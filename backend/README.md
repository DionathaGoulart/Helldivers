# Helldivers 2 API - Backend

API REST desenvolvida com Django e Django REST Framework para gerenciar armaduras, capacetes, capas e sets do jogo Helldivers 2.

## 📁 Estrutura do Projeto

```
backend/
├── api/                    # Organização das URLs da API
│   └── v1/                 # Versão 1 da API
│       └── urls.py          # Rotas da API v1
├── armory/                 # App principal - Gerenciamento de armaduras
│   ├── models/             # Modelos de dados (Armor, Helmet, Cape, Set, etc.)
│   ├── serializers/        # Serializers DRF para validação e serialização
│   ├── views/              # ViewSets (endpoints da API)
│   ├── filters/            # Filtros django-filter para queries
│   ├── admin/              # Configuração do Django Admin
│   └── migrations/         # Migrações do banco de dados
├── users/                  # App de usuários e autenticação
│   ├── models/             # Modelo CustomUser
│   ├── serializers/        # Serializers de autenticação
│   ├── views/              # Views de autenticação e perfil
│   └── adapters.py         # Adaptadores para django-allauth
├── core/                   # Configurações principais do Django
│   ├── settings.py         # Configurações do Django (CORS, DRF, JWT, etc.)
│   ├── urls.py             # URLs principais
│   └── wsgi.py             # WSGI application
├── manage.py               # Script de gerenciamento do Django
└── requirements.txt        # Dependências do projeto
```

## 🚀 Tecnologias Utilizadas

- **Django 5.2+**: Framework web Python
- **Django REST Framework**: Framework para APIs REST
- **django-filter**: Filtros avançados para queries
- **djangorestframework-simplejwt**: Autenticação JWT
- **drf-spectacular**: Documentação OpenAPI/Swagger
- **django-allauth**: Autenticação social (Google OAuth)
- **django-cors-headers**: Configuração de CORS

## 📦 Instalação

1. Instale as dependências:
```bash
pip install -r requirements.txt
# ou com Poetry
poetry install
```

2. Configure as variáveis de ambiente (crie um arquivo `.env`):
```env
SECRET_KEY=sua-secret-key-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_SECRET=seu-google-secret
```

3. Execute as migrações:
```bash
python manage.py migrate
```

4. Crie um superusuário (opcional):
```bash
python manage.py createsuperuser
```

5. Execute o servidor:
```bash
python manage.py runserver
```

## 📚 Endpoints da API

### Autenticação
- `POST /api/v1/auth/login/` - Login
- `POST /api/v1/auth/registration/` - Registro
- `POST /api/v1/auth/logout/` - Logout
- `POST /api/v1/auth/google/callback/` - Callback OAuth Google

### Armory (Armaduras)
- `GET /api/v1/armory/armors/` - Lista armaduras
- `GET /api/v1/armory/armors/{id}/` - Detalhes de uma armadura
- `GET /api/v1/armory/helmets/` - Lista capacetes
- `GET /api/v1/armory/capes/` - Lista capas
- `GET /api/v1/armory/passives/` - Lista passivas
- `GET /api/v1/armory/sets/` - Lista sets completos
- `GET /api/v1/armory/user-sets/` - Relações usuário-sets (favoritos, coleção, wishlist)

### Usuários
- `GET /api/v1/profile/` - Perfil do usuário autenticado
- `PUT /api/v1/profile/update/` - Atualizar perfil

## 🔍 Filtros e Busca

Todos os endpoints do armory suportam:

### Filtros
Use query parameters para filtrar:
- `?category=light` - Filtrar por categoria
- `?cost__gte=100` - Custo maior ou igual a 100
- `?cost__lte=500` - Custo menor ou igual a 500

### Busca
- `?search=termo` - Busca em campos de nome e origem

### Ordenação
- `?ordering=name` - Ordenar por nome (crescente)
- `?ordering=-cost` - Ordenar por custo (decrescente)

## 📖 Documentação da API

Após iniciar o servidor, acesse:
- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **Schema OpenAPI**: http://localhost:8000/api/schema/

## 🔐 Autenticação

A API utiliza autenticação JWT:
1. Faça login ou registro via `/api/v1/auth/login/` ou `/api/v1/auth/registration/`
2. Receba os tokens `access` e `refresh`
3. Use o token `access` no header: `Authorization: Bearer <token>`

## 🧪 Testes

Execute os testes:
```bash
python manage.py test
```

## 📝 Estrutura de Dados

### Modelos Principais

- **Passive**: Passivas de armadura (efeitos especiais)
- **Armor**: Armaduras com atributos (armor, speed, stamina)
- **Helmet**: Capacetes cosméticos
- **Cape**: Capas cosméticas
- **ArmorSet**: Conjuntos completos (helmet + armor + cape)
- **UserArmorSetRelation**: Relações usuário-set (favoritos, coleção, wishlist)

## 🛠️ Desenvolvimento

### Adicionar um novo modelo

1. Crie o modelo em `armory/models/nome.py`
2. Importe em `armory/models/__init__.py`
3. Crie o serializer em `armory/serializers/nome.py`
4. Crie a view em `armory/views/nome.py`
5. Registre no router em `armory/urls.py`
6. Crie e execute a migração:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Padrões de Código

- **Views**: Use `viewsets.ModelViewSet` ou `viewsets.ReadOnlyModelViewSet`
- **Serializers**: Separe list serializer (simplificado) de detail serializer
- **Filtros**: Use `filterset_fields` ou crie classes `FilterSet`
- **Permissions**: Configure `permission_classes` nas views

## 📄 Licença

Este projeto é privado e não possui licença pública.
