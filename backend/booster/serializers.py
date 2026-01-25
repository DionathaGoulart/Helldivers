from rest_framework import serializers
from .models import Booster
from warbonds.serializers import WarbondSerializer

class BoosterSerializer(serializers.ModelSerializer):
    warbond_details = WarbondSerializer(source='warbond', read_only=True)

    class Meta:
        model = Booster
        fields = [
            'id', 
            'name', 
            'name_pt_br', 
            'icon', 
            'description', 
            'description_pt_br', 
            'warbond', 
            'warbond_details',
            'cost',
            'created_at',
            'updated_at'
        ]
