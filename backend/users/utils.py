"""
Utilitários para autenticação e cookies seguros
"""

from django.conf import settings
from datetime import timedelta
from cryptography.fernet import Fernet
from decouple import config
import base64
import hashlib
import os


def set_auth_cookies(response, access_token, refresh_token):
    """
    Define cookies HttpOnly seguros para tokens de autenticação
    
    Args:
        response: HttpResponse object
        access_token: Token de acesso JWT
        refresh_token: Token de refresh JWT
    """
    # Configurações de segurança
    is_secure = not settings.DEBUG  # HTTPS apenas em produção
    samesite = 'None' if not settings.DEBUG else 'Lax'
    
    # Cookie para access token (HttpOnly)
    response.set_cookie(
        'access_token',
        access_token,
        max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
        httponly=True,
        secure=is_secure,
        samesite=samesite,
        path='/',
    )
    
    # Cookie para refresh token (HttpOnly)
    response.set_cookie(
        'refresh_token',
        refresh_token,
        max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
        httponly=True,
        secure=is_secure,
        samesite=samesite,
        path='/',
    )
    
    return response


def clear_auth_cookies(response):
    """
    Remove cookies de autenticação
    
    Args:
        response: HttpResponse object
    """
    response.delete_cookie('access_token', path='/')
    response.delete_cookie('refresh_token', path='/')
    return response


# ============================================================================
# CRIPTOGRAFIA PARA TOKENS OAUTH
# ============================================================================

def _get_encryption_key():
    """
    Obtém a chave de criptografia da variável de ambiente ou gera uma baseada no SECRET_KEY
    """
    # Tenta obter chave customizada do .env
    encryption_key = config('OAUTH_ENCRYPTION_KEY', default=None)
    
    if encryption_key:
        # Se fornecida, valida e usa
        try:
            # Fernet precisa de uma chave de 32 bytes em base64
            key_bytes = base64.urlsafe_b64decode(encryption_key + '==')[:32]
            return base64.urlsafe_b64encode(key_bytes)
        except:
            pass
    
    # Se não foi fornecida, gera uma baseada no SECRET_KEY do Django
    # Isso garante que seja determinística mas ainda segura
    secret_key = settings.SECRET_KEY
    key_hash = hashlib.sha256(secret_key.encode()).digest()
    return base64.urlsafe_b64encode(key_hash)


def encrypt_oauth_token(token: str) -> str:
    """
    Criptografa um token OAuth antes de armazenar no banco
    
    Args:
        token: Token OAuth em texto plano
        
    Returns:
        Token criptografado em base64
    """
    if not token:
        return token
    
    try:
        key = _get_encryption_key()
        fernet = Fernet(key)
        encrypted_token = fernet.encrypt(token.encode())
        # Retorna em formato que pode ser salvo no banco
        return base64.urlsafe_b64encode(encrypted_token).decode()
    except Exception as e:
        # Em caso de erro, loga mas não quebra a aplicação
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Erro ao criptografar token OAuth: {str(e)}")
        # Por segurança, retorna None ao invés do token em texto plano
        return None


def decrypt_oauth_token(encrypted_token: str) -> str:
    """
    Descriptografa um token OAuth do banco
    
    Args:
        encrypted_token: Token criptografado em base64
        
    Returns:
        Token OAuth em texto plano
    """
    if not encrypted_token:
        return encrypted_token
    
    try:
        key = _get_encryption_key()
        fernet = Fernet(key)
        # Decodifica de base64 primeiro
        token_bytes = base64.urlsafe_b64decode(encrypted_token.encode())
        decrypted_token = fernet.decrypt(token_bytes)
        return decrypted_token.decode()
    except Exception as e:
        # Em caso de erro, loga e retorna None
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Erro ao descriptografar token OAuth: {str(e)}")
        return None

