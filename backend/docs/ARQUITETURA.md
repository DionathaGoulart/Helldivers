# 🏗️ Documentação de Arquitetura - Helldivers Arsenal Backend

## Visão Geral

O Helldivers Arsenal Backend é uma API REST moderna construída com Django e Django REST Framework, seguindo princípios de arquitetura escalável, segura e manutenível.

---

## 🎯 Princípios Arquiteturais

### 1. Separation of Concerns (SoC)

O projeto está organizado em **apps** com responsabilidades bem definidas:

```
📦 Apps do Projeto
├── 👥 users/           # Autenticação e gestão de usuários
├── 🛡️ armory/         # Gerenciamento de itens e sets
└── 🔧 core/           # Configurações Django
```

### 2. Django Apps Architecture

Cada app segue a estrutura padrão do Django:

```
app/
├── models/           # Modelos de dados
├── serializers/      # Serializers DRF
├── views/            # ViewSets e Views
├── urls.py           # Rotas do app
├── admin.py          # Configuração Django Admin
└── migrations/       # Migrações de BD
```

### 3. Model-View-Serializer (MVS)

Padrão seguido para APIs REST:

```
Model → Serializer → ViewSet → URL
```

### 4. Don't Repeat Yourself (DRY)

- Serializers reutilizáveis
- Mixins para funcionalidades comuns
- Utilitários compartilhados

### 5. Security First

- Cookies HttpOnly para JWT
- CORS configurado
- CSRF protection
- Validações robustas

---

## 📂 Estrutura de Diretórios Detalhada

### backend/

```
backend/
├── 📁 api/                      # Organização das URLs da API
│   └── v1/                       # Versão 1 da API
│       └── urls.py               # URLs principais da v1
│
├── 📁 armory/                    # App principal - Gerenciamento de armaduras
│   ├── models/                   # Modelos de dados
│   │   ├── __init__.py          # Exports centralizados
│   │   ├── armor.py              # Modelo de Armadura
│   │   ├── helmet.py             # Modelo de Capacete
│   │   ├── cape.py               # Modelo de Capa
│   │   ├── passive.py            # Modelo de Passiva
│   │   ├── set.py                # Modelo de Set de Armadura
│   │   ├── battlepass.py         # Modelo de Battle Pass
│   │   └── user_set_relation.py  # Relação Usuário-Set
│   │
│   ├── serializers/              # Serializers DRF
│   │   ├── __init__.py          # Exports centralizados
│   │   ├── armor.py              # Serializer de Armadura
│   │   ├── helmet.py             # Serializer de Capacete
│   │   ├── cape.py               # Serializer de Capa
│   │   ├── passive.py            # Serializer de Passiva
│   │   ├── set.py                # Serializer de Set
│   │   ├── battlepass.py         # Serializer de Battle Pass
│   │   └── user_set_relation.py  # Serializer de Relação
│   │
│   ├── views/                    # ViewSets (endpoints da API)
│   │   ├── __init__.py          # Exports centralizados
│   │   ├── armor.py              # ViewSet de Armadura
│   │   ├── helmet.py             # ViewSet de Capacete
│   │   ├── cape.py               # ViewSet de Capa
│   │   ├── passive.py            # ViewSet de Passiva
│   │   ├── set.py                # ViewSet de Set
│   │   ├── battlepass.py         # ViewSet de Battle Pass
│   │   └── user_set_relation.py  # ViewSet de Relação
│   │
│   ├── filters/                  # Filtros django-filter
│   │   ├── __init__.py          # Exports centralizados
│   │   └── armor.py              # Filtros customizados de Armadura
│   │
│   ├── admin/                    # Configuração Django Admin
│   │   ├── __init__.py          # Exports centralizados
│   │   ├── armor.py              # Admin de Armadura
│   │   ├── helmet.py             # Admin de Capacete
│   │   ├── cape.py               # Admin de Capa
│   │   ├── passive.py            # Admin de Passiva
│   │   ├── set.py                # Admin de Set
│   │   ├── battlepass.py         # Admin de Battle Pass
│   │   └── user_set_relation.py  # Admin de Relação
│   │
│   ├── migrations/               # Migrações do banco de dados
│   │   ├── __init__.py
│   │   ├── 0001_initial.py      # Migração inicial
│   │   ├── 0008_add_pt_br_translations.py  # i18n
│   │   └── ...
│   │
│   ├── static/                   # Arquivos estáticos do app
│   │   └── admin/                # JavaScript customizado para admin
│   │       ├── armor_pass_field.js
│   │       └── armor_presets.js
│   │
│   ├── urls.py                   # URLs do app armory
│   ├── apps.py                   # Configuração do app
│   └── tests.py                  # Testes unitários
│
├── 📁 users/                      # App de usuários e autenticação
│   ├── models/                   # Modelos de usuário
│   │   ├── __init__.py          # Exports centralizados
│   │   └── user.py               # Modelo CustomUser
│   │
│   ├── serializers/              # Serializers de autenticação
│   │   ├── __init__.py          # Exports centralizados
│   │   ├── auth.py               # Serializers de autenticação
│   │   ├── user.py               # Serializers de usuário
│   │   └── password_reset.py     # Serializers de reset de senha
│   │
│   ├── views/                    # Views de autenticação e perfil
│   │   ├── __init__.py          # Exports centralizados
│   │   ├── auth.py               # Views de autenticação básica
│   │   ├── auth_cookies.py       # Views com cookies HttpOnly
│   │   ├── profile.py            # Views de perfil
│   │   ├── password.py           # Views de senha
│   │   ├── password_reset.py     # Views de reset de senha
│   │   ├── password_reset_confirm.py  # Views de confirmação reset
│   │   ├── dashboard.py          # Views de dashboard
│   │   ├── validators.py         # Views de validação
│   │   ├── email_verification.py # Views de verificação de email
│   │   └── verify_email.py       # Views de verificar email
│   │
│   ├── migrations/               # Migrações do app users
│   │   ├── __init__.py
│   │   ├── 0001_initial.py
│   │   └── ...
│   │
│   ├── templates/                # Templates HTML
│   │   ├── dashboard.html        # Dashboard
│   │   └── home.html             # Home
│   │
│   ├── authentication.py         # Autenticação JWT com cookies HttpOnly
│   ├── adapters.py               # Adapters django-allauth customizados
│   ├── utils.py                  # Utilitários de usuário (cookies, tokens)
│   ├── utils_oauth.py            # Utilitários OAuth
│   ├── signals.py                # Signals Django (emails, etc)
│   ├── urls.py                   # URLs do app users
│   ├── admin.py                  # Admin de usuários
│   ├── apps.py                   # Configuração do app
│   └── tests.py                  # Testes unitários
│
├── 📁 core/                       # Configurações principais do Django
│   ├── settings.py                # Configurações Django completas
│   ├── settings_prod.py           # Configurações de produção
│   ├── urls.py                    # URLs principais
│   ├── wsgi.py                    # WSGI application
│   ├── asgi.py                    # ASGI application
│   └── __init__.py
│
├── 📁 media/                      # Arquivos de mídia (imagens)
│   ├── armors/                    # Imagens de armaduras
│   ├── helmets/                   # Imagens de capacetes
│   ├── capes/                     # Imagens de capas
│   ├── passives/                  # Imagens de passivas
│   ├── passes/                    # Imagens de passes
│   └── sets/                      # Imagens de sets
│
├── 📁 staticfiles/                # Arquivos estáticos coletados (produção)
│
├── 📁 docs/                       # Documentação técnica
│
├── manage.py                      # Script de gerenciamento Django
├── Dockerfile                     # Configuração Docker para deploy
├── fly.toml                       # Configuração Fly.io
├── .dockerignore                  # Arquivos ignorados pelo Docker
├── pyproject.toml                 # Dependências Poetry
├── requirements.txt               # Dependências pip
├── poetry.lock                    # Lock file Poetry
├── .gitignore                     # Arquivos ignorados pelo Git
└── db.sqlite3                     # Banco SQLite (desenvolvimento)
```

---

## 🔄 Fluxo de Dados

### 1. Fluxo de Requisição HTTP

```
Cliente HTTP (Frontend)
    ↓
Nginx/Reverse Proxy (Fly.io)
    ↓
Gunicorn WSGI Server
    ↓
Django Middleware
    ↓
URL Dispatcher (core/urls.py)
    ↓
ViewSet/View
    ↓
Serializer (Validação)
    ↓
Model (ORM)
    ↓
Database (PostgreSQL)
```

