# 🚀 Documentação de Deploy - Helldivers Arsenal Backend

## Visão Geral

O backend é deployado automaticamente na plataforma **Fly.io** usando Docker e GitHub Actions.

---

## 🐳 Docker

### Dockerfile

**Localização**: `backend/Dockerfile`

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Instalar dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar projeto
COPY . .

# Coletar estáticos
RUN python manage.py collectstatic --noinput || true

# Expor porta
EXPOSE 8000

# Comando de inicialização
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120", "core.wsgi:application"]
```

---

## ☁️ Fly.io

### Configuração

**Localização**: `backend/fly.toml`

```toml
app = "helldivers-api"
primary_region = "gru"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

---

## 🔑 Variáveis de Ambiente

### Produção (Fly.io)

```bash
SECRET_KEY=...
DEBUG=False
ALLOWED_HOSTS=helldivers-api.fly.dev,.fly.dev
DATABASE_URL=postgresql://...
CORS_ALLOWED_ORIGINS=https://gooddivers.dionatha.com.br
CSRF_TRUSTED_ORIGINS=https://gooddivers.dionatha.com.br
GOOGLE_CLIENT_ID=...
GOOGLE_SECRET=...
EMAIL_BACKEND=...
```

---

## 🚀 Deploy Automático

### GitHub Actions

Deploy automático via CI/CD:

```yaml
# .github/workflows/ci.yml
- name: Deploy to Fly.io
  uses: superfly/flyctl-actions/setup-flyctl@master
  with:
    version: latest
  env:
    FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

- name: Deploy
  run: fly deploy --remote-only
```

---

## 📊 Healthcheck

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')"
```

---

## 🔧 Comandos Úteis

```bash
# Deploy manual
fly deploy

# Ver logs
fly logs

# SSH na máquina
fly ssh console

# Acessar banco
fly postgres connect
```

---

## 📚 Recursos Adicionais

- [README Principal](../README.md)
- [Fly.io Documentation](https://fly.io/docs/)

---

<div align="center">

**Made with ❤️ by Dionatha Goulart**

</div>

