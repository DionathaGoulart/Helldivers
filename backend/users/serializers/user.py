from rest_framework import serializers
from users.models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    """Serializer para detalhes do usuário"""
    
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)
    
    def validate_username(self, username):
        """Valida se o username já existe"""
        # Verifica se outro usuário já tem esse username
        queryset = CustomUser.objects.filter(username__iexact=username)
        
        # Se estiver editando, excluir o próprio usuário da busca
        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)
        
        if queryset.exists():
            raise serializers.ValidationError(
                "Este nome de usuário já está em uso."
            )
        
        return username
    
    def validate_email(self, email):
        """Valida se o email já existe"""
        # Verifica se outro usuário já tem esse email
        queryset = CustomUser.objects.filter(email__iexact=email)
        
        # Se estiver editando, excluir o próprio usuário da busca
        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)
        
        if queryset.exists():
            raise serializers.ValidationError(
                "Este email já está em uso."
            )
        
        return email