from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import PasswordResetForm
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils.translation import activate, get_language
from django.conf import settings

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset(request):
    """
    Endpoint customizado para reset de senha
    Envia email com link para o FRONTEND
    """
    # Ativar idioma baseado no header Accept-Language
    language = request.META.get('HTTP_ACCEPT_LANGUAGE', 'pt-br')
    if language.startswith('en'):
        activate('en')
        is_english = True
    else:
        activate('pt-br')
        is_english = False
    
    email = request.data.get('email')
    
    if not email:
        message = 'This field is required.' if is_english else 'Este campo é obrigatório.'
        return Response(
            {'email': [message]},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Buscar usuário por email
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Não revelar que o email não existe (segurança)
        message = 'If the email exists, you will receive instructions to reset your password.' if is_english else 'Se o email existir, você receberá instruções para redefinir sua senha.'
        return Response(
            {'detail': message},
            status=status.HTTP_200_OK
        )
    
    # Limpar flag de token usado (para permitir novo reset)
    user.password_reset_token_used = False
    user.save(update_fields=['password_reset_token_used'])
    
    # Gerar token e uid
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    
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
    
    reset_url = f"{frontend_url}/reset-password/{uid}/{token}/"
    
    # Preparar email com template baseado no idioma
    if is_english:
        subject = "Password Reset - Gooddivers"
        message = f"""
Hello {user.username},

You requested to reset your password for your account.

Click on the link below to reset your password:

{reset_url}

If you did not request this reset, please ignore this email.

Best regards,
Gooddivers Team
        """
    else:
        subject = "Redefinição de senha - Gooddivers"
        message = f"""
Olá {user.username},

Você solicitou a redefinição de senha para sua conta.

Clique no link abaixo para redefinir sua senha:

{reset_url}

Se você não solicitou esta redefinição, ignore este email.

Atenciosamente,
Equipe do Gooddivers
        """
    
    # Enviar email
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
    
    response_message = 'If the email exists, you will receive instructions to reset your password.' if is_english else 'Se o email existir, você receberá instruções para redefinir sua senha.'
    return Response(
        {'detail': response_message},
        status=status.HTTP_200_OK
    )

