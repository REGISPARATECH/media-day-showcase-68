import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Save, X } from 'lucide-react';
import { Client } from '@/types';
import { PasswordInput } from '@/components/ui/password-input';

interface ClientManagerProps {
  clients: Client[];
  newClient: Omit<Client, 'id'>;
  editingClient: Client | null;
  onNewClientChange: (field: keyof Omit<Client, 'id'>, value: string) => void;
  onAddClient: () => void;
  onEditClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onCancelEdit: () => void;
  onDeleteClient: (id: string) => void;
  onEditingClientChange: (field: keyof Client, value: string) => void;
}

export function ClientManager({
  clients,
  newClient,
  editingClient,
  onNewClientChange,
  onAddClient,
  onEditClient,
  onUpdateClient,
  onCancelEdit,
  onDeleteClient,
  onEditingClientChange
}: ClientManagerProps) {
  const generatePrefix = (name: string) => {
    return name.slice(0, 3).toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Add Client */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-orbitron text-xl text-primary">
            ADICIONAR CLIENTE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Nome do Cliente"
            value={newClient.name}
            onChange={(e) => {
              onNewClientChange('name', e.target.value);
              onNewClientChange('prefix', generatePrefix(e.target.value));
            }}
          />
          <Input
            placeholder="Prefixo (3 letras)"
            value={newClient.prefix}
            onChange={(e) => onNewClientChange('prefix', e.target.value.slice(0, 3).toUpperCase())}
            maxLength={3}
          />
          <PasswordInput
            placeholder="Senha do Cliente"
            value={newClient.password}
            onChange={(e) => onNewClientChange('password', e.target.value)}
            showSaveOption={false}
          />
          <Button 
            onClick={onAddClient}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-orbitron"
            disabled={!newClient.name || !newClient.password || !newClient.prefix}
          >
            <Save className="mr-2 w-4 h-4" />
            SALVAR CLIENTE
          </Button>
        </CardContent>
      </Card>

      {/* Clients List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-orbitron text-xl text-primary">
            CLIENTES CADASTRADOS ({clients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
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
                      {editingClient?.id === client.id ? (
                        <Input
                          value={editingClient.name}
                          onChange={(e) => onEditingClientChange('name', e.target.value)}
                        />
                      ) : (
                        <div className="font-medium">{client.name}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingClient?.id === client.id ? (
                        <Input
                          value={editingClient.prefix}
                          onChange={(e) => onEditingClientChange('prefix', e.target.value.slice(0, 3).toUpperCase())}
                          maxLength={3}
                        />
                      ) : (
                        <Badge variant="outline">{client.prefix}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingClient?.id === client.id ? (
                        <PasswordInput
                          value={editingClient.password}
                          onChange={(e) => onEditingClientChange('password', e.target.value)}
                          showSaveOption={false}
                          placeholder="Nova senha"
                        />
                      ) : (
                        <span className="text-muted-foreground">••••••••</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {editingClient?.id === client.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => onUpdateClient(editingClient)}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={onCancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onEditClient(client)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onDeleteClient(client.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}