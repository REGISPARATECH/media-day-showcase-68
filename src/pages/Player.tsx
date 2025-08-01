
import { useState, useRef } from "react";
import Footer from "@/components/layout/Footer";
import NavigationMenu from "@/components/navigation/NavigationMenu";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useSupabaseMediaPlayer } from "@/hooks/useSupabaseMediaPlayer";
import { useFullscreen } from "@/hooks/useFullscreen";
import { MediaRenderer } from "@/components/player/MediaRenderer";
import { PlayerControls } from "@/components/player/PlayerControls";

const Player = () => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [showMarquee, setShowMarquee] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('systemSettings');
    return saved ? JSON.parse(saved) : {
      showFooter: true,
      showMarquee: true,
      marqueeText: "PARATECH SOLUÇÕES E SISTEMAS - Sistema de Mídia Digital",
      showLottery: true,
      showWeather: true,
      showNews: true,
      primaryColor: "#3b82f6",
      accentColor: "#8b5cf6",
      playerOrientation: "landscape"
    };
  });

  // Hooks personalizados
  const { currentMedia, currentMediaObj, loading, handleMediaEnd } = useSupabaseMediaPlayer();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const togglePortrait = () => {
    setIsPortrait(!isPortrait);
  };

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen flex flex-col gradient-metal ${
        isPortrait ? 'portrait-mode' : ''
      }`}
    >
      <NavigationMenu />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      {/* Marquee Text */}
      {showMarquee && settings.showMarquee && settings.marqueeText && (
        <div className="bg-primary/90 text-primary-foreground py-2 overflow-hidden relative z-10">
          <div className="animate-marquee whitespace-nowrap text-lg font-orbitron font-bold">
            {settings.marqueeText}
          </div>
        </div>
      )}

      {/* Player Controls */}
      <PlayerControls
        isPortrait={isPortrait}
        isFullscreen={isFullscreen}
        onTogglePortrait={togglePortrait}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Player Area */}
      <div className={`flex-1 flex items-center justify-center p-2 sm:p-4 ${
        isPortrait ? 'portrait-container' : ''
      }`}>
        <div className={`w-full h-full sm:max-w-6xl sm:aspect-[9/16] bg-card shadow-card rounded-lg overflow-hidden relative ${
          isPortrait ? 'transform rotate-90 origin-center' : ''
        }`}>
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="font-orbitron text-4xl text-primary neon-glow mb-4">
                  CARREGANDO...
                </h2>
                <p className="text-muted-foreground text-xl">
                  Conectando ao servidor...
                </p>
              </div>
            </div>
          ) : currentMedia && currentMediaObj ? (
            <MediaRenderer
              media={currentMedia}
              mediaObj={currentMediaObj}
              onMediaEnd={handleMediaEnd}
              isPortrait={isPortrait}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="font-orbitron text-4xl text-primary neon-glow mb-4">
                  PLAYER DE MÍDIA
                </h2>
                <p className="text-muted-foreground text-xl">
                  Aguardando conteúdo para reprodução...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Widgets Area */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Loteria Widget */}
        {settings.showLottery && (
          <div className="glass-effect rounded-lg p-4">
            <h3 className="font-orbitron text-lg text-primary mb-2">MEGA-SENA</h3>
            <div className="flex space-x-2">
              {[2, 24, 27, 30, 53, 57].map((num, i) => (
                <div key={i} className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {num}
                </div>
              ))}
            </div>
            {settings.lotteryApi && (
              <p className="text-xs text-muted-foreground mt-2">API configurada</p>
            )}
          </div>
        )}

        {/* Clima Widget */}
        {settings.showWeather && (
          <div className="glass-effect rounded-lg p-4">
            <h3 className="font-orbitron text-lg text-primary mb-2">CLIMA</h3>
            <div className="text-2xl font-bold">24°C</div>
            <div className="text-muted-foreground">Parcialmente Nublado</div>
            {settings.weatherApi && (
              <p className="text-xs text-muted-foreground mt-2">API configurada</p>
            )}
          </div>
        )}

        {/* Notícias Widget */}
        {settings.showNews && (
          <div className="glass-effect rounded-lg p-4">
            <h3 className="font-orbitron text-lg text-primary mb-2">NOTÍCIAS</h3>
            <div className="text-sm text-muted-foreground">
              Últimas atualizações em tempo real...
            </div>
            {settings.newsApi && (
              <p className="text-xs text-muted-foreground mt-2">API configurada</p>
            )}
          </div>
        )}
      </div>

      {settings.showFooter && <Footer />}
    </div>
  );
};

export default Player;
