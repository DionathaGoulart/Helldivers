# 🛡️ Documentação do Módulo Armory - Helldivers Arsenal Backend

## Visão Geral

O módulo **Armory** é o núcleo da API, gerenciando todos os itens relacionados a armaduras, capacetes, capas, passivas, sets e batalh passes do Helldivers 2.

---

## 📊 Modelos de Dados

### ArmorSet

**Localização**: `armory/models/set.py`

Modelo principal representando um conjunto completo de equipamento.

```python
class ArmorSet(models.Model):
    name = models.CharField(max_length=100, unique=True)
    name_pt_br = models.CharField(max_length=100, blank=True, null=True)
    image = models.ImageField(upload_to='sets/', blank=True, null=True)
    
    helmet = models.ForeignKey(Helmet, on_delete=models.CASCADE)
    armor = models.ForeignKey(Armor, on_delete=models.CASCADE)
    cape = models.ForeignKey(Cape, on_delete=models.CASCADE, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Campos Especiais:**
- `name_pt_br`: Tradução em português
- `image`: Imagem do set completo
- `helmet`, `armor`, `cape`: Componentes do set

---

### Armor

**Localização**: `armory/models/armor.py`

Armadura individual com atributos técnicos.

```python
class Armor(models.Model):
    CATEGORY_CHOICES = [
        ('light', 'Leve'),
        ('medium', 'Médio'),
        ('heavy', 'Pesado'),
    ]
    
    ACQUISITION_CHOICES = [
        ('store', 'Loja'),
        ('pass', 'Passe'),
        ('others', 'Outros'),
        # ... mais opções
    ]
    
    name = models.CharField(max_length=100, unique=True)
    name_pt_br = models.CharField(max_length=100, blank=True, null=True)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    image = models.ImageField(upload_to='armors/', blank=True, null=True)
    
    # Atributos técnicos
    armor = models.IntegerField()  # Classificação da armadura
    speed = models.IntegerField()  # Velocidade
    stamina = models.IntegerField()  # Regeneração de Resistência
    
    # Relacionamentos
    passive = models.ForeignKey(Passive, on_delete=models.SET_NULL, null=True, blank=True)
    source = models.CharField(max_length=30, choices=ACQUISITION_CHOICES, default='store')
    pass_field = models.ForeignKey(BattlePass, on_delete=models.SET_NULL, null=True, blank=True)
    
    cost = models.IntegerField(default=0)
```

**Atributos Técnicos:**
- `armor`: Classificação da armadura (1-5)
- `speed`: Velocidade (50-100)
- `stamina`: Regeneração de Resistência (50-100)

---

### Helmet, Cape, Passive, BattlePass

Modelos similares com estrutura padrão:

```python
class Helmet(models.Model):
    name = models.CharField(max_length=100, unique=True)
    name_pt_br = models.CharField(max_length=100, blank=True, null=True)
    image = models.ImageField(upload_to='helmets/', blank=True, null=True)
    cost = models.IntegerField(default=0)

class Cape(models.Model):
    name = models.CharField(max_length=100, unique=True)
    name_pt_br = models.CharField(max_length=100, blank=True, null=True)
    image = models.ImageField(upload_to='capes/', blank=True, null=True)
    cost = models.IntegerField(default=0)

class Passive(models.Model):
    name = models.CharField(max_length=100, unique=True)
    name_pt_br = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField()
    description_pt_br = models.TextField(blank=True, null=True)
    effect = models.CharField(max_length=255)
    effect_pt_br = models.CharField(max_length=255, blank=True, null=True)
    image = models.ImageField(upload_to='passives/', blank=True, null=True)

class BattlePass(models.Model):
    name = models.CharField(max_length=100, unique=True)
    name_pt_br = models.CharField(max_length=100, blank=True, null=True)
    image = models.ImageField(upload_to='passes/', blank=True, null=True)
