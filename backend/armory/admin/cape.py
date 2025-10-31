from django.contrib import admin
from armory.models import Cape


@admin.register(Cape)
class CapeAdmin(admin.ModelAdmin):
    list_display = ['name', 'cost', 'source', 'pass_field', 'created_at']
    list_filter = ['source', 'pass_field']
    search_fields = ['name', 'source']
    ordering = ['name']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'image')
        }),
        ('Aquisição', {
            'fields': ('source', 'pass_field', 'cost')
        }),
    )
    
    class Media:
        js = ('admin/armor_pass_field.js',)
