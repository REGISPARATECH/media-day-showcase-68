import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PasswordInput } from '@/components/ui/password-input';
import { clientService } from '@/services/clientService';

interface ClientLoginNewProps {
  onLogin: (id: string, name: string) => void;
}

export const ClientLoginNew = ({ onLogin }: ClientLoginNewProps) => {
  const [clientName, setClientName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName.trim() || !password.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite o nome do cliente e a senha',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      // Buscar cliente por nome e validar senha
      const clients = await clientService.getAllClients();
      const client = clients.find(c => 
        c.name.toLowerCase() === clientName.toLowerCase() && 
        c.password === password
      );

      if (client) {
        onLogin(client.id, client.name);
        toast({
          title: 'Sucesso',
          description: `Bem-vindo, ${client.name}!`,
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Nome do cliente ou senha incorretos',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao conectar com o servidor',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Upload de Mídias</CardTitle>
          <p className="text-muted-foreground">
            Digite suas credenciais de cliente para continuar
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Digite o nome do cliente"
                disabled={loading}
                className="border-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                disabled={loading}
                className="border-primary/20 focus:border-primary"
                showSaveOption={true}
                onSave={(savedPassword) => {
                  localStorage.setItem(`clientPassword_${clientName}`, savedPassword);
                }}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white" 
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Acessar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};