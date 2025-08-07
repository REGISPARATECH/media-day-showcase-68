-- Create system settings table
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_footer BOOLEAN NOT NULL DEFAULT true,
  show_marquee BOOLEAN NOT NULL DEFAULT true,
  marquee_text TEXT NOT NULL DEFAULT 'PARATECH SOLUÇÕES E SISTEMAS - Sistema de Mídia Digital',
  show_lottery BOOLEAN NOT NULL DEFAULT true,
  show_weather BOOLEAN NOT NULL DEFAULT true,
  show_news BOOLEAN NOT NULL DEFAULT true,
  show_widgets BOOLEAN NOT NULL DEFAULT true,
  theme TEXT NOT NULL DEFAULT 'dark',
  mute_videos BOOLEAN NOT NULL DEFAULT false,
  lottery_api TEXT,
  weather_api TEXT,
  news_api TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for system settings
CREATE POLICY "Allow reading system settings" 
ON public.system_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Allow inserting system settings" 
ON public.system_settings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow updating system settings" 
ON public.system_settings 
FOR UPDATE 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings with proper UUID
INSERT INTO public.system_settings DEFAULT VALUES;