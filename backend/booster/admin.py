from django.contrib import admin
from .models import Booster

@admin.register(Booster)
class BoosterAdmin(admin.ModelAdmin):
    list_display = ('name', 'name_pt_br', 'warbond', 'cost', 'created_at')
    search_fields = ('name', 'name_pt_br')
    list_filter = ('warbond',)
