from rest_framework import serializers
from armory.models import Cape


class CapeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cape
        fields = ['id', 'name', 'image', 'cost', 'source', 'created_at', 'updated_at']
