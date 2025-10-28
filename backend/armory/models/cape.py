from django.db import models


class Cape(models.Model):
    """Capa cosmética"""
    
    name = models.CharField(
        max_length=100, 
        unique=True, 
        verbose_name="Nome"
    )
    image = models.ImageField(
        upload_to='capes/', 
        blank=True, 
        null=True, 
        verbose_name="Imagem"
    )
    cost = models.IntegerField(
        default=0, 
        verbose_name="Custo"
    )
    source = models.CharField(
        max_length=255, 
        verbose_name="Fonte de Aquisição"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Capa"
        verbose_name_plural = "Capas"
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return self.name