from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import (
    PrimaryWeapon, SecondaryWeapon, Throwable,
    UserPrimaryWeaponRelation, UserSecondaryWeaponRelation, UserThrowableRelation
)
from .serializers import (
    PrimaryWeaponSerializer, SecondaryWeaponSerializer, ThrowableSerializer,
    UserPrimaryWeaponRelationSerializer, UserSecondaryWeaponRelationSerializer, UserThrowableRelationSerializer
)

# Base Mixin for Relation Views
class UserRelationMixin:
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Allow creating/toggling via POST
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        item = serializer.validated_data['item']
        relation_type = serializer.validated_data['relation_type']
        
        # Check if already exists
        # Note: 'self.get_queryset().model' refers to the Relation model
        existing = self.get_queryset().model.objects.filter(
            user=request.user,
            item=item,
            relation_type=relation_type
        ).first()
        
        if existing:
            # If exists, delete (toggle off)
            existing.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        # If not exists, create (toggle on)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['GET'])
    def by_type(self, request):
        """Get weapons by relation type (favorite, collection, wishlist)"""
        relation_type = request.query_params.get('type')
        if not relation_type:
            return Response({'error': 'Type parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        relations = self.get_queryset().filter(relation_type=relation_type)
        item_ids = relations.values_list('item_id', flat=True)
        
        # Determine which model and serializer to use based on the ViewSet
        if isinstance(self, UserPrimaryWeaponRelationViewSet):
            items = PrimaryWeapon.objects.filter(id__in=item_ids)
            serializer = PrimaryWeaponSerializer(items, many=True)
        elif isinstance(self, UserSecondaryWeaponRelationViewSet):
            items = SecondaryWeapon.objects.filter(id__in=item_ids)
            serializer = SecondaryWeaponSerializer(items, many=True)
        elif isinstance(self, UserThrowableRelationViewSet):
            items = Throwable.objects.filter(id__in=item_ids)
            serializer = ThrowableSerializer(items, many=True)
        else:
            return Response({'error': 'Unknown viewset type'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return Response(serializer.data)

# ViewSets
class PrimaryWeaponViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PrimaryWeapon.objects.all()
    serializer_class = PrimaryWeaponSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['weapon_type', 'damage_type', 'source']
    search_fields = ['name', 'name_pt_br']

class SecondaryWeaponViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SecondaryWeapon.objects.all()
    serializer_class = SecondaryWeaponSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['weapon_type', 'damage_type', 'source']
    search_fields = ['name', 'name_pt_br']

class ThrowableViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Throwable.objects.all()
    serializer_class = ThrowableSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['weapon_type', 'damage_type', 'source']
    search_fields = ['name', 'name_pt_br']

# Relation ViewSets
class UserPrimaryWeaponRelationViewSet(UserRelationMixin, viewsets.ModelViewSet):
    serializer_class = UserPrimaryWeaponRelationSerializer
    
    def get_queryset(self):
        return UserPrimaryWeaponRelation.objects.filter(user=self.request.user)

class UserSecondaryWeaponRelationViewSet(UserRelationMixin, viewsets.ModelViewSet):
    serializer_class = UserSecondaryWeaponRelationSerializer
    
    def get_queryset(self):
        return UserSecondaryWeaponRelation.objects.filter(user=self.request.user)

class UserThrowableRelationViewSet(UserRelationMixin, viewsets.ModelViewSet):
    serializer_class = UserThrowableRelationSerializer
    
    def get_queryset(self):
        return UserThrowableRelation.objects.filter(user=self.request.user)
