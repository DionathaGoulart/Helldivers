from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from warbonds.models import Warbond
from warbonds.serializers import WarbondSerializer, WarbondListSerializer


class WarbondViewSet(viewsets.ModelViewSet):
    """ViewSet para Warbonds (antigos Passes de Batalha)"""
    queryset = Warbond.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    search_fields = ['name']
    ordering_fields = ['name', 'custo_supercreditos', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        """Usa serializer simplificado para listagens"""
        if self.action == 'list':
            return WarbondListSerializer
        return WarbondSerializer
