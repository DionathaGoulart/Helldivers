from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from allauth.account.models import EmailAddress
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_verification_email(request):
    """Reenvia email de confirmação para o usuário"""
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
        email_obj.send_confirmation(request)
        
        return Response({
            'detail': 'Email de confirmação enviado com sucesso. Verifique sua caixa de entrada.'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        return Response({
            'error': f'Erro ao enviar email: {str(e)}',
            'traceback': traceback.format_exc()
        }, status=status.HTTP_400_BAD_REQUEST)

