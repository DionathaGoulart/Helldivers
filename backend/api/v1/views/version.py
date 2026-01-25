from rest_framework.views import APIView
from rest_framework.response import Response
from common.models import GlobalVersion

class GlobalVersionView(APIView):
    """
    Retorna o timestamp da última atualização global.
    """
    permission_classes = []  # Público

    def get(self, request):
        version, _ = GlobalVersion.objects.get_or_create(resource='global')
        return Response({
            'updated_at': version.updated_at.isoformat()
        })
