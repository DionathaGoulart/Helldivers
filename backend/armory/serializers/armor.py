from rest_framework import serializers
from armory.models import Armor
from .passive import PassiveSerializer


class ArmorSerializer(serializers.ModelSerializer):
    passive_detail = PassiveSerializer(source='passive', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    armor_display = serializers.CharField(source='get_armor_display', read_only=True)
    speed_display = serializers.CharField(source='get_speed_display', read_only=True)
    stamina_display = serializers.CharField(source='get_stamina_display', read_only=True)
    
    class Meta:
        model = Armor
        fields = [
            'id', 'name', 'category', 'category_display', 'image',
            'armor', 'armor_display', 'speed', 'speed_display',
            'stamina', 'stamina_display', 'passive', 'passive_detail',
            'cost', 'source', 'created_at', 'updated_at'
        ]


class ArmorListSerializer(serializers.ModelSerializer):
    """Versão mais simples para listagens"""
    passive_name = serializers.CharField(source='passive.name', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Armor
        fields = ['id', 'name', 'category', 'category_display', 'image', 'passive_name', 'cost']