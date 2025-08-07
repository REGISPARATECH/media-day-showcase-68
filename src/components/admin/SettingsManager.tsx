import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Save, Sun, Moon, Eye, EyeOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { settingsService, SystemSettings } from '@/services/settingsService';

interface AppSettings {
  theme: 'light' | 'dark';
  showMarquee: boolean;
  marqueeText: string;
  showFooter: boolean;
  showWidgets: boolean;
  showLottery: boolean;
  showWeather: boolean;
  showNews: boolean;
  muteVideos: boolean;
  lotteryApiKey: string;
  weatherApiKey: string;
  newsRssFeed: string;
}

export function SettingsManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    showMarquee: true,
    marqueeText: 'PARATECH SOLUÇÕES E SISTEMAS - Sistema de Mídia Digital',
    showFooter: true,
    showWidgets: true,
    showLottery: true,
    showWeather: true,
    showNews: true,
    muteVideos: false,
    lotteryApiKey: '',
    weatherApiKey: '',
    newsRssFeed: 'https://feeds.feedburner.com/g1/economia'
  });

  const [showApiKeys, setShowApiKeys] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await settingsService.getSettings();
      if (savedSettings) {
        setSettings({
          theme: savedSettings.theme as 'light' | 'dark',
          showMarquee: savedSettings.show_marquee,
          marqueeText: savedSettings.marquee_text,
          showFooter: savedSettings.show_footer,
          showWidgets: savedSettings.show_widgets,
          showLottery: savedSettings.show_lottery,
          showWeather: savedSettings.show_weather,
          showNews: savedSettings.show_news,
          muteVideos: savedSettings.mute_videos,
          lotteryApiKey: savedSettings.lottery_api || '',
          weatherApiKey: savedSettings.weather_api || '',
          newsRssFeed: savedSettings.news_api || 'https://feeds.feedburner.com/g1/economia'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const dbSettings = {
        theme: settings.theme,
        show_marquee: settings.showMarquee,
        marquee_text: settings.marqueeText,
        show_footer: settings.showFooter,
        show_widgets: settings.showWidgets,
        show_lottery: settings.showLottery,
        show_weather: settings.showWeather,
        show_news: settings.showNews,
        mute_videos: settings.muteVideos,
        lottery_api: settings.lotteryApiKey,
        weather_api: settings.weatherApiKey,
        news_api: settings.newsRssFeed
      };

      await settingsService.updateSettings(dbSettings);
      
      // Aplicar tema imediatamente
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(settings.theme);
      
      // Também salvar no localStorage para compatibilidade
      localStorage.setItem('appSettings', JSON.stringify(settings));
      
      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configurações',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleThemeToggle = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    setSettings(prev => ({ ...prev, theme: newTheme }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6">
      {/* Aparência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {settings.theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Aparência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Label>Tema da Aplicação</Label>
              <p className="text-sm text-muted-foreground">
                {settings.theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleThemeToggle}
              className="flex items-center gap-2"
            >
              {settings.theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4" />
                  Claro
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  Escuro
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Player */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Player</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Label>Som dos Vídeos</Label>
              <p className="text-sm text-muted-foreground">Controlar áudio dos vídeos</p>
            </div>
            <div className="flex items-center gap-2">
              {settings.muteVideos ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              <Switch
                checked={!settings.muteVideos}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, muteVideos: !checked }))}
              />
            </div>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Label>Exibir Letreiro</Label>
              <p className="text-sm text-muted-foreground">Mostrar texto em movimento no topo</p>
            </div>
            <Switch
              checked={settings.showMarquee}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showMarquee: checked }))}
            />
          </div>

          {settings.showMarquee && (
            <div className="space-y-2">
              <Label htmlFor="marquee-text">Texto do Letreiro</Label>
              <Textarea
                id="marquee-text"
                value={settings.marqueeText}
                onChange={(e) => setSettings(prev => ({ ...prev, marqueeText: e.target.value }))}
                placeholder="Digite o texto que aparecerá no letreiro"
                rows={2}
                className="resize-none"
              />
            </div>
          )}

          <Separator />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Label>Exibir Rodapé</Label>
              <p className="text-sm text-muted-foreground">Mostrar rodapé na parte inferior</p>
            </div>
            <Switch
              checked={settings.showFooter}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showFooter: checked }))}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Label>Exibir Widgets</Label>
              <p className="text-sm text-muted-foreground">Mostrar widgets de informações</p>
            </div>
            <Switch
              checked={settings.showWidgets}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showWidgets: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Widgets */}
      {settings.showWidgets && (
        <Card>
          <CardHeader>
            <CardTitle>Configurações dos Widgets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Label>Widget Loteria</Label>
                <p className="text-sm text-muted-foreground">Resultados das loterias brasileiras</p>
              </div>
              <Switch
                checked={settings.showLottery}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showLottery: checked }))}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Label>Widget Clima</Label>
                <p className="text-sm text-muted-foreground">Informações meteorológicas locais</p>
              </div>
              <Switch
                checked={settings.showWeather}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showWeather: checked }))}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Label>Widget Notícias</Label>
                <p className="text-sm text-muted-foreground">Feed de notícias do Brasil</p>
              </div>
              <Switch
                checked={settings.showNews}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showNews: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* APIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Configurações de APIs
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApiKeys(!showApiKeys)}
            >
              {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.showNews && (
            <div className="space-y-2">
              <Label htmlFor="news-rss">Feed RSS de Notícias</Label>
              <Input
                id="news-rss"
                value={settings.newsRssFeed}
                onChange={(e) => setSettings(prev => ({ ...prev, newsRssFeed: e.target.value }))}
                placeholder="URL do feed RSS"
              />
              <p className="text-xs text-muted-foreground">
                Padrão: Feed de notícias do G1 Economia
              </p>
            </div>
          )}

          {settings.showWeather && (
            <div className="space-y-2">
              <Label htmlFor="weather-api">API Key do OpenWeatherMap</Label>
              <Input
                id="weather-api"
                type={showApiKeys ? "text" : "password"}
                value={settings.weatherApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, weatherApiKey: e.target.value }))}
                placeholder="Sua chave da API do OpenWeatherMap"
              />
              <p className="text-xs text-muted-foreground">
                Obtenha sua chave em: openweathermap.org/api
              </p>
            </div>
          )}

          {settings.showLottery && (
            <div className="space-y-2">
              <Label htmlFor="lottery-api">API Key da Loteria</Label>
              <Input
                id="lottery-api"
                type={showApiKeys ? "text" : "password"}
                value={settings.lotteryApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, lotteryApiKey: e.target.value }))}
                placeholder="Chave da API de loterias"
              />
              <p className="text-xs text-muted-foreground">
                Para acessar resultados das loterias brasileiras
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Salvar */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={handleSaveSettings} 
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}