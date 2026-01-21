from django.contrib import admin
from .models import PrimaryWeapon, SecondaryWeapon, Throwable

class WeaponryAdminMixin:
    class Media:
        js = ('admin/weaponry_warbond_field.js',)

@admin.register(PrimaryWeapon)
class PrimaryWeaponAdmin(WeaponryAdminMixin, admin.ModelAdmin):
    list_display = ('name', 'weapon_type', 'damage_value', 'fire_rate', 'source')
    search_fields = ('name', 'name_pt_br')
    list_filter = ('weapon_type', 'source', 'damage_type')

@admin.register(SecondaryWeapon)
class SecondaryWeaponAdmin(WeaponryAdminMixin, admin.ModelAdmin):
    list_display = ('name', 'weapon_type', 'damage_value', 'fire_rate', 'source')
    search_fields = ('name', 'name_pt_br')
    list_filter = ('weapon_type', 'source', 'damage_type')

@admin.register(Throwable)
class ThrowableAdmin(WeaponryAdminMixin, admin.ModelAdmin):
    list_display = ('name', 'weapon_type', 'damage_value', 'source')
    search_fields = ('name', 'name_pt_br')
    list_filter = ('weapon_type', 'source', 'damage_type')
