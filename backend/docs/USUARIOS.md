# 👥 Documentação de Usuários - Helldivers Arsenal Backend

## Visão Geral

O app **users** gerencia todo o sistema de autenticação, perfis, validações e funcionalidades relacionadas aos usuários.

---

## 🏗️ CustomUser Model

**Localização**: `users/models/user.py`

```python
class CustomUser(AbstractUser):
    """Modelo customizado de usuário"""
    password_reset_token_used = models.BooleanField(default=False)
```

**Características:**
- Herda de `AbstractUser` do Django
- Campo adicional para rastrear tokens de reset de senha usados

---

## 🔐 Endpoints de Autenticação

Ver [AUTENTICACAO.md](./AUTENTICACAO.md) para detalhes completos.

### Endpoints Disponíveis

- `POST /api/v1/auth/login/` - Login
- `POST /api/v1/auth/logout/` - Logout
- `POST /api/v1/auth/registration/` - Registro
- `POST /api/v1/auth/token/refresh/` - Refresh token
- `GET /api/v1/auth/user/` - Detalhes do usuário
- `GET /api/v1/auth/google/callback/` - Callback OAuth

---

## 👤 Endpoints de Perfil

### GET `/api/v1/profile/`

Obtém perfil do usuário autenticado.

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "email_verified": true
}
```

### PUT `/api/v1/profile/update/`

Atualiza perfil do usuário.

**Request:**
```json
{
  "username": "new_username",
  "email": "newemail@example.com"
}
```

---

## 📊 Dashboard

### GET `/api/v1/dashboard/`

Dashboard com estatísticas do usuário.

**Response:**
```json
{
  "total_favorites": 15,
  "total_collection": 8,
  "total_wishlist": 12,
  "user": {...}
}
```

---

## ✅ Validações

### GET `/api/v1/check/username/`

Verifica disponibilidade de username.

**Query Parameters:**
- `username`: Username para verificar

**Response:**
```json
{
  "available": true
}
```

### GET `/api/v1/check/email/`

Verifica disponibilidade de email.

**Query Parameters:**
- `email`: Email para verificar

**Response:**
```json
{
  "available": true
}
```

---

## 📧 Email e Senha

### Endpoints

- `POST /api/v1/password/reset/` - Solicita reset de senha
- `POST /api/v1/password/reset/confirm/` - Confirma reset
- `POST /api/v1/password/change/` - Troca senha
- `POST /api/v1/resend-verification-email/` - Reenvia email de verificação
- `POST /api/v1/verify-email/` - Verifica email

---

## 🔗 Relacionamentos

### UserArmorSetRelation

Relações entre usuários e sets:
- Favoritos
- Coleção
- Wishlist

Ver [ARMORY.md](./ARMORY.md) para mais detalhes.

---

## 📚 Recursos Adicionais

- [README Principal](../README.md)
- [ARQUITETURA.md](./ARQUITETURA.md)
- [AUTENTICACAO.md](./AUTENTICACAO.md)

---

<div align="center">

**Made with ❤️ by Dionatha Goulart**

</div>

