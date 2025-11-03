<div align="center">

# 🛡️ Helldivers Arsenal

**Sistema completo para gerenciamento de armaduras, sets e passivas do Helldivers 2**

[![Frontend](https://img.shields.io/badge/Frontend-Next.js_16-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Django_5.2.7-0C4B33?style=flat-square&logo=django)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📸 Preview

<div align="center">

<img src="public/screenshots/desktop.jpeg" alt="Desktop Preview" width="800"/>
<p><em>Visualização desktop com layout responsivo e tema escuro</em></p>

<img src="public/screenshots/mobile.jpeg" alt="Mobile Preview" width="400"/>
<p><em>Interface mobile otimizada com navegação intuitiva</em></p>

</div>

---

## ✨ Sobre o Projeto

**Helldivers Arsenal** é uma aplicação web completa desenvolvida para jogadores de Helldivers 2 gerenciarem suas armaduras, sets e passivas do jogo. O projeto é composto por um frontend moderno em Next.js e uma API REST robusta em Django.

### 🎯 Principais Funcionalidades

- 🛡️ **Armory Completo** - Visualize e gerencie todas as armaduras, capacetes, capas, passivas e sets do jogo
- 🔍 **Busca e Filtros Avançados** - Sistema poderoso de busca e filtragem em todos os itens
- ⭐ **Sistema de Relacionamentos** - Favoritos, coleção pessoal e wishlist de sets
- 👤 **Gestão de Usuários** - Sistema completo de autenticação com Google OAuth
- 🔐 **Autenticação Segura** - JWT com cookies HttpOnly para máxima segurança
- 📊 **Documentação Automática** - API com documentação OpenAPI/Swagger automática
- 🌍 **Suporte Multilíngue** - Interface e API disponíveis em Português (PT-BR) e Inglês (EN)
- 💾 **Cache Inteligente** - Sistema de cache otimizado para performance superior
- 📱 **Totalmente Responsivo** - Interface adaptada para todos os dispositivos

---

## 🏗️ Arquitetura do Projeto

```
Helldivers/
├── 📁 frontend/                   # Frontend Next.js
│   ├── app/                       # Next.js App Router
│   ├── components/                # Componentes React
│   ├── lib/                       # Utilitários e APIs
│   ├── hooks/                     # Custom hooks
│   └── README.md                  # Documentação do frontend
├── 📁 backend/                    # Backend Django/DRF
│   ├── api/                       # URLs da API versionada
│   ├── armory/                    # App principal (armaduras)
│   ├── users/                     # App de autenticação
│   ├── core/                      # Configurações Django
│   └── README.md                  # Documentação do backend
└── 📄 LICENSE                     # Licença MIT
```

### 🔄 Fluxo de Comunicação

```
Frontend (Next.js) ←→ API REST (Django) ←→ PostgreSQL
     ↓                      ↓                    ↓
  Netlify              Fly.io              Cloud DB
```

---

## 🛠️ Tecnologias Utilizadas

### Frontend

- **Next.js 16.0.0** - Framework React com App Router, SSR e SSG
- **React 19.2.0** - Biblioteca JavaScript para interfaces
- **TypeScript 5.0** - Superset JavaScript com tipagem estática
- **Tailwind CSS 4.0** - Framework CSS utility-first
- **Axios 1.13.0** - Cliente HTTP para API

### Backend

- **Django 5.2.7** - Framework web Python robusto
- **Django REST Framework 3.16.1** - Framework para APIs REST
- **Python 3.13** - Linguagem de programação
- **djangorestframework-simplejwt 5.5.1** - Autenticação JWT
- **django-allauth 65.12.0** - Autenticação social (Google OAuth)
- **drf-spectacular 0.28.0** - Documentação OpenAPI/Swagger automática

### Banco de Dados

- **PostgreSQL** - Banco de dados relacional (produção)
- **SQLite** - Banco de dados local (desenvolvimento)

### Deploy e CI/CD

- **Netlify** - Deploy do frontend (Next.js)
- **Fly.io** - Deploy do backend (Django)
- **GitHub Actions** - CI/CD automatizado
- **Docker** - Containerização

---

## 🚀 Como Executar

### Pré-requisitos

- **Node.js 20+** (para frontend)
- **Python 3.13+** (para backend)
- **Poetry** ou **pip** (gerenciador de dependências Python)
- **PostgreSQL** (opcional para desenvolvimento local)

### Instalação Completa

#### 1. Clone o Repositório

```bash
git clone https://github.com/DionathaGoulart/Helldivers.git
cd Helldivers
```

#### 2. Backend (Django)

```bash
# Entre no diretório do backend
cd backend

# Instale as dependências (usando Poetry - recomendado)
poetry install

# Ou usando pip
pip install -r requirements.txt

# Configure as variáveis de ambiente
# Crie um arquivo .env na raiz do backend/
# Copie e edite conforme necessário

# Execute as migrações
poetry run python manage.py migrate

# Crie um superusuário (opcional)
poetry run python manage.py createsuperuser

# Execute o servidor de desenvolvimento
poetry run python manage.py runserver
```

O backend estará disponível em `http://localhost:8000`

#### 3. Frontend (Next.js)

```bash
# Em um novo terminal, entre no diretório do frontend
cd frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Crie um arquivo .env.local na raiz do frontend/
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Execute em modo desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

### Scripts Disponíveis

#### Backend

```bash
cd backend

# Desenvolvimento
poetry run python manage.py runserver    # Servidor de desenvolvimento
poetry run python manage.py migrate      # Aplicar migrações
poetry run python manage.py makemigrations  # Criar migrações

# Qualidade
poetry run python manage.py check       # Verificar configurações
poetry run python manage.py test        # Executar testes
```

#### Frontend

```bash
cd frontend

# Desenvolvimento
npm run dev      # Servidor de desenvolvimento (porta 3000)
npm run build    # Build para produção
npm run start    # Servidor de produção

# Qualidade
npm run lint     # Executar ESLint
```

---

## 📊 Deploy

### URLs de Produção

- **Frontend**: `https://gooddivers.dionatha.com.br`
- **Backend API**: `https://helldivers-api.fly.dev`
- **Documentação API**: `https://helldivers-api.fly.dev/api/docs/`

### Configuração de Deploy

O projeto está configurado para deploy automático:

- **Frontend**: Deploy automático na Netlify via GitHub Actions
- **Backend**: Deploy automático na Fly.io via GitHub Actions

Ambos os deploys acontecem automaticamente quando há push na branch `main`.

---

## 🔧 Configuração

### Variáveis de Ambiente - Backend

Crie um arquivo `.env` na raiz do `backend/`:

```env
# Configurações Básicas
SECRET_KEY=sua-secret-key-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Banco de Dados (opcional - usa SQLite por padrão)
DATABASE_URL=postgresql://user:password@localhost:5432/helldivers

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_SECRET=seu-google-secret

# Email (opcional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha
```

### Variáveis de Ambiente - Frontend

Crie um arquivo `.env.local` na raiz do `frontend/`:

```env
# URL da API Backend
NEXT_PUBLIC_API_URL=http://localhost:8000

# URL Base do Frontend
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google OAuth Client ID (opcional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-google-client-id
```

---

## 📄 Documentação Detalhada

Para informações mais detalhadas sobre cada parte do projeto, consulte:

- **[README do Frontend](frontend/README.md)** - Documentação completa do frontend Next.js
- **[README do Backend](backend/README.md)** - Documentação completa da API Django
- **[Documentação da API](https://helldivers-api.fly.dev/api/docs/)** - Swagger UI interativo

---

## 🌍 Internacionalização

O projeto suporta múltiplos idiomas:

- **🇧🇷 Português (PT-BR)** - Idioma padrão
- **🇺🇸 Inglês (EN)** - Tradução completa

A detecção de idioma é automática baseada nas configurações do navegador (frontend) e no header `Accept-Language` (backend).

---

## 📊 Performance

### Frontend

- **Cache Inteligente**: Redução de até 95% das requisições HTTP após primeira carga
- **Cache de Imagens**: Imagens armazenadas em localStorage para carregamento instantâneo
- **Lazy Loading**: Componentes e imagens carregados sob demanda
- **Code Splitting**: Divisão automática do código por rotas
- **React Compiler**: Otimizações automáticas de renderização

### Backend

- **Paginação Inteligente**: 20 itens por página para otimizar carregamento
- **Índices de Banco**: Índices otimizados em campos frequentemente consultados
- **Cache de Arquivos Estáticos**: WhiteNoise para servir arquivos estáticos rapidamente
- **Gunicorn Multi-Worker**: 4 workers para melhor processamento paralelo
- **Queries Otimizadas**: Uso de select_related e prefetch_related

---

## 🧪 CI/CD e Qualidade

### GitHub Actions

O projeto possui workflows automatizados:

- **CI/CD Frontend** - Build, testes e deploy automático para Netlify
- **CI/CD Backend** - Build, testes e deploy automático para Fly.io
- **Linting** - Verificação de código em ambos os projetos
- **Type Checking** - Verificação de tipos TypeScript e Python

### Ferramentas de Qualidade

- **ESLint** - Linter para código JavaScript/TypeScript
- **TypeScript** - Verificação estática de tipos (frontend)
- **Django Admin** - Interface administrativa para dados
- **DRF Spectacular** - Documentação automática da API

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License**.

**Copyright (c) 2025 Dionatha Goulart**

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 📞 Contato

**Desenvolvedor**: Dionatha Goulart  
**Email**: dionatha.work@gmail.com  
**Portfolio**: https://dionatha.com.br/  
**GitHub**: https://github.com/DionathaGoulart  
**Linkedin**: https://www.linkedin.com/in/dionathagoulart/

---

<div align="center">

**Feito by Dionatha Goulart**

</div>

