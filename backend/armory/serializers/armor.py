from rest_framework import serializers
from armory.models import Armor
from .passive import PassiveSerializer
from warbonds.serializers import WarbondSerializer, AcquisitionSourceSerializer



class ArmorSerializer(serializers.ModelSerializer):
    passive_detail = PassiveSerializer(source='passive', read_only=True)
    pass_detail = WarbondSerializer(source='pass_field', read_only=True)
    acquisition_source_detail = AcquisitionSourceSerializer(source='acquisition_source', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    cost_currency = serializers.CharField(source='get_cost_currency', read_only=True)
    
    class Meta:
        model = Armor
        fields = [
            'id', 'name', 'name_pt_br', 'category', 'category_display', 'image',
            'armor', 'speed', 'stamina', 'passive', 'passive_detail',
            'cost', 'source', 'source_display', 'pass_field', 'pass_detail',
            'acquisition_source', 'acquisition_source_detail',
            'cost_currency', 'created_at', 'updated_at'
        ]


class ArmorListSerializer(serializers.ModelSerializer):
    """Versão mais simples para listagens"""
    passive_name = serializers.CharField(source='passive.name', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Armor
        fields = [
            'id', 'name', 'name_pt_br', 'category', 'category_display', 'image',
            'armor', 'speed', 'stamina',
            'passive_name', 'cost'
        ]