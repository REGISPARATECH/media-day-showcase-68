import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload as UploadIcon, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PasswordInput } from "@/components/ui/password-input";
import Footer from "@/components/layout/Footer";
import NavigationMenu from "@/components/navigation/NavigationMenu";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { DragDropUpload } from "@/components/upload/DragDropUpload";
import { AnimationSelector } from "@/components/upload/AnimationSelector";
import { FileConflictDialog } from "@/components/upload/FileConflictDialog";
import { MediaEditDialog } from "@/components/upload/MediaEditDialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Client, MediaFile, SystemSettings } from "@/types";
import { fileStorage } from "@/utils/fileStorage";

const Upload = () => {
  const [clientName, setClientName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState('fade');
  const [conflictFile, setConflictFile] = useState<{file: File; index: number} | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaFile | null>(null);
  
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);
  const [clients, setClients] = useLocalStorage<Client[]>('adminClients', []);
  const [settings, setSettings] = useLocalStorage<SystemSettings>('systemSettings', {
    showFooter: true,
    showMarquee: true,
    marqueeText: "PARATECH SOLUÇÕES E SISTEMAS - Sistema de Mídia Digital",
    showLottery: true,
    showWeather: true,
    showNews: true,
    primaryColor: "#3b82f6",
    accentColor: "#8b5cf6"
  });
  
  const { toast } = useToast();

  const folders = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO", "TODOS"];

  useEffect(() => {
    // Carregar arquivos do sistema de storage
    setUploadedFiles(fileStorage.getAllFiles());
    
    // Auto-carregar senha salva quando cliente for selecionado
    if (clientName) {
      const savedPassword = localStorage.getItem(`savedPassword_${clientName}`);
      if (savedPassword) {
        setPassword(savedPassword);
      }
    }
  }, [clientName]);

  const handleLogin = () => {
    // Autenticação real com dados do localStorage
    const client = clients.find(c => c.name === clientName && c.password === password);
    if (client) {
      setIsLoggedIn(true);
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${clientName}`,
      });
    } else {
      toast({
        title: "Erro no login",
        description: "Nome ou senha incorretos",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const checkFileConflict = (fileName: string, clientPrefix: string): boolean => {
    const prefixedName = `${clientPrefix}_${fileName}`;
    return fileStorage.checkFileExists(prefixedName, selectedFolder.toLowerCase());
  };

  const handleUpload = async () => {
    if (!selectedFolder || files.length === 0) {
      toast({
        title: "Erro no upload",
        description: "Selecione a pasta e pelo menos um arquivo",
        variant: "destructive"
      });
      return;
    }

    const client = clients.find(c => c.name === clientName);
    const clientPrefix = client?.prefix || clientName.slice(0, 3).toUpperCase();

    // Verificar conflitos de arquivos
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (checkFileConflict(file.name, clientPrefix)) {
        setConflictFile({ file, index: i });
        return;
      }
    }

    await processUpload();
  };

  const processUpload = async (replaceFile?: boolean) => {
    setIsUploading(true);
    setUploadProgress(0);

    const client = clients.find(c => c.name === clientName);
    const clientPrefix = client?.prefix || clientName.slice(0, 3).toUpperCase();

    try {
      const newFiles: MediaFile[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progress = ((i + 1) / files.length) * 100;
        setUploadProgress(progress);

        const prefixedName = `${clientPrefix}_${file.name}`;
        
        // Se estiver substituindo, remover o arquivo existente
        if (replaceFile) {
          const existingFile = fileStorage.getAllFiles().find(f => f.name === prefixedName && f.folder === selectedFolder.toLowerCase());
          if (existingFile) {
            fileStorage.deleteFile(existingFile.id);
          }
        }

        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const newFile: MediaFile = {
              id: `${Date.now()}_${Math.random()}_${i}`,
              name: prefixedName,
              originalName: file.name,
              type: file.type.startsWith('video/') ? 'video' : 'image',
              folder: selectedFolder.toLowerCase(),
              client: clientName,
              url: e.target?.result as string,
              size: file.size,
              hidden: false,
              animation: file.type.startsWith('image/') ? selectedAnimation as any : 'none'
            };
            newFiles.push(newFile);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }

      // Salvar arquivos no sistema de storage
      fileStorage.addFiles(selectedFolder.toLowerCase(), newFiles);
      
      // Atualizar estado local
      setUploadedFiles(fileStorage.getAllFiles());

      toast({
        title: "Upload realizado com sucesso!",
        description: `${files.length} arquivo(s) enviado(s) para ${selectedFolder}`,
      });

      // Aguardar um pouco para mostrar o progresso completo
      await new Promise(resolve => setTimeout(resolve, 500));

      // Limpar arquivos selecionados após upload
      setFiles([]);
      setSelectedFolder("");
      setSelectedAnimation('fade');
      
      // Limpar input de arquivo
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Falha ao enviar arquivos",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDelete = (id: string) => {
    fileStorage.deleteFile(id);
    setUploadedFiles(fileStorage.getAllFiles());
    toast({
      title: "Arquivo excluído",
      description: "Arquivo removido com sucesso",
    });
  };

  const handleEditMedia = (media: MediaFile) => {
    setEditingMedia(media);
  };

  const handleSaveMediaEdit = (updatedMedia: MediaFile) => {
    fileStorage.updateFile(updatedMedia.id, updatedMedia);
    setUploadedFiles(fileStorage.getAllFiles());
    
    setEditingMedia(null);
    toast({
      title: "Arquivo atualizado",
      description: "Configurações do arquivo foram salvas",
    });
  };

  const toggleMediaVisibility = (id: string) => {
    const file = fileStorage.getAllFiles().find(f => f.id === id);
    if (file) {
      const updatedFile = { ...file, hidden: !file.hidden };
      fileStorage.updateFile(id, updatedFile);
      setUploadedFiles(fileStorage.getAllFiles());
      toast({
        title: "Visibilidade alterada",
        description: "Status de exibição do arquivo foi alterado",
      });
    }
  };

  const clientFiles = fileStorage.getFilesByClient(clientName);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen gradient-metal flex items-center justify-center p-4">
        <NavigationMenu />
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md shadow-card">
          <CardHeader>
            <CardTitle className="font-orbitron text-2xl text-center text-primary neon-glow">
              LOGIN DO CLIENTE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={clientName} onValueChange={setClientName}>
              <SelectTrigger className="text-lg">
                <SelectValue placeholder="Selecione seu nome" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.name}>
                    {client.name} ({client.prefix})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <PasswordInput
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-lg"
              showSaveOption={true}
              onSave={(password) => {
                localStorage.setItem(`savedPassword_${clientName}`, password);
              }}
            />
            
            <Button 
              onClick={handleLogin}
              className="w-full gradient-primary text-lg font-orbitron"
            >
              ENTRAR
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-metal flex flex-col">
      <NavigationMenu />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex-1 p-6 space-y-6">
        <div className="text-center">
          <h1 className="font-orbitron text-4xl text-primary neon-glow mb-2">
            PAINEL DE UPLOAD
          </h1>
          <p className="text-muted-foreground text-xl">
            Bem-vindo, {clientName}
          </p>
        </div>

        {/* Upload Area */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-orbitron text-xl text-primary">
              ENVIAR ARQUIVOS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Selecionar Pasta de Destino
                </label>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha a pasta" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map(folder => (
                      <SelectItem key={folder} value={folder}>
                        {folder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <AnimationSelector
                  value={selectedAnimation}
                  onChange={setSelectedAnimation}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Selecionar Arquivos
                </label>
                <DragDropUpload
                  onFilesSelect={setFiles}
                  selectedFiles={files}
                  onRemoveFile={removeFile}
                  uploadProgress={uploadProgress}
                  isUploading={isUploading}
                />
              </div>
            </div>

            <Button 
              onClick={handleUpload}
              className="w-full gradient-primary text-lg font-orbitron"
              disabled={!selectedFolder || files.length === 0 || isUploading}
            >
              <UploadIcon className="mr-2" />
              {isUploading ? 'ENVIANDO...' : 'ENVIAR ARQUIVOS'}
            </Button>
          </CardContent>
        </Card>

        {/* Files List */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-orbitron text-xl text-primary">
              SEUS ARQUIVOS ({clientFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {clientFiles.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum arquivo enviado ainda
                </p>
              ) : (
                clientFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between bg-muted p-3 rounded">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {file.originalName}
                        {file.hidden && <EyeOff className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Tipo: {file.type} | Pasta: {file.folder.toUpperCase()} | {(file.size / 1024 / 1024).toFixed(2)} MB
                        {file.animation && file.animation !== 'none' && ` | Animação: ${file.animation}`}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditMedia(file)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant={file.hidden ? "default" : "outline"}
                        onClick={() => toggleMediaVisibility(file.id)}
                      >
                        {file.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDelete(file.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {settings.showFooter && <Footer />}

      {/* Conflict Dialog */}
      <FileConflictDialog
        isOpen={conflictFile !== null}
        fileName={conflictFile?.file.name || ''}
        onReplace={() => {
          setConflictFile(null);
          processUpload(true);
        }}
        onCancel={() => setConflictFile(null)}
      />

      {/* Edit Media Dialog */}
      <MediaEditDialog
        isOpen={editingMedia !== null}
        media={editingMedia}
        onSave={handleSaveMediaEdit}
        onCancel={() => setEditingMedia(null)}
      />
    </div>
  );
};

export default Upload;