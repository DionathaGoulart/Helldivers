from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from armory.models import Pass
from armory.serializers import PassSerializer, PassListSerializer


class PassViewSet(viewsets.ModelViewSet):
    """ViewSet para Passes de Batalha"""
    queryset = Pass.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    search_fields = ['name']
    ordering_fields = ['name', 'custo_supercreditos', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        """Usa serializer simplificado para listagens"""
        if self.action == 'list':
            return PassListSerializer
        return PassSerializer

