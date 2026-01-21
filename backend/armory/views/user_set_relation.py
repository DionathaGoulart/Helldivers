from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from armory.models import UserArmorSetRelation, ArmorSet
from armory.serializers.user_set_relation import (
    UserArmorSetRelationSerializer,
    UserArmorSetRelationCreateSerializer
)
from armory.serializers.set import ArmorSetListSerializer


class UserArmorSetRelationViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar relações entre usuários e sets"""
    serializer_class = UserArmorSetRelationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Retorna apenas as relações do usuário autenticado"""
        return UserArmorSetRelation.objects.filter(
            user=self.request.user
        ).select_related('armor_set', 'armor_set__helmet', 'armor_set__armor', 'armor_set__cape', 'armor_set__armor__passive')
    
    @action(detail=False, methods=['post'], url_path='add')
    def add_relation(self, request):
        """
        Adiciona uma relação (favorito, coleção ou wishlist)
        Body: { "armor_set_id": 1, "relation_type": "favorite" }
        
        Lógica: Se adicionar à coleção, remove automaticamente da wishlist (e vice-versa)
        """
        serializer = UserArmorSetRelationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        armor_set = get_object_or_404(
            ArmorSet,
            id=serializer.validated_data['armor_set_id']
        )
        relation_type = serializer.validated_data['relation_type']
        
        # Verifica se já existe
        relation, created = UserArmorSetRelation.objects.get_or_create(
            user=request.user,
            armor_set=armor_set,
            relation_type=relation_type
        )
        
        if not created:
            return Response(
                {"detail": f"Este set já está na sua {relation.get_relation_type_display().lower()}."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Lógica: Se está adicionando à coleção, remover da wishlist (e vice-versa)
        if relation_type == 'collection':
            # Remove da wishlist se existir
            UserArmorSetRelation.objects.filter(
                user=request.user,
                armor_set=armor_set,
                relation_type='wishlist'
            ).delete()
        elif relation_type == 'wishlist':
            # Remove da coleção se existir
            UserArmorSetRelation.objects.filter(
                user=request.user,
                armor_set=armor_set,
                relation_type='collection'
            ).delete()
        
        response_serializer = UserArmorSetRelationSerializer(relation)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'], url_path='remove')
    def remove_relation(self, request):
        """
        Remove uma relação (favorito, coleção ou wishlist)
        Body: { "armor_set_id": 1, "relation_type": "favorite" }
        """
        serializer = UserArmorSetRelationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        armor_set_id = serializer.validated_data['armor_set_id']
        relation_type = serializer.validated_data['relation_type']
        
        relation = UserArmorSetRelation.objects.filter(
            user=request.user,
            armor_set_id=armor_set_id,
            relation_type=relation_type
        ).first()
        
        if not relation:
            return Response(
                {"detail": f"Relação não encontrada: Set {armor_set_id}, Tipo {relation_type}"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        relation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'], url_path='favorites')
    def list_favorites(self, request):
        """Lista todos os sets favoritados pelo usuário"""
        # Otimização: usa values_list para evitar N+1 queries
        armor_set_ids = UserArmorSetRelation.objects.favorites().filter(
            user=request.user
        ).values_list('armor_set_id', flat=True)
        
        sets = ArmorSet.objects.filter(
            id__in=armor_set_ids
        ).select_related('helmet', 'armor', 'cape', 'armor__passive')
        
        serializer = ArmorSetListSerializer(sets, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='collection')
    def list_collection(self, request):
        """Lista todos os sets na coleção do usuário"""
        # Otimização: usa values_list para evitar N+1 queries
        armor_set_ids = UserArmorSetRelation.objects.collection().filter(
            user=request.user
        ).values_list('armor_set_id', flat=True)
        
        sets = ArmorSet.objects.filter(
            id__in=armor_set_ids
        ).select_related('helmet', 'armor', 'cape', 'armor__passive')
        
        serializer = ArmorSetListSerializer(sets, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='wishlist')
    def list_wishlist(self, request):
        """Lista todos os sets na wishlist do usuário"""
        # Otimização: usa values_list para evitar N+1 queries
        armor_set_ids = UserArmorSetRelation.objects.wishlist().filter(
            user=request.user
        ).values_list('armor_set_id', flat=True)
        
        sets = ArmorSet.objects.filter(
            id__in=armor_set_ids
        ).select_related('helmet', 'armor', 'cape', 'armor__passive')
        
        serializer = ArmorSetListSerializer(sets, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='check')
    def check_relation(self, request):
        """
        Verifica o status de relação de um set
        Query params: ?armor_set_id=1
        Retorna: { "favorite": true, "collection": false, "wishlist": true }
        """
        armor_set_id = request.query_params.get('armor_set_id')
        if not armor_set_id:
            return Response(
                {"detail": "armor_set_id é obrigatório"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        relations = self.get_queryset().filter(armor_set_id=armor_set_id)
        result = {
            'favorite': False,
            'collection': False,
            'wishlist': False
        }
        
        for relation in relations:
            result[relation.relation_type] = True
        
        return Response(result)

