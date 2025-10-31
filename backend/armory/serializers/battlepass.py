from rest_framework import serializers
from armory.models import BattlePass


class BattlePassSerializer(serializers.ModelSerializer):
    """Serializer para o modelo BattlePass"""
    
    class Meta:
        model = BattlePass
        fields = [
            'id',
            'name',
            'image',
            'creditos_ganhaveis',
            'custo_medalhas_todas_paginas',
            'custo_medalhas_todos_itens',
            'quantidade_paginas',
            'custo_supercreditos',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class BattlePassListSerializer(serializers.ModelSerializer):
    """Versão simplificada para listagens"""
    
    class Meta:
        model = BattlePass
        fields = ['id', 'name', 'image', 'quantidade_paginas', 'custo_supercreditos']

