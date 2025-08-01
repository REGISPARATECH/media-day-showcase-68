import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Users, Palette, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PasswordInput } from "@/components/ui/password-input";
import Footer from "@/components/layout/Footer";
import NavigationMenu from "@/components/navigation/NavigationMenu";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { ClientManager } from "@/components/admin/ClientManager";
import { MediaFolderManager } from "@/components/admin/MediaFolderManager";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Client, SystemSettings, MediaFile, MediaFolder } from "@/types";
import { fileStorage } from "@/utils/fileStorage";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [newClient, setNewClient] = useState<Omit<Client, 'id'>>({
    name: "",
    password: "",
    prefix: ""
  });
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [mediaFolders, setMediaFolders] = useState<MediaFolder[]>([]);

  const [clients, setClients] = useLocalStorage<Client[]>('adminClients', []);
  const [settings, setSettings] = useLocalStorage<SystemSettings>('systemSettings', {
    showFooter: true,
    showMarquee: true,
    marqueeText: "PARATECH SOLUÇÕES E SISTEMAS - Sistema de Mídia Digital",
    showLottery: true,
    showWeather: true,
    showNews: true,
    primaryColor: "#3b82f6",
    accentColor: "#8b5cf6",
    playerOrientation: "landscape"
  });

  const { toast } = useToast();

  useEffect(() => {
    // Auto-carregar senha de admin salva
    const savedAdminPassword = localStorage.getItem('savedAdminPassword');
    if (savedAdminPassword) {
      setAdminPassword(savedAdminPassword);
    }
    refreshMediaFolders();
  }, []);

  useEffect(() => {
    // Aplicar cores CSS quando mudarem
    if (settings.primaryColor && settings.accentColor) {
      const primaryHSL = hexToHSL(settings.primaryColor);
      const accentHSL = hexToHSL(settings.accentColor);
      
      document.documentElement.style.setProperty('--primary', primaryHSL);
      document.documentElement.style.setProperty('--accent', accentHSL);
    }
  }, [settings.primaryColor, settings.accentColor]);

  const hexToHSL = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const refreshMediaFolders = () => {
    const folderNames = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo', 'todos'];
    const folders = folderNames.map(folderName => {
      // Usar o sistema de storage centralizado
      const folderMedia = fileStorage.getFilesByFolder(folderName.toLowerCase());
      
      return {
        name: folderName,
        media: folderMedia
      };
    });
    setMediaFolders(folders);
  };

  const handleAdminLogin = () => {
    if (adminPassword === "admin123") {
      setIsAuthenticated(true);
      toast({
        title: "Acesso autorizado",
        description: "Bem-vindo ao painel administrativo",
      });
    } else {
      toast({
        title: "Acesso negado",
        description: "Senha incorreta",
        variant: "destructive"
      });
    }
  };

  const saveAdminPassword = (password: string) => {
    localStorage.setItem('savedAdminPassword', password);
    toast({
      title: "Senha salva",
      description: "Senha administrativa salva com sucesso",
    });
  };

  const handleAddClient = () => {
    if (!newClient.name || !newClient.password || !newClient.prefix) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    const client: Client = {
      id: Date.now().toString(),
      ...newClient
    };

    setClients(prev => [...prev, client]);
    setNewClient({ name: "", password: "", prefix: "" });
    
    toast({
      title: "Cliente adicionado",
      description: `${client.name} foi cadastrado com sucesso`,
    });
  };

  const handleDeleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Cliente removido",
      description: "Cliente excluído com sucesso",
    });
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    setEditingClient(null);
    toast({
      title: "Cliente atualizado",
      description: "Dados do cliente salvos com sucesso",
    });
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
  };

  const handleNewClientChange = (field: keyof Omit<Client, 'id'>, value: string) => {
    setNewClient(prev => ({ ...prev, [field]: value }));
  };

  const handleEditingClientChange = (field: keyof Client, value: string) => {
    if (editingClient) {
      setEditingClient(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleSettingsChange = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const saveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Todas as configurações foram atualizadas",
    });
  };

  const deleteMedia = (folderName: string, mediaId: string) => {
    // Usar o sistema de storage centralizado
    fileStorage.deleteFile(mediaId);
    
    refreshMediaFolders();
    toast({
      title: "Mídia excluída",
      description: "Arquivo removido com sucesso",
    });
  };

  const toggleMediaVisibility = (folderName: string, mediaId: string) => {
    // Usar o sistema de storage centralizado
    const file = fileStorage.getAllFiles().find(f => f.id === mediaId);
    if (file) {
      const updatedFile = { ...file, hidden: !file.hidden };
      fileStorage.updateFile(mediaId, updatedFile);
      
      refreshMediaFolders();
      toast({
        title: "Visibilidade alterada",
        description: "Status da mídia atualizado",
      });
    }
  };

  const updateMediaDay = (folderName: string, mediaId: string, newDay: string) => {
    // Usar o sistema de storage centralizado
    const file = fileStorage.getAllFiles().find(f => f.id === mediaId);
    if (file) {
      const updatedFile = { ...file, folder: newDay.toLowerCase() };
      fileStorage.updateFile(mediaId, updatedFile);
      
      refreshMediaFolders();
      toast({
        title: "Dia atualizado",
        description: `Mídia movida para ${newDay}`,
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-metal flex items-center justify-center p-4">
        <NavigationMenu />
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md shadow-card">
          <CardHeader>
            <CardTitle className="font-orbitron text-2xl text-center text-primary neon-glow">
              PAINEL ADMINISTRATIVO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PasswordInput
              placeholder="Senha Administrativa"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="text-lg"
              showSaveOption={true}
              onSave={saveAdminPassword}
            />
            <Button 
              onClick={handleAdminLogin}
              className="w-full gradient-primary text-lg font-orbitron"
            >
              <Settings className="mr-2" />
              ACESSAR
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
      <div className="flex-1 p-6">
        <div className="text-center mb-6">
          <h1 className="font-orbitron text-4xl text-primary neon-glow mb-2">
            PAINEL ADMINISTRATIVO
          </h1>
          <p className="text-muted-foreground text-xl">
            Configurações do Sistema
          </p>
        </div>

        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="clients" className="font-orbitron">
              <Users className="mr-2 w-4 h-4" />
              CLIENTES
            </TabsTrigger>
            <TabsTrigger value="media" className="font-orbitron">
              <FolderOpen className="mr-2 w-4 h-4" />
              PASTAS
            </TabsTrigger>
            <TabsTrigger value="appearance" className="font-orbitron">
              <Palette className="mr-2 w-4 h-4" />
              APARÊNCIA
            </TabsTrigger>
            <TabsTrigger value="widgets" className="font-orbitron">
              <Settings className="mr-2 w-4 h-4" />
              WIDGETS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients">
            <ClientManager
              clients={clients}
              newClient={newClient}
              editingClient={editingClient}
              onNewClientChange={handleNewClientChange}
              onAddClient={handleAddClient}
              onEditClient={handleEditClient}
              onUpdateClient={handleUpdateClient}
              onCancelEdit={handleCancelEdit}
              onDeleteClient={handleDeleteClient}
              onEditingClientChange={handleEditingClientChange}
            />
          </TabsContent>

          <TabsContent value="media">
            <MediaFolderManager
              mediaFolders={mediaFolders}
              onDeleteMedia={deleteMedia}
              onToggleVisibility={toggleMediaVisibility}
              onUpdateMediaDay={updateMediaDay}
            />
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-orbitron text-xl text-primary">
                  CONFIGURAÇÕES DE APARÊNCIA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showFooter">Exibir Rodapé</Label>
                      <Switch
                        id="showFooter"
                        checked={settings.showFooter}
                        onCheckedChange={(checked) => handleSettingsChange('showFooter', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showMarquee">Exibir Letreiro</Label>
                      <Switch
                        id="showMarquee"
                        checked={settings.showMarquee}
                        onCheckedChange={(checked) => handleSettingsChange('showMarquee', checked)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="marqueeText">Texto do Letreiro</Label>
                      <Textarea
                        id="marqueeText"
                        value={settings.marqueeText}
                        onChange={(e) => handleSettingsChange('marqueeText', e.target.value)}
                        placeholder="Digite o texto do letreiro"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="primaryColor">Cor Primária</Label>
                      <Input
                        id="primaryColor"
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => handleSettingsChange('primaryColor', e.target.value)}
                      />
                    </div>

                     <div>
                      <Label htmlFor="accentColor">Cor de Destaque</Label>
                      <Input
                        id="accentColor"
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => handleSettingsChange('accentColor', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="playerOrientation">Orientação do Player</Label>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant={settings.playerOrientation === 'landscape' ? 'default' : 'outline'}
                          onClick={() => handleSettingsChange('playerOrientation', 'landscape')}
                          className="font-orbitron"
                        >
                          PAISAGEM
                        </Button>
                        <Button
                          variant={settings.playerOrientation === 'portrait' ? 'default' : 'outline'}
                          onClick={() => handleSettingsChange('playerOrientation', 'portrait')}
                          className="font-orbitron"
                        >
                          RETRATO
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={saveSettings} className="w-full gradient-primary font-orbitron">
                  SALVAR CONFIGURAÇÕES
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="widgets">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-orbitron text-xl text-primary">
                  CONFIGURAÇÕES DE WIDGETS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showLottery">Widget Loteria</Label>
                      <Switch
                        id="showLottery"
                        checked={settings.showLottery}
                        onCheckedChange={(checked) => handleSettingsChange('showLottery', checked)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="lotteryApi">API da Loteria</Label>
                      <Input
                        id="lotteryApi"
                        value={settings.lotteryApi || ''}
                        onChange={(e) => handleSettingsChange('lotteryApi', e.target.value)}
                        placeholder="URL da API da loteria"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showWeather">Widget Clima</Label>
                      <Switch
                        id="showWeather"
                        checked={settings.showWeather}
                        onCheckedChange={(checked) => handleSettingsChange('showWeather', checked)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="weatherApi">API do Clima</Label>
                      <Input
                        id="weatherApi"
                        value={settings.weatherApi || ''}
                        onChange={(e) => handleSettingsChange('weatherApi', e.target.value)}
                        placeholder="URL da API do clima"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showNews">Widget Notícias</Label>
                      <Switch
                        id="showNews"
                        checked={settings.showNews}
                        onCheckedChange={(checked) => handleSettingsChange('showNews', checked)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="newsApi">API de Notícias</Label>
                      <Input
                        id="newsApi"
                        value={settings.newsApi || ''}
                        onChange={(e) => handleSettingsChange('newsApi', e.target.value)}
                        placeholder="URL da API de notícias"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={saveSettings} className="w-full gradient-primary font-orbitron">
                  SALVAR CONFIGURAÇÕES
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {settings.showFooter && <Footer />}
    </div>
  );
};

export default Admin;