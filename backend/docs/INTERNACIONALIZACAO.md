# 🌍 Documentação de Internacionalização - Helldivers Arsenal Backend

## Visão Geral

O sistema de internacionalização usa o sistema nativo do Django com suporte a múltiplos idiomas via header `Accept-Language`.

---

## 🔧 Configuração

**Localização**: `core/settings.py`

```python
# Idioma padrão
LANGUAGE_CODE = 'pt-br'

# Idiomas suportados
LANGUAGES = [
    ('pt-br', 'Português (Brasil)'),
    ('en', 'English'),
]

# Localização
USE_I18N = True

# Locale paths
LOCALE_PATHS = [BASE_DIR / 'locale']

# Middleware
MIDDLEWARE = [
    ...
    'django.middleware.locale.LocaleMiddleware',  # Ativo
    ...
]
```

---

## 🗂️ Estrutura Multilíngue

### Modelos com Tradução

Todos os modelos do armory possuem campos `_pt_br`:

```python
class Armor(models.Model):
    name = models.CharField(max_length=100, unique=True)
    name_pt_br = models.CharField(max_length=100, blank=True, null=True)

class Passive(models.Model):
    name = models.CharField(max_length=100)
    name_pt_br = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField()
    description_pt_br = models.TextField(blank=True, null=True)
    effect = models.CharField(max_length=255)
    effect_pt_br = models.CharField(max_length=255, blank=True, null=True)
```

### Modelos com Tradução

- ✅ Armor
- ✅ Helmet
- ✅ Cape
- ✅ ArmorSet
- ✅ Passive
- ✅ BattlePass

---

## 🌐 Detecção de Idioma

### Header Accept-Language

O frontend envia automaticamente:

```
Accept-Language: pt-br
Accept-Language: en
```

### Lógica de Retorno

```python
# Backend retorna baseado no header
# pt-BR → Retorna dados com name_pt_br, description_pt_br
# en → Retorna dados originais (name, description)
```

---

## 📝 Serializers

Os serializers retornam ambos os campos:

```json
{
  "name": "Light Armor",
  "name_pt_br": "Armadura Leve",
  "description": "Light armor description",
  "description_pt_br": "Descrição da armadura leve"
}
```

O frontend escolhe qual usar baseado no idioma selecionado.

---

## 🔄 Migração de Dados

Migração criou campos multilíngues:

```python
# 0008_add_pt_br_translations.py
migrations.AddField('armor', 'name_pt_br', ...)
migrations.AddField('passive', 'description_pt_br', ...)
# etc
```

---

## 📚 Recursos Adicionais

- [README Principal](../README.md)
- [Django i18n](https://docs.djangoproject.com/en/stable/topics/i18n/)

---

<div align="center">

**Made with ❤️ by Dionatha Goulart**

</div>

