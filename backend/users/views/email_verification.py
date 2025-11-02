from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from allauth.account.models import EmailAddress
from django.core.mail import send_mail
from django.utils.translation import activate, get_language
from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_verification_email(request):
    """Reenvia email de confirmação para o usuário"""
    # Ativar idioma baseado no header Accept-Language
    language = request.META.get('HTTP_ACCEPT_LANGUAGE', 'pt-br')
    if language.startswith('en'):
        activate('en')
        is_english = True
    else:
        activate('pt-br')
        is_english = False
    
    user = request.user
    
    try:
        # Buscar o objeto EmailAddress
        email_obj = EmailAddress.objects.filter(user=user, email__iexact=user.email).first()
        
        if not email_obj:
            # Criar EmailAddress se não existir
            email_obj = EmailAddress.objects.create(
                user=user,
                email=user.email,
                primary=True,
                verified=False
            )
        
        # Enviar email de confirmação
        # O adapter já detecta o idioma do request automaticamente
        email_obj.send_confirmation(request)
        
        response_message = 'Confirmation email sent successfully. Check your inbox.' if is_english else 'Email de confirmação enviado com sucesso. Verifique sua caixa de entrada.'
        return Response({
            'detail': response_message
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        error_message = 'Error sending email' if is_english else 'Erro ao enviar email'
        return Response({
            'error': f'{error_message}: {str(e)}',
            'traceback': traceback.format_exc()
        }, status=status.HTTP_400_BAD_REQUEST)

