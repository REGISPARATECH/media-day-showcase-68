import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Upload as UploadIcon, Check, Sun, Moon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { mediaService } from '@/services/mediaService';
import { clientService, Client } from '@/services/clientService';
import NavigationMenu from '@/components/navigation/NavigationMenu';
import { ClientLogin } from '@/components/auth/ClientLogin';
import { useTheme } from '@/hooks/useTheme';

const SupabaseUpload = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('todos');
  const [selectedClient, setSelectedClient] = useState('');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [animationType, setAnimationType] = useState('fade');
  const [animationDuration, setAnimationDuration] = useState(5000);
  const [loggedInClient, setLoggedInClient] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const folders = [
    { value: 'todos', label: 'Todos os dias' },
    { value: 'domingo', label: 'Domingo' },
    { value: 'segunda', label: 'Segunda-feira' },
    { value: 'terça', label: 'Terça-feira' },
    { value: 'quarta', label: 'Quarta-feira' },
    { value: 'quinta', label: 'Quinta-feira' },
    { value: 'sexta', label: 'Sexta-feira' },
    { value: 'sábado', label: 'Sábado' }
  ];

  const animationTypes = [
    { value: 'fade', label: 'Fade' },
    { value: 'slide-left', label: 'Deslizar Esquerda' },
    { value: 'slide-right', label: 'Deslizar Direita' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'rotate', label: 'Rotacionar' },
    { value: 'none', label: 'Nenhuma' }
  ];

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const clientsList = await clientService.getAllClients();
      setClients(clientsList);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar lista de clientes',
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: 'Aviso',
        description: 'Apenas arquivos de imagem e vídeo são aceitos',
        variant: 'destructive',
      });
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!loggedInClient) {
      toast({
        title: 'Erro',
        description: 'Você precisa fazer login primeiro',
        variant: 'destructive',
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione pelo menos um arquivo',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileKey = `${file.name}_${i}`;
        
        // Simular progresso
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => ({ ...prev, [fileKey]: progress }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Upload do arquivo
        await mediaService.uploadFile(
          file, 
          selectedFolder, 
          animationType, 
          animationDuration,
          loggedInClient.name
        );
        
        toast({
          title: 'Sucesso',
          description: `${file.name} enviado com sucesso`,
        });
      }
      
      setSelectedFiles([]);
      setUploadProgress({});
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: 'Erro',
        description: 'Erro durante o upload dos arquivos',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Se não estiver logado, mostrar tela de login
  if (!loggedInClient) {
    return <ClientLogin onLogin={(id, name) => setLoggedInClient({ id, name })} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationMenu />
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="border-primary/20"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setLoggedInClient(null)}
          className="border-destructive/20 text-destructive hover:bg-destructive/10"
        >
          Sair ({loggedInClient.name})
        </Button>
      </div>

      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Upload de Mídias</h1>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              {/* Configurações do Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Upload</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="folder">Pasta de Destino</Label>
                      <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a pasta" />
                        </SelectTrigger>
                        <SelectContent>
                          {folders.map((folder) => (
                            <SelectItem key={folder.value} value={folder.value}>
                              {folder.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="animation">Tipo de Animação</Label>
                      <Select value={animationType} onValueChange={setAnimationType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a animação" />
                        </SelectTrigger>
                        <SelectContent>
                          {animationTypes.map((animation) => (
                            <SelectItem key={animation.value} value={animation.value}>
                              {animation.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração da Animação (ms)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={animationDuration}
                      onChange={(e) => setAnimationDuration(Number(e.target.value))}
                      min={1000}
                      max={10000}
                      step={500}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Upload de Arquivos */}
              <Card>
                <CardHeader>
                  <CardTitle>Selecionar Arquivos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <div className="space-y-2">
                        <p className="text-lg font-medium">Arrastar arquivos aqui ou</p>
                        <Button variant="outline" asChild>
                          <label htmlFor="file-upload" className="cursor-pointer">
                            Selecionar Arquivos
                          </label>
                        </Button>
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Imagens e vídeos até 50MB cada
                      </p>
                    </div>

                    {/* Lista de Arquivos Selecionados */}
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-medium">Arquivos Selecionados ({selectedFiles.length})</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {selectedFiles.map((file, index) => {
                            const fileKey = `${file.name}_${index}`;
                            const progress = uploadProgress[fileKey] || 0;
                            return (
                              <div key={fileKey} className="flex items-center gap-2 p-2 border rounded">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                  {progress > 0 && progress < 100 && (
                                    <Progress value={progress} className="mt-1" />
                                  )}
                                  {progress === 100 && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <Check className="h-4 w-4 text-green-500" />
                                      <span className="text-xs text-green-500">Concluído</span>
                                    </div>
                                  )}
                                </div>
                                {!isUploading && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                  >
                                    ×
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selectedFiles.length > 0 && (
                      <Button 
                        onClick={handleUpload} 
                        disabled={isUploading}
                        className="w-full"
                      >
                        {isUploading ? 'Enviando...' : `Enviar ${selectedFiles.length} arquivo(s)`}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Padrão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Essas configurações serão aplicadas por padrão aos novos uploads.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Pasta Padrão</Label>
                      <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {folders.map((folder) => (
                            <SelectItem key={folder.value} value={folder.value}>
                              {folder.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Animação Padrão</Label>
                      <Select value={animationType} onValueChange={setAnimationType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {animationTypes.map((animation) => (
                            <SelectItem key={animation.value} value={animation.value}>
                              {animation.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SupabaseUpload;