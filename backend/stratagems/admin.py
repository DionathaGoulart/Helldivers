from django.contrib import admin
from .models import Stratagem

@admin.register(Stratagem)
class StratagemAdmin(admin.ModelAdmin):
    list_display = ('name', 'department', 'unlock_level', 'cost')
    search_fields = ('name', 'name_pt_br')
    list_filter = ('department', 'unlock_level')
