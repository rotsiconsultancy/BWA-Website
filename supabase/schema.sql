-- Beads World Africa: Supabase-owned commerce schema.
-- Run against a fresh project before enabling production checkout.
create extension if not exists pgcrypto;

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  description text, image_url text, active boolean not null default true, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), crm_external_id text unique, slug text unique not null,
  sku text unique not null, title text not null, subtitle text, descriptor text,
  category text not null default 'Bracelets', collection_id uuid references public.collections(id) on delete set null,
  price numeric(10,2) not null check (price >= 0), price_kes numeric(10,2) not null check (price_kes >= 0), price_usd numeric(10,2) check (price_usd >= 0), cost_price numeric(10,2), currency text not null default 'KES',
  story text, description text, details text[] not null default '{}', featured boolean not null default false,
  is_trending boolean not null default false, active boolean not null default false,
  availability text not null default 'in_stock' check (availability in ('in_stock','made_to_order','preorder','unavailable')),
  seo_title text, seo_description text, energy_vibe text[] not null default '{}',
  intention text[] not null default '{}', stone_type text[] not null default '{}',
  color_palette text[] not null default '{}', style_tags text[] not null default '{}',
  wrist_fits text[] not null default '{}', occasion text[] not null default '{}',
  recipient text[] not null default '{}', crm_last_synced_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  url text not null, alt_text text not null, kind text not null default 'gallery'
  check (kind in ('hero','gallery','detail','lifestyle','spin')), sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  crm_external_id text unique, sku text unique not null, title text not null,
  price_adjustment numeric(10,2) not null default 0, price_adjustment_kes numeric(10,2) not null default 0, price_adjustment_usd numeric(10,2) check (price_adjustment_usd >= 0), stock_quantity integer not null default 0 check (stock_quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  low_stock_threshold integer not null default 3 check (low_stock_threshold >= 0),
  active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- Existing BWA catalogues keep their KES amounts; USD is deliberately entered
-- by staff, never calculated from an exchange rate.
alter table public.products add column if not exists price_kes numeric(10,2);
alter table public.products add column if not exists price_usd numeric(10,2);
update public.products set price_kes = price where price_kes is null;
alter table public.products alter column price_kes set not null;
alter table public.product_variants add column if not exists price_adjustment_kes numeric(10,2);
alter table public.product_variants add column if not exists price_adjustment_usd numeric(10,2);
update public.product_variants set price_adjustment_kes = price_adjustment where price_adjustment_kes is null;
alter table public.product_variants alter column price_adjustment_kes set not null;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'products_price_kes_nonnegative') then
    alter table public.products add constraint products_price_kes_nonnegative check (price_kes >= 0) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_price_usd_nonnegative') then
    alter table public.products add constraint products_price_usd_nonnegative check (price_usd is null or price_usd >= 0) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'product_variants_price_adjustment_kes_nonnegative') then
    alter table public.product_variants add constraint product_variants_price_adjustment_kes_nonnegative check (price_adjustment_kes >= 0) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'product_variants_price_adjustment_usd_nonnegative') then
    alter table public.product_variants add constraint product_variants_price_adjustment_usd_nonnegative check (price_adjustment_usd is null or price_adjustment_usd >= 0) not valid;
  end if;
end $$;
create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(), variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity_delta integer not null, reason text not null check (reason in ('initial','sale','reservation','release','restock','adjustment','return')),
  reference_type text, reference_id uuid, note text, actor_id uuid, created_at timestamptz not null default now()
);
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(), crm_external_id text unique, first_name text not null, last_name text,
  email text, phone text unique not null, whatsapp_opt_in boolean not null default true,
  marketing_opt_in boolean not null default false, source text not null default 'website',
  crm_last_synced_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.customers(id) on delete cascade,
  address text, city text, county text, delivery_note text, is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), order_number text unique not null, crm_external_id text unique,
  idempotency_key text unique not null, customer_id uuid not null references public.customers(id),
  status text not null default 'order_received' check (status in ('order_received','payment_pending','payment_confirmed','hand_crafting','quality_checked','ready_for_dispatch','dispatched','delivered','cancelled','refunded')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  delivery_method text not null check (delivery_method in ('standard','pickup')), delivery_address text, city text, county text, delivery_note text,
  courier_name text, tracking_reference text,
  subtotal numeric(10,2) not null check (subtotal >= 0), delivery_fee numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0, total_amount numeric(10,2) not null check (total_amount >= 0),
  currency text not null default 'KES', source text not null default 'website', whatsapp_handoff_at timestamptz,
  crm_last_synced_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
-- Discount campaigns are owned by BWA. They are deliberately not public: all
-- eligibility checks happen through the server checkout routes and RPC below.
create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code) and code ~ '^[A-Z0-9][A-Z0-9_-]{1,31}$'),
  name text not null,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  percentage_basis_points integer check (percentage_basis_points between 1 and 10000),
  fixed_amount_kes numeric(10,2) check (fixed_amount_kes > 0),
  fixed_amount_usd numeric(10,2) check (fixed_amount_usd > 0),
  minimum_subtotal_kes numeric(10,2) check (minimum_subtotal_kes >= 0),
  minimum_subtotal_usd numeric(10,2) check (minimum_subtotal_usd >= 0),
  max_redemptions integer check (max_redemptions > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (discount_type = 'percentage' and percentage_basis_points is not null and fixed_amount_kes is null and fixed_amount_usd is null)
    or
    (discount_type = 'fixed' and percentage_basis_points is null and fixed_amount_kes is not null and fixed_amount_usd is not null)
  ),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);
alter table public.orders add column if not exists discount_code_id uuid references public.discount_codes(id) on delete set null;
alter table public.orders add column if not exists discount_code_snapshot text;
create table if not exists public.discount_redemptions (
  id uuid primary key default gen_random_uuid(),
  discount_code_id uuid not null references public.discount_codes(id),
  order_id uuid not null unique references public.orders(id) on delete restrict,
  code_snapshot text not null,
  discount_type_snapshot text not null check (discount_type_snapshot in ('percentage','fixed')),
  configured_value_snapshot numeric(10,2) not null,
  qualifying_subtotal numeric(10,2) not null check (qualifying_subtotal >= 0),
  discount_amount numeric(10,2) not null check (discount_amount >= 0),
  currency text not null check (currency in ('KES','USD')),
  released_at timestamptz,
  released_reason text,
  created_at timestamptz not null default now()
);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null, variant_id uuid references public.product_variants(id) on delete set null,
  product_title_snapshot text not null, variant_title_snapshot text not null, image_snapshot text, sku_snapshot text,
  unit_price numeric(10,2) not null check (unit_price >= 0), quantity integer not null check (quantity > 0),
  line_total numeric(10,2) not null check (line_total >= 0), created_at timestamptz not null default now()
);
create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  status text not null, note text, actor_id uuid, created_at timestamptz not null default now()
);
create table if not exists public.custom_bracelet_requests (
  id uuid primary key default gen_random_uuid(), request_number text unique not null, customer_id uuid references public.customers(id),
  starting_product_id uuid references public.products(id), intention text[], palette text[], stones text[], wrist_size text,
  bead_preference text, accent_preference text, budget_range text, desired_date date, inspiration_url text, notes text,
  status text not null default 'submitted' check (status in ('submitted','reviewing','quoted','approved','converted','declined')),
  order_id uuid references public.orders(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.quiz_versions (
  id uuid primary key default gen_random_uuid(), title text not null,
  status text not null default 'draft' check (status in ('draft','published','archived')), published_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(), quiz_version_id uuid not null references public.quiz_versions(id) on delete cascade,
  internal_key text not null, title text not null, supporting_copy text, display_order integer not null,
  required boolean not null default true, active boolean not null default true, unique (quiz_version_id, internal_key)
);
create table if not exists public.quiz_options (
  id uuid primary key default gen_random_uuid(), question_id uuid not null references public.quiz_questions(id) on delete cascade,
  label text not null, description text, display_order integer not null, active boolean not null default true
);
create table if not exists public.quiz_option_tag_weights (
  id uuid primary key default gen_random_uuid(), option_id uuid not null references public.quiz_options(id) on delete cascade,
  taxonomy_field text not null, taxonomy_value text not null, weight integer not null check (weight between 1 and 10)
);
create table if not exists public.quiz_sessions (
  id uuid primary key default gen_random_uuid(), quiz_version_id uuid references public.quiz_versions(id),
  session_token text unique not null, answers jsonb not null default '{}', started_at timestamptz not null default now(), completed_at timestamptz
);
create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(), quiz_session_id uuid not null references public.quiz_sessions(id) on delete cascade,
  ranked_products jsonb not null, selected_product_id uuid references public.products(id), created_at timestamptz not null default now()
);
alter table public.quiz_sessions add column if not exists customer_id uuid references public.customers(id);
create table if not exists public.discovery_events (
  id uuid primary key default gen_random_uuid(), quiz_session_id uuid references public.quiz_sessions(id) on delete set null,
  event_type text not null check (event_type in ('quiz_completed','recommendation_viewed','added_to_bag','bespoke_started','order_created')),
  product_id uuid references public.products(id), order_id uuid references public.orders(id),
  created_at timestamptz not null default now()
);
create index if not exists discovery_events_type_created_at_idx on public.discovery_events(event_type, created_at desc);
create index if not exists quiz_sessions_customer_id_idx on public.quiz_sessions(customer_id);
create table if not exists public.drops (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, story text, hero_image_url text,
  starts_at timestamptz, ends_at timestamptz, active boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.drop_products (
  drop_id uuid not null references public.drops(id) on delete cascade, product_id uuid not null references public.products(id) on delete cascade,
  allocated_quantity integer, sort_order integer not null default 0, primary key (drop_id, product_id)
);
create table if not exists public.product_stacks (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, story text, image_url text, active boolean not null default true
);
create table if not exists public.product_stack_items (
  stack_id uuid not null references public.product_stacks(id) on delete cascade, product_id uuid not null references public.products(id) on delete cascade,
  default_variant_id uuid references public.product_variants(id), sort_order integer not null default 0, primary key (stack_id, product_id)
);
create table if not exists public.lookbook_entries (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, story text, image_url text,
  publish_status text not null default 'draft' check (publish_status in ('draft','published','archived')), published_at timestamptz
);
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(), product_id uuid references public.products(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null, rating integer not null check (rating between 1 and 5),
  body text not null, verified_purchase boolean not null default false,
  publish_status text not null default 'pending' check (publish_status in ('pending','published','rejected')), created_at timestamptz not null default now()
);
create table if not exists public.worn_stories (
  id uuid primary key default gen_random_uuid(), slug text unique, customer_id uuid references public.customers(id) on delete set null,
  product_id uuid references public.products(id) on delete set null, display_name text, story text not null, media_url text,
  publication_consent boolean not null default false,
  publish_status text not null default 'submitted' check (publish_status in ('submitted','verification_pending','approved','scheduled','published','archived','rejected')),
  published_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.crm_sync_outbox (
  id uuid primary key default gen_random_uuid(), entity_type text not null check (entity_type in ('product','customer','order','custom_request')),
  entity_id uuid not null, operation text not null check (operation in ('create','update')), idempotency_key text unique not null,
  payload jsonb not null, status text not null default 'pending' check (status in ('pending','processing','synced','failed')),
  retry_count integer not null default 0, last_error text, last_attempt_at timestamptz, synced_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.crm_sync_log (
  id uuid primary key default gen_random_uuid(), outbox_id uuid references public.crm_sync_outbox(id) on delete set null,
  response_status integer, response_body jsonb, created_at timestamptz not null default now()
);
create table if not exists public.crm_import_review (
  id uuid primary key default gen_random_uuid(), entity_type text not null, entity_id uuid not null, crm_payload jsonb not null, bwa_payload jsonb not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')), reviewed_by uuid, reviewed_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(), actor_id uuid, entity_type text not null, entity_id uuid, action text not null,
  before_value jsonb, after_value jsonb, reason text, created_at timestamptz not null default now()
);
create table if not exists public.site_settings (
  key text primary key, value jsonb not null, updated_at timestamptz not null default now()
);
create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','commerce_manager','content_manager','fulfilment_staff','support_staff')),
  display_name text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists products_active_slug_idx on public.products(active, slug);
create index if not exists variants_product_active_idx on public.product_variants(product_id, active);
create index if not exists orders_customer_created_idx on public.orders(customer_id, created_at desc);
create index if not exists crm_sync_outbox_status_idx on public.crm_sync_outbox(status, created_at);
create index if not exists discount_redemptions_code_active_idx on public.discount_redemptions(discount_code_id, created_at) where released_at is null;
create index if not exists discount_redemptions_order_idx on public.discount_redemptions(order_id);

-- Safe additions for projects that applied an earlier version of this schema.
alter table public.orders add column if not exists courier_name text;
alter table public.orders add column if not exists tracking_reference text;

-- Pricing: one cost recipe per product. Shared monthly settings live in
-- site_settings under the 'pricing' key. Staff-only; no public policies.
create table if not exists public.product_cost_recipes (
  product_id uuid primary key references public.products(id) on delete cascade,
  material_cost numeric(10,2) not null default 0 check (material_cost >= 0),
  material_yield numeric(10,2) not null default 1 check (material_yield > 0),
  charm_cost numeric(10,2) not null default 0 check (charm_cost >= 0),
  charm_count integer not null default 0 check (charm_count >= 0),
  extra_cost numeric(10,2) not null default 0 check (extra_cost >= 0),
  packaging text not null default 'pouch' check (packaging in ('none','pouch','box','pouch_and_box')),
  labour_kes numeric(10,2) not null default 0 check (labour_kes >= 0),
  notes text,
  updated_by uuid,
  updated_at timestamptz not null default now()
);
alter table public.product_cost_recipes enable row level security;
alter table public.site_settings enable row level security;

-- Public browsing is read-only. Customer/order/admin/CRM writes occur only through server routes using the service role.
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.collections enable row level security;
alter table public.worn_stories enable row level security;
alter table public.lookbook_entries enable row level security;
alter table public.product_stacks enable row level security;
alter table public.product_stack_items enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.discount_codes enable row level security;
alter table public.discount_redemptions enable row level security;
create policy "Public can read active products" on public.products for select using (active = true);
create policy "Public can read product images" on public.product_images for select using (true);
create policy "Public can read active variants" on public.product_variants for select using (active = true);
create policy "Public can read active collections" on public.collections for select using (active = true);
create policy "Public can read published stories" on public.worn_stories for select using (publish_status = 'published');
create policy "Public can read published lookbook" on public.lookbook_entries for select using (publish_status = 'published');
create policy "Public can read active stacks" on public.product_stacks for select using (active = true);
create policy "Public can read active stack items" on public.product_stack_items for select using (true);
create policy "Staff can read their own profile" on public.admin_profiles for select using (auth.uid() = user_id);

-- Final checkout persistence is a single transaction. The route has already
-- priced the live variant data, but this function owns the capacity-sensitive
-- discount validation and the immutable order/redemption snapshots.
create or replace function public.create_checkout_order(
  p_order jsonb,
  p_items jsonb,
  p_discount_code text default null
)
returns table (
  order_id uuid,
  order_number text,
  subtotal numeric,
  discount_amount numeric,
  delivery_fee numeric,
  total_amount numeric,
  currency text,
  discount_code text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing public.orders%rowtype;
  v_campaign public.discount_codes%rowtype;
  v_order public.orders%rowtype;
  v_subtotal numeric(10,2);
  v_delivery numeric(10,2);
  v_discount numeric(10,2) := 0;
  v_currency text;
  v_active_redemptions integer := 0;
  v_normalised_code text;
  v_configured_value numeric(10,2);
begin
  select * into v_existing
  from public.orders
  where idempotency_key = p_order->>'idempotency_key';
  if found then
    return query select v_existing.id, v_existing.order_number, v_existing.subtotal,
      v_existing.discount_amount, v_existing.delivery_fee, v_existing.total_amount,
      v_existing.currency, v_existing.discount_code_snapshot;
    return;
  end if;

  v_subtotal := (p_order->>'subtotal')::numeric;
  v_delivery := (p_order->>'delivery_fee')::numeric;
  v_currency := p_order->>'currency';
  if v_subtotal < 0 or v_delivery < 0 or v_currency not in ('KES', 'USD') then
    raise exception 'CHECKOUT_INVALID';
  end if;

  v_normalised_code := nullif(upper(trim(coalesce(p_discount_code, ''))), '');
  if v_normalised_code is not null then
    select * into v_campaign
    from public.discount_codes
    where code = v_normalised_code
    for update;
    if not found or not v_campaign.active
      or (v_campaign.starts_at is not null and v_campaign.starts_at > now())
      or (v_campaign.ends_at is not null and v_campaign.ends_at <= now()) then
      raise exception 'DISCOUNT_UNAVAILABLE';
    end if;
    -- Personal codes (review thank-you) belong to one customer.
    if v_campaign.customer_id is not null
      and v_campaign.customer_id <> (p_order->>'customer_id')::uuid then
      raise exception 'DISCOUNT_NOT_YOURS';
    end if;
    select count(*) into v_active_redemptions
    from public.discount_redemptions
    where discount_code_id = v_campaign.id and released_at is null;
    if v_campaign.max_redemptions is not null and v_active_redemptions >= v_campaign.max_redemptions then
      raise exception 'DISCOUNT_UNAVAILABLE';
    end if;
    if (v_currency = 'KES' and coalesce(v_campaign.minimum_subtotal_kes, 0) > v_subtotal)
      or (v_currency = 'USD' and coalesce(v_campaign.minimum_subtotal_usd, 0) > v_subtotal) then
      raise exception 'DISCOUNT_UNAVAILABLE';
    end if;
    if v_campaign.discount_type = 'percentage' then
      v_discount := round(v_subtotal * v_campaign.percentage_basis_points / 10000, case when v_currency = 'USD' then 2 else 0 end);
      v_configured_value := v_campaign.percentage_basis_points / 100.0;
    else
      v_discount := least(v_subtotal, case when v_currency = 'USD' then v_campaign.fixed_amount_usd else v_campaign.fixed_amount_kes end);
      v_configured_value := case when v_currency = 'USD' then v_campaign.fixed_amount_usd else v_campaign.fixed_amount_kes end;
    end if;
  end if;

  insert into public.orders (
    order_number, idempotency_key, customer_id, delivery_method,
    delivery_address, city, county, delivery_note, subtotal, delivery_fee,
    discount_amount, total_amount, currency, discount_code_id, discount_code_snapshot
  ) values (
    p_order->>'order_number', p_order->>'idempotency_key', (p_order->>'customer_id')::uuid,
    p_order->>'delivery_method', nullif(p_order->>'delivery_address', ''),
    nullif(p_order->>'city', ''), nullif(p_order->>'county', ''),
    nullif(p_order->>'delivery_note', ''), v_subtotal, v_delivery, v_discount,
    v_subtotal - v_discount + v_delivery, v_currency,
    case when v_normalised_code is null then null else v_campaign.id end, v_normalised_code
  ) returning * into v_order;

  insert into public.order_items (
    order_id, product_id, variant_id, product_title_snapshot,
    variant_title_snapshot, image_snapshot, sku_snapshot, unit_price,
    quantity, line_total
  )
  select v_order.id, (item->>'product_id')::uuid, (item->>'variant_id')::uuid,
    item->>'product_title_snapshot', item->>'variant_title_snapshot',
    nullif(item->>'image_snapshot', ''), item->>'sku_snapshot',
    (item->>'unit_price')::numeric, (item->>'quantity')::integer,
    (item->>'line_total')::numeric
  from jsonb_array_elements(p_items) item;

  if v_normalised_code is not null then
    insert into public.discount_redemptions (
      discount_code_id, order_id, code_snapshot, discount_type_snapshot,
      configured_value_snapshot, qualifying_subtotal, discount_amount, currency
    ) values (
      v_campaign.id, v_order.id, v_campaign.code, v_campaign.discount_type,
      v_configured_value, v_subtotal, v_discount, v_currency
    );
  end if;
  return query select v_order.id, v_order.order_number, v_order.subtotal,
    v_order.discount_amount, v_order.delivery_fee, v_order.total_amount,
    v_order.currency, v_order.discount_code_snapshot;
end;
$$;

create or replace function public.release_discount_redemption(
  p_order_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code_id uuid;
begin
  update public.discount_redemptions
  set released_at = now(), released_reason = p_reason
  where order_id = p_order_id and released_at is null
  returning discount_code_id into v_code_id;
  return v_code_id;
end;
$$;

revoke all on function public.create_checkout_order(jsonb, jsonb, text) from public;
revoke all on function public.release_discount_redemption(uuid, text) from public;
grant execute on function public.create_checkout_order(jsonb, jsonb, text) to service_role;
grant execute on function public.release_discount_redemption(uuid, text) to service_role;

-- Design Your Own (2026-10-30): which stones the designer offers, independent of
-- whether the bracelet listing itself is active. design_slug is the stone's code
-- in design links; a renamed code keeps working through design_aliases.
alter table public.products add column if not exists design_enabled boolean not null default false;
alter table public.products add column if not exists design_slug text;
alter table public.products add column if not exists design_name text;
alter table public.products add column if not exists design_bead_shape text not null default 'sphere';
alter table public.products add column if not exists design_bead_images text[] not null default '{}';
alter table public.products add column if not exists design_colour text;
alter table public.products add column if not exists design_aliases text[] not null default '{}';
do $$ begin
  alter table public.products add constraint products_design_slug_key unique (design_slug);
exception when duplicate_object or duplicate_table then null; end $$;
do $$ begin
  alter table public.products add constraint products_design_bead_shape_check
    check (design_bead_shape in ('sphere','rondelle','tube'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.products add constraint products_design_slug_format
    check (design_slug is null or design_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.products add constraint products_design_colour_format
    check (design_colour is null or design_colour ~ '^#[0-9a-f]{6}$');
exception when duplicate_object then null; end $$;

-- Design Your Own leads (2026-10-30): every design sent to WhatsApp, with the
-- id shown in the message (D-XXXXX), what was chosen and the price range at the
-- time. No name, phone or gift message: those stay in the WhatsApp chat.
-- status lets staff mark which designs became orders.
create table if not exists public.design_leads (
  id text primary key check (id ~ '^D-[2-9A-HJKMNP-Z]{5}$'),
  created_at timestamptz not null default now(),
  main_stone text not null,
  main_name text not null,
  second_stone text,
  second_name text,
  pattern text not null check (pattern in ('one','alt','accent')),
  bead_size text not null check (bead_size in ('medium','large')),
  spacers boolean not null default false,
  letters text check (char_length(letters) <= 30),
  letter_kind text check (letter_kind in ('metal','acrylic')),
  charm boolean not null default false,
  wrist_cm smallint check (wrist_cm between 10 and 30),
  gift boolean not null default false,
  price_kes_from numeric(10,2) not null,
  price_kes_to numeric(10,2) not null,
  link text not null,
  placement text,
  from_design text,
  status text not null default 'sent' check (status in ('sent','ordered','no_reply','declined'))
);
create index if not exists design_leads_created_at on public.design_leads (created_at desc);
alter table public.design_leads enable row level security;

-- Review & reward (2026-11-08): one review link per delivered order, a
-- personal one-time thank-you code, private "do better" feedback.
-- discount_codes.customer_id is checked in create_checkout_order above.
-- 1. Personal discount codes: a code with a customer only works for them.
alter table public.discount_codes add column if not exists customer_id uuid references public.customers(id) on delete cascade;
alter table public.discount_codes add column if not exists source text not null default 'campaign';
do $$ begin
  alter table public.discount_codes add constraint discount_codes_source_check
    check (source in ('campaign','review_reward'));
exception when duplicate_object then null; end $$;

-- 2. One review link per order.
create table if not exists public.review_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  token text not null unique check (token ~ '^[A-Za-z0-9_-]{20,64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  opened_at timestamptz,
  completed_at timestamptz,
  discount_code_id uuid references public.discount_codes(id) on delete set null
);
alter table public.review_requests enable row level security;

-- 3. Reviews (table already existed, unused): link them to the order and request.
alter table public.reviews add column if not exists order_id uuid references public.orders(id) on delete set null;
alter table public.reviews add column if not exists review_request_id uuid references public.review_requests(id) on delete set null;
alter table public.reviews add column if not exists tags text[] not null default '{}';
alter table public.reviews add column if not exists display_name text;
alter table public.reviews add column if not exists town text;
alter table public.reviews add column if not exists publication_consent boolean not null default false;
alter table public.reviews add column if not exists incentivised boolean not null default false;
alter table public.reviews alter column body set default '';
create index if not exists reviews_product_published_idx on public.reviews (product_id, created_at desc) where publish_status = 'published';
alter table public.reviews enable row level security;
drop policy if exists "Public can read published consented reviews" on public.reviews;
create policy "Public can read published consented reviews" on public.reviews
  for select using (publish_status = 'published' and publication_consent);

-- 4. "One thing we could do better next time?" Private, never shown on the site.
create table if not exists public.review_feedback (
  id uuid primary key default gen_random_uuid(),
  review_request_id uuid not null unique references public.review_requests(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  improvements text[] not null default '{}',
  note text check (char_length(note) <= 500),
  status text not null default 'new' check (status in ('new','replied','done')),
  created_at timestamptz not null default now()
);
alter table public.review_feedback enable row level security;

-- 5. Submit a review in one transaction: claim the link, save reviews and
-- feedback, create the personal one-time code. A second submit returns the
-- code from the first one instead of a new one.
create or replace function public.submit_order_review(
  p_token text,
  p_reviews jsonb,
  p_feedback jsonb,
  p_display_name text,
  p_town text,
  p_consent boolean,
  p_code text,
  p_code_name text,
  p_amount_kes numeric,
  p_amount_usd numeric,
  p_valid_days integer
)
returns table (code text, ends_at timestamptz, already boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.review_requests%rowtype;
  v_code public.discount_codes%rowtype;
  v_review jsonb;
begin
  select * into v_request from public.review_requests where token = p_token for update;
  if not found then raise exception 'REVIEW_NOT_FOUND'; end if;
  if v_request.completed_at is not null then
    select * into v_code from public.discount_codes where id = v_request.discount_code_id;
    return query select v_code.code, v_code.ends_at, true;
    return;
  end if;
  if v_request.expires_at <= now() then raise exception 'REVIEW_EXPIRED'; end if;
  if jsonb_array_length(coalesce(p_reviews, '[]'::jsonb)) = 0 then raise exception 'REVIEW_INVALID'; end if;

  insert into public.discount_codes (
    code, name, discount_type, fixed_amount_kes, fixed_amount_usd,
    max_redemptions, starts_at, ends_at, active, customer_id, source
  ) values (
    p_code, p_code_name, 'fixed', p_amount_kes, p_amount_usd,
    1, now(), now() + make_interval(days => p_valid_days), true,
    v_request.customer_id, 'review_reward'
  ) returning * into v_code;

  for v_review in select * from jsonb_array_elements(p_reviews) loop
    insert into public.reviews (
      product_id, customer_id, order_id, review_request_id, rating, body, tags,
      display_name, town, publication_consent, verified_purchase, incentivised
    ) values (
      nullif(v_review->>'product_id', '')::uuid, v_request.customer_id,
      v_request.order_id, v_request.id, (v_review->>'rating')::integer,
      left(coalesce(v_review->>'body', ''), 500),
      coalesce(array(select jsonb_array_elements_text(v_review->'tags')), '{}'),
      nullif(left(trim(coalesce(p_display_name, '')), 40), ''),
      nullif(left(trim(coalesce(p_town, '')), 40), ''),
      coalesce(p_consent, false), true, true
    );
  end loop;

  if p_feedback is not null and (
    jsonb_array_length(coalesce(p_feedback->'improvements', '[]'::jsonb)) > 0
    or coalesce(trim(p_feedback->>'note'), '') <> ''
  ) then
    insert into public.review_feedback (review_request_id, order_id, improvements, note)
    values (
      v_request.id, v_request.order_id,
      coalesce(array(select jsonb_array_elements_text(p_feedback->'improvements')), '{}'),
      nullif(left(trim(coalesce(p_feedback->>'note', '')), 500), '')
    );
  end if;

  update public.review_requests
  set completed_at = now(), discount_code_id = v_code.id
  where id = v_request.id;

  return query select v_code.code, v_code.ends_at, false;
end;
$$;
revoke all on function public.submit_order_review(text, jsonb, jsonb, text, text, boolean, text, text, numeric, numeric, integer) from public;
grant execute on function public.submit_order_review(text, jsonb, jsonb, text, text, boolean, text, text, numeric, numeric, integer) to service_role;



-- QR links & welcome codes (2026-11-09). Run once in the Supabase SQL editor.
-- Safe to run again: every step is "if not exists" or "create or replace".
--
-- Admin makes one QR link per channel or print run (e.g. /welcome/mancave-7k2p).
-- A scan opens the welcome page; the customer leaves their WhatsApp number and
-- first name and gets a one-time welcome code tied to that number. One welcome
-- code per phone number, ever: registering again returns the same code.

-- 1. Welcome codes are personal discount codes with their own source.
alter table public.discount_codes drop constraint if exists discount_codes_source_check;
alter table public.discount_codes add constraint discount_codes_source_check
  check (source in ('campaign','review_reward','qr_welcome'));

-- 2. One row per printed QR link.
create table if not exists public.qr_links (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,47}$'),
  name text not null check (char_length(name) between 2 and 80),
  channel text not null check (channel in ('online','mancave','stockist','event','other')),
  reward_percent integer not null default 10 check (reward_percent between 1 and 50),
  reward_valid_days integer not null default 60 check (reward_valid_days between 7 and 365),
  minimum_subtotal_kes numeric(10,2) check (minimum_subtotal_kes >= 0),
  active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now()
);
alter table public.qr_links enable row level security;

-- 3. Scans. visitor_id is a random id kept on the visitor's phone; no IP stored.
create table if not exists public.qr_scans (
  id bigint generated always as identity primary key,
  link_id uuid not null references public.qr_links(id) on delete cascade,
  visitor_id text not null check (visitor_id ~ '^[A-Za-z0-9_-]{8,64}$'),
  device text not null default 'mobile' check (device in ('mobile','desktop')),
  scanned_at timestamptz not null default now()
);
create index if not exists qr_scans_link_idx on public.qr_scans (link_id, scanned_at desc);
create index if not exists qr_scans_visitor_idx on public.qr_scans (visitor_id, link_id, scanned_at desc);
alter table public.qr_scans enable row level security;

-- 4. Registrations: one row per form sent (a customer can register more bracelets).
create table if not exists public.qr_registrations (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.qr_links(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete cascade,
  first_name text not null,
  phone text not null,
  product_id uuid references public.products(id) on delete set null,
  marketing_consent boolean not null default false,
  consent_text text,
  discount_code_id uuid references public.discount_codes(id) on delete set null,
  issued_code boolean not null default false,
  visitor_id text,
  created_at timestamptz not null default now()
);
create index if not exists qr_registrations_link_idx on public.qr_registrations (link_id, created_at desc);
create index if not exists qr_registrations_customer_idx on public.qr_registrations (customer_id, created_at);
create index if not exists qr_registrations_visitor_idx on public.qr_registrations (visitor_id, created_at desc);
alter table public.qr_registrations enable row level security;

-- 5. Register in one transaction: save the customer (never overwriting their
-- name), give the welcome code once per phone number, log the registration.
create or replace function public.register_qr_welcome(
  p_slug text,
  p_first_name text,
  p_phone text,
  p_product_id uuid,
  p_consent boolean,
  p_consent_text text,
  p_visitor_id text,
  p_code text
)
returns table (code text, ends_at timestamptz, percent integer, minimum_kes numeric, already boolean, used boolean, paused boolean)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_link public.qr_links%rowtype;
  v_customer public.customers%rowtype;
  v_code public.discount_codes%rowtype;
  v_already boolean := false;
  v_issued boolean := false;
  v_recent integer;
begin
  select * into v_link from public.qr_links where slug = p_slug;
  if not found then raise exception 'QR_NOT_FOUND'; end if;
  if p_phone !~ '^254[17][0-9]{8}$' or char_length(trim(coalesce(p_first_name, ''))) < 1 then
    raise exception 'QR_INVALID';
  end if;

  -- Spam guard: at most 5 registrations from one phone (the device) per hour.
  if p_visitor_id is not null then
    select count(*) into v_recent from public.qr_registrations
    where visitor_id = p_visitor_id and created_at > now() - interval '1 hour';
    if v_recent >= 5 then raise exception 'QR_TOO_MANY'; end if;
  end if;

  insert into public.customers as c (first_name, phone, source, marketing_opt_in)
  values (left(trim(p_first_name), 60), p_phone, 'qr', coalesce(p_consent, false))
  on conflict (phone) do update
    set marketing_opt_in = c.marketing_opt_in or coalesce(p_consent, false),
        updated_at = now()
  returning * into v_customer;

  -- Lock the customer so two quick submits can't create two codes.
  perform 1 from public.customers where id = v_customer.id for update;

  select count(*) into v_recent from public.qr_registrations
  where customer_id = v_customer.id and created_at > now() - interval '1 day';
  if v_recent >= 5 then raise exception 'QR_TOO_MANY'; end if;

  select * into v_code from public.discount_codes
  where customer_id = v_customer.id and source = 'qr_welcome'
  order by created_at limit 1;
  if found then
    v_already := true;
  elsif v_link.active then
    insert into public.discount_codes (
      code, name, discount_type, percentage_basis_points,
      minimum_subtotal_kes, max_redemptions, starts_at, ends_at, active,
      customer_id, source
    ) values (
      p_code, 'Welcome · ' || v_link.name, 'percentage', v_link.reward_percent * 100,
      v_link.minimum_subtotal_kes, 1, now(),
      now() + make_interval(days => v_link.reward_valid_days), true,
      v_customer.id, 'qr_welcome'
    ) returning * into v_code;
    v_issued := true;
  end if;

  insert into public.qr_registrations (
    link_id, customer_id, first_name, phone, product_id, marketing_consent,
    consent_text, discount_code_id, issued_code, visitor_id
  ) values (
    v_link.id, v_customer.id, left(trim(p_first_name), 60), p_phone, p_product_id,
    coalesce(p_consent, false), case when p_consent then p_consent_text end,
    v_code.id, v_issued, p_visitor_id
  );

  return query select
    v_code.code,
    v_code.ends_at,
    (v_code.percentage_basis_points / 100)::integer,
    v_code.minimum_subtotal_kes,
    v_already,
    coalesce(v_code.id is not null and exists (
      select 1 from public.discount_redemptions d
      where d.discount_code_id = v_code.id and d.released_at is null
    ), false),
    v_code.id is null;
end;
$$;
revoke all on function public.register_qr_welcome(text, text, text, uuid, boolean, text, text, text) from public;
grant execute on function public.register_qr_welcome(text, text, text, uuid, boolean, text, text, text) to service_role;

-- 6. Numbers per link for the admin list. An order counts for the link the
-- customer FIRST registered through, and only if placed after that.
create or replace view public.qr_link_stats with (security_invoker = true) as
with first_reg as (
  select distinct on (customer_id) customer_id, link_id, created_at
  from public.qr_registrations
  order by customer_id, created_at
),
attributed as (
  select f.link_id, o.id, o.total_amount, o.currency
  from first_reg f
  join public.orders o on o.customer_id = f.customer_id
    and o.created_at > f.created_at
    and o.status not in ('cancelled','refunded')
)
select
  l.id as link_id,
  (select count(*) from public.qr_scans s where s.link_id = l.id) as scans,
  (select count(distinct s.visitor_id) from public.qr_scans s where s.link_id = l.id) as visitors,
  (select count(*) from public.qr_registrations r where r.link_id = l.id) as registrations,
  (select count(distinct r.customer_id) from public.qr_registrations r where r.link_id = l.id) as people,
  (select count(*) from public.qr_registrations r where r.link_id = l.id and r.issued_code) as codes_issued,
  (select count(*) from public.qr_registrations r
     join public.discount_redemptions d on d.discount_code_id = r.discount_code_id and d.released_at is null
     where r.link_id = l.id and r.issued_code) as codes_used,
  (select count(*) from attributed a where a.link_id = l.id) as orders,
  (select coalesce(sum(a.total_amount), 0) from attributed a where a.link_id = l.id and a.currency = 'KES') as revenue_kes,
  (select coalesce(sum(a.total_amount), 0) from attributed a where a.link_id = l.id and a.currency = 'USD') as revenue_usd
from public.qr_links l;
revoke all on public.qr_link_stats from anon, authenticated;
grant select on public.qr_link_stats to service_role;
