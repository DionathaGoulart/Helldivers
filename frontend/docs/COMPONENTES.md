# 🎨 Documentação de Componentes - Gooddivers Arsenal Frontend

## Visão Geral

Esta documentação descreve todos os componentes reutilizáveis do Gooddivers Arsenal, incluindo suas props, exemplos de uso e boas práticas.

---

## 📦 Componentes UI Base

### Button

**Localização**: `components/ui/Button.tsx`

Botão estilizado com suporte a múltiplas variantes, tamanhos e estados.

#### Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}
```

#### Variantes

- **primary**: Botão principal (azul/dourado)
- **outline**: Botão com borda
- **danger**: Botão de ação perigosa (vermelho)
- **success**: Botão de sucesso (verde)

#### Exemplo de Uso

```typescript
import Button from '@/components/ui/Button';

// Botão primário
<Button variant="primary" size="lg">
  Enviar
</Button>

// Botão com loading
<Button loading={isSubmitting}>
  Salvar
</Button>

// Botão outline
<Button variant="outline" size="md">
  Cancelar
</Button>

// Botão full width
<Button fullWidth onClick={handleClick}>
  Continuar
</Button>
```

---

### Card

**Localização**: `components/ui/Card.tsx`

Card com efeito de glow e estética militar.

#### Props

```typescript
interface CardProps {
  children: React.ReactNode;
  glowColor?: 'cyan' | 'gold' | 'green' | 'red';
  className?: string;
  onClick?: () => void;
}
```

#### Exemplo de Uso

```typescript
import Card from '@/components/ui/Card';

// Card com glow cyan
<Card glowColor="cyan">
  <h3>Título</h3>
  <p>Conteúdo</p>
</Card>

// Card clickável
<Card glowColor="gold" onClick={handleClick}>
  <h3>Ação</h3>
  <p>Clique para continuar</p>
</Card>
```

---

### Input

**Localização**: `components/ui/Input.tsx`

Input customizado com label, erro e validação.

#### Props

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}
```

#### Exemplo de Uso

```typescript
import Input from '@/components/ui/Input';

<Input
  type="text"
  label="Username"
  placeholder="Digite seu username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  error={errors.username}
  required
/>

<Input
  type="password"
  label="Senha"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error={errors.password}
  required
/>
```

---

### Select

**Localização**: `components/ui/Select.tsx`

Select customizado com estética militar.

#### Props

```typescript
interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  required?: boolean;
}
```

#### Exemplo de Uso

```typescript
import Select from '@/components/ui/Select';

<Select
  label="Categoria"
  value={category}
  onChange={setCategory}
  options={[
    { value: 'light', label: 'Light' },
    { value: 'medium', label: 'Medium' },
    { value: 'heavy', label: 'Heavy' },
  ]}
/>
```

---

### CachedImage

**Localização**: `components/ui/CachedImage.tsx`

Componente de imagem com cache automático em localStorage.

#### Props

```typescript
interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | undefined | null;
  fallback?: string;
}
```

#### Características

- ✅ Cache automático em localStorage
- ✅ Carregamento instantâneo de imagens cacheadas
- ✅ Fallback para placeholder
- ✅ Lazy loading nativo

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

---

### LoadingSpinner

**Localização**: `components/ui/LoadingSpinner.tsx`

Spinner de carregamento animado.

#### Props

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'cyan' | 'gold';
}
```

#### Exemplo de Uso

```typescript
import LoadingSpinner from '@/components/ui/LoadingSpinner';

<LoadingSpinner size="lg" color="cyan" />
```

---

## 🛡️ Componentes do Armory

### SetCard

**Localização**: `components/armory/SetCard.tsx`

Card para exibir sets de armadura com ações rápidas.

#### Props

```typescript
interface SetCardProps {
  set: ArmorSet;
  relations?: Record<number, SetRelationStatus>;
  updating?: Record<number, boolean>;
  onRelationToggle?: (setId: number, relation: RelationType) => void;
  showActions?: boolean;
}
```

#### Exemplo de Uso

```typescript
import { SetCard } from '@/components/armory';

