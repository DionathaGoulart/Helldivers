from django import forms
from django.contrib import admin
from armory.models import Cape


class CapeAdminForm(forms.ModelForm):
    class Meta:
        model = Cape
        fields = '__all__'
    
    class Media:
        js = ('admin/armor_pass_field.js',)


@admin.register(Cape)
class CapeAdmin(admin.ModelAdmin):
    form = CapeAdminForm
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
