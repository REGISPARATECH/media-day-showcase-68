
import React, { useEffect, useState } from 'react';
import { MediaFile } from '@/types';

// Função helper para determinar o tipo de mídia
const getMediaType = (file: MediaFile): 'image' | 'video' => {
  if (file.type) return file.type;
  if (file.file_type?.startsWith('image/')) return 'image';
  if (file.file_type?.startsWith('video/')) return 'video';
  return 'image'; // fallback
};

// Função helper para obter a animação
const getAnimation = (file: MediaFile): string => {
  return file.animation || file.animation_type || 'fade';
};

interface MediaRendererProps {
  media: string;
  mediaObj: MediaFile;
  onMediaEnd: () => void;
  isPortrait: boolean;
  muted?: boolean;
}

export const MediaRenderer: React.FC<MediaRendererProps> = ({ 
  media, 
  mediaObj, 
  onMediaEnd,
  isPortrait 
}) => {
  const [imageDuration] = useState(() => {
    // Duração configurável para imagens (1 a 10 segundos)
    // Por enquanto usando 5 segundos, mas pode ser configurado
    return 5000;
  });

  const getAnimationClass = () => {
    const animation = getAnimation(mediaObj);
    if (!animation || animation === 'none') {
      return 'animate-fade-in';
    }
    
    switch (animation) {
      case 'fade':
        return 'animate-fade-in';
      case 'slide-left':
        return 'animate-slide-in-left';
      case 'slide-right':
        return 'animate-slide-in-right';
      case 'zoom':
        return 'animate-scale-in';
      case 'rotate':
        return 'animate-spin';
      default:
        return 'animate-fade-in';
    }
  };

  // Timer para imagens
  useEffect(() => {
    const mediaType = getMediaType(mediaObj);
    if (mediaType === 'image') {
      const duration = mediaObj.animation_duration || imageDuration;
      console.log(`Imagem será exibida por ${duration/1000} segundos`);
      const timer = setTimeout(() => {
        console.log('Tempo de exibição da imagem finalizado');
        onMediaEnd();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [media, mediaObj, imageDuration, onMediaEnd]);

  const handleVideoEnd = () => {
    console.log('Vídeo finalizado');
    onMediaEnd();
  };

  if (getMediaType(mediaObj) === 'video') {
    return (
      <video
        key={media}
        src={media}
        autoPlay
        muted
        onEnded={handleVideoEnd}
        className="max-w-full max-h-full object-contain"
      />
    );
  }

  return (
    <img
      key={media}
      src={media}
      alt="Current media"
      className={`max-w-full max-h-full object-contain ${getAnimationClass()}`}
    />
  );
};
