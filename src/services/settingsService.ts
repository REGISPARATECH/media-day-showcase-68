import { supabase } from '@/integrations/supabase/client';

export interface SystemSettings {
  id: string;
  show_footer: boolean;
  show_marquee: boolean;
  marquee_text: string;
  show_lottery: boolean;
  show_weather: boolean;
  show_news: boolean;
  show_widgets: boolean;
  theme: string;
  mute_videos: boolean;
  lottery_api?: string;
  weather_api?: string;
  news_api?: string;
  created_at: string;
  updated_at: string;
}

export const settingsService = {
  async getSettings(): Promise<SystemSettings | null> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao buscar configurações:', error);
      return null;
    }
    
    return data;
  },

  async updateSettings(settings: Partial<Omit<SystemSettings, 'id' | 'created_at' | 'updated_at'>>): Promise<SystemSettings | null> {
    // First get the current settings
    const currentSettings = await this.getSettings();
    
    if (!currentSettings) {
      // If no settings exist, create new ones
      const { data, error } = await supabase
        .from('system_settings')
        .insert([settings])
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar configurações:', error);
        return null;
      }
      
      return data;
    } else {
      // Update existing settings
      const { data, error } = await supabase
        .from('system_settings')
        .update(settings)
        .eq('id', currentSettings.id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar configurações:', error);
        return null;
      }
      
      return data;
    }
  }
};