from rest_framework import serializers
from armory.models import UserHelmetRelation, UserArmorRelation, UserCapeRelation


class UserHelmetRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserHelmetRelation
        fields = ['id', 'user', 'helmet', 'relation_type', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class UserHelmetRelationCreateSerializer(serializers.Serializer):
    helmet_id = serializers.IntegerField()
    relation_type = serializers.ChoiceField(choices=UserHelmetRelation.RELATION_TYPE_CHOICES)


class UserArmorRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserArmorRelation
        fields = ['id', 'user', 'armor', 'relation_type', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class UserArmorRelationCreateSerializer(serializers.Serializer):
    armor_id = serializers.IntegerField()
    relation_type = serializers.ChoiceField(choices=UserArmorRelation.RELATION_TYPE_CHOICES)


class UserCapeRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCapeRelation
        fields = ['id', 'user', 'cape', 'relation_type', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class UserCapeRelationCreateSerializer(serializers.Serializer):
    cape_id = serializers.IntegerField()
    relation_type = serializers.ChoiceField(choices=UserCapeRelation.RELATION_TYPE_CHOICES)
