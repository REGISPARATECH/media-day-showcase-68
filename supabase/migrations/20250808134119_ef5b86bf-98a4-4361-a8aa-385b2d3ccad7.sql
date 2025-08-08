-- Add player refresh interval to system_settings
ALTER TABLE public.system_settings
ADD COLUMN IF NOT EXISTS player_refresh_interval_ms INTEGER NOT NULL DEFAULT 30000;

-- Optional: ensure updated_at updates automatically on update (if not already)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_update_system_settings_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;