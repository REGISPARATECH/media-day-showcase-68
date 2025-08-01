import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Eye, EyeOff, Image, Video } from 'lucide-react';
import { MediaFile, MediaFolder } from '@/types';

interface MediaFolderManagerProps {
  mediaFolders: MediaFolder[];
  onDeleteMedia: (folderName: string, mediaId: string) => void;
  onToggleVisibility: (folderName: string, mediaId: string) => void;
  onUpdateMediaDay: (folderName: string, mediaId: string, newDay: string) => void;
}

const FOLDER_NAMES = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo', 'todos'];

export function MediaFolderManager({ 
  mediaFolders, 
  onDeleteMedia, 
  onToggleVisibility, 
  onUpdateMediaDay 
}: MediaFolderManagerProps) {
  const [selectedFolder, setSelectedFolder] = React.useState<string>('');

  const getFolderStats = (folder: MediaFolder) => {
    const total = folder.media.length;
    const images = folder.media.filter(m => m.type === 'image').length;
    const videos = folder.media.filter(m => m.type === 'video').length;
    return { total, images, videos };
  };

  const selectedFolderData = mediaFolders.find(f => f.name === selectedFolder);

  return (
    <div className="space-y-6">
      {/* Folders Overview */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-orbitron text-xl text-primary">
            VISÃO GERAL DAS PASTAS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FOLDER_NAMES.map(folderName => {
              const folder = mediaFolders.find(f => f.name === folderName);
              const stats = folder ? getFolderStats(folder) : { total: 0, images: 0, videos: 0 };
              
              return (
                <Card 
                  key={folderName}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedFolder === folderName ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedFolder(folderName)}
                >
                  <CardContent className="p-4 text-center">
                    <h3 className="font-medium capitalize mb-2">{folderName}</h3>
                    <div className="text-2xl font-bold text-primary mb-2">{stats.total}</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Image className="h-3 w-3" />
                        <span>{stats.images}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <Video className="h-3 w-3" />
                        <span>{stats.videos}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Folder Content */}
      {selectedFolderData && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-orbitron text-xl text-primary">
              CONTEÚDO - {selectedFolder.toUpperCase()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedFolderData.media.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Esta pasta não contém mídias
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Pasta</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedFolderData.media.map((media) => (
                    <TableRow key={media.id}>
                      <TableCell className="font-medium">{media.originalName}</TableCell>
                      <TableCell>{media.client}</TableCell>
                      <TableCell>
                        <Badge variant={media.type === 'video' ? 'default' : 'secondary'}>
                          {media.type === 'video' ? <Video className="h-3 w-3 mr-1" /> : <Image className="h-3 w-3 mr-1" />}
                          {media.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{(media.size / 1024 / 1024).toFixed(2)} MB</TableCell>
                      <TableCell>
                        <Select 
                          value={media.folder} 
                          onValueChange={(newDay) => onUpdateMediaDay(selectedFolder, media.id, newDay)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FOLDER_NAMES.map(day => (
                              <SelectItem key={day} value={day}>
                                {day.charAt(0).toUpperCase() + day.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={media.hidden ? 'destructive' : 'default'}>
                          {media.hidden ? 'Oculto' : 'Visível'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onToggleVisibility(selectedFolder, media.id)}
                          >
                            {media.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDeleteMedia(selectedFolder, media.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}