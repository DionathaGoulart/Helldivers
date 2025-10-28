from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings


class CustomAccountAdapter(DefaultAccountAdapter):
    """Adapter customizado para usar URL do frontend"""
    
    def get_email_confirmation_url(self, request, emailconfirmation):
        """Retorna URL do frontend para confirmação de email"""
        return f"{settings.FRONTEND_URL}/confirm-email/{emailconfirmation.key}/"

