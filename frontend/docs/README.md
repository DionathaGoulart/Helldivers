<div align="center">

# 📚 Documentação Técnica - Gooddivers Arsenal Frontend

**Documentação completa da arquitetura, componentes e funcionalidades do frontend**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 📖 Índice da Documentação

Esta pasta contém documentação técnica detalhada do frontend do Gooddivers Arsenal:

### 📄 [README.md](./README.md) (você está aqui)
Documentação principal com visão geral e índice.

### 🏗️ [ARQUITETURA.md](./ARQUITETURA.md)
Arquitetura detalhada do projeto:
- Princípios arquiteturais
- Estrutura de diretórios
- Fluxo de dados
- Padrões de componentes
- Gerenciamento de estado

### 💾 [CACHE.md](./CACHE.md)
Sistema de cache multi-camada:
- Cache de API (SessionStorage)
- Cache de Imagens (LocalStorage)
- Estratégias de invalidação
- Performance e otimizações

### 🎨 [COMPONENTES.md](./COMPONENTES.md)
Componentes reutilizáveis:
- Componentes UI base (Button, Card, Input, etc.)
- Componentes especializados (SetCard, PassiveSelect)
- Componentes de layout (Header, Footer)
- Padrões e boas práticas

### 🔌 [API.md](./API.md)
Integração com backend:
- Cliente Axios
- Endpoints disponíveis
- Autenticação com cookies
- Tratamento de erros

### 🌍 [INTERNACIONALIZACAO.md](./INTERNACIONALIZACAO.md)
Sistema de i18n:
- Suporte a múltiplos idiomas
- Hooks de tradução
- Detecção automática
- Backend integration

### 📝 [I18N-EXEMPLOS.md](./I18N-EXEMPLOS.md)
Exemplos práticos de uso do sistema de i18n.

---

## 🚀 Quick Start

### Para Desenvolvedores

Se você é novo no projeto, comece por:

1. **[README Principal](../README.md)** - Visão geral do projeto
2. **[ARQUITETURA.md](./ARQUITETURA.md)** - Entenda a estrutura
3. **[COMPONENTES.md](./COMPONENTES.md)** - Veja os componentes disponíveis
4. **[I18N-EXEMPLOS.md](./I18N-EXEMPLOS.md)** - Aprenda sobre traduções

### Para Contribuidores

Leia primeiro:
- **[ARQUITETURA.md](./ARQUITETURA.md)** - Padrões e convenções
- **[CACHE.md](./CACHE.md)** - Sistema de cache
- **[API.md](./API.md)** - Integração com backend

---

## 📊 Visão Geral do Projeto

### Stack Principal

- **Next.js 16.0.0** - Framework React com App Router
- **React 19.2.0** - Biblioteca UI
- **TypeScript 5.0** - Tipagem estática
- **Tailwind CSS 4.0** - Framework CSS
- **Axios 1.13.0** - Cliente HTTP
- **React Compiler 1.0.0** - Otimizações automáticas

### Principais Funcionalidades

- ✅ Sistema de autenticação seguro
- ✅ Cache inteligente multi-camada
- ✅ Internacionalização (PT-BR/EN)
- ✅ Interface responsiva e moderna
- ✅ Otimizações de performance
- ✅ Acessibilidade WCAG AA

---

## 🏗️ Estrutura de Arquivos

```
frontend/
├── 📁 app/                    # Next.js App Router
├── 📁 components/            # Componentes reutilizáveis
├── 📁 contexts/              # Contextos React
├── 📁 hooks/                 # Custom hooks
├── 📁 lib/                   # Bibliotecas
├── 📁 utils/                 # Utilitários
├── 📁 constants/             # Constantes
├── 📁 docs/                  # Documentação técnica
└── 📁 public/                # Arquivos estáticos
```

---

## 🔍 Guia de Navegação

### Por Funcionalidade

| Funcionalidade | Documentação |
|---|---|
| Autenticação | [API.md](./API.md#autenticação) |
| Cache | [CACHE.md](./CACHE.md) |
| Componentes | [COMPONENTES.md](./COMPONENTES.md) |
| i18n | [INTERNACIONALIZACAO.md](./INTERNACIONALIZACAO.md) |
| Rotas | [ARQUITETURA.md](./ARQUITETURA.md#rotas-e-navegação) |

---

## 📚 Recursos Adicionais

- [README Principal](../README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

<div align="center">

**Made with ❤️ by Dionatha Goulart**

</div>
