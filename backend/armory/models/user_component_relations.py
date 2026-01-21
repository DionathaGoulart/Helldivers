from django.db import models
from django.conf import settings
from .helmet import Helmet
from .armor import Armor
from .cape import Cape


class BaseComponentRelation(models.Model):
    """Classe base para relações de componentes"""
    RELATION_TYPE_CHOICES = [
        ('favorite', 'Favorito'),
        ('collection', 'Coleção'),
        ('wishlist', 'Lista de Desejo'),
    ]

    relation_type = models.CharField(
        max_length=20,
        choices=RELATION_TYPE_CHOICES,
        verbose_name="Tipo de Relação"
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Data de Criação")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Data de Atualização")

    class Meta:
        abstract = True
        ordering = ['-created_at']


class UserHelmetRelation(BaseComponentRelation):
    """Relação entre usuário e capacetes"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='helmet_relations',
        verbose_name="Usuário"
    )
    helmet = models.ForeignKey(
        Helmet,
        on_delete=models.CASCADE,
        related_name='user_relations',
        verbose_name="Capacete"
    )

    class Meta(BaseComponentRelation.Meta):
        verbose_name = "Relação Usuário-Capacete"
        verbose_name_plural = "Relações Usuário-Capacete"
        unique_together = [['user', 'helmet', 'relation_type']]
        indexes = [
            models.Index(fields=['user', 'relation_type']),
            models.Index(fields=['helmet', 'relation_type']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.helmet.name} ({self.get_relation_type_display()})"


class UserArmorRelation(BaseComponentRelation):
    """Relação entre usuário e armaduras"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='armor_relations',
        verbose_name="Usuário"
    )
    armor = models.ForeignKey(
        Armor,
        on_delete=models.CASCADE,
        related_name='user_relations',
        verbose_name="Armadura"
    )

    class Meta(BaseComponentRelation.Meta):
        verbose_name = "Relação Usuário-Armadura"
        verbose_name_plural = "Relações Usuário-Armadura"
        unique_together = [['user', 'armor', 'relation_type']]
        indexes = [
            models.Index(fields=['user', 'relation_type']),
            models.Index(fields=['armor', 'relation_type']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.armor.name} ({self.get_relation_type_display()})"


class UserCapeRelation(BaseComponentRelation):
    """Relação entre usuário e capas"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cape_relations',
        verbose_name="Usuário"
    )
    cape = models.ForeignKey(
        Cape,
        on_delete=models.CASCADE,
        related_name='user_relations',
        verbose_name="Capa"
    )

    class Meta(BaseComponentRelation.Meta):
        verbose_name = "Relação Usuário-Capa"
        verbose_name_plural = "Relações Usuário-Capa"
        unique_together = [['user', 'cape', 'relation_type']]
        indexes = [
            models.Index(fields=['user', 'relation_type']),
            models.Index(fields=['cape', 'relation_type']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.cape.name} ({self.get_relation_type_display()})"