<SetCard
  set={armorSet}
  relations={relations}
  updating={updating}
  onRelationToggle={handleRelationToggle}
  showActions={true}
/>
```

---

### PassiveSelect

**Localização**: `components/armory/PassiveSelect.tsx`

Seletor de passivas com múltipla seleção.

#### Props

```typescript
interface PassiveSelectProps {
  passives: PassiveOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  isPortuguese: boolean;
}
```

#### Exemplo de Uso

```typescript
import { PassiveSelect } from '@/components/armory';

<PassiveSelect
  passives={passivesList}
  selectedIds={selectedPassiveIds}
  onChange={setSelectedPassiveIds}
  isPortuguese={isPortuguese}
/>
```

---

## 🏗️ Componentes de Layout

### Header

**Localização**: `components/layout/Header.tsx`

Cabeçalho com navegação e idioma.

#### Características

- ✅ Logo do Gooddivers
- ✅ Links de navegação
- ✅ Seletor de idioma
- ✅ Menu de usuário
- ✅ Responsivo

#### Exemplo de Uso

```typescript
import Header from '@/components/layout/Header';

// Usado automaticamente no RootLayout
<Header />
```

---

### Footer

**Localização**: `components/layout/Footer.tsx`

Rodapé com informações legais.

#### Características

- ✅ Copyright
- ✅ Links legais
- ✅ Informações do desenvolvedor

---

### SecurityWarning

**Localização**: `components/layout/SecurityWarning.tsx`

Aviso de segurança no topo da página.

#### Características

- ✅ Aviso de ambiente de desenvolvimento
- ✅ Dismissable
- ✅ Persistido em localStorage

---

## 🎯 Padrões de Componentes

### 1. Componentes Controlados

Componentes que recebem `value` e `onChange`:

```typescript
<Input
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>

<Select
  value={category}
  onChange={setCategory}
  options={options}
/>
```

### 2. Componentes com Render Props

Componentes que permitem renderização customizada:

```typescript
<Modal>
  {({ isOpen, close }) => (
    <div>
      <h2>Modal Content</h2>
      <button onClick={close}>Close</button>
    </div>
  )}
</Modal>
```

### 3. Componentes Compostos

Componentes que se combinam:

```typescript
<Card glowColor="cyan">
  <Card.Header>
    <h3>Title</h3>
  </Card.Header>
  <Card.Body>
    <p>Content</p>
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

---

## 🎨 Estilização

### CSS Modules

Alguns componentes usam CSS modules para estilização:

```css
/* Button.css */
.hd-button {
  /* Estilos base */
}

.hd-button--primary {
  /* Variante primária */
}

.hd-button--loading {
  /* Estado loading */
}
```

### Tailwind CSS

A maioria dos componentes usa Tailwind CSS:

```typescript
<div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
  <h3 className="text-xl font-bold">Title</h3>
</div>
```

---

## 📱 Responsividade

Todos os componentes são responsivos e seguem breakpoints padrão:

```typescript
// Mobile First
className="text-sm md:text-base lg:text-lg xl:text-xl"

// Grid responsivo
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

// Flex responsivo
className="flex flex-col md:flex-row"
```

---

## ♿ Acessibilidade

Todos os componentes seguem as melhores práticas de acessibilidade:

### ARIA Labels

```typescript
<button aria-label="Fechar modal">
  <CloseIcon />
</button>
```

### Keyboard Navigation

```typescript
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Action
</button>
```

### Focus States

```typescript
className="focus:outline-none focus:ring-2 focus:ring-cyan-500"
```

---

## 🧪 Testes

### Estrutura de Teste

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🚀 Performance

### Otimizações

1. **Memoização**: Componentes pesados são memorizados
2. **Lazy Loading**: Componentes grandes carregam sob demanda
3. **Code Splitting**: Componentes separados em chunks
4. **CSS Optimization**: Tailwind CSS purge unused

---

## 📚 Referências

- [React Documentation](https://react.dev)
- [Next.js Components](https://nextjs.org/docs/app/building-your-application/components)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Accessibility](https://www.w3.org/WAI/)

---

<div align="center">

**Made with ❤️ by Dionatha Goulart**

</div>

