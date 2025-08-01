
import React from 'react';
import { Button } from '@/components/ui/button';
import { Maximize, RotateCcw } from 'lucide-react';

interface PlayerControlsProps {
  isPortrait: boolean;
  isFullscreen: boolean;
  onTogglePortrait: () => void;
  onToggleFullscreen: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPortrait,
  isFullscreen,
  onTogglePortrait,
  onToggleFullscreen
}) => {
  return (
    <div className="absolute top-4 left-4 z-20 flex gap-2">
      <Button
        onClick={onTogglePortrait}
        variant="secondary"
        size="sm"
        className="bg-card/90 border-border hover:bg-accent"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        {isPortrait ? 'Paisagem' : 'Retrato'}
      </Button>
      
      <Button
        onClick={onToggleFullscreen}
        variant="secondary"
        size="sm"
        className="bg-card/90 border-border hover:bg-accent"
      >
        <Maximize className="h-4 w-4 mr-2" />
        {isFullscreen ? 'Sair' : 'Tela Cheia'}
      </Button>
    </div>
  );
};
