"""
Autenticação customizada para JWT com suporte a cookies HttpOnly
"""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.conf import settings


class CookieJWTAuthentication(JWTAuthentication):
    """
    Autenticação JWT que suporta tokens em cookies HttpOnly
    Fallback para header Authorization para compatibilidade
    """
    
    def authenticate(self, request):
        """
        Tenta autenticar usando cookies HttpOnly primeiro,
        depois tenta o header Authorization como fallback
        """
        # Primeiro tenta obter token do cookie
        access_token = request.COOKIES.get('access_token')
        
        if access_token:
            try:
                # Valida e retorna usuário autenticado
                validated_token = self.get_validated_token(access_token)
                user = self.get_user(validated_token)
                return (user, validated_token)
            except InvalidToken:
                # Se o token do cookie é inválido, tenta o header
                pass
        
        # Fallback para autenticação via header Authorization
        return super().authenticate(request)


class CookieRefreshJWTAuthentication(JWTAuthentication):
    """
    Autenticação para refresh tokens de cookies HttpOnly
    """
    
    def authenticate(self, request):
        """
        Obtém refresh token do cookie para renovação
        """
        refresh_token = request.COOKIES.get('refresh_token')
        
        if refresh_token:
            try:
                validated_token = self.get_validated_token(refresh_token)
                user = self.get_user(validated_token)
                return (user, validated_token)
            except InvalidToken:
                raise AuthenticationFailed('Token de refresh inválido')
        
        # Se não tem cookie, tenta header (compatibilidade)
        return super().authenticate(request)

