from django.db import models


class Helmet(models.Model):
    """Capacete cosmético"""
    
    name = models.CharField(
        max_length=100, 
        unique=True, 
        verbose_name="Nome"
    )
    image = models.ImageField(
        upload_to='helmets/', 
        blank=True, 
        null=True, 
        verbose_name="Imagem"
    )
    
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
        verbose_name = "Capacete"
        verbose_name_plural = "Capacetes"
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return self.name