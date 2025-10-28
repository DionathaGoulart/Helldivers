from rest_framework import viewsets
from armory.models import Passive
from armory.serializers import PassiveSerializer


class PassiveViewSet(viewsets.ModelViewSet):
    """ViewSet para Passivas"""
    queryset = Passive.objects.all()
    serializer_class = PassiveSerializer
