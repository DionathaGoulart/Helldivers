from rest_framework import serializers
from armory.models import Cape


class CapeSerializer(serializers.ModelSerializer):
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    cost_currency = serializers.CharField(source='get_cost_currency', read_only=True)
    
    class Meta:
        model = Cape
        fields = ['id', 'name', 'image', 'cost', 'source', 'source_display', 'cost_currency', 'created_at', 'updated_at']
