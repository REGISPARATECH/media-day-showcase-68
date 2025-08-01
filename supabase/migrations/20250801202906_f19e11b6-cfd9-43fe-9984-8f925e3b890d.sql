-- Criar bucket de storage para mídias
INSERT INTO storage.buckets (id, name, public) VALUES ('media-files', 'media-files', true);

-- Criar tabela de clientes
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  prefix TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de arquivos de mídia
CREATE TABLE public.media_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  folder TEXT NOT NULL,
  url TEXT NOT NULL,
  hidden BOOLEAN NOT NULL DEFAULT false,
  animation_type TEXT,
  animation_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes (acesso público para funcionalidade atual)
CREATE POLICY "Permitir leitura de clientes" 
ON public.clients 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserção de clientes" 
ON public.clients 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir atualização de clientes" 
ON public.clients 
FOR UPDATE 
USING (true);

CREATE POLICY "Permitir exclusão de clientes" 
ON public.clients 
FOR DELETE 
USING (true);

-- Políticas para arquivos de mídia (acesso público para funcionalidade atual)
CREATE POLICY "Permitir leitura de arquivos de mídia" 
ON public.media_files 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserção de arquivos de mídia" 
ON public.media_files 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir atualização de arquivos de mídia" 
ON public.media_files 
FOR UPDATE 
USING (true);

CREATE POLICY "Permitir exclusão de arquivos de mídia" 
ON public.media_files 
FOR DELETE 
USING (true);

-- Políticas de storage para arquivos de mídia
CREATE POLICY "Permitir visualização de arquivos de mídia" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media-files');

CREATE POLICY "Permitir upload de arquivos de mídia" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'media-files');

CREATE POLICY "Permitir atualização de arquivos de mídia" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'media-files');

CREATE POLICY "Permitir exclusão de arquivos de mídia" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'media-files');

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualização automática de timestamps
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_files_updated_at
  BEFORE UPDATE ON public.media_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();