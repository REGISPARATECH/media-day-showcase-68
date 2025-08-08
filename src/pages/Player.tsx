
import { useState, useRef, useEffect } from "react";
import Footer from "@/components/layout/Footer";
import { useSupabaseMediaPlayer } from "@/hooks/useSupabaseMediaPlayer";
import { MediaRenderer } from "@/components/player/MediaRenderer";
import { settingsService } from "@/services/settingsService";
const Player = () => {
  const [showMarquee, setShowMarquee] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPortrait, setIsPortrait] = useState<boolean>(typeof window !== 'undefined' && 'matchMedia' in window ? window.matchMedia('(orientation: portrait)').matches : true);
  const [weather, setWeather] = useState<{ temp: number; desc: string } | null>(null);
  const [news, setNews] = useState<string[]>([]);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : {
      showFooter: true,
      showMarquee: true,
      marqueeText: "PARATECH SOLUÇÕES E SISTEMAS - Sistema de Mídia Digital",
      showLottery: true,
      showWeather: true,
      showNews: true,
      showWidgets: true,
      primaryColor: "#3b82f6",
      accentColor: "#8b5cf6",
      playerOrientation: "portrait"
    };
  });
  // Kiosk & orientação
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mql = window.matchMedia('(orientation: portrait)');
    const update = () => setIsPortrait(mql.matches);
    update();
    mql.addEventListener?.('change', update as any);
    window.addEventListener('resize', update);
    return () => {
      mql.removeEventListener?.('change', update as any);
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let idleTimer: any;
    const resetCursor = () => {
      el.classList.remove('cursor-none');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => el.classList.add('cursor-none'), 3000);
    };
    resetCursor();

    const preventContext = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', preventContext);
    el.addEventListener('mousemove', resetCursor);

    let wakeLock: any;
    const requestWakeLock = async () => {
      try { wakeLock = await (navigator as any).wakeLock?.request('screen'); } catch {}
    };
    requestWakeLock();
    const visHandler = () => { if (document.visibilityState === 'visible') requestWakeLock(); };
    document.addEventListener('visibilitychange', visHandler);

    return () => {
      document.removeEventListener('contextmenu', preventContext);
      el.removeEventListener('mousemove', resetCursor);
      clearTimeout(idleTimer);
      try { wakeLock?.release?.(); } catch {}
      document.removeEventListener('visibilitychange', visHandler);
    };
  }, []);

  // Listener para mudanças nas configurações
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('appSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Verificar mudanças a cada segundo
    const interval = setInterval(() => {
      const saved = localStorage.getItem('appSettings');
      if (saved) {
        const newSettings = JSON.parse(saved);
        setSettings(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(newSettings)) {
            return newSettings;
          }
          return prev;
        });
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

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
        <div className="w-full flex-1 bg-card shadow-card rounded-lg overflow-hidden relative min-h-0 flex items-center justify-center">
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
            <div className="w-full h-full flex items-center justify-center">
              <MediaRenderer
                media={currentMedia}
                mediaObj={currentMediaObj}
                onMediaEnd={handleMediaEnd}
                isPortrait={isPortrait}
              />
            </div>
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
        {settings.showWidgets && (
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
        )}

        {settings.showFooter && <Footer />}
      </div>
    </div>
  );
};

export default Player;
