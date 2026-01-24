from django.contrib import admin
from warbonds.models import Warbond


@admin.register(Warbond)
class WarbondAdmin(admin.ModelAdmin):
    """Admin para o modelo Warbond"""
    list_display = [
        'name',
        'quantidade_paginas',
        'creditos_ganhaveis',
        'custo_supercreditos',
        'custo_medalhas_todas_paginas',
        'custo_medalhas_todos_itens',
        'created_at',
    ]
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'name_pt_br', 'image')
        }),
        ('Custos e Recursos', {
            'fields': (
                'creditos_ganhaveis',
                'custo_medalhas_todas_paginas',
                'custo_medalhas_todos_itens',
                'quantidade_paginas',
                'custo_supercreditos',
            )
        }),
        ('Metadados', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
