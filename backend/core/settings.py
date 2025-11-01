"""
Django settings for core project - API Version

Este arquivo contém todas as configurações do Django para o projeto Helldivers 2 API.
As configurações estão organizadas em seções temáticas para facilitar manutenção.
"""

import os
from pathlib import Path
from decouple import config, Csv
from datetime import timedelta
import dj_database_url

# ============================================================================
# CONFIGURAÇÕES BÁSICAS DO DJANGO
# ============================================================================

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Segurança
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-me-in-production')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

# Adicionar .fly.dev aos hosts permitidos em produção
if not DEBUG:
    # Adicionar .fly.dev (wildcard) e o hostname completo se não estiver
    if '.fly.dev' not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append('.fly.dev')
    # Adicionar hostname completo também para garantir
    import socket
    try:
        hostname = socket.gethostname()
        if hostname and hostname not in ALLOWED_HOSTS and '.fly.dev' in hostname:
            ALLOWED_HOSTS.append(hostname)
    except:
        pass
    # Garantir que helldivers-api.fly.dev esteja na lista
    if 'helldivers-api.fly.dev' not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append('helldivers-api.fly.dev')

# CSRF Trusted Origins - necessário para formulários via HTTPS
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='https://localhost:8000,http://localhost:3000',
    cast=Csv()
)

# Adicionar .fly.dev automaticamente em produção
if not DEBUG:
    # Converter para lista se necessário
    if not isinstance(CSRF_TRUSTED_ORIGINS, list):
        csrf_origins_list = list(CSRF_TRUSTED_ORIGINS) if CSRF_TRUSTED_ORIGINS else []
    else:
        csrf_origins_list = list(CSRF_TRUSTED_ORIGINS)
    
    # Adicionar domínios .fly.dev do ALLOWED_HOSTS
    for host in ALLOWED_HOSTS:
        host_str = str(host)
        if '.fly.dev' in host_str or host_str == '.fly.dev':
            # Se for só '.fly.dev', usar o hostname atual
            if host_str == '.fly.dev':
                origin = 'https://helldivers-api.fly.dev'
            else:
                origin = f'https://{host_str}'
            
            if origin not in csrf_origins_list:
                csrf_origins_list.append(origin)
    
    CSRF_TRUSTED_ORIGINS = csrf_origins_list

# ============================================================================
# APLICAÇÕES E MIDDLEWARE
# ============================================================================

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'django_extensions',
    'drf_spectacular',
    'django_filters',
    
    # Django allauth
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    
    # Local apps
    'users',
    'armory',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Adicionar após SecurityMiddleware
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# ============================================================================
# BANCO DE DADOS E VALIDAÇÕES
# ============================================================================

# Database - Configuração inteligente de banco de dados
# 
# COMO FUNCIONA:
# - LOCAL (sem DATABASE_URL): Usa SQLite (db.sqlite3) automaticamente
# - PRODUÇÃO (com DATABASE_URL): Usa PostgreSQL da variável de ambiente
# 
# Para usar PostgreSQL localmente, adicione ao .env:
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# ============================================================================
# CONFIGURAÇÕES DE IDIOMA E HORÁRIO
# ============================================================================

SITE_ID = 1

# Internationalization
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Whitenoise para servir arquivos estáticos em produção
# Compressão e cache de arquivos estáticos
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'users.CustomUser'

# ============================================================================
# AUTENTICAÇÃO E AUTORIZAÇÃO
# ============================================================================

# Authentication Backends
AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend"
)

# ============================================================================
# CORS (Cross-Origin Resource Sharing)
# ============================================================================
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000',
    cast=Csv()
)
CORS_ALLOW_CREDENTIALS = True

# ============================================================================
# DJANGO REST FRAMEWORK - API REST
# ============================================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'users.authentication.CookieJWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# ============================================================================
# DRF SPECTACULAR - Documentação OpenAPI/Swagger
# ============================================================================
SPECTACULAR_SETTINGS = {
    'TITLE': 'Helldivers 2 API',
    'DESCRIPTION': 'API para gerenciar armaduras, capacetes, capas e sets do Helldivers 2',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/',
    'APPEND_COMPONENTS': {
        'securitySchemes': {
            'jwtAuth': {
                'type': 'http',
                'scheme': 'bearer',
                'bearerFormat': 'JWT',
            }
        }
    },
    'SECURITY': [{'jwtAuth': []}],
}

# ============================================================================
# SIMPLE JWT - Autenticação via Tokens JWT
# ============================================================================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,  # Desabilitado porque token_blacklist não está instalado
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ============================================================================
# DJ-REST-AUTH - Integração com django-allauth
# ============================================================================
REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_HTTPONLY': False,
    'JWT_AUTH_COOKIE': None,
    'TOKEN_MODEL': None,
    'USER_DETAILS_SERIALIZER': 'users.serializers.UserSerializer',
    'REGISTER_SERIALIZER': 'users.serializers.CustomRegisterSerializer',
}

# ============================================================================
# DJANGO-ALLAUTH - Autenticação Social
# ============================================================================

# Métodos de Login Permitidos
ACCOUNT_LOGIN_METHODS = {'email', 'username'}

# Campos de Signup Obrigatórios (o * indica obrigatório)
ACCOUNT_SIGNUP_FIELDS = ['email*', 'username*', 'password1*', 'password2*']

# Email único
ACCOUNT_UNIQUE_EMAIL = True

# URL para confirmação de email (frontend)
ACCOUNT_EMAIL_CONFIRMATION_AUTHENTICATED_REDIRECT_URL = config('FRONTEND_URL', default='http://localhost:3000') + '/dashboard'
ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = config('FRONTEND_URL', default='http://localhost:3000') + '/login'

# Usar frontend URL para emails
ACCOUNT_ADAPTER = 'users.adapters.CustomAccountAdapter'

# ============================================================================
# PROVIDERS DE AUTENTICAÇÃO SOCIAL
# ============================================================================
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        },
        'APP': {
            'client_id': config('GOOGLE_CLIENT_ID', default=''),
            'secret': config('GOOGLE_SECRET', default=''),
            'key': ''
        }
    }
}

# ============================================================================
# CONFIGURAÇÕES DE EMAIL
# ============================================================================
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='localhost')
EMAIL_PORT = config('EMAIL_PORT', default=25, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=False, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')

# URL do frontend
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:3000')

# Verificação de Email (optional: não obrigatória, mandatory: obrigatória)
ACCOUNT_EMAIL_VERIFICATION = 'optional'