from django.contrib import admin
from armory.models import Passive


@admin.register(Passive)
class PassiveAdmin(admin.ModelAdmin):
    list_display = ['name', 'effect']
    search_fields = ['name', 'description']
    ordering = ['name']