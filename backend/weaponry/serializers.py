from rest_framework import serializers
from .models import (
    PrimaryWeapon, SecondaryWeapon, Throwable,
    UserPrimaryWeaponRelation, UserSecondaryWeaponRelation, UserThrowableRelation
)


# Weapon Serializers
class PrimaryWeaponSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrimaryWeapon
        fields = '__all__'

class SecondaryWeaponSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecondaryWeapon
        fields = '__all__'

class ThrowableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Throwable
        fields = '__all__'

# Relation Serializers
class UserPrimaryWeaponRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPrimaryWeaponRelation
        fields = ['id', 'user', 'item', 'relation_type', 'created_at']
        read_only_fields = ['user', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        item = validated_data['item']
        relation_type = validated_data['relation_type']

        relation, created = UserPrimaryWeaponRelation.objects.get_or_create(
            user=user,
            item=item,
            relation_type=relation_type
        )
        return relation

class UserSecondaryWeaponRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSecondaryWeaponRelation
        fields = ['id', 'user', 'item', 'relation_type', 'created_at']
        read_only_fields = ['user', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        item = validated_data['item']
        relation_type = validated_data['relation_type']

        relation, created = UserSecondaryWeaponRelation.objects.get_or_create(
            user=user,
            item=item,
            relation_type=relation_type
        )
        return relation

class UserThrowableRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserThrowableRelation
        fields = ['id', 'user', 'item', 'relation_type', 'created_at']
        read_only_fields = ['user', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        item = validated_data['item']
        relation_type = validated_data['relation_type']

        relation, created = UserThrowableRelation.objects.get_or_create(
            user=user,
            item=item,
            relation_type=relation_type
        )
        return relation
