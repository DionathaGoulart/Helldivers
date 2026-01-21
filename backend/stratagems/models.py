from django.db import models

class Stratagem(models.Model):
    """
    Stratagem Component
    Represents a stratagem (special ability) that can be unlocked and used properly.
    """
    
    DEPARTMENT_CHOICES = [
        ('patriotic_admin', 'Patriotic Administration Center'),
        ('orbital_cannons', 'Orbital Cannons'),
        ('hangar', 'Hangar'),
        ('bridge', 'Bridge'),
        ('engineering_bay', 'Engineering Bay'),
        ('robotics_workshop', 'Robotics Workshop'),
        ('warbonds', 'Warbonds'),
    ]

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
    
    department = models.CharField(
        max_length=50,
        choices=DEPARTMENT_CHOICES,
        verbose_name="Department"
    )
    
    icon = models.ImageField(
        upload_to='stratagems/',
        blank=True,
        null=True,
        verbose_name="Icon"
    )
    
    codex = models.CharField(
        max_length=50,
        help_text="Format: UP, DOWN, LEFT, RIGHT (comma separated)",
        verbose_name="Stratagem Codes"
    )
    
    cooldown = models.IntegerField(
        verbose_name="Cooldown (seconds)",
        default=0
    )
    
    cost = models.IntegerField(
        verbose_name="Cost",
        default=0
    )
    
    unlock_level = models.IntegerField(
        verbose_name="Unlock Level",
        default=0
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
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Stratagem"
        verbose_name_plural = "Stratagems"
        ordering = ['department', 'name']
    
    def __str__(self):
        return self.name

from django.conf import settings
from armory.models.user_component_relations import BaseComponentRelation

class UserStratagemRelation(BaseComponentRelation):
    """Relação entre usuário e stratagems"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='stratagem_relations',
        verbose_name="Usuário"
    )
    stratagem = models.ForeignKey(
        Stratagem,
        on_delete=models.CASCADE,
        related_name='user_relations',
        verbose_name="Stratagem"
    )

    class Meta(BaseComponentRelation.Meta):
        verbose_name = "Relação Usuário-Stratagem"
        verbose_name_plural = "Relações Usuário-Stratagem"
        unique_together = [['user', 'stratagem', 'relation_type']]
        indexes = [
            models.Index(fields=['user', 'relation_type']),
            models.Index(fields=['stratagem', 'relation_type']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.stratagem.name} ({self.get_relation_type_display()})"
