from django.contrib import admin
from armory.models import Helmet


@admin.register(Helmet)
class HelmetAdmin(admin.ModelAdmin):
    list_display = ['name', 'cost', 'source', 'created_at']
    search_fields = ['name', 'source']
    ordering = ['name']
