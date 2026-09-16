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
