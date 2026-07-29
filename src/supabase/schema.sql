-- SUPABASE SCHEMA FOR LANDING ENCHERE PRO

-- 1. Create tables
CREATE TABLE public.sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  iso_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'Brouillon',
  revenue NUMERIC DEFAULT 0,
  participants INT DEFAULT 0,
  lots_sold INT DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  image TEXT,
  lots_count INT DEFAULT 0,
  subtitle TEXT,
  description TEXT,
  registration_deadline TEXT,
  location TEXT,
  end_date TEXT,
  type TEXT,
  price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.lots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  ref TEXT,
  title TEXT NOT NULL,
  category TEXT,
  start_price NUMERIC DEFAULT 0,
  est_low NUMERIC DEFAULT 0,
  est_high NUMERIC DEFAULT 0,
  condition TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  date TIMESTAMPTZ DEFAULT now(),
  payment_status TEXT DEFAULT 'pending',
  participation_status TEXT DEFAULT 'registered'
);

-- 2. Enable RLS (Row Level Security)
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- 3. Policies for public reading (Landing page needs to read sales and lots)
CREATE POLICY "Public can view published sales" ON public.sales FOR SELECT USING (status IN ('À venir', 'En cours', 'published', 'upcoming', 'open'));
CREATE POLICY "Public can view lots of published sales" ON public.lots FOR SELECT USING (EXISTS (SELECT 1 FROM public.sales WHERE sales.id = lots.sale_id AND sales.status IN ('À venir', 'En cours', 'published', 'upcoming', 'open')));

-- 4. Policy for participants to insert themselves
CREATE POLICY "Public can insert participants" ON public.participants FOR INSERT WITH CHECK (true);

-- 5. Authenticated users (Admin) can do everything
CREATE POLICY "Admin full access sales" ON public.sales FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access lots" ON public.lots FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access participants" ON public.participants FOR ALL USING (auth.role() = 'authenticated');

-- 6. Settings table and policies
CREATE TABLE IF NOT EXISTS public.settings (
  id INT PRIMARY KEY,
  registration_fee NUMERIC DEFAULT 25,
  admin_avatar TEXT,
  auto_email_draft BOOLEAN DEFAULT false,
  auto_email_access BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admin full access settings" ON public.settings FOR ALL USING (auth.role() = 'authenticated');
