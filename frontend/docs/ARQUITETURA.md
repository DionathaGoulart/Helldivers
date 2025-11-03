# 🏗️ Documentação de Arquitetura - Gooddivers Arsenal Frontend

## Visão Geral

O Gooddivers Arsenal Frontend é uma aplicação moderna construída com Next.js 16 e React 19, seguindo os princípios de arquitetura escalável, performática e manutenível.

---

## 🎯 Princípios Arquiteturais

### 1. Separação de Responsabilidades

```
📦 Camadas de Responsabilidade
├── 🎨 Presentation Layer (Componentes UI)
│   └── Renderização e interação do usuário
├── 🧠 Business Logic Layer (Hooks, Contextos)
│   └── Lógica de negócio e estado global
├── 🔌 API Layer (lib/api-*.ts)
│   └── Comunicação com backend
└── 💾 Cache Layer (lib/cache.ts)
    └── Gerenciamento de cache multi-camada
```

### 2. Composição sobre Herança

Todos os componentes são compostos de componentes menores e mais simples, seguindo o princípio de composição do React.

### 3. Single Responsibility Principle

Cada módulo, componente e função tem uma única responsabilidade bem definida.

### 4. DRY (Don't Repeat Yourself)

Lógica compartilhada é extraída para hooks, utilitários e contextos reutilizáveis.

### 5. Type Safety

TypeScript é usado em todo o projeto para garantir type safety e melhor DX (Developer Experience).

---

## 📂 Estrutura de Diretórios Detalhada

### app/

```
app/
├── layout.tsx              # Layout raiz com providers
├── page.tsx                # Página inicial (landing page)
├── globals.css             # Estilos globais e variáveis CSS
├── proxy.ts                # Middleware de roteamento
│
├── (auth)/                 # Grupo de rotas de autenticação
│   ├── login/page.tsx      # Login com email/senha e Google OAuth
│   ├── register/page.tsx   # Registro de novo usuário
│   ├── forgot-password/    # Recuperação de senha
│   ├── reset-password/     # Reset de senha via token
│   └── confirm-email/      # Confirmação de email
│
├── armory/                 # Módulo principal do sistema
│   ├── page.tsx            # Lista de sets com filtros
│   ├── sets/
│   │   ├── page.tsx        # Grid de sets
│   │   └── [id]/page.tsx   # Detalhes do set
│   ├── armors/page.tsx     # Lista de armaduras
│   ├── helmets/page.tsx    # Lista de capacetes
│   ├── capes/page.tsx      # Lista de capas
│   └── passives/page.tsx   # Lista de passivas
│
├── collection/             # Coleção do usuário
├── favorites/              # Favoritos
├── wishlist/               # Lista de desejos
├── profile/                # Perfil e configurações
│
└── api/                    # API Routes (Next.js)
    └── auth/
        └── google/         # Callback Google OAuth
```

### components/

```
components/
├── armory/                 # Componentes específicos do armory
│   ├── SetCard.tsx         # Card de set de armadura
│   ├── PassiveSelect.tsx   # Seletor de passivas
│   └── index.ts            # Barrel exports
│
├── layout/                 # Componentes de layout
│   ├── Header.tsx          # Cabeçalho com navegação
│   ├── Footer.tsx          # Rodapé
│   └── SecurityWarning.tsx # Aviso de segurança
│
└── ui/                     # Componentes de UI base
    ├── Button.tsx          # Botão customizado
    ├── Button.css          # Estilos do botão
    ├── Card.tsx            # Card customizado
    ├── Card.css            # Estilos do card
    ├── Input.tsx           # Input customizado
    ├── Input.css           # Estilos do input
    ├── Select.tsx          # Select customizado
    ├── Select.css          # Estilos do select
    ├── CachedImage.tsx     # Imagem com cache
    ├── LoadingSpinner.tsx  # Spinner de loading
    └── types/              # Tipos TypeScript dos componentes
```

### contexts/

```
contexts/
├── AuthContext.tsx         # Estado global de autenticação
└── LanguageContext.tsx     # Estado global de idioma
```

**Responsabilidades:**
- Gerenciar estado global da aplicação
- Fornecer hooks customizados para consumo
- Persistir preferências do usuário
- Coordinate entre componentes

### hooks/

```
hooks/
├── index.ts                # Barrel exports
├── useAsync.ts             # Gerenciamento de operações assíncronas
├── useDebounce.ts          # Debounce de valores
├── useModal.ts             # Gerenciamento de modais
└── usePasswordStrength.ts  # Validação de força de senha
```

