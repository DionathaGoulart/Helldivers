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
        ('Weapon Stats', {
            'classes': ('collapse',),
            'fields': (
                ('damage_value', 'damage_type'),
                'max_penetration',
                ('capacity', 'spare_mags'),
                ('fire_rate', 'dps'),
                ('supply_box_refill', 'ammo_box_refill')
            ),
            'description': 'These stats apply only when "Is Tertiary Weapon" is checked.'
        }),
    )

    class Media:
        js = ('stratagems/js/admin_stratagem.js',)
