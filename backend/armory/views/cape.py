from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from armory.models import Cape
from armory.serializers import CapeSerializer


class CapeViewSet(viewsets.ModelViewSet):
    """ViewSet para Capas"""
    queryset = Cape.objects.all()
    serializer_class = CapeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = {
        'cost': ['lte', 'gte'],
    }
    search_fields = ['name', 'source']
    ordering_fields = ['name', 'cost', 'created_at']
    ordering = ['name']
