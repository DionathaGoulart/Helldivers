from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """Modelo customizado de usuário"""
    
    def __str__(self):
        return self.username
