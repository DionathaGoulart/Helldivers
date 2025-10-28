from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model


User = get_user_model()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Endpoint seguro para trocar senha
    REQUER: senha antiga correta
    """
    old_password = request.data.get('old_password')
    new_password1 = request.data.get('new_password1')
    new_password2 = request.data.get('new_password2')
    
    # Validações básicas
    if not old_password:
        return Response(
            {'error': 'Senha atual é obrigatória'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not new_password1 or not new_password2:
        return Response(
            {'error': 'Nova senha é obrigatória'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if new_password1 != new_password2:
        return Response(
            {'error': 'As novas senhas não coincidem'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # ⚠️ VALIDAÇÃO CRÍTICA: Verificar senha antiga
    user = authenticate(
        username=request.user.username,
        password=old_password
    )
    
    # Se authenticate retornar None, a senha está errada
    if user is None:
        return Response(
            {'error': 'Senha atual incorreta'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validar nova senha
    try:
        validate_password(new_password1, user=request.user)
    except ValidationError as e:
        return Response(
            {'error': list(e.messages)},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Tudo OK, trocar senha
    user = request.user
    user.set_password(new_password1)
    user.save()
    
    return Response(
        {'message': 'Senha alterada com sucesso'},
        status=status.HTTP_200_OK
    )

