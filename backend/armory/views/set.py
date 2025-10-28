from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from armory.models import ArmorSet
from armory.serializers import ArmorSetSerializer, ArmorSetListSerializer


class ArmorSetViewSet(viewsets.ModelViewSet):
    """ViewSet para Sets completos"""
    queryset = ArmorSet.objects.select_related('helmet', 'armor', 'cape', 'armor__passive').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    search_fields = ['name', 'helmet__name', 'armor__name', 'cape__name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        """Usa serializer simplificado para listagens"""
        if self.action == 'list':
            return ArmorSetListSerializer
        return ArmorSetSerializer

