import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnimationSelectorProps {
  value: string;
  onChange: (animation: string) => void;
}

export function AnimationSelector({ value, onChange }: AnimationSelectorProps) {
  const animations = [
    { value: 'none', label: 'Sem animação' },
    { value: 'fade', label: 'Fade In/Out' },
    { value: 'slide-left', label: 'Deslizar da Esquerda' },
    { value: 'slide-right', label: 'Deslizar da Direita' },
    { value: 'zoom', label: 'Zoom In/Out' },
    { value: 'rotate', label: 'Rotação' }
  ];

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Efeito de Animação (somente para imagens)
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma animação" />
        </SelectTrigger>
        <SelectContent>
          {animations.map(animation => (
            <SelectItem key={animation.value} value={animation.value}>
              {animation.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}