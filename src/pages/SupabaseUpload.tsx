import { useState, useEffect, type ChangeEvent } from 'react';
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
import { mediaService, MediaFile } from '@/services/mediaService';
import { clientService, Client } from '@/services/clientService';
import NavigationMenu from '@/components/navigation/NavigationMenu';
import { ClientLoginNew } from '@/components/auth/ClientLoginNew';
import { useTheme } from '@/hooks/useTheme';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

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
  const [myFiles, setMyFiles] = useState<MediaFile[]>([]);
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

  useEffect(() => {
    loadMyFiles();
  }, [loggedInClient, clients]);

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

  const loadMyFiles = async () => {
    try {
      if (!loggedInClient) return;
      const client = clients.find(c => c.id === loggedInClient.id || c.name === loggedInClient.name);
      if (!client) return;
      const all = await mediaService.getAllMediaFiles();
      const prefix = `${client.prefix.toLowerCase()}_`;
      const mine = all.filter(f => f.file_name?.startsWith(prefix));
      setMyFiles(mine);
    } catch (err) {
      console.error('Erro ao carregar mídias do cliente:', err);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const fileList = e.target.files ? Array.from(e.target.files) : [];
      if (fileList.length === 0) return;
      const MAX_MB = 50;
      const accepted = fileList.filter((f) => f.size <= MAX_MB * 1024 * 1024);
      const rejected = fileList.filter((f) => f.size > MAX_MB * 1024 * 1024);

      if (rejected.length > 0) {
        toast({
          title: 'Arquivo muito grande',
          description: `Alguns arquivos excedem ${MAX_MB}MB e foram ignorados: ${rejected.map((r) => r.name).join(', ')}`,
          variant: 'destructive',
        });
      }

      setSelectedFiles((prev) => [...prev, ...accepted]);
    } catch (err) {
      console.error('Erro ao selecionar arquivos:', err);
      toast({ title: 'Erro', description: 'Falha ao selecionar arquivos', variant: 'destructive' });
    } finally {
      // permite selecionar o mesmo arquivo novamente
      if (e.target) e.target.value = '';
    }
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
      const client = clients.find(c => c.id === loggedInClient.id || c.name === loggedInClient.name);
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileKey = `${file.name}_${i}`;
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => ({ ...prev, [fileKey]: progress }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        await mediaService.uploadFile(
          file,
          selectedFolder,
          animationType,
          animationDuration,
          client?.prefix
        );
        toast({ title: 'Sucesso', description: `${file.name} enviado com sucesso` });
      }
      setSelectedFiles([]);
      setUploadProgress({});
      await loadMyFiles();
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({ title: 'Erro', description: 'Erro durante o upload dos arquivos', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  if (!loggedInClient) {
    return <ClientLoginNew onLogin={(id, name) => setLoggedInClient({ id, name })} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationMenu />
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="border-primary/20 bg-white/90 dark:bg-gray-900/90"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setLoggedInClient(null)}
          className="border-destructive/20 text-destructive hover:bg-destructive/10 bg-white/90 dark:bg-gray-900/90"
        >
          Sair ({loggedInClient.name})
        </Button>
      </div>

      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Upload de Mídias</h1>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="upload">Upload</TabsTrigger>
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
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
                      >
                        {isUploading ? 'Enviando...' : `Enviar ${selectedFiles.length} arquivo(s)`}
                      </Button>
                    )}
                  </div>
              </CardContent>
            </Card>

            {/* Minhas Mídias */}
            <Card>
              <CardHeader>
                <CardTitle>Mídias do Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                {myFiles.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma mídia enviada ainda.</p>
                ) : (
                  <div className="w-full overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Pasta</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myFiles.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell className="font-medium">{file.original_name}</TableCell>
                            <TableCell>
                              <Select value={file.folder} onValueChange={async (v) => { await mediaService.updateFolder(file.id, v); await loadMyFiles(); }}>
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {folders.map((f) => (
                                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>{file.file_type.startsWith('video/') ? 'Vídeo' : 'Imagem'}</TableCell>
                            <TableCell>{file.hidden ? 'Oculto' : 'Visível'}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button size="sm" variant="outline" onClick={async () => { await mediaService.toggleVisibility(file.id, !file.hidden); await loadMyFiles(); }}>
                                {file.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </Button>
                              <Button size="sm" variant="destructive" onClick={async () => { await mediaService.deleteMediaFile(file.id); await loadMyFiles(); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
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