**Responsabilidades:**
- Extrair lógica reutilizável de componentes
- Simplificar estados complexos
- Facilitar testes

### lib/

```
lib/
├── api.ts                  # Cliente Axios base
├── api-cached.ts           # Wrapper com cache automático
├── auth-cached.ts          # Funções de autenticação com cache
├── armory-cached.ts        # Funções do armory com cache
├── cache.ts                # Sistema de cache (SessionStorage)
├── i18n.ts                 # Utilitários de internacionalização
├── theme.ts                # Configurações de tema
├── error-utils.ts          # Utilitários de erro
│
├── translations/           # Sistema de tradução
│   ├── index.ts            # Exports e hook useTranslation
│   ├── pt-BR.ts            # Traduções em português
│   └── en.ts               # Traduções em inglês
│
└── types/                  # Tipos TypeScript
    ├── index.ts            # Barrel exports
    ├── armory.ts           # Tipos do armory
    ├── armory-page.ts      # Tipos das páginas
    ├── auth.ts             # Tipos de autenticação
    └── auth-context.ts     # Tipos do AuthContext
```

### utils/

```
utils/
├── index.ts                # Barrel exports
├── armory.ts               # Utilitários do armory
├── images.ts               # Cache de imagens (LocalStorage)
├── validation.ts           # Funções de validação
```

**Responsabilidades:**
- Funções utilitárias puras
- Transformações de dados
- Validações e formatações
- Cache de recursos estáticos

### constants/

```
constants/
└── index.ts                # Constantes do projeto
```

---

## 🔄 Fluxo de Dados

### 1. Fluxo de Autenticação

```
Usuário → Login/Register → AuthContext → API Backend
    ↓
Recebe User Object → Salva em Context → Atualiza UI
```

### 2. Fluxo de Cache

```
Requisição GET
    ↓
Verifica Cache (SessionStorage)
    ↓
Cache Hit? → Retorna Dados Cacheados
    ↓
Cache Miss → Faz Requisição HTTP
    ↓
Salva no Cache → Retorna Dados
```

### 3. Fluxo de Internacionalização

```
LanguageContext → Detecta Idioma do Navegador
    ↓
Salva em localStorage → Usa Traduções Apropriadas
    ↓
Componentes → Hook useTranslation()
    ↓
Renderiza Texto Traduzido
```

### 4. Fluxo de Imagens

```
Componente CachedImage
    ↓
Verifica Cache (LocalStorage)
    ↓
Cache Hit? → Exibe Base64
    ↓
Cache Miss → Carrega HTTP → Converte Base64 → Salva
```

---

## 🎨 Arquitetura de Componentes

### Hierarquia de Componentes

```
RootLayout
├── LanguageProvider
│   └── AuthProvider
│       ├── SecurityWarning
│       ├── Header
│       │   └── Navigation Links
│       ├── Main Content
│       │   ├── ArmoryPage
│       │   │   ├── Filters
│       │   │   └── SetCard Grid
│       │   └── ProfilePage
│       │       └── Forms
│       └── Footer
```

### Padrões de Componentes

#### 1. Container vs Presentation

```typescript
// Container (app/armory/page.tsx)
function ArmoryPage() {
  // Lógica, estado, efeitos
  const { user } = useAuth();
  const [sets, setSets] = useState([]);
  
  return <SetGrid sets={sets} onSetClick={handleClick} />;
}

// Presentation (components/armory/SetCard.tsx)
function SetCard({ set, onRelationToggle }) {
  // Apenas renderização
  return <Card>...</Card>;
}
```

#### 2. Compound Components

```typescript
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

#### 3. Render Props

```typescript
<Modal>
  {({ isOpen, close }) => (
    <div>
      <button onClick={close}>Close</button>
    </div>
  )}
</Modal>
```

---

## 🔌 Arquitetura de API

### Camadas de API

```
Componente
    ↓
Hook/Serviço (armory-cached.ts, auth-cached.ts)
    ↓
Wrapper com Cache (api-cached.ts)
    ↓
Cliente Axios (api.ts)
    ↓
Backend Django REST API
```

### Padrões de Requisição

```typescript
// 1. GET com Cache
const sets = await getSets();

// 2. POST com Invalidação
await addSetRelation(setId);
// Automaticamente invalida cache relacionado

