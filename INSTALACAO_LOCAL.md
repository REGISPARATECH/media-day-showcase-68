# Instalação Local - Sistema de Mídia Digital

## Pré-requisitos

1. **Node.js** versão 18 ou superior
   - Download: https://nodejs.org/
   - Verificar instalação: `node --version`

2. **Git** (opcional, para clonar repositório)
   - Download: https://git-scm.com/

## Passo 1: Obter o Código

### Opção A: Clonar repositório (se disponível)
```bash
git clone <URL_DO_REPOSITORIO>
cd sistema-midia-digital
```

### Opção B: Download direto
- Baixe o arquivo ZIP do projeto
- Extraia em uma pasta de sua escolha
- Abra o terminal na pasta do projeto

## Passo 2: Instalar Dependências

```bash
# Instalar todas as dependências
npm install
```

## Passo 3: Executar em Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em: **http://localhost:5173**

## Passo 4: Build para Produção (Opcional)

```bash
# Gerar build de produção
npm run build

# Visualizar build de produção
npm run preview
```

## Configuração Inicial

### 1. Acesso Administrativo

1. Acesse: `http://localhost:5173/admin`
2. Senha padrão: `admin123`
3. Configure clientes e preferências

### 2. Cadastrar Clientes

1. Vá em **CLIENTES** no painel admin
2. Adicione nome, senha e prefixo do cliente
3. O prefixo será usado nos nomes dos arquivos

### 3. Configurar Aparência

1. Vá em **APARÊNCIA** no painel admin
2. Configure cores, letreiro e orientação do player
3. Salve as configurações

## Como Usar

### Upload de Mídia

1. Acesse: `http://localhost:5173/upload`
2. Faça login com as credenciais do cliente
3. Selecione arquivos (imagens: JPG, PNG, GIF, WEBP | vídeos: MP4, AVI, MOV)
4. Escolha a pasta de destino (dias da semana ou "todos")
5. Para imagens, selecione animação
6. Envie os arquivos

### Visualizar Player

1. Acesse: `http://localhost:5173/player`
2. O player exibirá automaticamente as mídias do dia atual
3. Use F11 para tela cheia
4. Controles disponíveis para orientação

## Estrutura de Pastas

```
src/
├── components/          # Componentes React
│   ├── admin/          # Componentes administrativos
│   ├── layout/         # Layout da aplicação
│   ├── navigation/     # Menu de navegação
│   ├── ui/            # Componentes de interface
│   └── upload/        # Componentes de upload
├── hooks/             # Hooks personalizados
├── pages/             # Páginas da aplicação
├── types/             # Definições TypeScript
├── utils/             # Utilitários
└── index.css          # Estilos globais
```

## Dados e Armazenamento

### LocalStorage
A aplicação usa LocalStorage para:
- Configurações do sistema
- Lista de clientes
- Dados de mídia (backup)

### Arquivo JSON
As mídias são salvas em: `media_storage.json` no LocalStorage

### Backup
- Backup automático diário dos dados
- Exportação manual disponível no admin

## Solução de Problemas

### Erro "não envia as fotos"
1. Verifique se os formatos são suportados (JPG, PNG, GIF, WEBP, MP4, AVI, MOV)
2. Confirme se o cliente está cadastrado
3. Verifique o console do navegador (F12)

### Player não exibe mídias
1. Verifique se há mídias na pasta do dia atual
2. Confirme que as mídias não estão ocultas
3. Atualize a página do player

### Perda de dados
1. Use a função de backup no admin
2. Exporte dados regularmente
3. Mantenha backup dos arquivos JSON

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Visualizar produção
npm run preview

# Linting
npm run lint

# Verificação de tipos
npm run type-check
```

## Recursos da Aplicação

### Player de Mídia
- Reprodução automática de imagens e vídeos
- Orientação landscape/portrait
- Animações para imagens
- Widgets opcionais (clima, loteria, notícias)

### Sistema de Upload
- Suporte múltiplos formatos
- Organização por dias da semana
- Prefixo automático com nome do cliente
- Resolução de conflitos de nomes

### Painel Administrativo
- Gerenciamento de clientes
- Configuração de aparência
- Controle de widgets
- Gerenciamento de pastas e mídias

## Tecnologias Utilizadas

- **React 18** - Framework frontend
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **Shadcn/ui** - Componentes UI
- **React Router** - Roteamento

## Suporte

Para problemas ou dúvidas:
1. Verifique a documentação
2. Consulte o console do navegador (F12)
3. Teste em modo incógnito
4. Reinicie o servidor de desenvolvimento

## Atualizações

Para atualizar a aplicação:
1. Faça backup dos dados
2. Substitua os arquivos
3. Execute `npm install` novamente
4. Teste todas as funcionalidades

---

**Importante**: Esta aplicação roda completamente no navegador. Todos os dados são armazenados localmente. Para uso em produção, considere implementar um backend adequado.