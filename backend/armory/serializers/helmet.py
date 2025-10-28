from rest_framework import serializers
from armory.models import Helmet


class HelmetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Helmet
        fields = ['id', 'name', 'image', 'cost', 'source', 'created_at', 'updated_at']
