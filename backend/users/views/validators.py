from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from users.models import CustomUser


@api_view(['GET'])
@permission_classes([AllowAny])
def check_username(request):
    """Verifica se o username está disponível"""
    username = request.GET.get('username', '').strip()
    
    if not username:
        return Response({'available': False, 'message': 'Username não pode estar vazio'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Verifica se o username já existe
    exists = CustomUser.objects.filter(username__iexact=username).exists()
    
    return Response({
        'available': not exists,
        'username': username
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def check_email(request):
    """Verifica se o email está disponível"""
    from allauth.account.models import EmailAddress
    
    email = request.GET.get('email', '').strip().lower()
    
    if not email:
        return Response({'available': False, 'message': 'Email não pode estar vazio'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Verifica se o email já existe
    user_exists = CustomUser.objects.filter(email__iexact=email).exists()
    social_exists = EmailAddress.objects.filter(email__iexact=email).exists()
    
    return Response({
        'available': not user_exists and not social_exists,
        'email': email
    })

