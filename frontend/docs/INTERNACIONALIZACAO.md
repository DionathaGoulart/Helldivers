# 🌍 Documentação de Internacionalização - Gooddivers Arsenal Frontend

## Visão Geral

O Gooddivers Arsenal suporta **múltiplos idiomas** com detecção automática e troca dinâmica sem recarregar a página.

---

## ✅ Idiomas Suportados

### Português Brasileiro (pt-BR)
- Idioma padrão
- Tradução completa da interface
- Dados do backend traduzidos

### Inglês (en)
- Idioma secundário
- Tradução completa da interface
- Dados do backend em inglês

---

## 🗂️ Estrutura de Traduções

### Localização dos Arquivos

```
lib/
├── translations/
│   ├── index.ts         # Hook useTranslation e exports
│   ├── pt-BR.ts         # Traduções em português
│   └── en.ts            # Traduções em inglês
└── i18n.ts              # Utilitários de tradução de itens
```

### Estrutura de Arquivo de Tradução

```typescript
// lib/translations/pt-BR.ts
export const ptBR = {
  home: {
    welcome: 'Bem-vindo a',
    superEarth: 'Super Terra',
    subtitle: 'Gerencie seu arsenal completo',
    // ...
  },
  armory: {
    title: 'Arsenal',
    filter: 'Filtrar',
    search: 'Buscar',
    // ...
  },
  // ...
};
```

---

## 🎯 Contexto de Idioma

**Localização**: `contexts/LanguageContext.tsx`

### Uso Básico

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { language, setLanguage, toggleLanguage, isPortuguese } = useLanguage();

  return (
    <div>
      <p>Idioma atual: {language}</p>
      <button onClick={toggleLanguage}>
        {language === 'pt-BR' ? 'English' : 'Português'}
      </button>
    </div>
  );
}
```

### API do Contexto

```typescript
interface LanguageContextType {
  language: 'pt-BR' | 'en';        // Idioma atual
  setLanguage: (lang) => void;     // Define idioma
  toggleLanguage: () => void;      // Alterna entre idiomas
  isPortuguese: () => boolean;     // Verifica se é pt-BR
}
```

---

## 🔧 Hooks de Tradução

### 1. useTranslation

Hook para traduzir textos da UI.

**Localização**: `lib/translations/index.ts`

```typescript
import { useTranslation } from '@/lib/translations';

function HomePage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('home.welcome')} Super Earth!</h1>
      <p>{t('home.subtitle')}</p>
    </div>
  );
}
```

### 2. useTranslations

Hook para traduzir itens do armory (nomes, descrições, efeitos).

**Localização**: `lib/i18n.ts`

```typescript
import { useTranslations } from '@/lib/i18n';

function ArmorCard({ armor }) {
  const { getTranslatedName, isPtBr } = useTranslations();

  return (
    <div>
      <h3>{getTranslatedName(armor)}</h3>
      {/* Retorna armor.name_pt_br se isPtBr=true, senão armor.name */}
    </div>
  );
}
```

---

## 📝 Funções de Tradução

### getTranslatedName

Traduz nome de itens (armor, helmet, cape, set).

```typescript
import { getTranslatedName } from '@/lib/i18n';

const name = getTranslatedName(armor);
// Retorna armor.name_pt_br se idioma for pt-BR, senão armor.name
```

### getTranslatedDescription

Traduz descrição de passivas.

```typescript
import { getTranslatedDescription } from '@/lib/i18n';

const description = getTranslatedDescription(passive);
// Retorna passive.description_pt_br se idioma for pt-BR, senão passive.description
```

### getTranslatedEffect

Traduz efeito prático de passivas.

```typescript
import { getTranslatedEffect } from '@/lib/i18n';

const effect = getTranslatedEffect(passive);
// Retorna passive.effect_pt_br se idioma for pt-BR, senão passive.effect
```

---

## 🔄 Detecção Automática

### Fluxo de Detecção

```
1. Usuário visita pela primeira vez
   ↓
2. Sistema detecta idioma do navegador
   ↓
3. Se for português → pt-BR
   Se for outro → en
   ↓
4. Salva preferência no localStorage
   ↓
5. Usa idioma detectado/salvo
```

### Código de Detecção

```typescript
function detectBrowserLanguage(): Language {
  const browserLang = navigator.language || navigator.userLanguage;
  const normalizedLang = browserLang.toLowerCase().split('-')[0];
  
  if (normalizedLang === 'pt') {
    return 'pt-BR';
  }
  
  return 'en';
}
```

---

## 💾 Persistência

### Salvamento Automático

A preferência de idioma é salva automaticamente no localStorage:

```typescript
const LANGUAGE_STORAGE_KEY = 'helldivers_language';

// Salva preferência
localStorage.setItem(LANGUAGE_STORAGE_KEY, 'pt-BR');

