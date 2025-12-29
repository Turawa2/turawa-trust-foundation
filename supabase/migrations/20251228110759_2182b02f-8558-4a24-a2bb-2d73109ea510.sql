-- Create donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  amount DECIMAL(20, 6) NOT NULL,
  tx_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create distributions table
CREATE TABLE public.distributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  recipient_address TEXT,
  amount DECIMAL(20, 6) NOT NULL,
  tx_hash TEXT NOT NULL,
  purpose TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create proof_images table to link images to distributions
CREATE TABLE public.proof_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  distribution_id UUID REFERENCES public.distributions(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_images ENABLE ROW LEVEL SECURITY;

-- Public read access for transparency (anyone can view donations/distributions)
CREATE POLICY "Anyone can view donations" 
ON public.donations 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view distributions" 
ON public.distributions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view proof images" 
ON public.proof_images 
FOR SELECT 
USING (true);

-- Public insert for donations (anyone can donate)
CREATE POLICY "Anyone can create donations" 
ON public.donations 
FOR INSERT 
WITH CHECK (true);

-- Public insert for distributions (for demo - in production, restrict to admin)
CREATE POLICY "Anyone can create distributions" 
ON public.distributions 
FOR INSERT 
WITH CHECK (true);

-- Public insert for proof images (linked to distributions)
CREATE POLICY "Anyone can add proof images" 
ON public.proof_images 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.distributions;