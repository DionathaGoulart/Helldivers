from django.db import models


class Passive(models.Model):
    """Passiva de armadura"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome")
    description = models.TextField(verbose_name="Descrição")
    effect = models.CharField(max_length=255, verbose_name="Efeito Prático")
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