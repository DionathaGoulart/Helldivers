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
            # Garantir que os valores atuais sejam incluídos nas choices
            armor_choices = PRESETS[category]['armor'].copy()
            speed_choices = PRESETS[category]['speed'].copy()
            stamina_choices = PRESETS[category]['stamina'].copy()
            
            # Se há uma instância existente, adicionar os valores atuais se não estiverem na lista
            if self.instance and self.instance.pk:
                if self.instance.armor is not None and self.instance.armor not in armor_choices:
                    armor_choices.append(self.instance.armor)
                    armor_choices.sort()
                if self.instance.speed is not None and self.instance.speed not in speed_choices:
                    speed_choices.append(self.instance.speed)
                    speed_choices.sort()
                if self.instance.stamina is not None and self.instance.stamina not in stamina_choices:
                    stamina_choices.append(self.instance.stamina)
                    stamina_choices.sort()
            
            # Criar choices com opção vazia + valores, garantindo que o valor atual esteja selecionado
            armor_widget = forms.Select(choices=[('', '---------')] + [(v, v) for v in armor_choices])
            speed_widget = forms.Select(choices=[('', '---------')] + [(v, v) for v in speed_choices])
            stamina_widget = forms.Select(choices=[('', '---------')] + [(v, v) for v in stamina_choices])
            
            self.fields['armor'].widget = armor_widget
            self.fields['speed'].widget = speed_widget
            self.fields['stamina'].widget = stamina_widget
            
            # Garantir que os valores iniciais estejam definidos corretamente
            if self.instance and self.instance.pk:
                if self.instance.armor is not None:
                    self.fields['armor'].initial = self.instance.armor
                if self.instance.speed is not None:
                    self.fields['speed'].initial = self.instance.speed
                if self.instance.stamina is not None:
                    self.fields['stamina'].initial = self.instance.stamina
        else:
            # Sem categoria ainda: lista vazia até o JS preencher
            # Mas se há valores salvos, incluí-los para não perder
            armor_choices = [('', '---------')]
            speed_choices = [('', '---------')]
            stamina_choices = [('', '---------')]
            
            if self.instance and self.instance.pk:
                if self.instance.armor is not None:
                    armor_choices.append((self.instance.armor, self.instance.armor))
                if self.instance.speed is not None:
                    speed_choices.append((self.instance.speed, self.instance.speed))
                if self.instance.stamina is not None:
                    stamina_choices.append((self.instance.stamina, self.instance.stamina))
            
            self.fields['armor'].widget = forms.Select(choices=armor_choices)
            self.fields['speed'].widget = forms.Select(choices=speed_choices)
            self.fields['stamina'].widget = forms.Select(choices=stamina_choices)

    class Media:
        js = ('admin/armor_presets.js', 'admin/armor_pass_field.js',)


@admin.register(Armor)
class ArmorAdmin(admin.ModelAdmin):
    form = ArmorAdminForm
    list_display = ['name', 'category', 'armor', 'speed', 'stamina', 'passive', 'cost', 'source', 'pass_field']
    list_filter = ['category', 'passive', 'source', 'pass_field']
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
            'fields': ('source', 'pass_field', 'cost')
        }),
    )