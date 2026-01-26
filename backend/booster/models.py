from django.db import models
from warbonds.models import Warbond

class Booster(models.Model):
    """
    Booster Component
    Represents a booster that provides squad-wide bonuses.
    """
    name = models.CharField(
        max_length=100, 
        unique=True, 
        verbose_name="Name"
    )
    name_pt_br = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Name (PT-BR)"
    )
    
    icon = models.ImageField(
        upload_to='boosters/',
        blank=True,
        null=True,
        verbose_name="Icon"
    )
    
    description = models.TextField(
        verbose_name="Description",
        blank=True
    )
    description_pt_br = models.TextField(
        verbose_name="Description (PT-BR)",
        blank=True,
        null=True
    )

    warbond = models.ForeignKey(
        Warbond,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='boosters',
        verbose_name="Warbond"
    )

    cost = models.IntegerField(
        verbose_name="Cost (Medals)",
        default=0
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Booster"
        verbose_name_plural = "Boosters"
        ordering = ['name']
    
    def __str__(self):
        return self.name

from django.conf import settings

class UserBoosterRelation(models.Model):
    """
    Relation between User and Booster (Favorite, Collection, Wishlist)
    """
    RELATION_TYPES = [
        ('favorite', 'Favorite'),
        ('collection', 'Collection'),
        ('wishlist', 'Wishlist'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='booster_relations'
    )
    booster = models.ForeignKey(
        Booster,
        on_delete=models.CASCADE,
        related_name='user_relations'
    )
    relation_type = models.CharField(
        max_length=20,
        choices=RELATION_TYPES
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'booster', 'relation_type']
        indexes = [
            models.Index(fields=['user', 'relation_type']),
        ]
        verbose_name = "User Booster Relation"
        verbose_name_plural = "User Booster Relations"

    def __str__(self):
        return f"{self.user.username} - {self.booster.name} ({self.relation_type})"
