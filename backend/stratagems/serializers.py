from rest_framework import serializers
from .models import Stratagem, UserStratagemRelation

class StratagemSerializer(serializers.ModelSerializer):
    department_display = serializers.CharField(source='get_department_display', read_only=True)

    class Meta:
        model = Stratagem
        fields = [
            'id',
            'name',
            'name_pt_br',
            'department',
            'department_display',
            'icon',
            'codex',
            'cooldown',
            'cost',
            'unlock_level',
            'description',
            'description_pt_br',
            'has_backpack',
            'is_tertiary_weapon',
        ]

class UserStratagemRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStratagemRelation
        fields = ['id', 'user', 'stratagem', 'relation_type', 'created_at']
        read_only_fields = ['user', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        stratagem = validated_data['stratagem']
        relation_type = validated_data['relation_type']

        relation, created = UserStratagemRelation.objects.get_or_create(
            user=user,
            stratagem=stratagem,
            relation_type=relation_type
        )
        return relation
