from django import forms
from django.contrib import admin
from armory.models import Helmet


class HelmetAdminForm(forms.ModelForm):
    class Meta:
        model = Helmet
        fields = '__all__'
    
    class Media:
        js = ('admin/armor_pass_field.js',)


@admin.register(Helmet)
class HelmetAdmin(admin.ModelAdmin):
    form = HelmetAdminForm
    list_display = ['name', 'cost', 'source', 'pass_field', 'created_at']
    list_filter = ['source', 'pass_field']
    search_fields = ['name', 'source']
    ordering = ['name']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'name_pt_br', 'image')
        }),
        ('Aquisição', {
            'fields': ('source', 'pass_field', 'cost')
        }),
    )
