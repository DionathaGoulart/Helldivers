from django import forms
from django.contrib import admin
from armory.models import Armor


PRESETS = {
    'light': {
        'armor': [50, 64, 70, 75, 79, 100],
        'speed': [521, 530, 536, 550],
        'stamina': [111, 115, 118, 125],
    },
    'medium': {
        'armor': [100, 125, 129],
        'speed': [450, 471, 500],
        'stamina': [71, 100],
    },
    'heavy': {
        'armor': [150],
        'speed': [450],
        'stamina': [50],
    },
}


class ArmorAdminForm(forms.ModelForm):
    class Meta:
        model = Armor
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Rótulos desejados
        self.fields['armor'].label = 'Classificação da armadura'
        self.fields['stamina'].label = 'Regeneração de Resistência'
        # Ajustar choices iniciais com base na categoria presente
        category = None
        if self.instance and self.instance.pk:
            category = self.instance.category
        else:
            # new form with initial data
            category = (self.initial or {}).get('category')

        if category in PRESETS:
            self.fields['armor'].widget = forms.Select(choices=[(v, v) for v in PRESETS[category]['armor']])
            self.fields['speed'].widget = forms.Select(choices=[(v, v) for v in PRESETS[category]['speed']])
            self.fields['stamina'].widget = forms.Select(choices=[(v, v) for v in PRESETS[category]['stamina']])
        else:
            # Sem categoria ainda: lista vazia até o JS preencher
            self.fields['armor'].widget = forms.Select(choices=[('', '---------')])
            self.fields['speed'].widget = forms.Select(choices=[('', '---------')])
            self.fields['stamina'].widget = forms.Select(choices=[('', '---------')])

    class Media:
        js = ('admin/armor_presets.js',)


@admin.register(Armor)
class ArmorAdmin(admin.ModelAdmin):
    form = ArmorAdminForm
    list_display = ['name', 'category', 'armor', 'speed', 'stamina', 'passive', 'cost', 'source']
    list_filter = ['category', 'passive', 'source']
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