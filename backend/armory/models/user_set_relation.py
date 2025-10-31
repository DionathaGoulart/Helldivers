from django.db import models
from django.conf import settings
from .set import ArmorSet


class UserArmorSetRelationManager(models.Manager):
    """Manager personalizado para facilitar queries por tipo de relação"""
    
    def favorites(self):
        """Retorna apenas as relações do tipo favorito"""
        return self.filter(relation_type='favorite')
    
    def collection(self):
        """Retorna apenas as relações do tipo coleção"""
        return self.filter(relation_type='collection')
    
    def wishlist(self):
        """Retorna apenas as relações do tipo wishlist"""
        return self.filter(relation_type='wishlist')


class UserArmorSetRelation(models.Model):
    """Relacionamento entre usuário e sets (favoritos, coleção, wishlist)"""
    
    RELATION_TYPE_CHOICES = [
        ('favorite', 'Favorito'),
        ('collection', 'Coleção'),
        ('wishlist', 'Lista de Desejo'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='armor_set_relations',
        verbose_name="Usuário"
    )
    
    armor_set = models.ForeignKey(
        ArmorSet,
        on_delete=models.CASCADE,
        related_name='user_relations',
        verbose_name="Set de Armadura"
    )
    
    relation_type = models.CharField(
        max_length=20,
        choices=RELATION_TYPE_CHOICES,
        verbose_name="Tipo de Relação"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Data de Criação")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Data de Atualização")
    
    # Manager personalizado
    objects = UserArmorSetRelationManager()
    
    class Meta:
        verbose_name = "Relação Usuário-Set"
        verbose_name_plural = "Relações Usuário-Set"
        # Um usuário só pode ter uma relação de cada tipo com cada set
        unique_together = [['user', 'armor_set', 'relation_type']]
        indexes = [
            models.Index(fields=['user', 'relation_type']),
            models.Index(fields=['armor_set', 'relation_type']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.armor_set.name} ({self.get_relation_type_display()})"

