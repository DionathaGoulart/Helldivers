from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from armory.models import Armor
from armory.serializers import ArmorSerializer, ArmorListSerializer


class ArmorViewSet(viewsets.ModelViewSet):
    """ViewSet para Armaduras com filtros"""
    queryset = Armor.objects.select_related('passive').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtros disponíveis
    filterset_fields = {
        'category': ['exact'],
        'armor': ['exact'],
        'speed': ['exact'],
        'stamina': ['exact'],
        'passive': ['exact'],
        'cost': ['lte', 'gte'],
    }
    
    # Busca por nome
    search_fields = ['name', 'source']
    
    # Ordenação
    ordering_fields = ['name', 'cost', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        """Usa serializer simplificado para listagens"""
        if self.action == 'list':
            return ArmorListSerializer
        return ArmorSerializer
