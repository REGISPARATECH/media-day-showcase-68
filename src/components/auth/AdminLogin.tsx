import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AdminLoginProps {
  onLogin: () => void;
  onCancel?: () => void;
}

export const AdminLogin = ({ onLogin, onCancel }: AdminLoginProps) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const ADMIN_PASSWORD = '#PARATECHCargaTotal';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite a senha de administrador',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    // Simular delay de autenticação
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        onLogin();
        toast({
          title: 'Sucesso',
          description: 'Acesso liberado para administração',
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Senha de administrador incorreta',
          variant: 'destructive',
        });
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Acesso Administrativo</CardTitle>
          <p className="text-muted-foreground">
            Digite a senha de administrador para continuar
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha do Administrador</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                disabled={loading}
                className="border-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Verificando...' : 'Acessar'}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};