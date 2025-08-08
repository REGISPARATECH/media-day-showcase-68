import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Eye, EyeOff, Edit, Trash2, Save, X, Sun, Moon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clientService, Client } from '@/services/clientService';
import { mediaService, MediaFile } from '@/services/mediaService';
import NavigationMenu from '@/components/navigation/NavigationMenu';
import { AdminLogin } from '@/components/auth/AdminLogin';
import { useTheme } from '@/hooks/useTheme';
import { SettingsManager } from '@/components/admin/SettingsManager';

const SupabaseAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [newClient, setNewClient] = useState({ name: '', prefix: '', password: '' });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const folders = [
    { value: '', label: 'Todas as pastas' },
    { value: 'todos', label: 'Todos os dias' },
    { value: 'domingo', label: 'Domingo' },
    { value: 'segunda', label: 'Segunda-feira' },
    { value: 'terça', label: 'Terça-feira' },
    { value: 'quarta', label: 'Quarta-feira' },
    { value: 'quinta', label: 'Quinta-feira' },
    { value: 'sexta', label: 'Sexta-feira' },
    { value: 'sábado', label: 'Sábado' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientList, mediaList] = await Promise.all([
        clientService.getAllClients(),
        mediaService.getAllMediaFiles()
      ]);
      setClients(clientList);
      setMediaFiles(mediaList);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do servidor',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePrefix = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '').substring(0, 6);
  };

  const handleAddClient = async () => {
    if (!newClient.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do cliente é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    try {
      const client = {
        ...newClient,
        prefix: newClient.prefix || generatePrefix(newClient.name),
        password: newClient.password || '123456'
      };

      await clientService.addClient(client);
      await loadData();
      setNewClient({ name: '', prefix: '', password: '' });
      
      toast({
        title: 'Sucesso',
        description: 'Cliente adicionado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar cliente',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateClient = async (id: string, updates: Partial<Client>) => {
    try {
      await clientService.updateClient(id, updates);
      await loadData();
      setEditingClient(null);
      
      toast({
        title: 'Sucesso',
        description: 'Cliente atualizado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar cliente',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await clientService.deleteClient(id);
      await loadData();
      
      toast({
        title: 'Sucesso',
        description: 'Cliente removido com sucesso',
      });
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover cliente',
        variant: 'destructive',
      });
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      await mediaService.toggleVisibility(id, !currentVisibility);
      await loadData();
      
      toast({
        title: 'Sucesso',
        description: `Mídia ${!currentVisibility ? 'ocultada' : 'exibida'} com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao alterar visibilidade:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao alterar visibilidade da mídia',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      await mediaService.deleteMediaFile(id);
      await loadData();
      
      toast({
        title: 'Sucesso',
        description: 'Mídia removida com sucesso',
      });
    } catch (error) {
      console.error('Erro ao remover mídia:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover mídia',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateMediaFolder = async (id: string, folder: string) => {
    try {
      await mediaService.updateFolder(id, folder);
      await loadData();
      
      toast({
        title: 'Sucesso',
        description: 'Pasta da mídia atualizada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao atualizar pasta:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar pasta da mídia',
        variant: 'destructive',
      });
    }
  };

  const filteredMediaFiles = selectedFolder
    ? mediaFiles.filter(file => file.folder === selectedFolder)
    : mediaFiles;

  const getFolderStats = (folder: string) => {
    const folderFiles = mediaFiles.filter(file => file.folder === folder);
    return {
      total: folderFiles.length,
      images: folderFiles.filter(file => file.file_type.startsWith('image/')).length,
      videos: folderFiles.filter(file => file.file_type.startsWith('video/')).length,
    };
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carregando...</h1>
          <p className="text-muted-foreground">Conectando ao servidor...</p>
        </div>
      </div>
    );
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
          size="sm"
          onClick={() => setIsAuthenticated(false)}
          className="border-destructive/20 text-destructive hover:bg-destructive/10"
        >
          Sair
        </Button>
      </div>

      <div className="container mx-auto p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Administração</h1>

          <Tabs defaultValue="clients" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="clients">Clientes</TabsTrigger>
              <TabsTrigger value="folders">Pastas</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="clients" className="space-y-6">
              {/* Adicionar Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Novo Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-name">Nome do Cliente</Label>
                      <Input
                        id="client-name"
                        value={newClient.name}
                        onChange={(e) => setNewClient({
                          ...newClient,
                          name: e.target.value,
                          prefix: generatePrefix(e.target.value)
                        })}
                        placeholder="Nome do cliente"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-prefix">Prefixo</Label>
                      <Input
                        id="client-prefix"
                        value={newClient.prefix}
                        onChange={(e) => setNewClient({ ...newClient, prefix: e.target.value })}
                        placeholder="Prefixo gerado automaticamente"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-password">Senha</Label>
                      <Input
                        id="client-password"
                        type="password"
                        value={newClient.password}
                        onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                        placeholder="Senha (padrão: 123456)"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddClient} className="bg-red-600 hover:bg-red-700 text-white">Salvar Cliente</Button>
                </CardContent>
              </Card>

              {/* Lista de Clientes */}
              <Card>
                <CardHeader>
                  <CardTitle>Clientes Cadastrados ({clients.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {clients.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum cliente cadastrado
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Prefixo</TableHead>
                          <TableHead>Senha</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell>
                              {editingClient === client.id ? (
                                <Input
                                  defaultValue={client.name}
                                  onBlur={(e) => handleUpdateClient(client.id, { name: e.target.value })}
                                />
                              ) : (
                                client.name
                              )}
                            </TableCell>
                            <TableCell>
                              {editingClient === client.id ? (
                                <Input
                                  defaultValue={client.prefix}
                                  onBlur={(e) => handleUpdateClient(client.id, { prefix: e.target.value })}
                                />
                              ) : (
                                client.prefix
                              )}
                            </TableCell>
                            <TableCell>
                              {editingClient === client.id ? (
                                <Input
                                  type="password"
                                  defaultValue={client.password}
                                  onBlur={(e) => handleUpdateClient(client.id, { password: e.target.value })}
                                />
                              ) : (
                                '••••••••'
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {editingClient === client.id ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingClient(null)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingClient(client.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir o cliente "{client.name}"?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                   <AlertDialogAction onClick={() => handleDeleteClient(client.id)} className="bg-red-600 hover:bg-red-700 text-white">
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="folders" className="space-y-6">
              {/* Filtro de Pasta */}
              <Card>
                <CardHeader>
                  <CardTitle>Filtrar por Pasta</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue placeholder="Selecione uma pasta" />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map((folder) => (
                        <SelectItem key={folder.value} value={folder.value}>
                          {folder.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Lista de Mídias */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Arquivos de Mídia ({filteredMediaFiles.length})
                    {selectedFolder && ` - ${folders.find(f => f.value === selectedFolder)?.label}`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredMediaFiles.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhuma mídia encontrada
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Tamanho</TableHead>
                          <TableHead>Pasta</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMediaFiles.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell className="font-medium">
                              {file.original_name}
                            </TableCell>
                            <TableCell>
                              <Badge variant={file.file_type.startsWith('image/') ? 'default' : 'secondary'}>
                                {file.file_type.startsWith('image/') ? 'Imagem' : 'Vídeo'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {(file.file_size / 1024 / 1024).toFixed(2)} MB
                            </TableCell>
                            <TableCell>
                              <Select
                                value={file.folder}
                                onValueChange={(value) => handleUpdateMediaFolder(file.id, value)}
                              >
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {folders.slice(1).map((folder) => (
                                    <SelectItem key={folder.value} value={folder.value}>
                                      {folder.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Badge variant={file.hidden ? 'destructive' : 'default'}>
                                {file.hidden ? 'Oculto' : 'Visível'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleVisibility(file.id, file.hidden)}
                                >
                                  {file.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir "{file.original_name}"?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteMedia(file.id)}>
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <SettingsManager />
            </TabsContent>

            <TabsContent value="folders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciamento de Pastas de Mídia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {folders.slice(1).map((folder) => {
                      const stats = getFolderStats(folder.value);
                      return (
                        <Card 
                          key={folder.value}
                          className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedFolder === folder.value ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedFolder(folder.value)}
                        >
                          <CardContent className="p-4 text-center">
                            <h3 className="font-medium mb-2">{folder.label}</h3>
                            <div className="text-2xl font-bold text-primary mb-1">{stats.total}</div>
                            <div className="text-xs text-muted-foreground">
                              <div>{stats.images} imagens</div>
                              <div>{stats.videos} vídeos</div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {selectedFolder && (
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          Conteúdo - {folders.find(f => f.value === selectedFolder)?.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {filteredMediaFiles.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4">
                            Esta pasta não contém mídias
                          </p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Tamanho</TableHead>
                                <TableHead>Pasta</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredMediaFiles.map((file) => (
                                <TableRow key={file.id}>
                                  <TableCell className="font-medium">
                                    {file.original_name}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={file.file_type.startsWith('video/') ? 'default' : 'secondary'}>
                                      {file.file_type.startsWith('video/') ? 'Vídeo' : 'Imagem'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {(file.file_size / 1024 / 1024).toFixed(2)} MB
                                  </TableCell>
                                  <TableCell>
                                    <Select 
                                      value={file.folder} 
                                      onValueChange={(newFolder) => handleUpdateMediaFolder(file.id, newFolder)}
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {folders.slice(1).map(folder => (
                                          <SelectItem key={folder.value} value={folder.value}>
                                            {folder.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={file.hidden ? 'destructive' : 'default'}>
                                      {file.hidden ? 'Oculto' : 'Visível'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleToggleVisibility(file.id, file.hidden)}
                                      >
                                        {file.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                      </Button>
                                       <AlertDialog>
                                         <AlertDialogTrigger asChild>
                                           <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                             <Trash2 className="h-4 w-4" />
                                           </Button>
                                         </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Tem certeza que deseja excluir "{file.original_name}"?
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                             <AlertDialogAction onClick={() => handleDeleteMedia(file.id)} className="bg-red-600 hover:bg-red-700 text-white">
                                               Excluir
                                             </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SupabaseAdmin;