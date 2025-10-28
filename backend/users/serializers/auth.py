from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from allauth.account.models import EmailAddress
from users.models import CustomUser


class CustomRegisterSerializer(RegisterSerializer):
    """Serializer customizado para registro"""
    
    first_name = serializers.CharField(required=False, allow_blank=True, error_messages={'required': 'O campo Nome é obrigatório.'})
    last_name = serializers.CharField(required=False, allow_blank=True, error_messages={'required': 'O campo Sobrenome é obrigatório.'})
    
    def validate(self, attrs):
        """Validação customizada para garantir que todos os campos sejam preenchidos"""
        errors = {}
        
        # Validar Nome
        if not attrs.get('first_name', '').strip():
            errors['first_name'] = ['O campo Nome é obrigatório.']
        
        # Validar Sobrenome
        if not attrs.get('last_name', '').strip():
            errors['last_name'] = ['O campo Sobrenome é obrigatório.']
        
        # Se houver erros, lançar exceção
        if errors:
            raise serializers.ValidationError(errors)
        
        return attrs
    
    def validate_email(self, email):
        """Valida se o email já está sendo usado"""
        email = email.lower()
        user_exists = CustomUser.objects.filter(email__iexact=email).exists()
        social_exists = EmailAddress.objects.filter(email__iexact=email).exists()
        
        if user_exists or social_exists:
            raise serializers.ValidationError(
                "Este email já está sendo usado. "
                "Se você já tem uma conta, faça login."
            )
        return email
    
    def validate_username(self, username):
        """Valida se o username já existe"""
        if CustomUser.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError(
                "Este nome de usuário já está sendo usado."
            )
        return username
    
    def get_cleaned_data(self):
        """Retorna os dados limpos incluindo first_name e last_name"""
        data = super().get_cleaned_data()
        data['first_name'] = self.validated_data.get('first_name', '')
        data['last_name'] = self.validated_data.get('last_name', '')
        return data
    
    def save(self, request):
        """Salva o usuário com os dados adicionais"""
        user = super().save(request)
        user.first_name = self.validated_data.get('first_name', '')
        user.last_name = self.validated_data.get('last_name', '')
        user.save()
        return user