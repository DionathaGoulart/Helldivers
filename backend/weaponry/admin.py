from django.contrib import admin
from .models import PrimaryWeapon, SecondaryWeapon, Throwable



@admin.register(PrimaryWeapon)
class PrimaryWeaponAdmin(admin.ModelAdmin):
    list_display = ('name', 'weapon_type', 'damage_value', 'source', 'acquisition_source', 'warbond')
    search_fields = ('name', 'name_pt_br')
    list_filter = ('weapon_type', 'source', 'acquisition_source', 'warbond', 'damage_type')
    
    class Media:
        js = ('admin/weaponry_warbond_field.js',)

@admin.register(SecondaryWeapon)
class SecondaryWeaponAdmin(admin.ModelAdmin):
    list_display = ('name', 'weapon_type', 'damage_value', 'source', 'acquisition_source', 'warbond')
    search_fields = ('name', 'name_pt_br')
    list_filter = ('weapon_type', 'source', 'acquisition_source', 'warbond', 'damage_type')

    class Media:
        js = ('admin/weaponry_warbond_field.js',)

@admin.register(Throwable)
class ThrowableAdmin(admin.ModelAdmin):
    list_display = ('name', 'weapon_type', 'damage_value', 'source', 'acquisition_source', 'warbond')
    search_fields = ('name', 'name_pt_br')
    list_filter = ('weapon_type', 'source', 'acquisition_source', 'warbond', 'damage_type')

    class Media:
        js = ('admin/weaponry_warbond_field.js',)

from .models import UserPrimaryWeaponRelation, UserSecondaryWeaponRelation, UserThrowableRelation

@admin.register(UserPrimaryWeaponRelation)
class UserPrimaryWeaponRelationAdmin(admin.ModelAdmin):
    list_display = ('user', 'item', 'relation_type', 'created_at')
    search_fields = ('user__username', 'item__name')
    list_filter = ('relation_type', 'created_at')
    autocomplete_fields = ['user', 'item']

@admin.register(UserSecondaryWeaponRelation)
class UserSecondaryWeaponRelationAdmin(admin.ModelAdmin):
    list_display = ('user', 'item', 'relation_type', 'created_at')
    search_fields = ('user__username', 'item__name')
    list_filter = ('relation_type', 'created_at')
    autocomplete_fields = ['user', 'item']

@admin.register(UserThrowableRelation)
class UserThrowableRelationAdmin(admin.ModelAdmin):
    list_display = ('user', 'item', 'relation_type', 'created_at')
    search_fields = ('user__username', 'item__name')
    list_filter = ('relation_type', 'created_at')
    autocomplete_fields = ['user', 'item']
