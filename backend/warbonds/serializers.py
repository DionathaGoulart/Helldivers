from rest_framework import serializers
from warbonds.models import Warbond, AcquisitionSource

class AcquisitionSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcquisitionSource
        fields = ['id', 'name', 'name_pt_br', 'is_event', 'description']



class WarbondSerializer(serializers.ModelSerializer):
    """Serializer para o modelo Warbond"""
    
    class Meta:
        model = Warbond
        fields = [
            'id',
            'name',
            'name_pt_br',
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


class WarbondListSerializer(serializers.ModelSerializer):
    """Versão simplificada para listagens"""
    
    class Meta:
        model = Warbond
        fields = ['id', 'name', 'name_pt_br', 'image', 'quantidade_paginas', 'custo_supercreditos']
