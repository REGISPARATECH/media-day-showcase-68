
import React, { useEffect, useState } from 'react';
import { MediaFile } from '@/types';

interface MediaRendererProps {
  media: string;
  mediaObj: MediaFile;
  onMediaEnd: () => void;
  isPortrait: boolean;
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
    if (!mediaObj || !mediaObj.animation || mediaObj.animation === 'none') {
      return 'animate-fade-in';
    }
    
    switch (mediaObj.animation) {
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
    if (mediaObj.type === 'image') {
      console.log(`Imagem será exibida por ${imageDuration/1000} segundos`);
      const timer = setTimeout(() => {
        console.log('Tempo de exibição da imagem finalizado');
        onMediaEnd();
      }, imageDuration);

      return () => clearTimeout(timer);
    }
  }, [media, mediaObj.type, imageDuration, onMediaEnd]);

  const handleVideoEnd = () => {
    console.log('Vídeo finalizado');
    onMediaEnd();
  };

  if (mediaObj.type === 'video') {
    return (
      <video
        key={media}
        src={media}
        autoPlay
        muted
        onEnded={handleVideoEnd}
        className={`${isPortrait ? 'h-full w-auto' : 'w-full h-full'} object-cover`}
      />
    );
  }

  return (
    <img
      key={media}
      src={media}
      alt="Current media"
      className={`${isPortrait ? 'h-full w-auto' : 'w-full h-full'} object-cover ${getAnimationClass()}`}
    />
  );
};
