# 💾 Documentação do Sistema de Cache - Gooddivers Arsenal Frontend

## Visão Geral

O Gooddivers Arsenal implementa um sistema de cache **multi-camada** e **inteligente** que reduz drasticamente as requisições HTTP e melhora significativamente a experiência do usuário.

---

## 🎯 Objetivos do Sistema de Cache

### 1. Redução de Requisições HTTP

- ✅ **95% de redução** nas requisições após primeira carga
- ✅ Carregamento instantâneo de dados em cache
- ✅ Menor uso de banda

### 2. Melhor Experiência do Usuário

- ✅ Navegação mais rápida
- ✅ Feedback imediato
- ✅ Funciona offline parcialmente

### 3. Economia de Recursos

- ✅ Menor carga no servidor
- ✅ Menor consumo de API
- ✅ Otimização de custos

---

## 📦 Camadas de Cache

### Camada 1: SessionStorage (API Responses)

**Localização**: `lib/cache.ts`

Cache de respostas de API usando SessionStorage do navegador.

#### Características

- ✅ **Escopo**: Por sessão (limpa ao fechar aba)
- ✅ **TTL**: Time-To-Live configurável por tipo de dado
- ✅ **Invalidação**: Automática e manual
- ✅ **Versionamento**: Sistema de versões para invalidação forçada
- ✅ **Estatísticas**: Rastreamento de hits/misses

#### TTLs Configurados

```typescript
export const CACHE_TTLS = {
  STATIC: Infinity,                    // Dados estáticos (nunca expira)
  USER_DATA: Infinity,                 // Dados do usuário
  STATIC_LISTINGS: Infinity,           // Listagens estáticas (armors, helmets, etc)
  USER_RELATIONS: Infinity,            // Relações usuário-item
  LISTINGS: 10 * 60 * 1000,           // 10 minutos
  ITEM_DETAIL: 15 * 60 * 1000,        // 15 minutos
  DASHBOARD: 5 * 60 * 1000,           // 5 minutos
  VALIDATIONS: 1 * 60 * 1000,         // 1 minuto
};
```

#### Estrutura do Cache Entry

```typescript
interface CacheEntry<T> {
  key: string;           // Chave única
  data: T;              // Dados cacheados
  timestamp: number;     // Quando foi salvo
  ttl: number;          // Time-To-Live (ms)
  version: string;      // Versão do cache
  endpoint: string;     // Endpoint original
  params?: string;      // Parâmetros (opcional)
}
```

#### Exemplo de Uso

```typescript
import { getCachedData, setCachedData, invalidateCache } from '@/lib/cache';

// Salvar no cache
setCachedData('/api/v1/sets/', setsArray, {}, { 
  ttl: CACHE_TTLS.STATIC_LISTINGS 
});

// Obter do cache
const cached = getCachedData('/api/v1/sets/', {});
if (cached) {
  return cached; // Cache hit!
}

// Invalidar cache
invalidateCache('/api/v1/sets/*');
clearCache(); // Limpa tudo
```

### Camada 2: LocalStorage (Imagens)

**Localização**: `utils/images.ts` e `components/ui/CachedImage.tsx`

Cache de imagens convertidas para base64 no LocalStorage.

#### Características

- ✅ **Escopo**: Persistente entre sessões
- ✅ **Formato**: Base64 encoding
- ✅ **Limite**: 3MB total
- ✅ **Limpeza**: LRU (Least Recently Used)
- ✅ **Tamanho Máximo**: 500KB por imagem

#### Estrutura do Image Cache

```typescript
interface CachedImage {
  url: string;           // URL original
  dataUrl: string;       // Base64 encoded
  timestamp: number;     // Quando foi salvo
  size: number;          // Tamanho em bytes
}
```

#### Exemplo de Uso

```typescript
import CachedImage from '@/components/ui/CachedImage';

<CachedImage
  src={armor.image_url}
  alt={armor.name}
  width={200}
  height={200}
  fallback="/placeholder.png"
/>
```

### Camada 3: Context State (UI State)

**Localização**: `contexts/`

Estado global da aplicação gerenciado por Contexts React.

#### AuthContext

```typescript
// Cacheia dados do usuário
const [user, setUser] = useState<User | null>(null);

// Permanece na sessão React
// Limpa apenas no logout ou refresh
```

#### LanguageContext

```typescript
// Cacheia preferência de idioma
const [language, setLanguage] = useState<Language>('pt-BR');

// Persistido em localStorage
localStorage.setItem('helldivers_language', language);
```

---

## 🔄 Fluxo de Cache

### Fluxo de Requisição GET

