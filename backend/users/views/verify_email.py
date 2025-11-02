from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from allauth.account.models import EmailConfirmation, EmailConfirmationHMAC, EmailAddress
from django.utils.translation import gettext_lazy as _, activate, get_language
import logging

logger = logging.getLogger(__name__)


from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """Verifica o email do usuário usando a key"""
    # Ativar idioma baseado no header Accept-Language
    language = request.META.get('HTTP_ACCEPT_LANGUAGE', 'pt-br')
    if language.startswith('en'):
        activate('en')
    else:
        activate('pt-br')
    
    key = request.data.get('key')
    
    logger.error(f"Dados recebidos (raw): key={key}")
    
    if not key:
        message = 'Key is required' if get_language() == 'en' else 'Key é obrigatória'
        return Response(
            {'detail': message},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Decodificar URL encoding se necessário
    from urllib.parse import unquote
    key = unquote(key)
    logger.error(f"Dados decodificados: key={key}")
    
    try:
        # Tentar buscar a confirmação usando HMAC
        logger.error("Tentando buscar confirmação usando EmailConfirmationHMAC...")
        confirmation = None
        
        try:
            confirmation = EmailConfirmationHMAC.from_key(key)
            logger.error(f"Confirmação HMAC encontrada: {confirmation}")
        except Exception as e:
            logger.error(f"Erro ao buscar HMAC: {str(e)}")
            # Tentar buscar confirmação normal
            try:
                # Tentar buscar por ID diretamente
                if ':' in key:
                    parts = key.split(':')
                    if len(parts) >= 2:
                        email_address_id = parts[1]
                        logger.error(f"Tentando buscar por email_address_id: {email_address_id}")
                        from allauth.account.models import EmailConfirmation as EC
                        confirmation_obj = EC.objects.filter(email_address_id=email_address_id).first()
                        if confirmation_obj:
                            confirmation = EmailConfirmationHMAC(confirmation_obj)
                            logger.error(f"Confirmação encontrada via ID: {confirmation}")
            except Exception as e2:
                logger.error(f"Erro ao buscar por ID: {str(e2)}")
        
        if confirmation:
            logger.error(f"Usando confirmação: {confirmation}")
            
            # Verificar se já foi confirmado
            if confirmation.email_address.verified:
                logger.error("Email já confirmado")
                message = 'Email already confirmed' if get_language() == 'en' else 'Email já foi confirmado anteriormente'
                return Response(
                    {'detail': message},
                    status=status.HTTP_200_OK
                )
            
            # Confirmar o email
            logger.error("Confirmando email...")
            confirmation.confirm(request)
            logger.error("Email confirmado com sucesso")
            
            message = 'Email confirmed successfully' if get_language() == 'en' else 'Email confirmado com sucesso'
            return Response(
                {'detail': message},
                status=status.HTTP_200_OK
            )
        
        logger.error("Nenhuma confirmação encontrada")
        message = 'Confirmation link is invalid or expired' if get_language() == 'en' else 'Link de confirmação inválido ou expirado'
        return Response(
            {'detail': message},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    except Exception as e:
        import traceback
        logger.error(f"Erro: {str(e)}")
        logger.error(traceback.format_exc())
        message = 'Error confirming email' if get_language() == 'en' else 'Erro ao confirmar email'
        return Response(
            {'detail': f'{message}: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )

