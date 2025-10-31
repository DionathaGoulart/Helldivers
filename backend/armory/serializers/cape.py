from rest_framework import serializers
from armory.models import Cape
from .battlepass import BattlePassSerializer


class CapeSerializer(serializers.ModelSerializer):
    pass_detail = BattlePassSerializer(source='pass_field', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    cost_currency = serializers.CharField(source='get_cost_currency', read_only=True)
    
    class Meta:
        model = Cape
        fields = [
            'id', 'name', 'image', 'cost', 'source', 'source_display',
            'pass_field', 'pass_detail', 'cost_currency', 'created_at', 'updated_at'
        ]
