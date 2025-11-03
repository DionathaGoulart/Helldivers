<div align="center">

# 🛡️ Helldivers Arsenal Backend

**API REST completa e moderna para gerenciamento de armaduras, sets e passivas do Helldivers 2**

[![Django](https://img.shields.io/badge/Django-5.2.7-0C4B33?style=flat-square&logo=django)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/DRF-3.16.1-red?style=flat-square&logo=django)](https://www.django-rest-framework.org/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Deploy](https://img.shields.io/badge/Deploy-Fly.io-8B5CF6?style=flat-square&logo=fly.io)](https://fly.io/)

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

## ✨ Funcionalidades

### 🎯 Principais Características

- 🛡️ **API Completa de Armory** - Endpoints REST para armaduras, capacetes, capas, passivas e sets do jogo
- 🔍 **Filtros e Busca Avançados** - Sistema de filtragem poderoso com django-filter e busca por múltiplos campos
- 👤 **Gestão de Usuários** - Sistema completo de autenticação e gerenciamento de perfis
- ⭐ **Sistema de Relacionamentos** - Favoritos, coleção e wishlist de sets por usuário
- 🔐 **Autenticação Segura** - JWT com cookies HttpOnly e autenticação social via Google OAuth
- 📊 **Documentação Automática** - Documentação OpenAPI/Swagger gerada automaticamente
- 🌍 **Suporte Multilíngue** - API com suporte a Português (PT-BR) e Inglês (EN)
- 📧 **Sistema de Emails** - Confirmação de email e recuperação de senha

### 🛠️ Funcionalidades Técnicas

- 🔒 **Cookies HttpOnly** - Tokens JWT armazenados de forma segura em cookies HttpOnly para proteção contra XSS
- 🔐 **Autenticação JWT** - Tokens de acesso e refresh com rotação automática
- 🌐 **CORS Configurado** - Configuração completa de CORS para comunicação frontend/backend
- 📄 **Paginação Automática** - Paginação padrão de 20 itens por página
- 🎯 **Versionamento de API** - API versionada (v1) preparada para futuras versões
- 💾 **Banco de Dados Flexível** - Suporte a SQLite (desenvolvimento) e PostgreSQL (produção)
- 🖼️ **Upload de Imagens** - Sistema completo de upload e gerenciamento de imagens
- 🔍 **Filtros Avançados** - Django-filter com filtros customizados por modelo
- 📝 **Validação Robusta** - Validação de dados em serializers e modelos
- 🔄 **Migrations Automáticas** - Sistema de migrações Django para versionamento do banco

---

## 🏗️ Arquitetura do Projeto

```
backend/
├── 📁 api/                      # Organização das URLs da API
│   └── v1/                       # Versão 1 da API
│       └── urls.py               # URLs principais da v1
├── 📁 armory/                    # App principal - Gerenciamento de armaduras
│   ├── models/                   # Modelos de dados
│   │   ├── armor.py              # Modelo de Armadura
│   │   ├── helmet.py             # Modelo de Capacete
│   │   ├── cape.py               # Modelo de Capa
│   │   ├── passive.py            # Modelo de Passiva
│   │   ├── set.py                # Modelo de Set de Armadura
│   │   ├── battlepass.py         # Modelo de Battle Pass
│   │   └── user_set_relation.py  # Relação Usuário-Set
│   ├── serializers/              # Serializers DRF
│   │   ├── armor.py              # Serializer de Armadura
│   │   ├── helmet.py             # Serializer de Capacete
│   │   ├── cape.py               # Serializer de Capa
│   │   ├── passive.py            # Serializer de Passiva
│   │   ├── set.py                # Serializer de Set
│   │   ├── battlepass.py         # Serializer de Battle Pass
│   │   └── user_set_relation.py  # Serializer de Relação
│   ├── views/                    # ViewSets (endpoints da API)
│   │   ├── armor.py              # ViewSet de Armadura
│   │   ├── helmet.py             # ViewSet de Capacete
│   │   ├── cape.py               # ViewSet de Capa
│   │   ├── passive.py            # ViewSet de Passiva
│   │   ├── set.py                # ViewSet de Set
│   │   ├── battlepass.py         # ViewSet de Battle Pass
│   │   └── user_set_relation.py  # ViewSet de Relação
│   ├── filters/                  # Filtros django-filter
│   │   └── armor.py              # Filtros customizados de Armadura
│   ├── admin/                    # Configuração Django Admin
│   │   ├── armor.py              # Admin de Armadura
│   │   ├── helmet.py             # Admin de Capacete
│   │   ├── cape.py               # Admin de Capa
│   │   ├── passive.py            # Admin de Passiva
│   │   ├── set.py                # Admin de Set
│   │   ├── battlepass.py         # Admin de Battle Pass
│   │   └── user_set_relation.py  # Admin de Relação
│   ├── migrations/               # Migrações do banco de dados
│   ├── urls.py                   # URLs do app armory
│   └── apps.py                   # Configuração do app
├── 📁 users/                      # App de usuários e autenticação
│   ├── models/                   # Modelos de usuário
│   │   └── user.py                # Modelo CustomUser
│   ├── serializers/              # Serializers de autenticação
│   │   ├── auth.py                # Serializers de autenticação
│   │   ├── user.py                # Serializers de usuário
│   │   └── password_reset.py      # Serializers de reset de senha
│   ├── views/                    # Views de autenticação e perfil
│   │   ├── auth.py                # Views de autenticação básica
│   │   ├── auth_cookies.py        # Views com cookies HttpOnly
│   │   ├── profile.py             # Views de perfil
│   │   ├── password.py            # Views de senha
│   │   ├── password_reset.py      # Views de reset de senha
│   │   ├── dashboard.py           # Views de dashboard
│   │   ├── validators.py          # Views de validação
│   │   └── email_verification.py  # Views de verificação de email
│   ├── authentication.py          # Autenticação JWT com cookies HttpOnly
│   ├── adapters.py                # Adapters django-allauth customizados
│   ├── utils.py                   # Utilitários de usuário
│   ├── utils_oauth.py             # Utilitários OAuth
│   ├── signals.py                 # Signals Django
│   ├── urls.py                    # URLs do app users
│   └── admin.py                   # Admin de usuários
├── 📁 core/                       # Configurações principais do Django
│   ├── settings.py                # Configurações Django completas
│   ├── settings_prod.py           # Configurações de produção
│   ├── urls.py                    # URLs principais
│   ├── wsgi.py                    # WSGI application
│   └── asgi.py                    # ASGI application
├── 📁 media/                      # Arquivos de mídia (imagens)
│   ├── armors/                    # Imagens de armaduras
│   ├── helmets/                   # Imagens de capacetes
│   ├── capes/                     # Imagens de capas
│   ├── passives/                  # Imagens de passivas
│   ├── passes/                    # Imagens de passes
│   └── sets/                      # Imagens de sets
├── 📁 staticfiles/                # Arquivos estáticos coletados
├── manage.py                      # Script de gerenciamento Django
├── Dockerfile                     # Configuração Docker para deploy
├── fly.toml                       # Configuração Fly.io
├── pyproject.toml                 # Dependências Poetry
├── requirements.txt               # Dependências pip
└── db.sqlite3                     # Banco SQLite (desenvolvimento)
```

---

## 📄 Endpoints da API

### 🔐 Autenticação

- **POST `/api/v1/auth/login/`** - Login com email/senha ou username/senha
- **POST `/api/v1/auth/logout/`** - Logout (limpa cookies)
- **POST `/api/v1/auth/token/refresh/`** - Refresh do token JWT
- **GET `/api/v1/auth/user/`** - Detalhes do usuário autenticado
- **POST `/api/v1/auth/registration/`** - Registro de novo usuário
- **GET `/api/v1/auth/google/callback/`** - Callback OAuth Google
- **POST `/api/v1/password/reset/`** - Solicitar reset de senha
- **POST `/api/v1/password/reset/confirm/`** - Confirmar reset de senha
- **POST `/api/v1/password/change/`** - Trocar senha (autenticado)
- **POST `/api/v1/resend-verification-email/`** - Reenviar email de verificação
- **POST `/api/v1/verify-email/`** - Verificar email

### 👤 Usuários

- **GET `/api/v1/profile/`** - Perfil do usuário
- **PUT `/api/v1/profile/update/`** - Atualizar perfil
- **GET `/api/v1/dashboard/`** - Dashboard do usuário
- **GET `/api/v1/check/username/`** - Verificar disponibilidade de username
- **GET `/api/v1/check/email/`** - Verificar disponibilidade de email

### 🛡️ Armory

- **GET `/api/v1/armory/sets/`** - Lista de sets de armadura (com filtros e busca)
- **GET `/api/v1/armory/sets/{id}/`** - Detalhes de um set específico
- **GET `/api/v1/armory/armors/`** - Lista de armaduras
- **GET `/api/v1/armory/armors/{id}/`** - Detalhes de uma armadura
- **GET `/api/v1/armory/helmets/`** - Lista de capacetes
- **GET `/api/v1/armory/helmets/{id}/`** - Detalhes de um capacete
- **GET `/api/v1/armory/capes/`** - Lista de capas
- **GET `/api/v1/armory/capes/{id}/`** - Detalhes de uma capa
- **GET `/api/v1/armory/passives/`** - Lista de passivas
- **GET `/api/v1/armory/passives/{id}/`** - Detalhes de uma passiva
- **GET `/api/v1/armory/passes/`** - Lista de battle passes
- **GET `/api/v1/armory/passes/{id}/`** - Detalhes de um battle pass

### ⭐ Relacionamentos Usuário-Set

- **GET `/api/v1/armory/user-sets/`** - Lista de relações do usuário
- **POST `/api/v1/armory/user-sets/`** - Criar relação (favorito/coleção/wishlist)
- **GET `/api/v1/armory/user-sets/{id}/`** - Detalhes de uma relação
- **PUT `/api/v1/armory/user-sets/{id}/`** - Atualizar relação
- **DELETE `/api/v1/armory/user-sets/{id}/`** - Deletar relação

### 📊 Documentação

- **GET `/api/schema/`** - Schema OpenAPI
- **GET `/api/docs/`** - Documentação Swagger UI
- **GET `/api/redoc/`** - Documentação ReDoc

### 🔧 Admin

- **GET `/admin/`** - Interface Django Admin

---

## 🛠️ Tecnologias Utilizadas

### Framework e Core

- **Django 5.2.7** - Framework web Python robusto e escalável
- **Django REST Framework 3.16.1** - Framework para construção de APIs REST
- **Python 3.13** - Linguagem de programação

### Autenticação e Autorização

- **djangorestframework-simplejwt 5.5.1** - Autenticação JWT com suporte a cookies HttpOnly
- **django-allauth 65.12.0** - Autenticação social (Google OAuth)
- **dj-rest-auth 7.0.1** - Integração REST para django-allauth
- **pyjwt 2.10.1** - Biblioteca JWT
- **cryptography 46.2.0** - Criptografia de tokens OAuth

### API e Documentação

- **drf-spectacular 0.28.0** - Documentação OpenAPI/Swagger automática
- **django-filter 25.2** - Filtros avançados para queries
- **django-cors-headers 4.9.0** - Configuração CORS para comunicação frontend/backend

### Banco de Dados

- **psycopg2-binary 2.9.9** - Driver PostgreSQL
- **dj-database-url 2.1.0** - Parsing de DATABASE_URL

### Utilitários

- **python-decouple 3.8** - Gerenciamento de variáveis de ambiente
- **python-dotenv 1.1.1** - Carregamento de arquivos .env
- **Pillow 12.0.0** - Processamento de imagens
- **requests 2.32.5** - Cliente HTTP
- **httpx 0.28.1** - Cliente HTTP assíncrono

### Servidor e Deploy

- **gunicorn 21.2.0** - Servidor WSGI para produção
- **whitenoise 6.6.0** - Servimento de arquivos estáticos
- **django-extensions 4.1** - Extensões úteis do Django

### Ferramentas de Desenvolvimento

- **Poetry** - Gerenciador de dependências Python moderno
- **python-dotenv** - Carregamento de variáveis de ambiente

### Deploy e CI/CD

- **Docker** - Containerização para deploy consistente
- **Fly.io** - Plataforma de deploy em nuvem

### Integrações

- **Google OAuth 2.0** - Autenticação social via Google
- **SMTP** - Envio de emails transacionais

---

## 🚀 Como Executar

### Pré-requisitos

- Python 3.13+
- Poetry (opcional, mas recomendado) ou pip
- PostgreSQL (opcional, SQLite usado por padrão em desenvolvimento)
- Conta Google para OAuth (opcional)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/DionathaGoulart/Helldivers.git

# Entre no diretório do backend
cd Helldivers/backend

# Instale as dependências (usando Poetry - recomendado)
poetry install

# Ou usando pip
pip install -r requirements.txt

# Configure as variáveis de ambiente
# Crie um arquivo .env na raiz do backend/
# Edite o arquivo .env com suas configurações

# Execute as migrações
poetry run python manage.py migrate
# ou
python manage.py migrate

# Crie um superusuário (opcional)
poetry run python manage.py createsuperuser
# ou
python manage.py createsuperuser

# Execute o servidor de desenvolvimento
poetry run python manage.py runserver
# ou
python manage.py runserver
```

O backend estará disponível em `http://localhost:8000`

### Scripts Disponíveis

```bash
# Desenvolvimento
poetry run python manage.py runserver          # Servidor de desenvolvimento
poetry run python manage.py migrate            # Aplicar migrações
poetry run python manage.py makemigrations     # Criar migrações
poetry run python manage.py createsuperuser    # Criar superusuário
poetry run python manage.py collectstatic      # Coletar arquivos estáticos
poetry run python manage.py shell              # Shell interativo Django

# Qualidade de Código
poetry run python manage.py check              # Verificar configurações Django
poetry run python manage.py test               # Executar testes
```

---

## 🧪 CI/CD e Qualidade

### GitHub Actions

O projeto possui workflows automatizados de CI/CD:

- **CI/CD** - Build, testes e deploy automático para Fly.io
- **Linting** - Verificação de código Python
- **Type Checking** - Verificação de tipos com mypy (se configurado)

### Ferramentas de Qualidade

- **Django Admin** - Interface administrativa para gerenciamento de dados
- **DRF Spectacular** - Documentação automática da API (Swagger/OpenAPI)
- **Django Debug Toolbar** - Debug toolbar para desenvolvimento (opcional)
- **django-extensions** - Extensões úteis do Django

---

## 🚀 Deploy

### Deploy Automático (Fly.io)

O projeto está configurado para deploy automático na Fly.io:

- **Produção**: Deploy automático na branch `main`
- **Preview**: Deploy automático em Pull Requests
- **URL**: `https://helldivers-api.fly.dev`

### Configuração Fly.io

- **Framework**: Django 5.2.7
- **Runtime**: Python 3.12
- **Build Command**: `pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -r requirements.txt && python manage.py collectstatic --noinput`
- **Start Command**: `gunicorn --bind 0.0.0.0:8000 --workers 4 --timeout 120 --access-logfile - --error-logfile - core.wsgi:application`
- **Configuração**: `fly.toml`

### Configuração Automática

1. Conecte seu repositório no Fly.io Dashboard
2. Configure as variáveis de ambiente necessárias no Fly.io
3. O deploy acontece automaticamente via GitHub Actions

### Workflows GitHub Actions

O projeto possui workflow automatizado:

- **CI/CD** (`ci.yml`) - Build, testes e deploy automático para Fly.io

### Deploy Manual

```bash
# Build para produção
cd backend
docker build -t helldivers-api .

# Deploy via Fly.io CLI
fly deploy
```

---

## 📊 Performance

- **Paginação Inteligente**: 20 itens por página para otimizar carregamento
- **Índices de Banco**: Índices otimizados em campos frequentemente consultados
- **Cache de Arquivos Estáticos**: WhiteNoise para servir arquivos estáticos rapidamente
- **Gunicorn Multi-Worker**: 4 workers para melhor processamento paralelo
- **Compressão de Arquivos**: WhiteNoise comprime arquivos estáticos automaticamente
- **Queries Otimizadas**: Uso de select_related e prefetch_related quando necessário

---

## 🔧 Configuração

### Variáveis de Ambiente

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

### Personalização

- **Configurações Django**: Edite `core/settings.py`
- **URLs da API**: Configure em `api/v1/urls.py` e `core/urls.py`
- **Serializers**: Personalize em `armory/serializers/` e `users/serializers/`
- **Filtros**: Adicione filtros customizados em `armory/filters/`
- **Modelos**: Adicione novos modelos em `armory/models/` ou `users/models/`
- **Views**: Customize ViewSets em `armory/views/` e `users/views/`
- **Admin**: Configure interfaces admin em `armory/admin/` e `users/admin.py`

---

## 🌍 Internacionalização

Suporte completo a múltiplos idiomas:

- **🇧🇷 Português (PT-BR)** - Idioma padrão
- **🇺🇸 Inglês (EN)** - Tradução completa
- **Detecção Automática** - Baseada no header Accept-Language
- **Backend i18n** - Mensagens do backend traduzidas dinamicamente
- **Django Locale** - Sistema de tradução integrado do Django

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

## 📚 Documentação Técnica

Documentação técnica detalhada disponível em [`docs/`](./docs/):

- 📖 [README Principal](./docs/README.md) - Índice e visão geral
- 🏗️ [Arquitetura](./docs/ARQUITETURA.md) - Estrutura e padrões
- 🔐 [Autenticação](./docs/AUTENTICACAO.md) - Sistema JWT e cookies
- 🛡️ [Armory](./docs/ARMORY.md) - Módulo principal
- 👥 [Usuários](./docs/USUARIOS.md) - Gestão de usuários
- 🌍 [Internacionalização](./docs/INTERNACIONALIZACAO.md) - Sistema i18n
- 🚀 [Deploy](./docs/DEPLOY.md) - Produção e Fly.io

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
