# 🔐 Documentação de Autenticação - Helldivers Arsenal Backend

## Visão Geral

O sistema de autenticação do Helldivers Arsenal utiliza **JWT (JSON Web Tokens)** com cookies **HttpOnly** para máxima segurança, protegendo contra ataques XSS e CSRF.

---

## 🎯 Características Principais

### 1. Segurança Máxima

- ✅ **Cookies HttpOnly**: Tokens não acessíveis via JavaScript
- ✅ **HTTPS Only**: Cookies secure apenas em produção
- ✅ **SameSite Protection**: Proteção contra CSRF
- ✅ **Token Rotation**: Refresh token rotacionado automaticamente

### 2. Autenticação Multi-Método

- ✅ **Email/Username + Password**: Login tradicional
- ✅ **Google OAuth 2.0**: Autenticação social
- ✅ **Token Refresh**: Renovação automática de tokens

### 3. Gestão Automática

- ✅ **Auto-Login**: Após registro
- ✅ **Auto-Refresh**: Tokens renovados automaticamente
- ✅ **Auto-Logout**: Limpeza de cookies e sessão

---

## 🏗️ Arquitetura de Autenticação

### Fluxo de Login

```
1. Cliente envia credenciais
   POST /api/v1/auth/login/
   { username, password }
   
2. CookieLoginView processa
   ↓
3. dj-rest-auth verifica credenciais
   ↓
4. SIMPLE_JWT gera tokens JWT
   ↓
5. set_auth_cookies() define cookies HttpOnly
   ↓
6. Response retorna sem tokens no body
```

### Fluxo de Refresh Token

```
1. Cliente envia requisição autenticada
   ↓
2. Cookie verificada automaticamente
   ↓
3. Se access_token expirou:
   ↓
4. Frontend automaticamente chama refresh
   POST /api/v1/auth/token/refresh/
   (refresh_token vem do cookie)
   ↓
5. Novo access_token gerado
   ↓
6. Cookies atualizados automaticamente
```

---

## 🔧 Componentes do Sistema

### 1. CookieJWTAuthentication

**Localização**: `users/authentication.py`

```python
class CookieJWTAuthentication(JWTAuthentication):
    """
    Autenticação JWT que suporta tokens em cookies HttpOnly
    Fallback para header Authorization para compatibilidade
    """
    
    def authenticate(self, request):
        # Primeiro tenta obter token do cookie
        access_token = request.COOKIES.get('access_token')
        
        if access_token:
            # Valida e retorna usuário autenticado
            validated_token = self.get_validated_token(access_token)
            user = self.get_user(validated_token)
            return (user, validated_token)
        
        # Fallback para autenticação via header Authorization
        return super().authenticate(request)
```

**Características:**
- Tenta cookie primeiro
- Fallback para header Authorization
- Compatibilidade total com DRF

### 2. CookieLoginView

**Localização**: `users/views/auth_cookies.py`

```python
class CookieLoginView(LoginView):
    """
    View customizada de login que define cookies HttpOnly
    """
    def post(self, request, *args, **kwargs):
        # Chama a view original do dj-rest-auth
        response = super().post(request, *args, **kwargs)
        
        # Se login foi bem-sucedido, define cookies
        if response.status_code == status.HTTP_200_OK:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')
            
            if access_token and refresh_token:
                set_auth_cookies(response, access_token, refresh_token)
                # Remove tokens do corpo por segurança
                response.data.pop('access', None)
                response.data.pop('refresh', None)
        
        return response
```

**Características:**
- Envolve LoginView do dj-rest-auth
- Define cookies automaticamente
- Remove tokens do response body

### 3. CookieRegisterView

**Localização**: `users/views/auth_cookies.py`

```python
class CookieRegisterView(RegisterView):
    """
    View customizada de registro que define cookies HttpOnly
    """
    def post(self, request, *args, **kwargs):
        # Chama a view original do dj-rest-auth
        response = super().post(request, *args, **kwargs)
        
        # Se registro foi bem-sucedido, define cookies
        if response.status_code == status.HTTP_201_CREATED:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')
            
            if access_token and refresh_token:
                set_auth_cookies(response, access_token, refresh_token)
                response.data.pop('access', None)
                response.data.pop('refresh', None)
        
        return response
```

