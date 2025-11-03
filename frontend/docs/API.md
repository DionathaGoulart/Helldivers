# 🔌 Documentação de API - Gooddivers Arsenal Frontend

## Visão Geral

Esta documentação descreve como o frontend interage com a API backend, incluindo autenticação, cache e gerenciamento de erros.

---

## 🔧 Cliente Axios

**Localização**: `lib/api.ts`

Configuração base do cliente HTTP usando Axios.

### Configuração

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Envia cookies automaticamente
});
```

### Características

- ✅ Base URL configurável via env
- ✅ Content-Type JSON automático
- ✅ Cookies automáticos (HttpOnly)
- ✅ Interceptors para auth e idioma

---

## 🔐 Interceptors

### Request Interceptor

```typescript
api.interceptors.request.use((config) => {
  // Adiciona header Accept-Language
  const savedLanguage = localStorage.getItem('helldivers_language') || 'pt-BR';
  const languageHeader = savedLanguage === 'pt-BR' ? 'pt-br' : 'en';
  config.headers['Accept-Language'] = languageHeader;
  
  return config;
});
```

### Response Interceptor

```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Trata erro 401 (não autorizado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      try {
        // Tenta refresh token
        await api.post('/api/v1/auth/token/refresh/');
        return api(originalRequest);
      } catch (refreshError) {
        // Se falhou, limpa cache e redireciona
        clearCache();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 🌐 Endpoints da API

### Autenticação

#### POST `/api/v1/auth/login/`

Login com username/email e senha.

```typescript
await api.post('/api/v1/auth/login/', {
  username: 'john_doe',
  password: 'secure_password',
});
```

#### POST `/api/v1/auth/registration/`

Registro de novo usuário.

```typescript
await api.post('/api/v1/auth/registration/', {
  username: 'john_doe',
  email: 'john@example.com',
  password1: 'secure_password',
  password2: 'secure_password',
});
```

#### POST `/api/v1/auth/logout/`

Logout do usuário atual.

```typescript
await api.post('/api/v1/auth/logout/');
```

#### GET `/api/v1/auth/user/`

Obtém dados do usuário atual.

```typescript
const response = await api.get('/api/v1/auth/user/');
const user = response.data;
```

---

### Armory

#### GET `/api/v1/armory/sets/`

Lista todos os sets de armadura.

```typescript
const response = await api.get('/api/v1/armory/sets/');
const sets = response.data;
```

**Parâmetros de query**:
- `ordering`: Ordenação (name, armor, helmet, cape)
- `category`: Categoria (light, medium, heavy, super_heavy)
- `passive`: Filtro por passiva
- `source`: Filtro por fonte

#### GET `/api/v1/armory/sets/{id}/`

Detalhes de um set específico.

```typescript
const response = await api.get(`/api/v1/armory/sets/${setId}/`);
const set = response.data;
```

#### GET `/api/v1/armory/armors/`

Lista todas as armaduras.

```typescript
const response = await api.get('/api/v1/armory/armors/');
const armors = response.data;
```

#### GET `/api/v1/armory/helmets/`

Lista todos os capacetes.

```typescript
const response = await api.get('/api/v1/armory/helmets/');
const helmets = response.data;
```

#### GET `/api/v1/armory/capes/`

Lista todas as capas.

```typescript
const response = await api.get('/api/v1/armory/capes/');
const capes = response.data;
```

#### GET `/api/v1/armory/passives/`

Lista todas as passivas.

```typescript
const response = await api.get('/api/v1/armory/passives/');
const passives = response.data;
```

---

### Relações Usuário-Item

#### GET `/api/v1/armory/user-sets/check/`

Verifica relações de um ou mais sets.

```typescript
const response = await api.post('/api/v1/armory/user-sets/check/', {
  set_ids: [1, 2, 3],
});
const relations = response.data;
```

#### POST `/api/v1/armory/user-sets/add/`

Adiciona relação (favorite, collection, wishlist).

```typescript
await api.post('/api/v1/armory/user-sets/add/', {
  set_id: 123,
  relation_type: 'favorite',
});
```

#### POST `/api/v1/armory/user-sets/remove/`

Remove relação.

```typescript
await api.post('/api/v1/armory/user-sets/remove/', {
  set_id: 123,
  relation_type: 'favorite',
});
```

#### GET `/api/v1/armory/user-sets/favorites/`

Lista sets favoritos do usuário.

```typescript
const response = await api.get('/api/v1/armory/user-sets/favorites/');
const favorites = response.data;
```

#### GET `/api/v1/armory/user-sets/collection/`

Lista sets na coleção do usuário.

```typescript
const response = await api.get('/api/v1/armory/user-sets/collection/');
const collection = response.data;
```

#### GET `/api/v1/armory/user-sets/wishlist/`

Lista sets na wishlist do usuário.

```typescript
const response = await api.get('/api/v1/armory/user-sets/wishlist/');
const wishlist = response.data;
```

---

### Perfil

#### GET `/api/v1/profile/`

Obtém dados do perfil do usuário.

```typescript
const response = await api.get('/api/v1/profile/');
const profile = response.data;
```

#### PATCH `/api/v1/profile/update/`

Atualiza dados do perfil.

```typescript
await api.patch('/api/v1/profile/update/', {
  username: 'new_username',
  email: 'new_email@example.com',
});
```

---

### Recuperação de Senha

#### POST `/api/v1/password/reset/`

Envia email de recuperação.

```typescript
await api.post('/api/v1/password/reset/', {
  email: 'user@example.com',
});
```

#### POST `/api/v1/password/reset/confirm/`

Confirma reset de senha.

```typescript
await api.post('/api/v1/password/reset/confirm/', {
  uid: 'uid_token',
  token: 'reset_token',
  new_password1: 'new_password',
  new_password2: 'new_password',
});
```

---

## 🎯 Funções com Cache

### api-cached.ts

Wrapper do cliente Axios com cache automático.

#### cachedGet

```typescript
import { cachedGet } from '@/lib/api-cached';

const response = await cachedGet('/api/v1/armory/sets/');
// Automaticamente verifica cache antes de fazer requisição
const sets = response.data;
```

#### cachedPost

```typescript
import { cachedPost } from '@/lib/api-cached';

await cachedPost('/api/v1/armory/user-sets/add/', {
  set_id: 123,
  relation_type: 'favorite',
});
// Automaticamente invalida cache relacionado
```

---

## 🔒 Autenticação com Cookies

O sistema usa cookies HttpOnly para maior segurança:

```typescript
// No servidor, cookies são enviados automaticamente
// Não precisamos gerenciar tokens manualmente

// Login retorna cookies
await api.post('/api/v1/auth/login/', credentials);

// Cookies são enviados automaticamente em todas as requisições
const response = await api.get('/api/v1/auth/user/');

// Logout limpa cookies
await api.post('/api/v1/auth/logout/');
```

---

## 🌍 Internacionalização

O header `Accept-Language` é adicionado automaticamente:

```typescript
// Request interceptor adiciona automaticamente
config.headers['Accept-Language'] = 'pt-br'; // ou 'en'

// Backend retorna dados traduzidos baseado no header
const response = await api.get('/api/v1/armory/sets/');
// Sets vêm com name_pt_br se idioma for pt-BR
```

---

## ❌ Tratamento de Erros

### Erros de Autenticação

```typescript
try {
  const response = await api.get('/api/v1/auth/user/');
} catch (error) {
  if (error.response?.status === 401) {
    // Usuário não autenticado
    // Redireciona para login
    window.location.href = '/login';
  }
}
```

### Erros de Validação

```typescript
try {
  await api.post('/api/v1/auth/registration/', data);
} catch (error) {
  if (error.response?.status === 400) {
    // Erros de validação
    const validationErrors = error.response.data;
    setErrors(validationErrors);
  }
}
```

### Erros de Rede

```typescript
try {
  await api.get('/api/v1/armory/sets/');
} catch (error) {
  if (!error.response) {
    // Erro de rede
    console.error('Network error');
  }
}
```

---

## 📊 Estatísticas de Requisições

### Monitoring

```typescript
// Contador de requisições
let requestCount = 0;

api.interceptors.request.use((config) => {
  requestCount++;
  console.log(`Total requests: ${requestCount}`);
  return config;
});
```

### Cache Hit Rate

```typescript
import { getCacheStats } from '@/lib/cache';

const stats = getCacheStats();
const hitRate = stats.hits / (stats.hits + stats.misses);
console.log(`Cache hit rate: ${hitRate * 100}%`);
```

---

## 🚀 Otimizações

### Batching de Requisições

```typescript
// Executar múltiplas requisições em paralelo
const [sets, passives, passes] = await Promise.all([
  api.get('/api/v1/armory/sets/'),
  api.get('/api/v1/armory/passives/'),
  api.get('/api/v1/armory/passes/'),
]);
```

### Cache First

```typescript
// Verifica cache antes de fazer requisição
const cached = getCachedData('/api/v1/armory/sets/');
if (cached) {
  return cached;
}

// Só faz requisição se não estiver em cache
const response = await api.get('/api/v1/armory/sets/');
```

---

## 📚 Referências

- [Axios Documentation](https://axios-http.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

---

<div align="center">

**Made with ❤️ by Dionatha Goulart**

</div>

