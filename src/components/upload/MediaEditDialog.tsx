import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MediaFile } from '@/types';

interface MediaEditDialogProps {
  isOpen: boolean;
  media: MediaFile | null;
  onSave: (updatedMedia: MediaFile) => void;
  onCancel: () => void;
}

export function MediaEditDialog({ 
  isOpen, 
  media, 
  onSave, 
  onCancel 
}: MediaEditDialogProps) {
  const [editedMedia, setEditedMedia] = useState<MediaFile | null>(media);

  const folders = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado", "todos"];

  React.useEffect(() => {
    setEditedMedia(media);
  }, [media]);

  if (!editedMedia) return null;

  const handleSave = () => {
    onSave(editedMedia);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Mídia</DialogTitle>
          <DialogDescription>
            Altere as configurações do arquivo: {editedMedia.originalName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="folder-select">Pasta de Exibição</Label>
            <Select 
              value={editedMedia.folder} 
              onValueChange={(value) => setEditedMedia({...editedMedia, folder: value})}
            >
              <SelectTrigger id="folder-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {folders.map(folder => (
                  <SelectItem key={folder} value={folder}>
                    {folder.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="visibility-switch"
              checked={!editedMedia.hidden}
              onCheckedChange={(checked) => setEditedMedia({...editedMedia, hidden: !checked})}
            />
            <Label htmlFor="visibility-switch">
              {editedMedia.hidden ? 'Arquivo Oculto' : 'Arquivo Visível'}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}