**Características:**
- Auto-login após registro
- Cookies seguros definidos
- Tokens removidos do body

### 4. CookieTokenRefreshView

**Localização**: `users/views/auth_cookies.py`

```python
class CookieTokenRefreshView(TokenRefreshView):
    """
    View customizada de refresh token que atualiza cookies HttpOnly
    Lê o refresh token do cookie ao invés do body
    """
    def post(self, request, *args, **kwargs):
        # Obtém refresh token do cookie
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response(
                {'error': 'Refresh token não encontrado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Chama a view original do simplejwt
        response = super().post(request, *args, **kwargs)
        
        # Se refresh foi bem-sucedido, atualiza cookies
        if response.status_code == status.HTTP_200_OK:
            access_token = response.data.get('access')
            new_refresh_token = response.data.get('refresh')  # Pode ser rotacionado
            
            if access_token:
                if new_refresh_token:
                    set_auth_cookies(response, access_token, new_refresh_token)
                    response.data.pop('refresh', None)
                else:
                    set_auth_cookies(response, access_token, refresh_token)
                response.data.pop('access', None)
        
        return response
```

**Características:**
- Lê refresh token do cookie
- Suporta token rotation
- Atualiza cookies automaticamente

### 5. CookieLogoutView

**Localização**: `users/views/auth_cookies.py`

```python
class CookieLogoutView(LogoutView):
    """
    View customizada de logout que limpa cookies
    """
    def post(self, request, *args, **kwargs):
        # Chama a view original do dj-rest-auth
        response = super().post(request, *args, **kwargs)
        
        # Limpa cookies de autenticação
        clear_auth_cookies(response)
        
        return response
```

**Características:**
- Limpa cookies HttpOnly
- Invalida sessão no servidor
- Retorna resposta limpa

### 6. Funções Utilitárias

**Localização**: `users/utils.py`

#### set_auth_cookies

```python
def set_auth_cookies(response, access_token, refresh_token):
    """
    Define cookies HttpOnly seguros para tokens de autenticação
    """
    # Configurações de segurança
    is_secure = not settings.DEBUG  # HTTPS apenas em produção
    samesite = 'None' if not settings.DEBUG else 'Lax'
    
    # Cookie para access token (HttpOnly)
    response.set_cookie(
        'access_token',
        access_token,
        max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
        httponly=True,
        secure=is_secure,
        samesite=samesite,
        path='/',
    )
    
    # Cookie para refresh token (HttpOnly)
    response.set_cookie(
        'refresh_token',
        refresh_token,
        max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
        httponly=True,
        secure=is_secure,
        samesite=samesite,
        path='/',
    )
```

**Configurações de Segurança:**
- **httponly=True**: Token não acessível via JavaScript
- **secure**: HTTPS apenas em produção
- **samesite**: Lax (dev) / None (prod)
- **max_age**: Baseado em SIMPLE_JWT settings

#### clear_auth_cookies

```python
def clear_auth_cookies(response):
    """
    Remove cookies de autenticação
    """
    response.delete_cookie('access_token', path='/')
    response.delete_cookie('refresh_token', path='/')
    return response
```

---

## 🔒 Configuração JWT

### SIMPLE_JWT Settings

**Localização**: `core/settings.py`

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),    # 1 hora
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),       # 7 dias
    'ROTATE_REFRESH_TOKENS': True,                     # Rotação automática
    'BLACKLIST_AFTER_ROTATION': False,                 # Sem blacklist
    'AUTH_HEADER_TYPES': ('Bearer',),                  # Header type
}
```

### REST_FRAMEWORK Settings

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'users.authentication.CookieJWTAuthentication',  # JWT com cookies
        'rest_framework.authentication.SessionAuthentication',  # Fallback
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}
```

---

## 🌐 Endpoints de Autenticação

### POST `/api/v1/auth/login/`

Login com email/username e senha.

