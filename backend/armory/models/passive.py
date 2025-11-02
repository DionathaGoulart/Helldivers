from django.db import models


class Passive(models.Model):
    """Passiva de armadura"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome")
    name_pt_br = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Nome (PT-BR)"
    )
    description = models.TextField(verbose_name="Descrição")
    description_pt_br = models.TextField(
        blank=True,
        null=True,
        verbose_name="Descrição (PT-BR)"
    )
    effect = models.CharField(max_length=255, verbose_name="Efeito Prático")
    effect_pt_br = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Efeito Prático (PT-BR)"
    )
    image = models.ImageField(
        upload_to='passives/',
        blank=True,
        null=True,
        verbose_name="Imagem"
    )
    
    class Meta:
        verbose_name = "Passiva"
        verbose_name_plural = "Passivas"
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return self.name