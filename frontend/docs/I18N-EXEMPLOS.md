# 📝 Exemplos de Internacionalização (i18n) - Gooddivers Arsenal Frontend

## Visão Geral

Este documento mostra exemplos práticos de como usar o sistema de internacionalização nos componentes do projeto.

O sistema detecta automaticamente o idioma do usuário (pt-BR ou en) e retorna o texto apropriado baseado na disponibilidade de tradução.

---

## 📚 Funções Disponíveis

### Importações

```typescript
import { getTranslatedName, getTranslatedDescription, getTranslatedEffect } from '@/lib/i18n';
import type { Armor, Helmet, Cape, ArmorSet, Passive, BattlePass } from '@/lib/types/armory';
```

---

## 🎯 Exemplos de Uso

### Exemplo 1: Exibir Nome de uma Armadura

```typescript
function ArmorCard({ armor }: { armor: Armor }) {
  // ✅ CORRETO: Usa a função getTranslatedName
  return (
    <div>
      <h3>{getTranslatedName(armor)}</h3>
      {/* Se o usuário for pt-BR e existir name_pt_br, usa name_pt_br */}
      {/* Caso contrário, usa armor.name */}
    </div>
  );
  
  // ❌ INCORRETO: Não usar diretamente
  // <h3>{armor.name}</h3>
}
```

**Como funciona:**
- Se o idioma for **pt-BR** e existir `name_pt_br`, usa `name_pt_br`
- Caso contrário, usa `name` (inglês)

---

### Exemplo 2: Exibir Nome de Capacete ou Capa

```typescript
function HelmetCard({ helmet }: { helmet: Helmet }) {
  return <h3>{getTranslatedName(helmet)}</h3>;
}

function CapeCard({ cape }: { cape: Cape }) {
  return <h3>{getTranslatedName(cape)}</h3>;
}
```

**Resultado:** Retorna o nome traduzido automaticamente.

---

### Exemplo 3: Exibir Nome de Set

```typescript
function SetCard({ set }: { set: ArmorSet }) {
  return <h3>{getTranslatedName(set)}</h3>;
}
```

**Resultado:** Retorna o nome do set traduzido.

---

### Exemplo 4: Exibir Passiva Completa

```typescript
function PassiveCard({ passive }: { passive: Passive }) {
  return (
    <div>
      <h4>{getTranslatedName(passive)}</h4>
      <p>{getTranslatedDescription(passive)}</p>
      <p>{getTranslatedEffect(passive)}</p>
    </div>
  );
}
```

**Resultado:**
- `getTranslatedName(passive)` - Nome da passiva
- `getTranslatedDescription(passive)` - Descrição completa
- `getTranslatedEffect(passive)` - Efeito prático

---

### Exemplo 5: Exibir Nome de Passe de Batalha

```typescript
function PassCard({ pass }: { pass: BattlePass }) {
  return <h3>{getTranslatedName(pass)}</h3>;
}
```

**Resultado:** Retorna o nome do passe traduzido.

---

### Exemplo 6: Exibir Armadura com Passiva

```typescript
function ArmorWithPassive({ armor }: { armor: Armor }) {
  return (
    <div>
      <h3>{getTranslatedName(armor)}</h3>
      {armor.passive_detail && (
        <div>
          <p>Passiva: {getTranslatedName(armor.passive_detail)}</p>
          <p>Efeito: {getTranslatedEffect(armor.passive_detail)}</p>
          <p>Descrição: {getTranslatedDescription(armor.passive_detail)}</p>
        </div>
      )}
    </div>
  );
}
```

**Resultado:** Exibe a armadura e seus detalhes de passiva traduzidos.

---

### Exemplo 7: Exibir Armadura com Passe

```typescript
function ArmorWithPass({ armor }: { armor: Armor }) {
  return (
    <div>
      <h3>{getTranslatedName(armor)}</h3>
      {armor.pass_detail && (
        <p>Passe: {getTranslatedName(armor.pass_detail)}</p>
      )}
    </div>
  );
}
```

**Resultado:** Exibe a armadura e o passe associado traduzido.

---

### Exemplo 8: Exibir Set Completo

```typescript
function SetDetails({ set }: { set: ArmorSet }) {
  return (
    <div>
      <h2>{getTranslatedName(set)}</h2>
      
      <div>
        <h3>Capacete: {getTranslatedName(set.helmet_detail)}</h3>
        <h3>Armadura: {getTranslatedName(set.armor_detail)}</h3>
        <h3>Capa: {getTranslatedName(set.cape_detail)}</h3>
      </div>
      
      {set.passive_detail && (
        <div>
          <h4>Passiva: {getTranslatedName(set.passive_detail)}</h4>
          <p>{getTranslatedEffect(set.passive_detail)}</p>
        </div>
      )}
      
      {set.pass_detail && (
        <p>Passe: {getTranslatedName(set.pass_detail)}</p>
      )}
    </div>
  );
}
```

**Resultado:** Exibe todos os componentes do set com traduções automáticas.

---

## 🔍 Usando com Hooks

### Hook useTranslations

Para usar dentro de componentes React:

```typescript
import { useTranslations } from '@/lib/i18n';

function MyComponent({ armor }) {
  const { getTranslatedName, isPtBr } = useTranslations();

  return (
    <div>
      <h3>{getTranslatedName(armor)}</h3>
      <p>Idioma: {isPtBr ? 'Português' : 'English'}</p>
    </div>
  );
}
```

---

## ⚠️ Notas Importantes

1. ✅ **Detecção Automática**: O sistema detecta automaticamente o idioma do navegador do usuário
2. ✅ **Fallback**: Se o idioma for português (pt, pt-BR, pt-PT), usa os campos `_pt_br`
3. ✅ **Fallback 2**: Se o campo `_pt_br` não existir ou estiver vazio, usa o campo original
4. ✅ **Type Safety**: As funções são type-safe e funcionam com todos os tipos de armory
5. ✅ **Performance**: Cache automático e otimizações

---

## 🎨 Exemplo Completo Real

```typescript
import { useTranslations } from '@/lib/i18n';
import type { ArmorSet } from '@/lib/types/armory';

function SetCard({ set }: { set: ArmorSet }) {
  const { getTranslatedName, getTranslatedEffect } = useTranslations();

  return (
    <div className="armor-set-card">
      <h2>{getTranslatedName(set)}</h2>
      
      <div className="components">
        <div className="component">
          <img src={set.helmet_detail.image_url} alt={getTranslatedName(set.helmet_detail)} />
          <p>{getTranslatedName(set.helmet_detail)}</p>
        </div>
        
        <div className="component">
          <img src={set.armor_detail.image_url} alt={getTranslatedName(set.armor_detail)} />
          <p>{getTranslatedName(set.armor_detail)}</p>
        </div>
        
        <div className="component">
          <img src={set.cape_detail.image_url} alt={getTranslatedName(set.cape_detail)} />
          <p>{getTranslatedName(set.cape_detail)}</p>
        </div>
      </div>
      
      {set.passive_detail && (
        <div className="passive">
          <h3>Passiva: {getTranslatedName(set.passive_detail)}</h3>
          <p>{getTranslatedEffect(set.passive_detail)}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 📖 Documentação Relacionada

- [INTERNACIONALIZACAO.md](./INTERNACIONALIZACAO.md) - Documentação completa do sistema i18n
- [COMPONENTES.md](./COMPONENTES.md) - Componentes com exemplos
- [README Principal](./README.md) - Índice geral

---

<div align="center">

**Made with ❤️ by Dionatha Goulart**

</div>

