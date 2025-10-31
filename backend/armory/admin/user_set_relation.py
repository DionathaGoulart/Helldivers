from django.contrib import admin
from armory.models import UserArmorSetRelation


@admin.register(UserArmorSetRelation)
class UserArmorSetRelationAdmin(admin.ModelAdmin):
    list_display = ['user', 'armor_set', 'relation_type', 'created_at']
    search_fields = ['user__username', 'user__email', 'armor_set__name']
    list_filter = ['relation_type', 'created_at']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('user', 'armor_set', 'relation_type')
        }),
        ('Informações', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

