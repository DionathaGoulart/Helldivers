from django.db import models

class AcquisitionSource(models.Model):
    """Sources of acquisition like events, pre-order bonuses, etc."""
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome")
    name_pt_br = models.CharField(max_length=100, blank=True, null=True, verbose_name="Nome (PT-BR)")
    is_event = models.BooleanField(default=False, verbose_name="É Evento?")
    description = models.TextField(verbose_name="Descrição", blank=True)
    
    class Meta:
        verbose_name = "Outros"
        verbose_name_plural = "Outros"
        ordering = ['name']

    def __str__(self):
        return self.name 

class Warbond(models.Model):
    """Warbond (formerly BattlePass)"""
    
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Nome do Warbond"
    )
    name_pt_br = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Nome do Warbond (PT-BR)"
    )
    
    image = models.ImageField(
        upload_to='warbonds/',
        blank=True,
        null=True,
        verbose_name="Imagem do Warbond"
    )
    
    creditos_ganhaveis = models.IntegerField(
        default=0,
        verbose_name="Créditos Ganháveis"
    )
    
    custo_medalhas_todas_paginas = models.IntegerField(
        default=0,
        verbose_name="Custo em Medalhas (Todas as Páginas)"
    )
    
    custo_medalhas_todos_itens = models.IntegerField(
        default=0,
        verbose_name="Custo em Medalhas (Todos os Itens)"
    )
    
    quantidade_paginas = models.IntegerField(
        default=0,
        verbose_name="Quantidade de Páginas"
    )
    
    custo_supercreditos = models.IntegerField(
        default=0,
        verbose_name="Custo em Supercréditos"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Data de Criação")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Data de Atualização")
    
    class Meta:
        verbose_name = "Warbond"
        verbose_name_plural = "Warbonds"
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return self.name