```

---

### UserArmorSetRelation

**Localização**: `armory/models/user_set_relation.py`

Relação entre usuários e sets (favoritos, coleção, wishlist).

```python
class UserArmorSetRelation(models.Model):
    RELATION_TYPE_CHOICES = [
        ('favorite', 'Favorito'),
        ('collection', 'Coleção'),
        ('wishlist', 'Lista de Desejo'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    armor_set = models.ForeignKey(ArmorSet, on_delete=models.CASCADE)
    relation_type = models.CharField(max_length=20, choices=RELATION_TYPE_CHOICES)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = [['user', 'armor_set', 'relation_type']]
        indexes = [
            models.Index(fields=['user', 'relation_type']),
            models.Index(fields=['armor_set', 'relation_type']),
        ]
```

**Manager Personalizado:**

```python
class UserArmorSetRelationManager(models.Manager):
    def favorites(self):
        return self.filter(relation_type='favorite')
    
    def collection(self):
        return self.filter(relation_type='collection')
    
    def wishlist(self):
        return self.filter(relation_type='wishlist')
```

---

## 🔌 Endpoints da API

### Sets de Armadura

#### GET `/api/v1/armory/sets/`

Lista todos os sets com filtros e busca.

**Query Parameters:**
- `search`: Busca por nome
- `ordering`: Ordenação (name, created_at)
- `category`: Filtro por categoria da armadura
- `source`: Filtro por fonte de aquisição
- `passive`: Filtro por passiva
- `page`: Número da página (paginação)

**Response:**
```json
{
  "count": 50,
  "next": "http://api/v1/armory/sets/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Light Armor Set",
      "name_pt_br": "Conjunto de Armadura Leve",
      "image": "/media/sets/set1.png",
      "helmet_detail": {...},
      "armor_detail": {...},
      "cape_detail": {...}
    }
  ]
}
```

#### GET `/api/v1/armory/sets/{id}/`

Detalhes completos de um set.

**Response:**
```json
{
  "id": 1,
  "name": "Light Armor Set",
  "helmet_detail": {
    "id": 1,
    "name": "Light Helmet",
    "image": "/media/helmets/helmet1.png"
  },
  "armor_detail": {
    "id": 1,
    "name": "Light Armor",
    "armor": 100,
    "speed": 450,
    "stamina": 700,
    "passive_detail": {...}
  },
  "cape_detail": {...}
}
```

---

### Armaduras, Capacetes, Capas, Passivas

Todos seguem o mesmo padrão de endpoints:

#### GET `/api/v1/armory/armors/`

Lista todas as armaduras.

**Query Parameters:**
- `search`: Busca por nome
- `ordering`: Ordenação
- `category`: Filtro por categoria
- `source`: Filtro por fonte

#### GET `/api/v1/armory/armors/{id}/`

Detalhes de uma armadura específica.

---

### Relações Usuário-Set

#### POST `/api/v1/armory/user-sets/add/`

Adiciona relação (favorite, collection, wishlist).

**Request:**
```json
{
  "armor_set_id": 1,
  "relation_type": "favorite"
}
```

**Response:**
```json
{
  "id": 1,
  "armor_set": 1,
  "relation_type": "favorite",
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Lógica Especial:**
- Adicionar à coleção remove da wishlist
- Adicionar à wishlist remove da coleção

#### DELETE `/api/v1/armory/user-sets/remove/`

Remove relação.

**Request:**
```json
{
  "armor_set_id": 1,
  "relation_type": "favorite"
}
```

#### GET `/api/v1/armory/user-sets/favorites/`

Lista sets favoritos do usuário.

#### GET `/api/v1/armory/user-sets/collection/`

Lista sets na coleção do usuário.

#### GET `/api/v1/armory/user-sets/wishlist/`

Lista sets na wishlist do usuário.

#### POST `/api/v1/armory/user-sets/check/`

Verifica relações de múltiplos sets.

**Request:**
```json
{
  "set_ids": [1, 2, 3, 4, 5]
}
```

**Response:**
```json
{
  "1": {"favorite": true, "collection": false, "wishlist": false},
  "2": {"favorite": false, "collection": true, "wishlist": false},
  "3": {"favorite": false, "collection": false, "wishlist": true}
}
```

---

## 🔍 Filtros e Busca

### Filtros Implementados

```python
# Armor filters
category = filters.ChoiceFilter(choices=CATEGORY_CHOICES)
source = filters.ChoiceFilter(choices=ACQUISITION_CHOICES)
passive = filters.NumberFilter(field_name='passive')

# Busca multi-campo
search_fields = ['name', 'helmet__name', 'armor__name', 'cape__name']
```

### Ordenação

```python
ordering_fields = ['name', 'created_at']
ordering = ['name']  # Padrão
```

---

## 📝 Serializers

### Serializers de Listagem

```python
class ArmorSetListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem"""
    helmet_detail = HelmetSerializer(read_only=True, source='helmet')
    armor_detail = ArmorSerializer(read_only=True, source='armor')
    cape_detail = CapeSerializer(read_only=True, source='cape')
    
    class Meta:
        model = ArmorSet
        fields = ['id', 'name', 'name_pt_br', 'image', 
                  'helmet_detail', 'armor_detail', 'cape_detail']
```

### Serializers de Detalhes

```python
class ArmorSetSerializer(serializers.ModelSerializer):
    """Serializer completo com todos os detalhes"""
    helmet_detail = HelmetDetailSerializer(read_only=True, source='helmet')
    armor_detail = ArmorDetailSerializer(read_only=True, source='armor')
    cape_detail = CapeDetailSerializer(read_only=True, source='cape')
    
    class Meta:
        model = ArmorSet
        fields = '__all__'
```

---

## 🎯 ViewSets

### ArmorSetViewSet

```python
class ArmorSetViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Sets completos
    CRUD completo + filtros + busca
    """
    queryset = ArmorSet.objects.select_related('helmet', 'armor', 'cape', 'armor__passive').all()
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    search_fields = ['name', 'helmet__name', 'armor__name', 'cape__name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ArmorSetListSerializer
        return ArmorSetSerializer
```

---

## 🎨 Otimizações

### Queries Otimizadas

```python
# select_related para ForeignKeys
queryset = ArmorSet.objects.select_related('helmet', 'armor', 'cape').all()

# prefetch_related para ManyToMany ou reverse ForeignKeys
queryset = queryset.prefetch_related('armor__passive')

# Índices no banco de dados
class Meta:
    indexes = [
        models.Index(fields=['user', 'relation_type']),
        models.Index(fields=['name']),
    ]
```

### Paginação

```python
# 20 itens por página (configurado em REST_FRAMEWORK)
PAGE_SIZE = 20
```

---

## 📚 Recursos Adicionais

- [README Principal](../README.md)
- [ARQUITETURA.md](./ARQUITETURA.md)
- [AUTENTICACAO.md](./AUTENTICACAO.md)
- [DRF ViewSets](https://www.django-rest-framework.org/api-guide/viewsets/)

---

<div align="center">

**Made with ❤️ by Dionatha Goulart**

</div>

