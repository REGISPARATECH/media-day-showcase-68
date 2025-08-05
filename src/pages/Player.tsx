
import { useState, useRef } from "react";
import Footer from "@/components/layout/Footer";
import { useSupabaseMediaPlayer } from "@/hooks/useSupabaseMediaPlayer";
import { MediaRenderer } from "@/components/player/MediaRenderer";

const Player = () => {
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
      playerOrientation: "portrait"
    };
  });

  // Hooks personalizados
  const { currentMedia, currentMediaObj, loading, handleMediaEnd } = useSupabaseMediaPlayer();

  return (
    <div 
      ref={containerRef}
      className="h-screen w-screen flex flex-col gradient-metal overflow-hidden"
    >
      {/* Marquee Text */}
      {showMarquee && settings.showMarquee && settings.marqueeText && (
        <div className="bg-primary/90 text-primary-foreground py-2 overflow-hidden relative z-10 flex-shrink-0">
          <div className="animate-marquee whitespace-nowrap text-lg font-orbitron font-bold">
            {settings.marqueeText}
          </div>
        </div>
      )}

      {/* Player Area - Portrait optimized */}
      <div className="flex-1 flex flex-col p-2 min-h-0">
        <div className="w-full flex-1 bg-card shadow-card rounded-lg overflow-hidden relative min-h-0">
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
              isPortrait={true}
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

        {/* Widgets Area - Compact for portrait */}
        <div className="p-2 grid grid-cols-3 gap-2 flex-shrink-0">
          {/* Loteria Widget */}
          {settings.showLottery && (
            <div className="glass-effect rounded-lg p-2">
              <h3 className="font-orbitron text-sm text-primary mb-1">MEGA-SENA</h3>
              <div className="flex space-x-1">
                {[2, 24, 27, 30, 53, 57].map((num, i) => (
                  <div key={i} className="w-6 h-6 bg-success rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {num}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clima Widget */}
          {settings.showWeather && (
            <div className="glass-effect rounded-lg p-2">
              <h3 className="font-orbitron text-sm text-primary mb-1">CLIMA</h3>
              <div className="text-lg font-bold">24°C</div>
              <div className="text-xs text-muted-foreground">Nublado</div>
            </div>
          )}

          {/* Notícias Widget */}
          {settings.showNews && (
            <div className="glass-effect rounded-lg p-2">
              <h3 className="font-orbitron text-sm text-primary mb-1">NOTÍCIAS</h3>
              <div className="text-xs text-muted-foreground">
                Atualizações...
              </div>
            </div>
          )}
        </div>

        {settings.showFooter && <Footer />}
      </div>
    </div>
  );
};

export default Player;