// Carrega preferência
const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
```

### Carregamento na Inicialização

```typescript
useEffect(() => {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === 'pt-BR' || saved === 'en') {
    setLanguage(saved as Language);
  } else {
    // Detecta do navegador
    const detected = detectBrowserLanguage();
    setLanguage(detected);
  }
}, []);
```

---

## 🌐 Backend Integration

### Accept-Language Header

O frontend envia automaticamente o header `Accept-Language` para o backend:

```typescript
// Request interceptor adiciona header
config.headers['Accept-Language'] = 'pt-br'; // ou 'en'
```

### Resposta do Backend

O backend retorna dados traduzidos baseado no header:

```typescript
// Requisição
const response = await api.get('/api/v1/armory/sets/');

// Resposta (idioma pt-BR)
{
  name: 'Light Armor',
  name_pt_br: 'Armadura Leve',
  // ...
}
```

---

## 📚 Exemplos Práticos

### Exemplo 1: Página com Traduções

```typescript
import { useTranslation } from '@/lib/translations';

function MyPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('page.title')}</h1>
      <p>{t('page.description')}</p>
      <button>{t('page.action')}</button>
    </div>
  );
}
```

### Exemplo 2: Lista de Items com Traduções

```typescript
import { useTranslations } from '@/lib/i18n';

function ArmorList({ armors }) {
  const { getTranslatedName } = useTranslations();

  return (
    <ul>
      {armors.map(armor => (
        <li key={armor.id}>
          {getTranslatedName(armor)}
        </li>
      ))}
    </ul>
  );
}
```

### Exemplo 3: Seletor de Idioma

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
      <option value="pt-BR">🇧🇷 Português</option>
      <option value="en">🇺🇸 English</option>
    </select>
  );
}
```

### Exemplo 4: Header com Navegação

```typescript
import { useTranslation, useLanguage } from '@/lib/translations';
import { useLanguage as useLanguageContext } from '@/contexts/LanguageContext';

function Header() {
  const { t } = useTranslation();
  const { toggleLanguage } = useLanguageContext();

  return (
    <header>
      <nav>
        <a href="/armory">{t('nav.armory')}</a>
        <a href="/favorites">{t('nav.favorites')}</a>
        <button onClick={toggleLanguage}>
          {t('nav.toggleLanguage')}
        </button>
      </nav>
    </header>
  );
}
```

---

## 🎨 Placeholders e Interpolação

### Placeholders

Suporte a placeholders em traduções:

```typescript
// Tradução
export const ptBR = {
  armory: {
    results: '{count} resultado(s) encontrado(s)',
  },
};

// Uso
const { t } = useTranslation();
const count = 5;
<p>{t('armory.results', { count })}</p>
// Output: "5 resultado(s) encontrado(s)"
```

---

## ⚡ Performance

### Otimizações

1. **Contexto Único**: Um único LanguageContext para toda a app
2. **Memoização**: Traduções são memoizadas automaticamente
3. **Lazy Loading**: Arquivos de tradução são carregados sob demanda
4. **Sem Re-renders**: Mudança de idioma causa re-render mínimo

---

## 🧪 Testes

### Teste de Tradução

```typescript
import { render } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import MyComponent from './MyComponent';

test('renders in pt-BR', () => {
  render(
    <LanguageProvider>
      <MyComponent />
    </LanguageProvider>
  );
  
  expect(screen.getByText('Bem-vindo a')).toBeInTheDocument();
});

test('renders in en', () => {
  render(
    <LanguageProvider>
      <MyComponent />
    </LanguageProvider>
  );
  
  act(() => {
    setLanguage('en');
  });
  
  expect(screen.getByText('Welcome to')).toBeInTheDocument();
});
```

---

## 📖 Adicionando Novos Idiomas

### Passo 1: Criar Arquivo de Tradução

```typescript
// lib/translations/es.ts
export const es = {
  home: {
    welcome: 'Bienvenido a',
    superEarth: 'Super Tierra',
    // ...
  },
  // ...
};
```

### Passo 2: Atualizar Tipos

```typescript
// contexts/LanguageContext.tsx
export type Language = 'pt-BR' | 'en' | 'es';
```

### Passo 3: Atualizar Detecção

```typescript
function detectBrowserLanguage(): Language {
  const browserLang = navigator.language || navigator.userLanguage;
  const normalizedLang = browserLang.toLowerCase().split('-')[0];
  
  if (normalizedLang === 'pt') return 'pt-BR';
  if (normalizedLang === 'es') return 'es';
  return 'en';
}
```

### Passo 4: Atualizar Seletor

```typescript
<select value={language} onChange={handleChange}>
  <option value="pt-BR">🇧🇷 Português</option>
  <option value="en">🇺🇸 English</option>
  <option value="es">🇪🇸 Español</option>
</select>
```

---

## 📚 Recursos Adicionais

- [Exemplo Completo](./I18N-EXEMPLOS.md)
- [React Context](https://react.dev/reference/react/useContext)
- [Next.js i18n](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

---

<div align="center">

**Made with ❤️ by Dionatha Goulart**

</div>

