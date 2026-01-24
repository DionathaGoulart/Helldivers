from rest_framework import serializers
from armory.models import UserSet
from .helmet import HelmetSerializer
from .armor import ArmorSerializer
from .cape import CapeSerializer

class UserSetSerializer(serializers.ModelSerializer):
    helmet_detail = HelmetSerializer(source='helmet', read_only=True)
    armor_detail = ArmorSerializer(source='armor', read_only=True)
    cape_detail = CapeSerializer(source='cape', read_only=True)
    
    is_liked = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()
    
    creator_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserSet
        fields = [
            'id', 'name', 'image', 
            'helmet', 'helmet_detail',
            'armor', 'armor_detail',
            'cape', 'cape_detail',
            'is_public', 'created_at',
            'is_liked', 'like_count', 'is_favorited', 'is_mine',
            'creator_username', 'user'
        ]
        read_only_fields = ['user', 'created_at', 'likes', 'favorites']
        
    def get_is_liked(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return obj.likes.filter(id=user.id).exists()
        return False

    def get_is_favorited(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return obj.favorites.filter(id=user.id).exists()
        return False
        
    def get_is_mine(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return obj.user == user
        return False

    def get_like_count(self, obj):
        # Usa o valor anotado se disponível (otimizado no list)
        if hasattr(obj, 'likes_count'):
            return obj.likes_count
        # Fallback para query (detail/create)
        return obj.likes.count()
        
    def create(self, validated_data):
        # Ensure user is set from request
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
