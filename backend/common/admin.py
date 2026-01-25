from django.contrib import admin
from .models import GlobalVersion

@admin.register(GlobalVersion)
class GlobalVersionAdmin(admin.ModelAdmin):
    list_display = ('resource', 'updated_at')
    readonly_fields = ('updated_at',)
