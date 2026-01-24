from django.contrib import admin
from armory.models import UserHelmetRelation, UserArmorRelation, UserCapeRelation


@admin.register(UserHelmetRelation)
class UserHelmetRelationAdmin(admin.ModelAdmin):
    list_display = ['user', 'helmet', 'relation_type', 'created_at']
    search_fields = ['user__username', 'helmet__name']
    list_filter = ['relation_type', 'created_at']
    autocomplete_fields = ['user', 'helmet']

@admin.register(UserArmorRelation)
class UserArmorRelationAdmin(admin.ModelAdmin):
    list_display = ['user', 'armor', 'relation_type', 'created_at']
    search_fields = ['user__username', 'armor__name']
    list_filter = ['relation_type', 'created_at']
    autocomplete_fields = ['user', 'armor']

@admin.register(UserCapeRelation)
class UserCapeRelationAdmin(admin.ModelAdmin):
    list_display = ['user', 'cape', 'relation_type', 'created_at']
    search_fields = ['user__username', 'cape__name']
    list_filter = ['relation_type', 'created_at']
    autocomplete_fields = ['user', 'cape']
