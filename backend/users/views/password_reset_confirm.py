from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.utils.http import urlsafe_base64_decode
from django.core.exceptions import ValidationError
from django.utils.encoding import force_str
from django.utils.translation import activate, get_language
from datetime import datetime, timedelta
from django.utils import timezone

User = get_user_model()


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """
    Endpoint customizado para confirmar reset de senha
    """
    # Ativar idioma baseado no header Accept-Language
    language = request.META.get('HTTP_ACCEPT_LANGUAGE', 'pt-br')
    if language.startswith('en'):
        activate('en')
    else:
        activate('pt-br')
    
    # Se for GET, verificar se o token é válido e não foi usado
    if request.method == 'GET':
        uid = request.GET.get('uid')
        token = request.GET.get('token')
        
        if not uid or not token:
            message = 'Invalid link' if get_language() == 'en' else 'Link inválido'
            return Response(
                {'error': message},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            uid_decoded = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid_decoded)
            
            # Verificar token
            if not default_token_generator.check_token(user, token):
                message = 'Link expired or invalid. Request a new recovery link.' if get_language() == 'en' else 'Link expirado ou inválido. Solicite um novo link de recuperação.'
                return Response(
                    {'error': message},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar se o token já foi usado
            try:
                if user.password_reset_token_used:
                    message = 'This recovery link has already been used. Request a new link.' if get_language() == 'en' else 'Este link de recuperação já foi utilizado. Solicite um novo link.'
                    return Response(
                        {'error': message},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except AttributeError:
                pass
            
            # Token válido e não usado
            return Response({'valid': True}, status=status.HTTP_200_OK)
            
        except (TypeError, ValueError, OverflowError):
            message = 'Invalid link' if get_language() == 'en' else 'Link inválido'
            return Response(
                {'error': message},
                status=status.HTTP_400_BAD_REQUEST
            )
        except User.DoesNotExist:
            message = 'Invalid link' if get_language() == 'en' else 'Link inválido'
            return Response(
                {'error': message},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            message = 'Error' if get_language() == 'en' else 'Erro'
            return Response(
                {'error': f'{message}: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # POST: processar a mudança de senha
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password1 = request.data.get('new_password1')
    new_password2 = request.data.get('new_password2')
    
    if not all([uid, token, new_password1, new_password2]):
        message = 'All fields are required' if get_language() == 'en' else 'Todos os campos são obrigatórios'
        return Response(
            {'error': message},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if new_password1 != new_password2:
        message = 'Passwords do not match' if get_language() == 'en' else 'As senhas não coincidem'
        return Response(
            {'error': message},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Decodificar uid e buscar usuário
        uid_decoded = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=uid_decoded)
        
        # Verificar token
        if not default_token_generator.check_token(user, token):
            message = 'Link expired or invalid. Request a new recovery link.' if get_language() == 'en' else 'Link expirado ou inválido. Solicite um novo link de recuperação.'
            return Response(
                {'error': message},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar se o token já foi usado
        try:
            if user.password_reset_token_used:
                message = 'This recovery link has already been used. Request a new link.' if get_language() == 'en' else 'Este link de recuperação já foi utilizado. Solicite um novo link.'
                return Response(
                    {'error': message},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except AttributeError:
            pass
        
        # Validar nova senha PRIMEIRO (antes de marcar token como usado)
        try:
            validate_password(new_password1, user=user)
        except ValidationError as e:
            return Response(
                {'error': list(e.messages)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar se a mesma senha está sendo usada
        try:
            if user.has_usable_password() and user.check_password(new_password1):
                message = 'This is already your current password. Use a different password.' if get_language() == 'en' else 'Esta já é sua senha atual. Use uma senha diferente.'
                return Response(
                    {'error': message},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except:
            pass  # Se não conseguir verificar, continua
        
        # Tudo validado! Agora definir nova senha E marcar token como usado
        user.set_password(new_password1)
        
        # Marcar token como usado APENAS APÓS validações OK
        try:
            user.password_reset_token_used = True
            user.save(update_fields=['password', 'password_reset_token_used'])
        except AttributeError:
            user.save(update_fields=['password'])
        
        message = 'Password reset successfully' if get_language() == 'en' else 'Senha redefinida com sucesso'
        return Response(
            {'message': message},
            status=status.HTTP_200_OK
        )
        
    except (TypeError, ValueError, OverflowError):
        message = 'Invalid data' if get_language() == 'en' else 'Dados inválidos'
        return Response(
            {'error': message},
            status=status.HTTP_400_BAD_REQUEST
        )
    except User.DoesNotExist:
        message = 'User not found' if get_language() == 'en' else 'Usuário não encontrado'
        return Response(
            {'error': message},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        message = 'Error resetting password' if get_language() == 'en' else 'Erro ao redefinir senha'
        return Response(
            {'error': f'{message}: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )

