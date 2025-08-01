# Instalação da Aplicação de Mídia Digital em VPS com Coolify

## Pré-requisitos

1. **VPS com Ubuntu 20.04 ou superior**
   - Mínimo 2GB RAM
   - 20GB de armazenamento
   - Acesso root via SSH

2. **Domínio configurado** (opcional, mas recomendado)
   - Subdomínio apontando para o IP da VPS
   - Exemplo: `midia.seudominio.com`

## Passo 1: Instalação do Docker

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release -y

# Adicionar chave GPG do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar repositório Docker
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io -y

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Passo 2: Instalação do Coolify

```bash
# Fazer logout e login novamente ou executar:
newgrp docker

# Instalar Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

## Passo 3: Configuração Inicial do Coolify

1. **Acessar Coolify**
   - Abra o navegador em `http://seu-ip-vps:8000`
   - Complete a configuração inicial (usuário admin, senha, etc.)

2. **Configurar domínio (opcional)**
   - Vá em Settings > Configuration
   - Configure o domínio se tiver

## Passo 4: Deploy da Aplicação

### Método 1: Via Git Repository

1. **Criar novo projeto no Coolify**
   - Clique em "New Project"
   - Digite um nome: "media-digital"

2. **Adicionar aplicação**
   - Clique em "New Resource" > "Application"
   - Selecione "Git Repository"
   - Configure:
     - **Repository URL**: URL do seu repositório Git
     - **Branch**: main ou master
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm run preview` ou configure um servidor
     - **Port**: 4173 (ou a porta que sua aplicação usa)

### Método 2: Via Dockerfile

1. **Criar Dockerfile na raiz do projeto**:
```dockerfile
# Use Node.js 18 Alpine
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Instalar serve para servir arquivos estáticos
RUN npm install -g serve

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["serve", "-s", "dist", "-l", "3000"]
```

2. **Configurar no Coolify**:
   - Tipo: "Dockerfile"
   - Port: 3000
   - Build Command: (deixar vazio, será usado o Dockerfile)

## Passo 5: Configuração de Domínio e SSL

1. **Configurar domínio**
   - Na aplicação no Coolify, vá em "Domains"
   - Adicione seu domínio: `midia.seudominio.com`
   - Coolify configurará automaticamente o SSL via Let's Encrypt

2. **Configurar DNS**
   - No seu provedor de DNS, crie um registro A:
     - Nome: `midia` (ou o subdomínio desejado)
     - Tipo: A
     - Valor: IP da sua VPS

## Passo 6: Configurações de Produção

### Backup Automático

```bash
# Criar script de backup
sudo nano /usr/local/bin/backup-media.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup/media-digital"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Backup dos dados da aplicação (se usando volumes)
docker exec <container-name> tar -czf /tmp/media-backup-$DATE.tar.gz /app/data

# Copiar backup para host
docker cp <container-name>:/tmp/media-backup-$DATE.tar.gz $BACKUP_DIR/

# Limpar backups antigos (manter apenas os últimos 7 dias)
find $BACKUP_DIR -name "media-backup-*.tar.gz" -mtime +7 -delete

echo "Backup concluído: media-backup-$DATE.tar.gz"
```

```bash
# Tornar executável
sudo chmod +x /usr/local/bin/backup-media.sh

# Configurar cron para backup diário às 2h
sudo crontab -e
# Adicionar linha:
0 2 * * * /usr/local/bin/backup-media.sh
```

### Monitoramento

1. **Configurar alertas no Coolify**
   - Vá em Settings > Notifications
   - Configure email ou Discord/Slack para alertas

2. **Logs da aplicação**
   - Acesse via Coolify > Sua Aplicação > Logs
   - Configure retenção de logs adequada

## Passo 7: Configurações de Segurança

### Firewall

```bash
# Configurar UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 8000  # Para Coolify (pode restringir por IP)
```

### Fail2Ban (opcional)

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Passo 8: Configurações Específicas da Aplicação

### Variáveis de Ambiente

No Coolify, configure as seguintes variáveis de ambiente na sua aplicação:

```env
NODE_ENV=production
VITE_APP_TITLE="Sistema de Mídia Digital"
VITE_API_URL=https://midia.seudominio.com/api
```

### Volume para Persistência de Dados

1. **Configurar volume no Coolify**
   - Vá em sua aplicação > Storage
   - Adicione volume: `/app/data:/data/media`

2. **Configurar backup dos dados**
   - Os arquivos JSON/backup serão salvos no volume persistente

## Comandos Úteis

```bash
# Ver status do Coolify
sudo systemctl status coolify

# Restart do Coolify
sudo systemctl restart coolify

# Ver logs do Coolify
sudo journalctl -u coolify -f

# Backup manual da aplicação
docker exec -it <container-name> /usr/local/bin/backup-media.sh

# Verificar uso de espaço
df -h
docker system df

# Limpeza de Docker
docker system prune -a
```

## Troubleshooting

### Problemas Comuns

1. **Aplicação não inicia**
   - Verifique logs no Coolify
   - Verifique se as portas estão corretas
   - Confirme se o build foi bem-sucedido

2. **SSL não funciona**
   - Verifique se o DNS está apontando corretamente
   - Aguarde propagação DNS (até 24h)
   - Verifique logs do Traefik no Coolify

3. **Performance lenta**
   - Aumente recursos da VPS
   - Configure compressão no nginx/traefik
   - Otimize imagens da aplicação

4. **Backup não funciona**
   - Verifique permissões do script
   - Confirme se o container name está correto
   - Teste execução manual do script

### Logs Importantes

```bash
# Logs da aplicação
docker logs <container-name>

# Logs do Coolify
sudo journalctl -u coolify -f

# Logs do sistema
sudo tail -f /var/log/syslog
```

## Atualizações

### Atualizar Coolify
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

### Atualizar Aplicação
- No Coolify, vá em sua aplicação > Deployments
- Clique em "Deploy" para fazer novo deploy da branch

## Suporte e Manutenção

- **Monitoramento**: Configure alertas para CPU, RAM e espaço em disco
- **Backup**: Teste restauração dos backups regularmente
- **Atualizações**: Mantenha sistema operacional e Docker atualizados
- **Segurança**: Monitore logs de acesso e configure fail2ban

## Contato

Para suporte técnico ou dúvidas sobre a instalação, consulte:
- Documentação do Coolify: https://coolify.io/docs
- Comunidade Docker: https://community.docker.com
- Documentação da aplicação: README.md do projeto