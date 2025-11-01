"""
Utilitários para trabalhar com tokens OAuth criptografados
"""

from users.utils import decrypt_oauth_token
from allauth.socialaccount.models import SocialToken, SocialAccount
from django.contrib.auth import get_user_model


def get_decrypted_google_token(user, token_type='access'):
    """
    Obtém e descriptografa um token OAuth do Google para um usuário
    
    Args:
        user: Instância do usuário ou ID do usuário
        token_type: 'access' para access_token ou 'refresh' para refresh_token
    
    Returns:
        Token descriptografado ou None se não encontrado
    """
    User = get_user_model()
    
    # Converte para objeto User se for ID
    if isinstance(user, int):
        try:
            user = User.objects.get(id=user)
        except User.DoesNotExist:
            return None
    
    # Busca a conta social do Google
    try:
        social_account = SocialAccount.objects.get(
            user=user,
            provider='google'
        )
    except SocialAccount.DoesNotExist:
        return None
    
    # Busca o token social
    try:
        social_token = SocialToken.objects.get(account=social_account)
    except SocialToken.DoesNotExist:
        return None
    
    # Obtém o token baseado no tipo
    if token_type == 'access':
        encrypted_token = social_token.token
    elif token_type == 'refresh':
        encrypted_token = social_token.token_secret
    else:
        return None
    
    # Descriptografa e retorna
    return decrypt_oauth_token(encrypted_token)


def is_token_valid(social_token):
    """
    Verifica se um token social ainda é válido (não expirou)
    
    Args:
        social_token: Instância de SocialToken
    
    Returns:
        True se válido, False caso contrário
    """
    from django.utils import timezone
    
    if not social_token.expires_at:
        return True  # Token sem expiração definida
    
    return social_token.expires_at > timezone.now()