```
1. Componente requisita dados
         ↓
2. Verifica SessionStorage
         ↓
    Cache Hit? → Retorna dados cacheados ✅
         ↓
    Cache Miss → Faz requisição HTTP
         ↓
3. Recebe resposta do servidor
         ↓
4. Salva no SessionStorage
         ↓
5. Retorna dados ao componente
```

### Fluxo de Invalidação

```
1. Operação POST/PUT/DELETE
         ↓
2. Processa no servidor
         ↓
3. Invalida cache relacionado
         ↓
4. Retorna resposta
         ↓
5. Componente atualiza UI
```

---

## 🎯 Estratégias de Cache

### 1. Cache por Endpoint

Cada endpoint tem sua própria estratégia de cache baseada no tipo de dado:

```typescript
// Static Lists (armors, helmets, capes, sets)
getSets()         → TTL: Infinity
getArmors()       → TTL: Infinity
getHelmets()      → TTL: Infinity

// User Relations
checkSetRelation() → TTL: Infinity (invalidado manualmente)
getFavorites()     → TTL: Infinity (invalidado manualmente)

// User Data
getCurrentUser()   → Sem cache (sempre verifica servidor)
```

### 2. Cache por Parâmetros

Requisições com parâmetros diferentes têm chaves de cache diferentes:

```typescript
// Diferentes chaves de cache
getCachedData('/api/v1/sets/', { category: 'light' })
getCachedData('/api/v1/sets/', { category: 'medium' })
```

### 3. Invalidação Seletiva

Cache relacionado é invalidado automaticamente:

```typescript
// Adiciona favorito
await addSetRelation(setId);
// → Invalida: favorites, collection, wishlist

// Atualiza perfil
await updateProfile(data);
// → Invalida: user, profile, dashboard
```

---

## 🛠️ Implementação Técnica

### Sistema de Chaves

```typescript
function generateCacheKey(endpoint: string, params?: Record<string, unknown>): string {
  const baseKey = endpoint.replace(/^\//, '').replace(/\//g, '_');
  
  if (!params || Object.keys(params).length === 0) {
    return `${CACHE_PREFIX}${baseKey}`;
  }
  
  // Ordena parâmetros para consistência
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  
  // Hash para URLs longas
  const paramsHash = sortedParams.length > 100 
    ? btoa(sortedParams).substring(0, 50)
    : sortedParams.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${CACHE_PREFIX}${baseKey}_${paramsHash}`;
}
```

### Verificação de Validade

```typescript
function isCacheValid<T>(entry: CacheEntry<T>): boolean {
  // Infinity nunca expira
  if (entry.ttl === Infinity) {
    return true;
  }
  
  const now = Date.now();
  const age = now - entry.timestamp;
  return age < entry.ttl;
}
```

### Limpeza Automática

```typescript
function cleanExpiredEntries(): void {
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      const entry = JSON.parse(sessionStorage.getItem(key)!);
      if (!isCacheValid(entry)) {
        keysToRemove.push(key);
      }
    }
  }
  
  keysToRemove.forEach(key => sessionStorage.removeItem(key));
}
```

---

## 📊 Estatísticas e Monitoramento

### Cache Stats

```typescript
interface CacheStats {
  hits: number;        // Requisições atendidas por cache
  misses: number;      // Requisições que precisaram buscar do servidor
  size: number;        // Número de entradas no cache
  totalSize: number;   // Tamanho total em bytes
}

// Obter estatísticas
const stats = getCacheStats();
console.log('Cache Hits:', stats.hits);
console.log('Cache Misses:', stats.misses);
console.log('Hit Rate:', stats.hits / (stats.hits + stats.misses));
```

### Image Cache Stats

```typescript
interface ImageCacheStats {
  count: number;       // Número de imagens cacheadas
  size: number;        // Tamanho total em bytes
  maxSize: number;     // Limite máximo
}

const stats = getImageCacheStats();
console.log('Imagens cacheadas:', stats.count);
console.log('Tamanho:', stats.size / 1024, 'KB');
```

---

## ⚠️ Casos Especiais

### 1. Endpoints Sem Cache

Alguns endpoints **NUNCA** são cacheados por segurança:

```typescript
const NO_CACHE_ENDPOINTS = [
  '/api/v1/auth/login/',
  '/api/v1/auth/logout/',
  '/api/v1/auth/registration/',
  '/api/v1/auth/token/refresh/',
  '/api/v1/password/reset/',
  '/api/v1/password/reset/confirm/',
  '/api/v1/password/change/',
];
```

### 2. Cache Manual

Algumas operações exigem invalidação manual:

```typescript
// Adiciona favorito
await addSetRelation(setId);

