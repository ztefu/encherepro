ALTER TABLE public.sales
ADD COLUMN subtitle TEXT DEFAULT 'Collection privée',
ADD COLUMN description TEXT DEFAULT 'Description de la vente...',
ADD COLUMN registration_deadline TIMESTAMPTZ,
ADD COLUMN location TEXT DEFAULT 'En ligne',
ADD COLUMN type TEXT DEFAULT 'Hybride',
ADD COLUMN price NUMERIC DEFAULT 0;
