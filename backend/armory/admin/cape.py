from django.contrib import admin
from armory.models import Cape


@admin.register(Cape)
class CapeAdmin(admin.ModelAdmin):
    list_display = ['name', 'cost', 'source', 'created_at']
    search_fields = ['name', 'source']
    ordering = ['name']
