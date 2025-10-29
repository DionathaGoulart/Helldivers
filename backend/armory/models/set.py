from django.db import models
from .armor import Armor
from .helmet import Helmet
from .cape import Cape


class ArmorSet(models.Model):
    """Conjunto completo de equipamento"""
    
    name = models.CharField(
        max_length=100, 
        unique=True, 
        verbose_name="Nome do Set"
    )
    
    image = models.ImageField(
        upload_to='sets/',
        blank=True,
        null=True,
        verbose_name="Imagem do Set"
    )
    
    helmet = models.ForeignKey(
        Helmet,
        on_delete=models.CASCADE,
        related_name='sets',
        verbose_name="Capacete"
    )
    
    armor = models.ForeignKey(
        Armor,
        on_delete=models.CASCADE,
        related_name='sets',
        verbose_name="Armadura"
    )
    
    cape = models.ForeignKey(
        Cape,
        on_delete=models.CASCADE,
        related_name='sets',
        verbose_name="Capa"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Set de Armadura"
        verbose_name_plural = "Sets de Armadura"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def get_total_cost(self):
        """Retorna o custo total do set"""
        return self.helmet.cost + self.armor.cost + self.cape.cost
    
    def get_armor_stats(self):
        """Retorna os stats herdados da armadura"""
        if self.armor:
            return {
                'armor': self.armor.armor,
                'armor_display': self.armor.get_armor_display(),
                'speed': self.armor.speed,
                'speed_display': self.armor.get_speed_display(),
                'stamina': self.armor.stamina,
                'stamina_display': self.armor.get_stamina_display(),
                'category': self.armor.category,
                'category_display': self.armor.get_category_display(),
            }
        return None
    
    def get_source(self):
        """Retorna a fonte de aquisição da armadura"""
        if self.armor:
            return self.armor.source
        return None