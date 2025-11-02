from django.db import models


class BattlePass(models.Model):
    """Passe de Batalha do Helldivers 2"""
    
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Nome do Passe"
    )
    name_pt_br = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Nome do Passe (PT-BR)"
    )
    
    image = models.ImageField(
        upload_to='passes/',
        blank=True,
        null=True,
        verbose_name="Imagem do Passe"
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
        verbose_name = "Passe"
        verbose_name_plural = "Passes"
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return self.name

