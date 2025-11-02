from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings


class CustomAccountAdapter(DefaultAccountAdapter):
    """Adapter customizado para usar URL do frontend"""
    
    def get_email_confirmation_url(self, request, emailconfirmation):
        """Retorna URL do frontend para confirmação de email"""
        # Tentar obter FRONTEND_URL do settings
        frontend_url = getattr(settings, 'FRONTEND_URL', None)
        
        # Se não estiver definido, tentar detectar do request em produção
        if not frontend_url and request:
            # Em produção, tentar obter do origin da requisição
            if hasattr(request, 'META') and 'HTTP_ORIGIN' in request.META:
                # Usar o origin da requisição como base
                origin = request.META['HTTP_ORIGIN']
                # Remover trailing slash se houver
                frontend_url = origin.rstrip('/')
            elif hasattr(request, 'META') and 'HTTP_REFERER' in request.META:
                # Se não tiver origin, tentar do referer
                from urllib.parse import urlparse
                referer = request.META['HTTP_REFERER']
                parsed = urlparse(referer)
                frontend_url = f"{parsed.scheme}://{parsed.netloc}"
        
        # Se ainda não tiver, usar o settings.FRONTEND_URL (que pode ter sido detectado automaticamente)
        if not frontend_url:
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        
        return f"{frontend_url}/confirm-email/{emailconfirmation.key}/"

