from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from armory.models import Passive
from armory.serializers import PassiveSerializer


class PassiveViewSet(viewsets.ModelViewSet):
    """ViewSet para Passivas"""
    queryset = Passive.objects.all()
    serializer_class = PassiveSerializer
    permission_classes = [AllowAny]
