import { supabase } from '@/integrations/supabase/client';

export interface AppSettings {
  theme: 'light' | 'dark';
  showMarquee: boolean;
  marqueeText: string;
  showFooter: boolean;
  showWidgets: boolean;
  showLottery: boolean;
  showWeather: boolean;
  showNews: boolean;
  lotteryApiKey: string;
  weatherApiKey: string;
  newsRssFeed: string;
  muteVideos?: boolean;
  playerRefreshIntervalMs?: number;
}

// Internal DB shape for system_settings
interface DbSystemSettings {
  id: string;
  theme: string;
  show_marquee: boolean;
  marquee_text: string;
  show_footer: boolean;
  show_widgets: boolean;
  show_lottery: boolean;
  show_weather: boolean;
  show_news: boolean;
  lottery_api: string | null;
  weather_api: string | null;
  news_api: string | null;
  mute_videos: boolean;
  player_refresh_interval_ms: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  showMarquee: true,
  marqueeText: 'PARATECH SOLUÇÕES E SISTEMAS - Sistema de Mídia Digital',
  showFooter: true,
  showWidgets: true,
  showLottery: true,
  showWeather: true,
  showNews: true,
  lotteryApiKey: '',
  weatherApiKey: '',
  newsRssFeed: 'https://feeds.feedburner.com/g1/economia',
  muteVideos: false,
  playerRefreshIntervalMs: 30000,
};

function mapDbToApp(s: DbSystemSettings): AppSettings {
  return {
    theme: (s.theme as 'light' | 'dark') || 'dark',
    showMarquee: s.show_marquee,
    marqueeText: s.marquee_text,
    showFooter: s.show_footer,
    showWidgets: s.show_widgets,
    showLottery: s.show_lottery,
    showWeather: s.show_weather,
    showNews: s.show_news,
    lotteryApiKey: s.lottery_api || '',
    weatherApiKey: s.weather_api || '',
    newsRssFeed: s.news_api || DEFAULT_SETTINGS.newsRssFeed,
    muteVideos: s.mute_videos,
    playerRefreshIntervalMs: s.player_refresh_interval_ms ?? DEFAULT_SETTINGS.playerRefreshIntervalMs,
  };
}

function mapAppToDb(s: AppSettings): Partial<DbSystemSettings> {
  return {
    theme: s.theme,
    show_marquee: s.showMarquee,
    marquee_text: s.marqueeText,
    show_footer: s.showFooter,
    show_widgets: s.showWidgets,
    show_lottery: s.showLottery,
    show_weather: s.showWeather,
    show_news: s.showNews,
    lottery_api: s.lotteryApiKey || null,
    weather_api: s.weatherApiKey || null,
    news_api: s.newsRssFeed || null,
    mute_videos: !!s.muteVideos,
    player_refresh_interval_ms: s.playerRefreshIntervalMs ?? DEFAULT_SETTINGS.playerRefreshIntervalMs!,
  };
}

export const settingsService = {
  async getSettings(): Promise<AppSettings> {
    const { data, error } = await (supabase as any)
      .from('system_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar configurações:', error);
      throw error;
    }

    if (!data) {
      // Create default row
      const { data: inserted, error: insertError } = await (supabase as any)
        .from('system_settings')
        .insert([mapAppToDb(DEFAULT_SETTINGS)])
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao criar configurações padrão:', insertError);
        // Fallback to defaults in memory
        return DEFAULT_SETTINGS;
      }

      localStorage.setItem('appSettings', JSON.stringify(mapDbToApp(inserted)));
      return mapDbToApp(inserted);
    }

    const appSettings = mapDbToApp(data);
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
    return appSettings;
  },

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    // Ensure a row exists, then update it
    const { data: existing, error: fetchError } = await (supabase as any)
      .from('system_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Erro ao verificar configurações:', fetchError);
      throw fetchError;
    }

    if (!existing) {
      const { data: inserted, error: insertError } = await (supabase as any)
        .from('system_settings')
        .insert([mapAppToDb(settings)])
        .select()
        .single();

      if (insertError) throw insertError;
      const app = mapDbToApp(inserted);
      localStorage.setItem('appSettings', JSON.stringify(app));
      return app;
    }

    const { data: updated, error: updateError } = await (supabase as any)
      .from('system_settings')
      .update(mapAppToDb(settings))
      .eq('id', existing.id)
      .select()
      .single();

    if (updateError) throw updateError;

    const app = mapDbToApp(updated);
    localStorage.setItem('appSettings', JSON.stringify(app));
    return app;
  },
};
