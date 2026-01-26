from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Booster, UserBoosterRelation
from .serializers import BoosterSerializer, UserBoosterRelationSerializer

class BoosterViewSet(viewsets.ModelViewSet):
    queryset = Booster.objects.all()
    serializer_class = BoosterSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    search_fields = ['name', 'name_pt_br']
    ordering_fields = ['name', 'cost', 'created_at']

class UserBoosterRelationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing user relations with boosters (favorites, collection, wishlist)
    """
    serializer_class = UserBoosterRelationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserBoosterRelation.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        # Allow creating/toggling via POST
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        booster = serializer.validated_data['booster']
        relation_type = serializer.validated_data['relation_type']
        
        # Check if already exists
        existing = UserBoosterRelation.objects.filter(
            user=request.user,
            booster=booster,
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
        """Get boosters by relation type (favorite, collection, wishlist)"""
        relation_type = request.query_params.get('type')
        if not relation_type:
            return Response({'error': 'Type parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        relations = self.get_queryset().filter(relation_type=relation_type)
        booster_ids = relations.values_list('booster_id', flat=True)
        boosters = Booster.objects.filter(id__in=booster_ids)
        
        serializer = BoosterSerializer(boosters, many=True)
        return Response(serializer.data)
