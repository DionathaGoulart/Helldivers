from django.db import models
from .passive import Passive


class Armor(models.Model):
    """Armadura com atributos técnicos"""
    
    CATEGORY_CHOICES = [
        ('light', 'Leve'),
        ('medium', 'Médio'),
        ('heavy', 'Pesado'),
    ]
    
    LEVEL_CHOICES = [
        ('low', 'Baixo'),
        ('medium', 'Médio'),
        ('high', 'Alto'),
    ]
    
    name = models.CharField(
        max_length=100, 
        unique=True, 
        verbose_name="Nome"
    )
    category = models.CharField(
        max_length=10, 
        choices=CATEGORY_CHOICES, 
        verbose_name="Categoria"
    )
    image = models.ImageField(
        upload_to='armors/', 
        blank=True, 
        null=True, 
        verbose_name="Imagem"
    )
    
    # Atributos técnicos
    armor = models.CharField(
        max_length=10, 
        choices=LEVEL_CHOICES, 
        verbose_name="Armadura"
    )
    speed = models.CharField(
        max_length=10, 
        choices=LEVEL_CHOICES, 
        verbose_name="Velocidade"
    )
    stamina = models.CharField(
        max_length=10, 
        choices=LEVEL_CHOICES, 
        verbose_name="Stamina"
    )
    
    # Passiva
    passive = models.ForeignKey(
        Passive,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='armors',
        verbose_name="Passiva"
    )
    
    # Aquisição
    ACQUISITION_CHOICES = [
        ('store', 'Loja'),
        ('pass', 'Passe'),
    ]
    
    source = models.CharField(
        max_length=10,
        choices=ACQUISITION_CHOICES,
        default='store',
        verbose_name="Fonte de Aquisição"
    )
    cost = models.IntegerField(
        default=0, 
        verbose_name="Custo"
    )
    
    def get_cost_currency(self):
        """Retorna a moeda do custo baseado na fonte de aquisição"""
        if self.source == 'pass':
            return 'Medalhas'
        return 'Supercréditos'
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Armadura"
        verbose_name_plural = "Armaduras"
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['category']),
            models.Index(fields=['passive']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"