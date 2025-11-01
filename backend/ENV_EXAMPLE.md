# Arquivo .env - Exemplo de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto `backend/` com as seguintes variáveis:

```env
# ============================================================================
# CONFIGURAÇÕES BÁSICAS DO DJANGO
# ============================================================================

# Chave secreta do Django (OBRIGATÓRIA)
# Gere uma nova chave com: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
SECRET_KEY=django-insecure-change-me-in-production

# Modo de debug (True para desenvolvimento, False para produção)
DEBUG=True

# Hosts permitidos (separados por vírgula)
# Exemplo: localhost,127.0.0.1,seusite.com
ALLOWED_HOSTS=localhost,127.0.0.1

# Origens confiáveis para CSRF (separadas por vírgula)
# Exemplo: https://localhost:8000,http://localhost:3000
CSRF_TRUSTED_ORIGINS=https://localhost:8000,http://localhost:3000

# ============================================================================
# BANCO DE DADOS
# ============================================================================

# URL do banco de dados (OPCIONAL para desenvolvimento)
# Se não definida, usa SQLite automaticamente (db.sqlite3)
# Para PostgreSQL: postgresql://usuario:senha@localhost:5432/nome_do_banco
# DATABASE_URL=postgresql://user:password@localhost:5432/helldivers

# ============================================================================
# CORS (Cross-Origin Resource Sharing)
# ============================================================================

# Origens permitidas para CORS (separadas por vírgula)
# Exemplo: http://localhost:3000,https://seusite.com
CORS_ALLOWED_ORIGINS=http://localhost:3000

# ============================================================================
# FRONTEND
# ============================================================================

# URL base do frontend (usado para redirecionamentos e emails)
FRONTEND_URL=http://localhost:3000

# ============================================================================
# GOOGLE OAUTH
# ============================================================================

# Client ID do Google OAuth (obtenha em https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=

# Secret do Google OAuth
GOOGLE_SECRET=

# ============================================================================
# CRIPTOGRAFIA DE TOKENS OAUTH
# ============================================================================

# Chave de criptografia para tokens OAuth (OPCIONAL)
# Se não definida, será gerada automaticamente baseada no SECRET_KEY
# Para gerar uma chave Fernet válida, execute:
# python -c "from cryptography.fernet import Fernet; import base64; print(base64.urlsafe_b64encode(Fernet.generate_key()).decode())"
# OAUTH_ENCRYPTION_KEY=

# ============================================================================
# CONFIGURAÇÕES DE EMAIL
# ============================================================================

# Backend de email
# Desenvolvimento: django.core.mail.backends.console.EmailBackend (imprime no console)
# Produção: django.core.mail.backends.smtp.EmailBackend
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Host SMTP (exemplo: smtp.gmail.com)
EMAIL_HOST=localhost

# Porta SMTP (exemplo: 587 para TLS, 465 para SSL)
EMAIL_PORT=25

# Usar TLS (True ou False)
EMAIL_USE_TLS=False

# Usuário do email SMTP
EMAIL_HOST_USER=

# Senha do email SMTP
EMAIL_HOST_PASSWORD=
```

## 📝 Notas

- **SECRET_KEY**: Obrigatória. Gere uma nova para produção usando o comando Python acima.
- **DEBUG**: Sempre `False` em produção por segurança.
- **DATABASE_URL**: Opcional. Se não definida, usa SQLite automaticamente em desenvolvimento.
- **GOOGLE_CLIENT_ID** e **GOOGLE_SECRET**: Obrigatórios apenas se usar login com Google.
- **OAUTH_ENCRYPTION_KEY**: Opcional. Se não definida, usa uma chave derivada do SECRET_KEY.
- **EMAIL_***: Configurar apenas se precisar enviar emails reais (verificação, reset de senha, etc.).