// IMPORTANTE: Atualiza cache manualmente
// ao invés de invalidar (evita flicker)
updateRelationsCache(relationType, setId, true);
```

### 3. Race Conditions

Cache verifica antes de limpar para evitar race conditions:

```typescript
// Primeiro verifica o cache específico ANTES de limpar
const cached = getCachedData(endpoint, params);
if (cached) return cached; // Cache hit!

// Só limpa se não encontrou
cleanExpiredEntries();
```

---

## 🔍 Debugging

### Console Logs

O sistema de cache registra logs detalhados em desenvolvimento:

```typescript
// Verificar cache
console.log('Cache Stats:', getCacheStats());

// Verificar imagem cache
console.log('Image Cache Stats:', getImageCacheStats());

// Limpar cache manualmente
clearCache();
clearImageCache();
```

### Visualizar Cache

```typescript
// Abrir DevTools → Application → Session Storage
// Procurar por: api_cache_*

// Abrir DevTools → Application → Local Storage
// Procurar por: helldivers_image_cache_*
```

---

## 🚀 Otimizações de Performance

### 1. Verificação Síncrona

```typescript
// Verificação de cache é SÍNCRONA
const cached = getCachedData(endpoint, params);
if (cached) {
  return cached; // Instantâneo!
}
```

### 2. Base64 para Imagens

```typescript
// Imagens em base64 carregam instantaneamente
const imageCache = getCachedImageUrl(imageUrl);
if (imageCache) {
  return imageCache; // Zero requisições HTTP!
}
```

### 3. Invalidação Seletiva

```typescript
// Invalida apenas o necessário
invalidateCache('/api/v1/armory/user-sets/favorites/');
// Não invalida collections ou wishlists
```

---

## 📚 APIs Disponíveis

### Cache de API

```typescript
// Obter dados
getCachedData<T>(endpoint, params, config)

// Salvar dados
setCachedData<T>(endpoint, data, params, config)

// Invalidar por padrão
invalidateCache(pattern)

// Limpar tudo
clearCache()

// Obter estatísticas
getCacheStats(): CacheStats

// Obter TTL para endpoint
getTTLForEndpoint(endpoint): number
```

### Cache de Imagens

```typescript
// Verificar se está cacheado
isImageCached(imageUrl): boolean

// Obter URL cachead
getCachedImageUrl(imageUrl): string | null

// Cachear imagem
cacheImage(imageUrl): Promise<string | null>

// Obter ou cachear
getOrCacheImage(imageUrl): Promise<string>

// Limpar cache de imagens
clearImageCache(): void

// Obter estatísticas
getImageCacheStats(): ImageCacheStats
```

---

## 📖 Exemplos Práticos

### Exemplo 1: Listagem de Sets

```typescript
async function fetchSets() {
  // 1. Verifica cache
  const cached = getCachedData('/api/v1/sets/', {});
  if (cached) return cached;
  
  // 2. Busca do servidor
  const response = await api.get('/api/v1/sets/');
  const sets = response.data;
  
  // 3. Salva no cache
  setCachedData('/api/v1/sets/', sets, {}, { 
    ttl: CACHE_TTLS.STATIC_LISTINGS 
  });
  
  return sets;
}
```

### Exemplo 2: Imagens com Cache

```typescript
function ArmorCard({ armor }) {
  return (
    <CachedImage
      src={armor.image_url}
      alt={armor.name}
      width={200}
      height={200}
      className="rounded-lg"
    />
  );
}
```

### Exemplo 3: Atualização com Invalidação

```typescript
async function toggleFavorite(setId: number) {
  // 1. Atualiza no servidor
  const action = await addSetRelation(setId, 'favorite');
  
  // 2. Invalida cache relacionado
  invalidateCache('/api/v1/armory/user-sets/favorites/');
  
  // 3. Atualiza UI
  setRelations(prev => ({
    ...prev,
    [setId]: { ...prev[setId], favorite: action === 'added' }
  }));
}
```

---

## 🎓 Boas Práticas

### ✅ DO

- Use cache para dados estáticos
- Invalide cache após mutações
- Use TTLs apropriados por tipo de dado
- Monitore estatísticas de cache
- Limpe cache expirado regularmente

### ❌ DON'T

- Não cache tokens de autenticação
- Não cache dados sensíveis
- Não use TTL muito longo para dados dinâmicos
- Não esqueça de invalidar cache relacionado
- Não force cache em operações críticas

---

## 📚 Recursos Adicionais

- [Documentação de Arquitetura](./ARQUITETURA.md)
- [README Principal](../README.md)
- [TypeScript Types](../lib/types/)

---

<div align="center">

**Made with ❤️ by Dionatha Goulart**

</div>

