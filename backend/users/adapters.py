from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings
from django.utils.translation import activate, get_language
from django.core.mail import EmailMessage
from django.template.loader import render_to_string


class CustomAccountAdapter(DefaultAccountAdapter):
    """Adapter customizado para usar URL do frontend e templates de email por idioma"""
    
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
    
    def render_mail(self, template_prefix, email, context, headers=None):
        """
        Renderiza email com template baseado no idioma atual
        """
        # Detectar idioma do request se disponível
        request = context.get('request') if isinstance(context, dict) else None
        if not request and hasattr(self, '_request'):
            request = self._request
        
        if request:
            language = request.META.get('HTTP_ACCEPT_LANGUAGE', 'pt-br')
            if language.startswith('en'):
                activate('en')
                is_english = True
            else:
                activate('pt-br')
                is_english = False
        else:
            is_english = get_language() == 'en'
        
        # Para emails de confirmação, criar template customizado
        if 'email_confirmation' in template_prefix:
            # Obter dados do contexto
            emailconfirmation = context.get('emailconfirmation') if isinstance(context, dict) else None
            if not emailconfirmation and hasattr(context, 'emailconfirmation'):
                emailconfirmation = context.emailconfirmation
            
            # Obter usuário
            user = None
            if isinstance(context, dict):
                user = context.get('user')
                if not user and emailconfirmation:
                    user = emailconfirmation.email_address.user
            elif hasattr(context, 'user'):
                user = context.user
            elif emailconfirmation:
                user = emailconfirmation.email_address.user
            
            username = user.username if user else 'User'
            
            # Obter URL de confirmação
            confirmation_url = None
            if emailconfirmation:
                confirmation_url = self.get_email_confirmation_url(request, emailconfirmation)
            elif isinstance(context, dict):
                confirmation_url = context.get('activate_url')
            
            if is_english:
                subject = "Please confirm your email - Gooddivers"
                message = f"""
Hello {username},

Please confirm your email address by clicking on the link below:

{confirmation_url}

If you did not request this confirmation, please ignore this email.

Best regards,
Gooddivers Team
                """
            else:
                subject = "Confirme seu email - Gooddivers"
                message = f"""
Olá {username},

Por favor, confirme seu endereço de email clicando no link abaixo:

{confirmation_url}

Se você não solicitou esta confirmação, ignore este email.

Atenciosamente,
Equipe do Gooddivers
                """
            
            msg = EmailMessage(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
            if headers:
                for k, v in headers.items():
                    msg[k] = v
            return msg
        
        # Para outros tipos de email, usar método padrão do allauth
        return super().render_mail(template_prefix, email, context, headers)

