import { useState, useEffect, useCallback } from 'react';
import { mediaService, MediaFile } from '@/services/mediaService';

export const useSupabaseMediaPlayer = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [currentMedia, setCurrentMedia] = useState<string | null>(null);
  const [currentMediaObj, setCurrentMediaObj] = useState<MediaFile | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  const dayMapping = {
    sunday: "domingo",
    monday: "segunda", 
    tuesday: "terça",
    wednesday: "quarta",
    thursday: "quinta",
    friday: "sexta",
    saturday: "sábado"
  };

  const getCurrentDayMedia = useCallback(() => {
    const today = new Date().getDay();
    const dayNames = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
    const todayName = dayNames[today];
    
    return mediaFiles.filter((file: MediaFile) => 
      (file.folder === "todos" || file.folder === todayName) && !file.hidden
    );
  }, [mediaFiles]);

  const updateMediaFiles = useCallback(async () => {
    try {
      setLoading(true);
      const files = await mediaService.getAllMediaFiles();
      setMediaFiles(files);
      console.log('Mídias carregadas do Supabase:', files.length);
    } catch (error) {
      console.error('Erro ao carregar mídias:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const playNextMedia = useCallback(() => {
    const availableMedia = getCurrentDayMedia();
    if (availableMedia.length === 0) {
      console.log('Nenhuma mídia disponível');
      setCurrentMedia(null);
      setCurrentMediaObj(null);
      setIsPlaying(false);
      return;
    }

    const media = availableMedia[currentIndex];
    console.log(`Reproduzindo mídia ${currentIndex + 1}/${availableMedia.length}:`, media.original_name);
    
    setCurrentMedia(media.url);
    setCurrentMediaObj(media);
    setIsPlaying(true);
    
    // Avançar para próximo índice
    setCurrentIndex((prev) => (prev + 1) % availableMedia.length);
  }, [currentIndex, getCurrentDayMedia]);

  const handleMediaEnd = useCallback(() => {
    console.log('Mídia finalizada, reproduzindo próxima...');
    playNextMedia();
  }, [playNextMedia]);

  // Carregar mídias inicialmente
  useEffect(() => {
    updateMediaFiles();
    
    // Atualizar conforme configuração
    const settingsRaw = localStorage.getItem('appSettings');
    const intervalMs = (() => {
      try {
        const parsed = JSON.parse(settingsRaw || '{}');
        const val = parsed.playerRefreshIntervalMs || 30000;
        return Math.max(5000, Number(val));
      } catch {
        return 30000;
      }
    })();
    const updateInterval = setInterval(updateMediaFiles, intervalMs);
    
    return () => clearInterval(updateInterval);
  }, [updateMediaFiles]);

  // Iniciar reprodução quando houver mídias
  useEffect(() => {
    const availableMedia = getCurrentDayMedia();
    if (availableMedia.length > 0 && !isPlaying && !loading) {
      console.log('Iniciando reprodução automática...');
      playNextMedia();
    }
  }, [mediaFiles, getCurrentDayMedia, playNextMedia, isPlaying, loading]);

  return {
    currentMedia,
    currentMediaObj,
    isPlaying,
    loading,
    handleMediaEnd,
    playNextMedia,
    updateMediaFiles
  };
};