from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Booster
from .serializers import BoosterSerializer

class BoosterViewSet(viewsets.ModelViewSet):
    queryset = Booster.objects.all()
    serializer_class = BoosterSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ['name', 'name_pt_br']
    ordering_fields = ['name', 'cost', 'created_at']
