from rest_framework import serializers
from armory.models import Helmet
from .battlepass import BattlePassSerializer


class HelmetSerializer(serializers.ModelSerializer):
    pass_detail = BattlePassSerializer(source='pass_field', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    cost_currency = serializers.CharField(source='get_cost_currency', read_only=True)
    
    class Meta:
        model = Helmet
        fields = [
            'id', 'name', 'name_pt_br', 'image', 'cost', 'source', 'source_display',
            'pass_field', 'pass_detail', 'cost_currency', 'created_at', 'updated_at'
        ]