// 3. Auth Sem Cache
const user = await getCurrentUser();
// Sempre busca do servidor
```

### Interceptors

```typescript
// Request Interceptor
api.interceptors.request.use((config) => {
  // Adiciona Accept-Language
  config.headers['Accept-Language'] = getLanguage();
  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Trata 401, faz refresh token
    // Redireciona se necessário
  }
);
```

---

## 💾 Sistema de Cache Multi-Camada

### Camada 1: SessionStorage (API)

- **Propósito**: Cachear respostas de API
- **TTL**: Configurável por endpoint
- **Invalidação**: Automática e manual
- **Escopo**: Por sessão do navegador

```typescript
// Exemplo de uso
const cacheEntry = {
  key: 'api_cache_sets',
  data: [...sets],
  timestamp: Date.now(),
  ttl: CACHE_TTLS.STATIC_LISTINGS,
  version: '1.0',
};
```

### Camada 2: LocalStorage (Imagens)

- **Propósito**: Cachear imagens em base64
- **TTL**: Permanente
- **Limpeza**: Automática por LRU
- **Escopo**: Persistente entre sessões

```typescript
// Exemplo de uso
const imageCache = {
  url: 'https://api.com/media/armor.png',
  dataUrl: 'data:image/png;base64,...',
  timestamp: Date.now(),
  size: 125000,
};
```

### Camada 3: Context State (UI)

- **Propósito**: Estado global da UI
- **TTL**: Por sessão do React
- **Invalidação**: On demand
- **Escopo**: Estado do componente

```typescript
// AuthContext
const [user, setUser] = useState<User | null>(null);

// LanguageContext
const [language, setLanguage] = useState<Language>('pt-BR');
```

---

## 🎭 Gerenciamento de Estado

### Estado Global

#### AuthContext

```typescript
const AuthContext = {
  user: User | null,           // Dados do usuário
  loading: boolean,            // Estado de carregamento
  login: (creds) => Promise,   // Autenticação
  logout: () => Promise,       // Logout
};
```

#### LanguageContext

```typescript
const LanguageContext = {
  language: 'pt-BR' | 'en',    // Idioma atual
  setLanguage: (lang) => void, // Define idioma
  toggleLanguage: () => void,  // Alterna idiomas
};
```

### Estado Local

```typescript
// Estado por componente
const [filters, setFilters] = useState({
  search: '',
  category: '',
  passive: '',
});

// Estado compartilhado entre componentes irmãos
const sharedState = useSharedState();
```

---

## 🎨 Sistema de Design

### Design Tokens

```css
:root {
  /* Cores Principais */
  --super-earth-blue: #1a2332;
  --military-gray: #2a3a4a;
  --democracy-gold: #d4af37;
  --alert-red: #ff3333;
  --holo-cyan: #00d9ff;
  
  /* Espaçamento */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  
  /* Tipografia */
  --font-heading: 'Orbitron', sans-serif;
  --font-body: 'Barlow Condensed', sans-serif;
  --font-accent: 'Rajdhani', sans-serif;
}
```

### Animações

```css
/* Animações customizadas */
@keyframes holo-flicker { /* Holográfico */ }
@keyframes glow-pulse { /* Brilho pulsante */ }
@keyframes terminal-blink { /* Cursor */ }
@keyframes slide-in-right { /* Entrada */ }
```

### Responsividade

```css
/* Breakpoints */
@media (min-width: 640px) { /* Mobile */ }
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Large */ }
```

---

## 🧪 Padrões de Testes

### Estrutura de Testes

```
__tests__/
├── components/
│   ├── Button.test.tsx
│   └── Card.test.tsx
├── hooks/
│   ├── useAsync.test.ts
│   └── useDebounce.test.ts
├── utils/
│   ├── validation.test.ts
│   └── armory.test.ts
└── lib/
    ├── cache.test.ts
    └── api.test.ts
```

---

## 🚀 Performance

### Otimizações Implementadas

1. **Code Splitting**: Automático por rota (Next.js App Router)
2. **Lazy Loading**: Componentes pesados carregados sob demanda
3. **Image Optimization**: Next.js Image + CachedImage
4. **Cache Inteligente**: Reduz 95% das requisições HTTP
5. **React Compiler**: Otimizações automáticas
6. **Memoização**: UseMemo, useCallback onde necessário

---

## 📚 Recursos Adicionais

- [README Principal](../README.md)
- [Documentação de Cache](./CACHE.md)
- [Documentação de I18n](./I18N-EXEMPLOS.md)
- [Documentação de Componentes](./COMPONENTES.md)

---

<div align="center">

**Made with ❤️ by Dionatha Goulart**

</div>

