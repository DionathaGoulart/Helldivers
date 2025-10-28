## Migração para v2 (Futuro)

Para adicionar a v2 no futuro:

1. Criar `backend/api/v2/`
2. Adicionar em `core/urls.py`:
   ```python
   path('api/v2/', include('api.v2.urls')),
   ```
3. Manter v1 ativa para compatibilidade

## Testando

```bash
# Backend
cd backend
poetry run python manage.py runserver

# Frontend
cd frontend
npm run dev
```

Todas as chamadas agora usam `/api/v1/` automaticamente!
