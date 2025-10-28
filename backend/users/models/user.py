from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """Modelo customizado de usuário"""
    
    password_reset_token_used = models.BooleanField(default=False, help_text="Token de reset usado")
    
    def __str__(self):
        return self.username
