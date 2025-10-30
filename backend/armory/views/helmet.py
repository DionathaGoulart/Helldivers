from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from armory.models import Helmet
from armory.serializers import HelmetSerializer


class HelmetViewSet(viewsets.ModelViewSet):
    """ViewSet para Capacetes"""
    queryset = Helmet.objects.all()
    serializer_class = HelmetSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = {
        'cost': ['lte', 'gte'],
    }
    search_fields = ['name', 'source']
    ordering_fields = ['name', 'cost', 'created_at']
    ordering = ['name']
