from django.contrib import admin
from armory.models import ArmorSet


@admin.register(ArmorSet)
class ArmorSetAdmin(admin.ModelAdmin):
    list_display = ['name', 'helmet', 'armor', 'cape', 'get_total_cost', 'created_at']
    search_fields = ['name', 'helmet__name', 'armor__name', 'cape__name']
    ordering = ['name']
    
    def get_total_cost(self, obj):
        return obj.get_total_cost()
    get_total_cost.short_description = 'Custo Total'