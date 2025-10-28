from django.contrib import admin
from armory.models import Armor


@admin.register(Armor)
class ArmorAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'armor', 'speed', 'stamina', 'passive', 'cost', 'source']
    list_filter = ['category', 'armor', 'speed', 'stamina', 'passive']
    search_fields = ['name', 'source']
    ordering = ['name']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'category', 'image')
        }),
        ('Atributos Técnicos', {
            'fields': ('armor', 'speed', 'stamina', 'passive')
        }),
        ('Aquisição', {
            'fields': ('cost', 'source')
        }),
    )