### 2. Fluxo de Autenticação

```
Requisição com Credenciais
    ↓
CookieLoginView
    ↓
dj-rest-auth LoginView
    ↓
Verifica Credenciais
    ↓
Gera Tokens JWT
    ↓
set_auth_cookies() → HttpOnly Cookies
    ↓
Retorna Response sem Tokens no Body
```

### 3. Fluxo de API Request

```
GET /api/v1/armory/sets/
    ↓
URL Dispatcher → armory.urls
    ↓
ArmorSetViewSet.list()
    ↓
get_queryset() → ArmorSet.objects.all()
    ↓
ArmorSetListSerializer
    ↓
Response JSON
```

---

## 🎨 Padrões Arquiteturais

### 1. ViewSet Pattern

```python
class ArmorSetViewSet(viewsets.ModelViewSet):
    """
    ViewSet padrão do DRF com CRUD completo
    """
    queryset = ArmorSet.objects.all()
    serializer_class = ArmorSetListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    def get_serializer_class(self):
        # Usa serializer diferente para list vs detail
        if self.action == 'list':
            return ArmorSetListSerializer
        return ArmorSetDetailSerializer
```

### 2. Custom Actions

```python
@action(detail=False, methods=['post'], url_path='add')
def add_relation(self, request):
    """Action customizada para lógica específica"""
    # Lógica aqui
    return Response(data, status=status.HTTP_201_CREATED)
```

### 3. Manager Pattern

```python
class UserArmorSetRelationManager(models.Manager):
    """Manager personalizado para queries específicas"""
    
    def favorites(self):
        return self.filter(relation_type='favorite')
```

### 4. Serializer Inline/Context

```python
class ArmorSetListSerializer(serializers.ModelSerializer):
    """
    Serializer para listagem com dados agregados
    """
    helmet_detail = HelmetSerializer(read_only=True, source='helmet')
    armor_detail = ArmorSerializer(read_only=True, source='armor')
    
    class Meta:
        model = ArmorSet
        fields = ['id', 'name', 'helmet_detail', 'armor_detail']
```

---

## 🔒 Segurança

### Camadas de Segurança

```
1. HTTPS/TLS
   ↓
2. CORS Headers
   ↓
3. CSRF Protection
   ↓
4. JWT Authentication
   ↓
5. HttpOnly Cookies
   ↓
6. Permission Checks
   ↓
7. Input Validation
```

### Configurações de Segurança

```python
# settings.py

# HTTPS em produção
USE_TLS = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# CORS
CORS_ALLOWED_ORIGINS = [...]
CORS_ALLOW_CREDENTIALS = True

# CSRF
CSRF_TRUSTED_ORIGINS = [...]

# JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}
```

---

## 💾 Banco de Dados

### Modelo de Dados

```
CustomUser
    ↓
UserArmorSetRelation → ArmorSet
    ↓
ArmorSet → { Helmet, Armor, Cape, Passive }
    ↓
Armor → Passive, BattlePass
```

### Índices Otimizados

```python
class Meta:
    indexes = [
        models.Index(fields=['user', 'relation_type']),
        models.Index(fields=['armor_set', 'relation_type']),
    ]
```

---

## 🌍 Internacionalização

### Suporte a Idiomas

```python
# settings.py
LANGUAGES = [
    ('pt-br', 'Português (Brasil)'),
    ('en', 'English'),
]

# Middleware
'django.middleware.locale.LocaleMiddleware'

# Modelos multilíngues
name_pt_br = models.CharField(...)
```

---

## 📊 Performance

### Otimizações Implementadas

1. **select_related**: Foreign keys
2. **prefetch_related**: Many-to-many, reverse ForeignKeys
3. **Índices de BD**: Campos frequentemente filtrados
4. **Paginação**: 20 itens por página
5. **WhiteNoise**: Arquivos estáticos

---

## 📚 Recursos Adicionais

- [README Principal](../README.md)
- [Documentação Django](https://docs.djangoproject.com/)
- [DRF Documentation](https://www.django-rest-framework.org/)

---

<div align="center">

**Made with ❤️ by Dionatha Goulart**

</div>

