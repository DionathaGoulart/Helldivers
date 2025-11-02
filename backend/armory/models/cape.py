from django.db import models
from .battlepass import BattlePass


class Cape(models.Model):
    """Capa cosmética"""
    
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
    image = models.ImageField(
        upload_to='capes/', 
        blank=True, 
        null=True, 
        verbose_name="Imagem"
    )
    
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
        BattlePass,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='capes',
        verbose_name="Passe",
        help_text="Passe específico se a fonte for 'pass'"
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
        verbose_name = "Capa"
        verbose_name_plural = "Capas"
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['source']),
            models.Index(fields=['pass_field']),
        ]
    
    def __str__(self):
        return self.name