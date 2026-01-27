from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from dj_rest_auth.views import LoginView, LogoutView
from dj_rest_auth.registration.views import RegisterView
from rest_framework_simplejwt.views import TokenRefreshView
from users.utils import set_auth_cookies, clear_auth_cookies
import logging

logger = logging.getLogger(__name__)


class CookieLoginView(LoginView):
    """
    View customizada de login que define cookies HttpOnly
    """
    def post(self, request, *args, **kwargs):
        try:
            logger.info(f"Tentativa de login recebida: {request.data.get('username') or request.data.get('email')}")
            
            # Chama a view original do dj-rest-auth
            response = super().post(request, *args, **kwargs)
            
            # ... (rest of logic)
            
        except ValidationError:
            # Re-raise validation errors so DRF can handle them (returns 400 instead of 500)
            raise
        except Exception as e:
            logger.exception(f"Erro na view de login: {str(e)}")
            # Retorna resposta de erro apropriada
            return Response(
                {'error': 'Erro interno ao processar login', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return response


class CookieRegisterView(RegisterView):
    """
    View customizada de registro que define cookies HttpOnly
    """
    def post(self, request, *args, **kwargs):
        # Chama a view original do dj-rest-auth
        response = super().post(request, *args, **kwargs)
        
        # Se registro foi bem-sucedido, define cookies
        if response.status_code == status.HTTP_201_CREATED:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')
            
            if access_token and refresh_token:
                set_auth_cookies(response, access_token, refresh_token)
                # Remove tokens do corpo da resposta por segurança
                response.data.pop('access', None)
                response.data.pop('refresh', None)
        
        return response


class CookieLogoutView(LogoutView):
    """
    View customizada de logout que limpa cookies
    """
    def post(self, request, *args, **kwargs):
        # Chama o logout do Django para limpar a sessão no banco/backend
        from django.contrib.auth import logout as django_logout
        django_logout(request)

        # Chama a view original do dj-rest-auth (que faz blacklist do token se configurado)
        response = super().post(request, *args, **kwargs)
        
        # Limpa cookies de autenticação (JWT)
        clear_auth_cookies(response)
        
        # Limpa cookies de sessão e CSRF (importante para quem logou via Admin)
        response.delete_cookie('sessionid', path='/')
        response.delete_cookie('csrftoken', path='/')
        
        return response


class CookieTokenRefreshView(TokenRefreshView):
    """
    View customizada de refresh token que atualiza cookies HttpOnly
    Lê o refresh token do cookie ao invés do body
    """
    def post(self, request, *args, **kwargs):
        # Obtém refresh token do cookie
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response(
                {'error': 'Refresh token não encontrado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cria nova requisição com refresh token do cookie no body
        # Se o body já tem refresh, usa o do cookie (prioridade)
        if hasattr(request, '_full_data'):
            request._full_data['refresh'] = refresh_token
        else:
            # Para request.data (QueryDict), precisamos criar novo
            from django.http import QueryDict
            new_data = QueryDict(mutable=True)
            new_data.update(request.data)
            new_data['refresh'] = refresh_token
            request._full_data = new_data
        
        # Chama a view original do simplejwt
        response = super().post(request, *args, **kwargs)
        
        # Se refresh foi bem-sucedido, atualiza cookies
        if response.status_code == status.HTTP_200_OK:
            access_token = response.data.get('access')
            # Refresh token pode ser rotacionado
            new_refresh_token = response.data.get('refresh')
            
            if access_token:
                # Se temos refresh token novo (rotação), atualiza ambos
                if new_refresh_token:
                    set_auth_cookies(response, access_token, new_refresh_token)
                    response.data.pop('refresh', None)
                else:
                    # Apenas atualiza access token
                    # Mantém o refresh token existente do cookie
                    from django.conf import settings
                    is_production = not settings.DEBUG
                    is_secure = is_production
                    samesite = 'None' if is_production else 'Lax'
                    
                    response.set_cookie(
                        'access_token',
                        access_token,
                        max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
                        httponly=True,
                        secure=is_secure,
                        samesite=samesite,
                        path='/',
                    )
                
                # Remove access token do corpo da resposta
                response.data.pop('access', None)
        
        return response


# Nota: As views são usadas diretamente nas URLs usando .as_view()
# Não precisamos de funções wrapper

