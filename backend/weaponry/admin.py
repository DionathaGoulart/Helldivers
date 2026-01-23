from django.contrib import admin
from .models import PrimaryWeapon, SecondaryWeapon, Throwable



@admin.register(PrimaryWeapon)
class PrimaryWeaponAdmin(admin.ModelAdmin):
    list_display = ('name', 'weapon_type', 'damage_value', 'source')
    search_fields = ('name', 'name_pt_br')
    list_filter = ('weapon_type', 'source', 'damage_type')

@admin.register(SecondaryWeapon)
class SecondaryWeaponAdmin(admin.ModelAdmin):
    list_display = ('name', 'weapon_type', 'damage_value', 'source')
    search_fields = ('name', 'name_pt_br')
    list_filter = ('weapon_type', 'source', 'damage_type')

@admin.register(Throwable)
class ThrowableAdmin(admin.ModelAdmin):
    list_display = ('name', 'weapon_type', 'damage_value', 'source')
    search_fields = ('name', 'name_pt_br')
    list_filter = ('weapon_type', 'source', 'damage_type')
