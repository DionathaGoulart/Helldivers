from django.db import models
from .passive import Passive
from warbonds.models import Warbond, AcquisitionSource


class Armor(models.Model):
    """Armadura com atributos técnicos"""
    
    CATEGORY_CHOICES = [
        ('light', 'Leve'),
        ('medium', 'Médio'),
        ('heavy', 'Pesado'),
    ]
    
    name = models.CharField(
        max_length=100, 
        unique=True, 
        verbose_name="Nome"
    )
    name_pt_br = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Nome (PT-BR)"
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
    
    # Atributos técnicos (valores numéricos)
    armor = models.IntegerField(
        verbose_name="Classificação da armadura"
    )
    speed = models.IntegerField(
        verbose_name="Velocidade"
    )
    stamina = models.IntegerField(
        verbose_name="Regeneração de Resistência"
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
        ('others', 'Outros'),
        ('starter_equipment', 'Starter Equipment'),
        ('pre_order_bonus', 'Pre-Order Bonus'),
        ('super_citizen_edition', 'Super Citizen Edition'),
        ('downloadable_content', 'Downloadable Content'),
        ('escalation_of_freedom', 'Escalation of Freedom'),
        ('liberty_day', 'Liberty Day'),
        ('anniversary_gift', 'Anniversary Gift'),
        ('helldivers_killzone', 'Helldivers x Killzone'),
        ('malevelon_creek_memorial', 'Malevelon Creek Memorial Day'),
        ('heart_of_democracy', 'Heart of Democracy'),
        ('social_media_mo', 'Social Media MO'),
        ('ministry_of_prosperity', 'Ministry of Prosperity'),
        ('station_81', 'Station-81'),
    ]
    
    source = models.CharField(
        max_length=30,
        choices=ACQUISITION_CHOICES,
        default='store',
        verbose_name="Fonte de Aquisição"
    )
    
    pass_field = models.ForeignKey(
        Warbond,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='armors',
        verbose_name="Passe",
        help_text="Passe específico se a fonte for 'pass'"
    )

    acquisition_source = models.ForeignKey(
        AcquisitionSource,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='armors',
        verbose_name="Fonte de Aquisição (Específica)",
        help_text="Usado quando a fonte é 'Outros' ou para eventos específicos"
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
            models.Index(fields=['source']),
            models.Index(fields=['pass_field']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"