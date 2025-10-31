from rest_framework import serializers
from armory.models import UserArmorSetRelation, ArmorSet
from armory.serializers.set import ArmorSetListSerializer


class UserArmorSetRelationSerializer(serializers.ModelSerializer):
    """Serializer para relações usuário-set"""
    armor_set_detail = ArmorSetListSerializer(source='armor_set', read_only=True)
    
    class Meta:
        model = UserArmorSetRelation
        fields = [
            'id', 'user', 'armor_set', 'armor_set_detail',
            'relation_type', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        """Valida se já existe uma relação do mesmo tipo"""
        user = self.context['request'].user
        armor_set = attrs.get('armor_set')
        relation_type = attrs.get('relation_type')
        
        if armor_set and relation_type:
            existing = UserArmorSetRelation.objects.filter(
                user=user,
                armor_set=armor_set,
                relation_type=relation_type
            )
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            
            if existing.exists():
                raise serializers.ValidationError(
                    f"Este set já está na sua {relation_type}."
                )
        
        return attrs
    
    def create(self, validated_data):
        """Cria relação atribuindo o usuário atual"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class UserArmorSetRelationCreateSerializer(serializers.Serializer):
    """Serializer simplificado para criar relação (apenas armor_set_id e relation_type)"""
    armor_set_id = serializers.IntegerField(required=True)
    relation_type = serializers.ChoiceField(
        choices=UserArmorSetRelation.RELATION_TYPE_CHOICES,
        required=True
    )

