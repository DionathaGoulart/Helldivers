from django.contrib import admin
from .models import Stratagem

@admin.register(Stratagem)
class StratagemAdmin(admin.ModelAdmin):
    list_display = ('name', 'department', 'unlock_level', 'cost', 'is_tertiary_weapon')
    search_fields = ('name', 'name_pt_br')
    list_filter = ('department', 'unlock_level', 'is_tertiary_weapon')
    
    fieldsets = (
        ('General Info', {
            'fields': (
                'name', 'name_pt_br', 'department', 'icon', 'codex', 
                'unlock_level', 'cost', 'cooldown', 
                'description', 'description_pt_br'
            )
        }),
        ('Configuration', {
            'fields': ('has_backpack', 'is_tertiary_weapon')
        }),
    )
