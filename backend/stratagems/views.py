from rest_framework import viewsets, filters, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Stratagem, UserStratagemRelation
from .serializers import StratagemSerializer, UserStratagemRelationSerializer

class StratagemViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows stratagems to be viewed.
    """
    queryset = Stratagem.objects.all()
    serializer_class = StratagemSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'unlock_level']
    search_fields = ['name', 'name_pt_br', 'department']
    ordering_fields = ['name', 'department', 'unlock_level', 'cost']
    ordering = ['department', 'name']

class UserStratagemRelationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing user relations with stratagems (favorites, collection, wishlist)
    """
    serializer_class = UserStratagemRelationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserStratagemRelation.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        # Allow creating/toggling via POST
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        stratagem = serializer.validated_data['stratagem']
        relation_type = serializer.validated_data['relation_type']
        
        # Check if already exists
        existing = UserStratagemRelation.objects.filter(
            user=request.user,
            stratagem=stratagem,
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
        """Get stratagems by relation type (favorite, collection, wishlist)"""
        relation_type = request.query_params.get('type')
        if not relation_type:
            return Response({'error': 'Type parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        relations = self.get_queryset().filter(relation_type=relation_type)
        stratagem_ids = relations.values_list('stratagem_id', flat=True)
        stratagems = Stratagem.objects.filter(id__in=stratagem_ids)
        
        serializer = StratagemSerializer(stratagems, many=True)
        return Response(serializer.data)
