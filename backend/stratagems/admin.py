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
                'name', 'name_pt_br', 'department', 'warbond', 'icon', 'codex', 
                'unlock_level', 'cost', 'cooldown', 
                'description', 'description_pt_br'
            )
        }),
        ('Configuration', {
            'fields': ('has_backpack', 'is_tertiary_weapon', 'is_mecha', 'is_turret', 'is_vehicle')
        }),
    )
    
    class Media:
        js = ('stratagems/js/admin_stratagem.js',)


from .models import UserStratagemRelation

@admin.register(UserStratagemRelation)
class UserStratagemRelationAdmin(admin.ModelAdmin):
    list_display = ('user', 'stratagem', 'relation_type', 'created_at')
    search_fields = ('user__username', 'stratagem__name')
    list_filter = ('relation_type', 'created_at')
    autocomplete_fields = ['user', 'stratagem']
