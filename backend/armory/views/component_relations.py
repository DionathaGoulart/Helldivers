from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from armory.models import (
    UserHelmetRelation, Helmet,
    UserArmorRelation, Armor,
    UserCapeRelation, Cape
)
from armory.serializers.component_relations import (
    UserHelmetRelationSerializer, UserHelmetRelationCreateSerializer,
    UserArmorRelationSerializer, UserArmorRelationCreateSerializer,
    UserCapeRelationSerializer, UserCapeRelationCreateSerializer
)
from armory.serializers import (
    HelmetSerializer,
    ArmorSerializer,
    CapeSerializer
)


class BaseComponentRelationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    # Needs to be defined in subclasses
    model_class = None 
    relation_model_class = None
    serializer_class = None
    create_serializer_class = None
    item_serializer_class = None # Serializer for the item itself (Helmet, Armor, Cape)
    component_field_name = None # 'helmet', 'armor', or 'cape'
    
    def get_queryset(self):
        return self.relation_model_class.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='add')
    def add_relation(self, request):
        serializer = self.create_serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        component_id = serializer.validated_data[f'{self.component_field_name}_id']
        relation_type = serializer.validated_data['relation_type']
        
        component = get_object_or_404(self.model_class, id=component_id)
        
        # Verify if exists
        relation, created = self.relation_model_class.objects.get_or_create(
            user=request.user,
            **{self.component_field_name: component},
            relation_type=relation_type
        )
        
        if not created:
             return Response(
                {"detail": f"Este item já está na sua {relation.get_relation_type_display().lower()}."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Mutual exclusion logic (Collection vs Wishlist)
        if relation_type == 'collection':
            self.relation_model_class.objects.filter(
                user=request.user,
                **{self.component_field_name: component},
                relation_type='wishlist'
            ).delete()
        elif relation_type == 'wishlist':
            self.relation_model_class.objects.filter(
                 user=request.user,
                **{self.component_field_name: component},
                relation_type='collection'
            ).delete()
            
        return Response(self.serializer_class(relation).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='remove')
    def remove_relation(self, request):
        serializer = self.create_serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        component_id = serializer.validated_data[f'{self.component_field_name}_id']
        relation_type = serializer.validated_data['relation_type']
        
        relation = get_object_or_404(
            self.relation_model_class,
            user=request.user,
            **{f'{self.component_field_name}_id': component_id},
            relation_type=relation_type
        )
        
        relation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path='check')
    def check_relation(self, request):
        component_id = request.query_params.get(f'{self.component_field_name}_id')
        if not component_id:
            return Response(
                {"detail": f"{self.component_field_name}_id é obrigatório"},
                status=status.HTTP_400_BAD_REQUEST
            )

        relations = self.get_queryset().filter(**{f'{self.component_field_name}_id': component_id})
        result = {
            'favorite': False,
            'collection': False,
            'wishlist': False
        }
        
        for relation in relations:
            result[relation.relation_type] = True
            
        return Response(result)

    @action(detail=False, methods=['get'], url_path='favorites')
    def list_favorites(self, request):
        """Lista todos os itens favoritados pelo usuário"""
        # Otimização: usa values_list para evitar N+1 queries
        item_ids = self.relation_model_class.objects.filter(
            user=request.user,
            relation_type='favorite'
        ).values_list(f'{self.component_field_name}_id', flat=True)
        
        items = self.model_class.objects.filter(
            id__in=item_ids
        )
        
        # Otimizações específicas por tipo
        if self.component_field_name == 'armor':
             items = items.select_related('passive')
        
        serializer = self.item_serializer_class(items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='collection')
    def list_collection(self, request):
        """Lista todos os itens na coleção do usuário"""
        item_ids = self.relation_model_class.objects.filter(
            user=request.user,
            relation_type='collection'
        ).values_list(f'{self.component_field_name}_id', flat=True)
        
        items = self.model_class.objects.filter(
            id__in=item_ids
        )
        
        if self.component_field_name == 'armor':
             items = items.select_related('passive')
        
        serializer = self.item_serializer_class(items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='wishlist')
    def list_wishlist(self, request):
        """Lista todos os itens na wishlist do usuário"""
        item_ids = self.relation_model_class.objects.filter(
            user=request.user,
            relation_type='wishlist'
        ).values_list(f'{self.component_field_name}_id', flat=True)
        
        items = self.model_class.objects.filter(
            id__in=item_ids
        )
        
        if self.component_field_name == 'armor':
             items = items.select_related('passive')
        
        serializer = self.item_serializer_class(items, many=True)
        return Response(serializer.data)


class UserHelmetRelationViewSet(BaseComponentRelationViewSet):
    model_class = Helmet
    relation_model_class = UserHelmetRelation
    serializer_class = UserHelmetRelationSerializer
    create_serializer_class = UserHelmetRelationCreateSerializer
    item_serializer_class = HelmetSerializer
    component_field_name = 'helmet'


class UserArmorRelationViewSet(BaseComponentRelationViewSet):
    model_class = Armor
    relation_model_class = UserArmorRelation
    serializer_class = UserArmorRelationSerializer
    create_serializer_class = UserArmorRelationCreateSerializer
    item_serializer_class = ArmorSerializer
    component_field_name = 'armor'


class UserCapeRelationViewSet(BaseComponentRelationViewSet):
    model_class = Cape
    relation_model_class = UserCapeRelation
    serializer_class = UserCapeRelationSerializer
    create_serializer_class = UserCapeRelationCreateSerializer
    item_serializer_class = CapeSerializer
    component_field_name = 'cape'
