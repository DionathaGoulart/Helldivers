from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from allauth.socialaccount.models import SocialAccount
from allauth.account.models import EmailAddress
from users.serializers import UserSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    """Dashboard com informações completas do usuário"""
    user = request.user
    
    # Verifica se tem conta social
    social_accounts = SocialAccount.objects.filter(user=user)
    has_social = social_accounts.exists()
    providers = [acc.provider for acc in social_accounts] if has_social else []
    
    # Verifica se email está verificado
    email_obj = EmailAddress.objects.filter(user=user, email__iexact=user.email).first()
    email_verified = email_obj.verified if email_obj else False
    
    return Response({
        'user': UserSerializer(user).data,
        'account_info': {
            'has_social_auth': has_social,
            'providers': providers,
            'email_verified': email_verified,
            'date_joined': user.date_joined,
            'last_login': user.last_login,
        },
        'message': f'Bem-vindo ao dashboard, {user.username}!'
    })