from rest_framework import serializers
from armory.models import ArmorSet
from .armor import ArmorSerializer
from .helmet import HelmetSerializer
from .cape import CapeSerializer


class ArmorSetSerializer(serializers.ModelSerializer):
    helmet_detail = HelmetSerializer(source='helmet', read_only=True)
    armor_detail = ArmorSerializer(source='armor', read_only=True)
    cape_detail = CapeSerializer(source='cape', read_only=True)
    total_cost = serializers.IntegerField(source='get_total_cost', read_only=True)
    
    class Meta:
        model = ArmorSet
        fields = [
            'id', 'name', 'helmet', 'helmet_detail',
            'armor', 'armor_detail', 'cape', 'cape_detail',
            'total_cost', 'created_at', 'updated_at'
        ]


class ArmorSetListSerializer(serializers.ModelSerializer):
    """Versão simplificada para listagens"""
    helmet_name = serializers.CharField(source='helmet.name', read_only=True)
    armor_name = serializers.CharField(source='armor.name', read_only=True)
    cape_name = serializers.CharField(source='cape.name', read_only=True)
    total_cost = serializers.IntegerField(source='get_total_cost', read_only=True)
    
    class Meta:
        model = ArmorSet
        fields = ['id', 'name', 'helmet_name', 'armor_name', 'cape_name', 'total_cost']
