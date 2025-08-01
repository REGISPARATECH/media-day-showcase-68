
import { useState, useEffect, useCallback } from 'react';
import { MediaFile } from '@/types';
import { fileStorage } from '@/utils/fileStorage';

export const useMediaPlayer = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [currentMedia, setCurrentMedia] = useState<string | null>(null);
  const [currentMediaObj, setCurrentMediaObj] = useState<MediaFile | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const updateMediaFiles = useCallback(() => {
    const files = fileStorage.getAllFiles();
    setMediaFiles(files);
    console.log('Mídias carregadas:', files.length);
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
    console.log(`Reproduzindo mídia ${currentIndex + 1}/${availableMedia.length}:`, media.originalName);
    
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
    
    // Atualizar a cada 10 segundos (melhor performance)
    const updateInterval = setInterval(updateMediaFiles, 10000);
    
    return () => clearInterval(updateInterval);
  }, [updateMediaFiles]);

  // Iniciar reprodução quando houver mídias
  useEffect(() => {
    const availableMedia = getCurrentDayMedia();
    if (availableMedia.length > 0 && !isPlaying) {
      console.log('Iniciando reprodução automática...');
      playNextMedia();
    }
  }, [mediaFiles, getCurrentDayMedia, playNextMedia, isPlaying]);

  return {
    currentMedia,
    currentMediaObj,
    isPlaying,
    handleMediaEnd,
    playNextMedia
  };
};
