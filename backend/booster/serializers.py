from rest_framework import serializers
from .models import Booster, UserBoosterRelation
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

class UserBoosterRelationSerializer(serializers.ModelSerializer):
    booster_details = BoosterSerializer(source='booster', read_only=True)
    
    class Meta:
        model = UserBoosterRelation
        fields = ['id', 'user', 'booster', 'booster_details', 'relation_type', 'created_at']
        read_only_fields = ['user', 'created_at']
        
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)
