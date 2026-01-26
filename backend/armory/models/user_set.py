from django.db import models
from django.conf import settings
from .helmet import Helmet
from .armor import Armor
from .cape import Cape
from weaponry.models import PrimaryWeapon, SecondaryWeapon, Throwable
from booster.models import Booster
from stratagems.models import Stratagem

class UserSet(models.Model):
    """Conjunto de armadura criado pelo usuário (Loadout)"""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_sets',
        verbose_name="Criador"
    )
    
    name = models.CharField(
        max_length=100, 
        verbose_name="Nome do Set"
    )
    
    image = models.ImageField(
        upload_to='user_sets/',
        blank=True,
        null=True,
        verbose_name="Imagem do Set"
    )

    description = models.TextField(
        blank=True,
        verbose_name="Descrição (Markdown)"
    )
    
    # Armor Components (Legacy + Current)
    helmet = models.ForeignKey(
        Helmet,
        on_delete=models.CASCADE,
        verbose_name="Capacete"
    )
    
    armor = models.ForeignKey(
        Armor,
        on_delete=models.CASCADE,
        verbose_name="Armadura"
    )
    
    cape = models.ForeignKey(
        Cape,
        on_delete=models.CASCADE,
        verbose_name="Capa"
    )

    # Full Loadout Components (New)
    primary = models.ForeignKey(
        PrimaryWeapon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Arma Primária"
    )

    secondary = models.ForeignKey(
        SecondaryWeapon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Arma Secundária"
    )

    throwable = models.ForeignKey(
        Throwable,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Granada/Arremessável"
    )

    booster = models.ForeignKey(
        Booster,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Booster"
    )

    stratagems = models.ManyToManyField(
        Stratagem,
        blank=True,
        verbose_name="Estratagemas"
    )
    
    # Configurações
    is_public = models.BooleanField(
        default=False,
        verbose_name="Público?"
    )
    
    # Likes
    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='liked_sets',
        blank=True,
        verbose_name="Curtidas"
    )

    favorites = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='favorite_sets',
        blank=True,
        verbose_name="Favoritos"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Set de Usuário"
        verbose_name_plural = "Sets de Usuário"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} por {self.user.username}"
    
    @property
    def total_likes(self):
        return self.likes.count()
