from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()


class CustomPasswordResetForm(PasswordResetForm):
    """
    Form customizado para reset de senha
    Gera links para o frontend ao invés do backend
    """
    
    def save(self, request=None, **kwargs):
        """
        Sobrescreve o método save para usar a URL do frontend
        """
        # Chama o método pai mas com nossa URL customizada
        from django.core.mail import send_mail
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes
        
        users = self.get_users(self.cleaned_data['email'])
        
        # URL do frontend - usar do settings (que já foi detectado automaticamente se necessário)
        frontend_url = getattr(settings, 'FRONTEND_URL', None)
        if not frontend_url:
            # Se ainda não estiver definido, usar localhost apenas em desenvolvimento
            frontend_url = 'http://localhost:3000' if settings.DEBUG else None
            if not frontend_url:
                # Em produção sem FRONTEND_URL, tentar detectar do CORS
                cors_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
                if cors_origins:
                    # Pegar primeiro origin que não seja localhost
                    for origin in cors_origins:
                        if 'localhost' not in origin.lower() and '127.0.0.1' not in origin.lower():
                            frontend_url = origin
                            break
                    # Se não encontrou, usar o primeiro mesmo
                    if not frontend_url:
                        frontend_url = cors_origins[0] if cors_origins else 'http://localhost:3000'
                else:
                    frontend_url = 'http://localhost:3000'
        
        for user in users:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            
            # URL do frontend
            reset_url = f"{frontend_url}/reset-password/{uid}/{token}/"
            
            subject = "Redefinição de senha - Helldivers 2"
            message = f"""
Olá {user.username},

Você solicitou a redefinição de senha para sua conta.

Clique no link abaixo para redefinir sua senha:

{reset_url}

Se você não solicitou esta redefinição, ignore este email.

Atenciosamente,
Equipe Helldivers 2
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

