# Arquivo .env.local - Exemplo de Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto `frontend/` com as seguintes variáveis:

```env
# ============================================================================
# URL DA API BACKEND
# ============================================================================

# URL base da API Django
# Exemplo local: http://localhost:8000
# Exemplo produção: https://api.seusite.com
NEXT_PUBLIC_API_URL=http://localhost:8000

# ============================================================================
# URL BASE DO FRONTEND
# ============================================================================

# URL base do frontend (usado para OAuth callbacks e redirecionamentos)
# Exemplo local: http://localhost:3000
# Exemplo produção: https://seusite.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ============================================================================
# GOOGLE OAUTH
# ============================================================================

# Client ID do Google OAuth (obtenha em https://console.cloud.google.com/)
# Deve ser o mesmo usado no backend
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

## 📝 Notas

- **NEXT_PUBLIC_***: Variáveis prefixadas com `NEXT_PUBLIC_` são expostas ao cliente (browser).
- **NEXT_PUBLIC_API_URL**: Deve apontar para o backend Django.
- **NEXT_PUBLIC_BASE_URL**: Deve ser a URL pública do frontend (usada em OAuth callbacks).
- **NEXT_PUBLIC_GOOGLE_CLIENT_ID**: Deve ser o mesmo Client ID configurado no Google Cloud Console e no backend.

## 🔧 Como Configurar

1. Copie o conteúdo acima para um arquivo `.env.local` na raiz do `frontend/`
2. Preencha as variáveis com seus valores
3. Reinicie o servidor de desenvolvimento (`npm run dev`)

