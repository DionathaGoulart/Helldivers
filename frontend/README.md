# Frontend - Helldivers 2 Authentication

Sistema de autenticação moderno e completo desenvolvido com Next.js 16, TypeScript e Tailwind CSS.

## 🚀 Recursos

- ✅ Login tradicional com username/email e senha
- ✅ Registro de novos usuários
- ✅ Login e registro com Google (OAuth 2.0)
- ✅ Esqueceu a senha
- ✅ Redefinição de senha
- ✅ Troca de senha (usuário autenticado)
- ✅ Edição de perfil (nome, sobrenome, username)
- ✅ Dashboard com informações da conta
- ✅ Proteção de rotas
- ✅ Gerenciamento de estado global (Context API)
- ✅ Design moderno e minimalista
- ✅ Totalmente responsivo

## 📦 Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização moderna
- **Axios** - Cliente HTTP para API
- **Context API** - Gerenciamento de estado

## 🛠️ Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:

Crie um arquivo `.env.local` na raiz do projeto:

```env
# URL da API backend
NEXT_PUBLIC_API_URL=http://localhost:8000

# URL base do frontend
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google OAuth Client ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_client_id_aqui
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura do Projeto

```
frontend/
├── app/                          # App Router do Next.js
│   ├── (auth)/                   # Grupo de rotas de autenticação
│   │   ├── login/               # Página de login
│   │   ├── register/            # Página de registro
│   │   ├── forgot-password/     # Esqueceu a senha
│   │   └── reset-password/      # Redefinir senha
│   ├── dashboard/               # Dashboard do usuário
│   ├── profile/                 # Configurações do perfil
│   ├── api/                     # API Routes
│   │   └── auth/
│   │       └── google/          # Callback OAuth Google
│   └── page.tsx                 # Página inicial
├── components/                   # Componentes reutilizáveis
│   └── ui/                      # Componentes de UI
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       └── LoadingSpinner.tsx
├── contexts/                     # Contexts do React
│   └── AuthContext.tsx          # Context de autenticação
├── lib/                          # Bibliotecas e utilitários
│   ├── api.ts                   # Configuração Axios
│   └── auth.ts                  # Funções de autenticação
└── middleware.ts               # Middleware do Next.js
```

## 🔐 Endpoints da API

O frontend consome os seguintes endpoints do backend:

### Autenticação
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/registration/` - Registro
- `POST /api/auth/token/refresh/` - Renovar token
- `POST /api/auth/token/verify/` - Verificar token

### Senha
- `POST /api/auth/password/reset/` - Esqueceu senha
- `POST /api/auth/password/reset/confirm/` - Resetar senha
- `POST /api/auth/password/change/` - Trocar senha

### Perfil
- `GET /api/profile/` - Obter perfil
- `PUT/PATCH /api/profile/update/` - Atualizar perfil
- `GET /api/dashboard/` - Dashboard

### Google OAuth
- `POST /api/auth/google/callback/` - Callback OAuth

## 🎨 Componentes

### Button
Botão estilizado com múltiplas variantes:
- `primary` (padrão)
- `secondary`
- `outline`
- `ghost`
- `danger`

```tsx
<Button variant="primary" size="md" fullWidth loading={isLoading}>
  Entrar
</Button>
```

### Input
Input com label e tratamento de erros:
```tsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errorMessage}
/>
```

### Card
Container estilizado:
```tsx
<Card>
  <h2>Título</h2>
  {/* Conteúdo */}
</Card>
```

## 🔑 Uso do AuthContext

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, loading } = useAuth();

  // Resto do código...
}
```

## 🚦 Navegação

- **/** - Redireciona para /login ou /dashboard
- **/login** - Página de login
- **/register** - Página de registro
- **/forgot-password** - Esqueceu a senha
- **/reset-password** - Redefinir senha
- **/dashboard** - Dashboard (protegida)
- **/profile** - Configurações (protegida)

## 🎯 Configurando Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em "APIs & Services" > "Credentials"
4. Clique em "Create Credentials" > "OAuth client ID"
5. Configure as URLs autorizadas:
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/google`
6. Copie o Client ID e adicione no `.env.local`

## 📝 Build para Produção

```bash
npm run build
npm start
```

## 🐛 Debugging

Para visualizar os logs de autenticação, abra o DevTools do navegador (F12) e verifique o console.

## 📄 Licença

Este projeto faz parte do sistema Helldivers 2.
