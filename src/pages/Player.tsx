import { useState, useRef, useEffect } from "react";
import Footer from "@/components/layout/Footer";
import { useSupabaseMediaPlayer } from "@/hooks/useSupabaseMediaPlayer";
import { MediaRenderer } from "@/components/player/MediaRenderer";
import { settingsService } from "@/services/settingsService";

const Player = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [settings, setSettings] = useState({
    showFooter: true,
    showMarquee: true,
    marqueeText: "PARATECH SOLUÇÕES E SISTEMAS - Sistema de Mídia Digital",
    showLottery: true,
    showWeather: true,
    showNews: true,
    showWidgets: true,
    muteVideos: false,
    theme: 'dark'
  });

  // Carregar configurações do banco de dados
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const dbSettings = await settingsService.getSettings();
        if (dbSettings) {
          setSettings({
            showFooter: dbSettings.show_footer,
            showMarquee: dbSettings.show_marquee,
            marqueeText: dbSettings.marquee_text,
            showLottery: dbSettings.show_lottery,
            showWeather: dbSettings.show_weather,
            showNews: dbSettings.show_news,
            showWidgets: dbSettings.show_widgets,
            muteVideos: dbSettings.mute_videos,
            theme: dbSettings.theme
          });
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        // Fallback para localStorage se o banco falhar
        const saved = localStorage.getItem('appSettings');
        if (saved) {
          const localSettings = JSON.parse(saved);
          setSettings(prev => ({ ...prev, ...localSettings }));
        }
      }
    };

    loadSettings();

    // Atualizar configurações a cada 5 segundos
    const interval = setInterval(loadSettings, 5000);

    return () => clearInterval(interval);
  }, []);

  // Hooks personalizados
  const { currentMedia, currentMediaObj, loading, handleMediaEnd } = useSupabaseMediaPlayer();

  return (
    <div 
      ref={containerRef}
      className="h-screen w-screen flex flex-col gradient-metal overflow-hidden"
    >
      {/* Marquee Text */}
      {settings.showMarquee && settings.marqueeText && (
        <div className="bg-primary/90 text-primary-foreground py-1 sm:py-2 overflow-hidden relative z-10 flex-shrink-0">
          <div className="animate-marquee whitespace-nowrap text-sm sm:text-base lg:text-lg font-orbitron font-bold px-2">
            {settings.marqueeText}
          </div>
        </div>
      )}

      {/* Player Area - Responsive */}
      <div className="flex-1 flex flex-col p-1 sm:p-2 min-h-0">
        <div className="w-full flex-1 bg-card shadow-card rounded-lg overflow-hidden relative min-h-0 flex items-center justify-center">
          {currentMedia && currentMediaObj ? (
            <div className="w-full h-full flex items-center justify-center">
              <MediaRenderer
                media={currentMedia}
                mediaObj={currentMediaObj}
                onMediaEnd={handleMediaEnd}
                isPortrait={true}
                muteVideos={settings.muteVideos}
              />
            </div>
          ) : loading ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <div className="text-center">
                <h2 className="font-orbitron text-xl sm:text-2xl lg:text-4xl text-primary neon-glow mb-2 sm:mb-4">
                  CARREGANDO...
                </h2>
                <p className="text-muted-foreground text-sm sm:text-lg lg:text-xl">
                  Conectando ao servidor...
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4">
              <div className="text-center">
                <h2 className="font-orbitron text-xl sm:text-2xl lg:text-4xl text-primary neon-glow mb-2 sm:mb-4">
                  PLAYER DE MÍDIA
                </h2>
                <p className="text-muted-foreground text-sm sm:text-lg lg:text-xl">
                  Aguardando conteúdo para reprodução...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Widgets Area - Responsive */}
        {settings.showWidgets && (
          <div className="p-1 sm:p-2 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 flex-shrink-0">
            {/* Loteria Widget */}
            {settings.showLottery && (
              <div className="glass-effect rounded-lg p-2">
                <h3 className="font-orbitron text-xs sm:text-sm text-primary mb-1">MEGA-SENA</h3>
                <div className="flex flex-wrap gap-1">
                  {[2, 24, 27, 30, 53, 57].map((num, i) => (
                    <div key={i} className="w-5 h-5 sm:w-6 sm:h-6 bg-success rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clima Widget */}
            {settings.showWeather && (
              <div className="glass-effect rounded-lg p-2">
                <h3 className="font-orbitron text-xs sm:text-sm text-primary mb-1">CLIMA</h3>
                <div className="text-sm sm:text-lg font-bold">24°C</div>
                <div className="text-xs text-muted-foreground">Nublado</div>
              </div>
            )}

            {/* Notícias Widget */}
            {settings.showNews && (
              <div className="glass-effect rounded-lg p-2">
                <h3 className="font-orbitron text-xs sm:text-sm text-primary mb-1">NOTÍCIAS</h3>
                <div className="text-xs text-muted-foreground">
                  Mercado em alta...
                </div>
              </div>
            )}
          </div>
        )}

        {settings.showFooter && <Footer />}
      </div>
    </div>
  );
};

export default Player;