**Request:**
```json
{
  "username": "john_doe",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Cookies Definidos:**
```
access_token=eyJ... (HttpOnly, Secure)
refresh_token=eyJ... (HttpOnly, Secure)
```

---

### POST `/api/v1/auth/registration/`

Registro de novo usuário com auto-login.

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password1": "secure_password",
  "password2": "secure_password"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

---

### POST `/api/v1/auth/logout/`

Logout com limpeza de cookies.

**Response:**
```json
{
  "detail": "Successfully logged out."
}
```

**Cookies Removidos:**
```
access_token (deleted)
refresh_token (deleted)
```

---

### POST `/api/v1/auth/token/refresh/`

Refresh automático de tokens (usando cookie).

**Response:**
```json
{
  "detail": "Token refreshed successfully."
}
```

**Cookies Atualizados:**
```
access_token=eyJ... (novo token)
refresh_token=eyJ... (rotacionado se configurado)
```

---

### GET `/api/v1/auth/user/`

Detalhes do usuário autenticado.

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "email_verified": true
}
```

---

## 🔐 Google OAuth

### Configuração

**settings.py**
```python
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
        'APP': {
            'client_id': config('GOOGLE_CLIENT_ID', default=''),
            'secret': config('GOOGLE_SECRET', default=''),
        }
    }
}
```

### Fluxo OAuth

```
1. Frontend redireciona para Google
   GET /api/v1/auth/google/
   
2. Google autentica usuário
   ↓
3. Callback para backend
   GET /api/v1/auth/google/callback/?code=...
   
4. Backend troca code por token
   ↓
5. Obtém dados do usuário
   ↓
6. Cria ou atualiza usuário
   ↓
7. Define cookies HttpOnly
   ↓
8. Redireciona para frontend
```

---

## 🔑 Recuperação de Senha

### POST `/api/v1/password/reset/`

Solicita reset de senha.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "detail": "Password reset e-mail has been sent."
}
```

### POST `/api/v1/password/reset/confirm/`

Confirma reset de senha com token.

**Request:**
```json
{
  "uid": "uid_token",
  "token": "reset_token",
  "new_password1": "new_password",
  "new_password2": "new_password"
}
```

### POST `/api/v1/password/change/`

Troca senha (requer autenticação).

**Request:**
```json
{
  "old_password": "old_password",
  "new_password1": "new_password",
  "new_password2": "new_password"
}
```

---

## 🛡️ Segurança

### Proteções Implementadas

1. **HttpOnly Cookies**
   - Tokens não acessíveis via JavaScript
   - Proteção contra XSS

2. **HTTPS Only**
   - Cookies secure apenas em produção
   - Proteção contra man-in-the-middle

3. **SameSite Protection**
   - Lax em desenvolvimento
   - None em produção (com secure)
   - Proteção contra CSRF

4. **Token Rotation**
   - Refresh tokens rotacionados
   - Mitigação de replay attacks

5. **Validações Robustas**
   - Password validators
   - Email uniqueness
   - Username uniqueness

---

## 📖 Exemplos de Uso

### Login Tradicional

```bash
# Request
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"pass123"}'

# Response
# Cookies: access_token, refresh_token (HttpOnly)
# Body: { "user": {...} }
```

### Requisição Autenticada

```bash
# Os cookies são enviados automaticamente
curl http://localhost:8000/api/v1/auth/user/ \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```

### Logout

```bash
curl -X POST http://localhost:8000/api/v1/auth/logout/ \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```

---

## 🧪 Testes

### Teste de Login

```python
def test_login_with_cookies(self):
    response = self.client.post('/api/v1/auth/login/', {
        'username': 'testuser',
        'password': 'testpass123'
    })
    
    self.assertEqual(response.status_code, 200)
    self.assertTrue('access_token' in response.cookies)
    self.assertTrue('refresh_token' in response.cookies)
    self.assertFalse('access' in response.data)  # Não deve estar no body
```

---

## 📚 Recursos Adicionais

- [README Principal](../README.md)
- [ARQUITETURA.md](./ARQUITETURA.md)
- [Django Authentication](https://docs.djangoproject.com/en/stable/topics/auth/)
- [DRF Authentication](https://www.django-rest-framework.org/api-guide/authentication/)
- [Simple JWT](https://github.com/jazzband/djangorestframework-simplejwt)

---

<div align="center">

**Made with ❤️ by Dionatha Goulart**

</div>

