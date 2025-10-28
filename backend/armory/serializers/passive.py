from rest_framework import serializers
from armory.models import Passive


class PassiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passive
        fields = ['id', 'name', 'description', 'effect']