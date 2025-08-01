import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Upload as UploadIcon, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { mediaService } from '@/services/mediaService';
import { clientService, Client } from '@/services/clientService';
import NavigationMenu from '@/components/navigation/NavigationMenu';
import ThemeToggle from '@/components/layout/ThemeToggle';

const SupabaseUpload = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('todos');
  const [selectedClient, setSelectedClient] = useState('');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [animationType, setAnimationType] = useState('fade');
  const [animationDuration, setAnimationDuration] = useState(5000);
  const { toast } = useToast();

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
      const clientList = await clientService.getAllClients();
      setClients(clientList);
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
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      if (!isValid) {
        toast({
          title: 'Arquivo inválido',
          description: `${file.name} não é um arquivo de imagem ou vídeo válido`,
          variant: 'destructive',
        });
      }
      return isValid;
    });
    
    setSelectedFiles(validFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione pelo menos um arquivo para upload',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    const progressMap: Record<string, number> = {};

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileKey = `${file.name}_${i}`;
        
        progressMap[fileKey] = 0;
        setUploadProgress({ ...progressMap });

        // Simulação de progresso (o Supabase não fornece progresso de upload em tempo real)
        const progressInterval = setInterval(() => {
          progressMap[fileKey] = Math.min(progressMap[fileKey] + 10, 90);
          setUploadProgress({ ...progressMap });
        }, 100);

        try {
          await mediaService.uploadFile(
            file,
            selectedFolder,
            animationType,
            animationDuration
          );

          clearInterval(progressInterval);
          progressMap[fileKey] = 100;
          setUploadProgress({ ...progressMap });

          toast({
            title: 'Upload concluído',
            description: `${file.name} foi enviado com sucesso`,
          });
        } catch (error) {
          clearInterval(progressInterval);
          console.error('Erro no upload:', error);
          toast({
            title: 'Erro no upload',
            description: `Erro ao enviar ${file.name}`,
            variant: 'destructive',
          });
        }
      }

      // Limpar formulário após upload
      setSelectedFiles([]);
      setUploadProgress({});
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Erro geral no upload:', error);
      toast({
        title: 'Erro',
        description: 'Erro durante o processo de upload',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationMenu />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Upload de Mídias</h1>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload de Arquivos</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Selecionar Arquivos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="folder-select">Pasta de Destino</Label>
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
                      <Label htmlFor="animation-select">Tipo de Animação</Label>
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
                    <Label htmlFor="duration-input">Duração da Imagem (ms)</Label>
                    <Input
                      id="duration-input"
                      type="number"
                      value={animationDuration}
                      onChange={(e) => setAnimationDuration(Number(e.target.value))}
                      min={1000}
                      max={30000}
                      step={1000}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file-upload">Arquivos de Mídia</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileSelect}
                      disabled={isUploading}
                    />
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Arquivos Selecionados:</h3>
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => {
                          const fileKey = `${file.name}_${index}`;
                          const progress = uploadProgress[fileKey] || 0;
                          
                          return (
                            <div key={fileKey} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium">{file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                {isUploading && progress > 0 && (
                                  <Progress value={progress} className="mt-2" />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {progress === 100 && (
                                  <Check className="h-5 w-5 text-green-500" />
                                )}
                                {!isUploading && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                  >
                                    Remover
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || isUploading}
                    className="w-full"
                  >
                    <UploadIcon className="h-4 w-4 mr-2" />
                    {isUploading ? 'Enviando...' : `Enviar ${selectedFiles.length} arquivo(s)`}
                  </Button>
                </CardContent>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Os arquivos serão armazenados no Supabase Storage e ficará disponível em todos os dispositivos conectados.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Upload</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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

                    <div className="space-y-2">
                      <Label>Duração Padrão para Imagens (ms)</Label>
                      <Input
                        type="number"
                        value={animationDuration}
                        onChange={(e) => setAnimationDuration(Number(e.target.value))}
                        min={1000}
                        max={30000}
                        step={1000}
                      />
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