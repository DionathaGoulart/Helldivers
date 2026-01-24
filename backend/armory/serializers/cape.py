from rest_framework import serializers
from armory.models import Cape
from warbonds.serializers import WarbondSerializer, AcquisitionSourceSerializer



class CapeSerializer(serializers.ModelSerializer):
    pass_detail = WarbondSerializer(source='pass_field', read_only=True)
    acquisition_source_detail = AcquisitionSourceSerializer(source='acquisition_source', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    cost_currency = serializers.CharField(source='get_cost_currency', read_only=True)
    
    class Meta:
        model = Cape
        fields = [
            'id', 'name', 'name_pt_br', 'image', 'cost', 'source', 'source_display',
            'pass_field', 'pass_detail', 'acquisition_source', 'acquisition_source_detail',
            'cost_currency', 'created_at', 'updated_at'
        ]
