from django.contrib import admin
from armory.models import Passive


@admin.register(Passive)
class PassiveAdmin(admin.ModelAdmin):
    list_display = ['name', 'effect']
    search_fields = ['name', 'description']
    ordering = ['name']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'name_pt_br', 'image')
        }),
        ('Detalhes', {
            'fields': ('description', 'description_pt_br', 'effect', 'effect_pt_br')
        }),
    )