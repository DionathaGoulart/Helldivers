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
from django.conf import settings

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset(request):
    """
    Endpoint customizado para reset de senha
    Envia email com link para o FRONTEND
    """
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'email': ['Este campo é obrigatório.']},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Buscar usuário por email
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Não revelar que o email não existe (segurança)
        return Response(
            {'detail': 'Se o email existir, você receberá instruções para redefinir sua senha.'},
            status=status.HTTP_200_OK
        )
    
    # Limpar flag de token usado (para permitir novo reset)
    user.password_reset_token_used = False
    user.save(update_fields=['password_reset_token_used'])
    
    # Gerar token e uid
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    
    # URL do frontend
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    reset_url = f"{frontend_url}/reset-password/{uid}/{token}/"
    
    # Preparar email
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
    
    # Enviar email
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
    
    return Response(
        {'detail': 'Se o email existir, você receberá instruções para redefinir sua senha.'},
        status=status.HTTP_200_OK
    )

