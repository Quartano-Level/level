# Superia - Aplicação Next.js com Autenticação Supabase

Uma aplicação moderna construída com Next.js, TypeScript e Supabase para autenticação.

## Tecnologias Utilizadas

- Next.js 15+
- React 19+
- TypeScript 5+
- Supabase (Autenticação)
- TailwindCSS 4
- Node.js 24+
- Radix UI (Componentes de UI acessíveis)
- Zod (Validação de formulários)
- Jest + React Testing Library (Testes)

## Requisitos do Sistema

- **Node.js**: versão 24.0.1 ou superior (recomendado usar [nvm](https://github.com/nvm-sh/nvm) ou [asdf](https://asdf-vm.com/))
- **Git**: para clonar o repositório
- **Navegador moderno**: Chrome, Firefox, Edge ou Safari recentes
- **Conta no Supabase**: necessária para configuração da autenticação

## Configuração Passo a Passo

### 1. Preparação do Ambiente

Certifique-se de ter o Node.js instalado na versão correta:

```bash
# Verificar a versão do Node.js
node -v
# Deve mostrar v24.0.1 ou superior
```

Se você utiliza o `asdf` como gerenciador de versões, o arquivo `.tool-versions` já está configurado e você pode simplesmente executar:

```bash
asdf install
```

### 2. Clone o repositório

```bash
git clone https://github.com/seu-usuario/superia.git
cd superia
```

### 3. Instale as dependências

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 4. Configure o Supabase

#### 4.1 Crie uma conta e um projeto no Supabase

1. Crie uma conta gratuita em [Supabase](https://supabase.com) se ainda não tiver
2. Crie um novo projeto no Dashboard do Supabase
3. Anote o nome do seu projeto e a região selecionada

#### 4.2 Obtenha as credenciais necessárias

1. No Dashboard do Supabase, acesse **Configurações do Projeto > API**
2. Você encontrará:
   - **Project URL**: Para a variável `NEXT_PUBLIC_SUPABASE_URL`
   - **anon key**: Para a variável `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: Para a variável `SUPABASE_SERVICE_ROLE_KEY`

#### 4.3 Configure as variáveis de ambiente

1. Crie um arquivo `.env.local` na raiz do projeto (onde está o package.json)
2. Adicione as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico-aqui
```

> **⚠️ Importante**: Nunca compartilhe ou cometa o arquivo `.env.local` no Git. Ele já está incluído no `.gitignore`.

#### 4.4 Configuração opcional da interface do Supabase

Para uma experiência completa, você pode configurar as seguintes opções no Dashboard do Supabase:

1. **Autenticação > Providers**: Ative Email/Password e/ou provedores OAuth como Google, GitHub
2. **Autenticação > Email Templates**: Personalize os emails enviados aos usuários
3. **Autenticação > URL Configuration**: Configure as URLs de redirecionamento

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

### 6. Verificação da configuração

Para verificar se suas variáveis de ambiente foram carregadas corretamente, visite:
http://localhost:3000/api/env (esta rota está disponível apenas em ambiente de desenvolvimento)

## Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev        # Inicia o servidor de desenvolvimento com Turbopack

# Build e produção
npm run build      # Cria build de produção
npm run start      # Inicia o servidor com a build de produção

# Testes
npm run test       # Executa todos os testes
npm run test:watch # Executa testes em modo watch

# Linting
npm run lint       # Executa o ESLint para verificar código
```

## Estrutura do Projeto

A aplicação segue uma estrutura organizada por recursos (features) e camadas:

- `src/app` - Páginas e layouts da aplicação (App Router do Next.js)
- `src/components` - Componentes reutilizáveis globais
- `src/features` - Módulos organizados por funcionalidade
- `src/shared` - Utilitários, hooks e serviços compartilhados
- `src/styles` - Estilos globais da aplicação
- `src/middleware.ts` - Middleware para controle de autenticação
- `src/utils` - Funções utilitárias

## Funcionalidades

- Sistema de autenticação completo (login, registro, logout)
- Proteção de rotas via middleware
- Gerenciamento de sessão e tokens
- Redirecionamentos inteligentes baseados no status de autenticação
- UI moderna e responsiva com Tailwind CSS
- Formulários com validação usando Zod
- Acesso a dados via Supabase

## Fluxo de Autenticação

1. O usuário admin manda um convite na página de configurações: `/configuracoes`
2. O Supabase envia um email de confirmação (opcional, configurável no painel do Supabase)
3. O usuário confirma o email e é redirecionado para `/set-password`
4. O middleware processa o token e estabelece a sessão
5. O usuário é redirecionado para o dashboard

## Customização e Desenvolvimento

### Estilos e Componentes
O projeto utiliza TailwindCSS 4 e componentes do Radix UI para uma interface acessível e moderna.

### Formulários
Os formulários utilizam Zod para validação de dados, garantindo integridade e feedback ao usuário.

### Testes
A aplicação utiliza Jest e React Testing Library para testes unitários e de integração.

## Arquitetura

O projeto implementa uma versão adaptada da Clean Architecture para aplicações Next.js, com foco em:

1. **Separação de responsabilidades**
2. **Testabilidade**
3. **Manutenibilidade**

### Estrutura de Pastas Detalhada

```
src/
├── app/                  # Rotas e páginas usando o App Router do Next.js
├── components/           # Componentes globais reutilizáveis 
├── features/             # Módulos organizados por funcionalidade
│   └── auth/             # Exemplo: Feature de autenticação
│       ├── components/   # Componentes específicos da feature
│       ├── hooks/        # Hooks específicos da feature (ex: useAuth)
│       ├── services/     # Serviços para acesso a dados
│       ├── types/        # Tipos e interfaces da feature
│       └── utils/        # Utilitários específicos da feature
├── shared/               # Código compartilhado entre features
│   ├── hooks/            # Hooks compartilhados
│   ├── services/         # Serviços compartilhados
│   └── types/            # Tipos compartilhados
├── middleware.ts         # Middleware do Next.js para autenticação
├── utils/                # Funções utilitárias globais
├── styles/               # Estilos globais
└── types/                # Tipos e interfaces globais
```


## Deploy

### Opções de Deploy

O projeto pode ser facilmente implantado em:

1. **Vercel**: Integração natural com Next.js
2. **Netlify**: Suporte para Next.js com funções serverless
3. **Containers**: Docker para ambientes personalizados

### Preparação para Produção

1. Configure as variáveis de ambiente no provedor escolhido
2. Execute `npm run build` para verificar se a build está funcionando
3. Conecte seu repositório Git à plataforma de deploy

## Solução de Problemas

### Problemas Comuns

1. **Erro de variáveis de ambiente**: Verifique se o arquivo `.env.local` está configurado corretamente
2. **Problemas de autenticação**: Verifique as configurações do Supabase no Dashboard
3. **Erros de build**: Verifique a compatibilidade de versões no `package.json`

### Recursos de Ajuda

- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Supabase](https://supabase.com/docs)
- [Troubleshooting do Next.js](https://nextjs.org/docs/messages)

## Contribuição

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Faça commit das suas mudanças (`git commit -m 'Add some amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - consulte o arquivo LICENSE para detalhes.

## Recursos Adicionais

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Zod Documentation](https://zod.dev/)
