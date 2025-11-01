from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from allauth.account.models import EmailAddress
from allauth.socialaccount.models import SocialAccount, SocialToken
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from decouple import config
from users.serializers import UserSerializer
from users.utils import set_auth_cookies, encrypt_oauth_token, decrypt_oauth_token
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Endpoint para autenticação via Google OAuth
    Cria/atualiza usuário e registra a conta social
    """
    try:
        # Log da requisição recebida
        logger.info(f"Dados recebidos: {request.data}")
        
        code = request.data.get('code')
        redirect_uri = request.data.get('redirect_uri')
        
        if not code:
            logger.error("Código de autorização não fornecido")
            return Response(
                {'error': 'Código de autorização não fornecido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not redirect_uri:
            logger.error("redirect_uri não fornecido")
            return Response(
                {'error': 'redirect_uri não fornecido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Troca o código por um access token do Google
        token_url = 'https://oauth2.googleapis.com/token'
        token_data = {
            'client_id': config('GOOGLE_CLIENT_ID'),
            'client_secret': config('GOOGLE_SECRET'),
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri,
        }
        
        logger.info(f"Solicitando token ao Google com redirect_uri: {redirect_uri}")
        token_response = requests.post(token_url, data=token_data)
        
        if token_response.status_code != 200:
            logger.error(f"Erro do Google: {token_response.text}")
            return Response(
                {
                    'error': 'Falha ao obter token do Google',
                    'details': token_response.json() if token_response.text else 'Sem detalhes'
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        token_json = token_response.json()
        access_token = token_json.get('access_token')
        refresh_token = token_json.get('refresh_token', '')
        expires_in = token_json.get('expires_in', 3600)
        
        if not access_token:
            logger.error("Token de acesso não recebido do Google")
            return Response(
                {'error': 'Token de acesso não recebido do Google'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtém informações do usuário do Google
        user_info_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
        user_response = requests.get(
            user_info_url, 
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        if user_response.status_code != 200:
            logger.error(f"Erro ao obter info do usuário: {user_response.text}")
            return Response(
                {'error': 'Falha ao obter informações do usuário'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user_info = user_response.json()
        logger.info(f"Informações do usuário obtidas: {user_info.get('email')}")
        
        email = user_info.get('email')
        google_id = user_info.get('id')
        first_name = user_info.get('given_name', '')
        last_name = user_info.get('family_name', '')
        
        if not email or not google_id:
            logger.error("Dados incompletos do Google")
            return Response(
                {'error': 'Dados incompletos do Google'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        User = get_user_model()
        
        # Verifica se já existe conta Google
        social_account = SocialAccount.objects.filter(
            provider='google',
            uid=google_id
        ).first()
        
        if social_account:
            # Usuário já existe com Google
            logger.info(f"Usuário existente encontrado: {social_account.user.email}")
            user = social_account.user
            if first_name:
                user.first_name = first_name
            if last_name:
                user.last_name = last_name
            user.save()
            
            social_account.extra_data = user_info
            social_account.save()
        else:
            # Verifica se existe usuário com esse email
            try:
                user = User.objects.get(email=email)
                logger.info(f"Usuário com email {email} já existe, vinculando conta Google")
            except User.DoesNotExist:
                # Cria novo usuário
                username = email.split('@')[0]
                counter = 1
                original_username = username
                while User.objects.filter(username=username).exists():
                    username = f"{original_username}{counter}"
                    counter += 1
                
                logger.info(f"Criando novo usuário: {username}")
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                )
            
            # Cria o SocialAccount
            social_account = SocialAccount.objects.create(
                user=user,
                provider='google',
                uid=google_id,
                extra_data=user_info
            )
            logger.info("SocialAccount criado")
        
        # Gerencia EmailAddress
        email_address, created = EmailAddress.objects.get_or_create(
            user=user,
            email__iexact=email,
            defaults={
                'email': email,
                'verified': True,
                'primary': True,
            }
        )
        
        if not email_address.verified:
            email_address.verified = True
            email_address.save()
        
        # Guarda os tokens OAuth criptografados
        # Criptografa antes de armazenar para segurança
        encrypted_access_token = encrypt_oauth_token(access_token) if access_token else None
        encrypted_refresh_token = encrypt_oauth_token(refresh_token) if refresh_token else None
        
        SocialToken.objects.update_or_create(
            account=social_account,
            defaults={
                'token': encrypted_access_token,
                'token_secret': encrypted_refresh_token,
                'expires_at': timezone.now() + timedelta(seconds=expires_in)
            }
        )
        
        # Gera tokens JWT
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        logger.info(f"Login bem-sucedido para {user.email}")
        
        # Cria resposta com dados do usuário
        response = Response({
            'user': UserSerializer(user).data
        })
        
        # Define cookies HttpOnly seguros
        set_auth_cookies(response, access_token, refresh_token)
        
        return response
        
    except Exception as e:
        logger.exception(f"Erro na autenticação Google: {str(e)}")
        return Response(
            {'error': f'Erro interno: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )