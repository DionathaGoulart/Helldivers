from rest_framework import serializers
from armory.models import ArmorSet
from .armor import ArmorSerializer
from .helmet import HelmetSerializer
from .cape import CapeSerializer
from .passive import PassiveSerializer


class ArmorSetSerializer(serializers.ModelSerializer):
    helmet_detail = HelmetSerializer(source='helmet', read_only=True)
    armor_detail = ArmorSerializer(source='armor', read_only=True)
    cape_detail = CapeSerializer(source='cape', read_only=True)
    passive_detail = PassiveSerializer(source='armor.passive', read_only=True)
    armor_stats = serializers.SerializerMethodField()
    source = serializers.CharField(source='get_source', read_only=True)
    total_cost = serializers.IntegerField(source='get_total_cost', read_only=True)
    
    class Meta:
        model = ArmorSet
        fields = [
            'id', 'name', 'image', 'helmet', 'helmet_detail',
            'armor', 'armor_detail', 'cape', 'cape_detail',
            'passive_detail', 'armor_stats', 'source', 'total_cost',
            'created_at', 'updated_at'
        ]
    
    def get_armor_stats(self, obj):
        """Retorna os stats herdados da armadura"""
        return obj.get_armor_stats()


class ArmorSetListSerializer(serializers.ModelSerializer):
    """Versão simplificada para listagens"""
    helmet_detail = HelmetSerializer(source='helmet', read_only=True)
    armor_detail = ArmorSerializer(source='armor', read_only=True)
    cape_detail = CapeSerializer(source='cape', read_only=True)
    passive_detail = PassiveSerializer(source='armor.passive', read_only=True)
    armor_stats = serializers.SerializerMethodField()
    source = serializers.CharField(source='get_source', read_only=True)
    total_cost = serializers.IntegerField(source='get_total_cost', read_only=True)
    
    class Meta:
        model = ArmorSet
        fields = [
            'id', 'name', 'image', 'helmet_detail', 'armor_detail', 'cape_detail', 
            'passive_detail', 'armor_stats', 'source', 'total_cost'
        ]
    
    def get_armor_stats(self, obj):
        """Retorna os stats herdados da armadura"""
        return obj.get_armor_stats()
