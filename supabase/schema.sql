-- Beads World Africa (BWA) E-Commerce Supabase Database Schema

-- 1. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  price NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  description TEXT,
  details TEXT[],
  images TEXT[] NOT NULL,
  featured BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  stock_count INTEGER DEFAULT 10,
  
  -- Taxonomy / Tags for 'Find Your Bracelet' Recommendation Engine
  energy_vibe TEXT[] DEFAULT '{}',     -- e.g. {'grounding', 'focus', 'protection'}
  intention TEXT[] DEFAULT '{}',       -- e.g. {'inner_strength', 'courage'}
  stone_type TEXT[] DEFAULT '{}',      -- e.g. {'black_onyx', 'lava_stone', 'tiger_eye'}
  color_palette TEXT[] DEFAULT '{}',   -- e.g. {'dark_monochrome', 'earth_tones'}
  style_tags TEXT[] DEFAULT '{}',      -- e.g. {'everyday_minimal', 'stacked_layers'}
  wrist_fits TEXT[] DEFAULT '{}',      -- e.g. {'small_16cm', 'medium_18cm', 'adjustable'}
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Orders Table (WhatsApp Direct Order Focus)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  city TEXT,
  county TEXT,
  delivery_method TEXT DEFAULT 'standard',
  delivery_note TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  delivery_fee NUMERIC(10, 2) DEFAULT 250.00,
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending_whatsapp', -- 'pending_whatsapp', 'confirmed', 'shipped', 'cancelled'
  whatsapp_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Newsletter Subscribers Table (Synced with Brevo API)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'scroll_popup',
  brevo_synced BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Quiz Leads & Recommendations Table (For Quiz Flow)
CREATE TABLE IF NOT EXISTS public.quiz_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  answers JSONB NOT NULL,
  recommended_product_id UUID REFERENCES public.products(id),
  converted_to_order BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active products
CREATE POLICY "Public products are viewable by everyone" ON public.products
  FOR SELECT USING (true);

-- Allow public insertion of orders & subscriptions
CREATE POLICY "Public can place orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can subscribe to newsletter" ON public.subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can submit quiz leads" ON public.quiz_leads
  FOR INSERT WITH CHECK (true);
