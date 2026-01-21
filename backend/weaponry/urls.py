from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PrimaryWeaponViewSet, SecondaryWeaponViewSet, ThrowableViewSet,
    UserPrimaryWeaponRelationViewSet, UserSecondaryWeaponRelationViewSet, UserThrowableRelationViewSet
)

router = DefaultRouter()
router.register(r'primary', PrimaryWeaponViewSet, basename='primary-weapon')
router.register(r'secondary', SecondaryWeaponViewSet, basename='secondary-weapon')
router.register(r'throwable', ThrowableViewSet, basename='throwable')

# Relation ViewSets
router.register(r'relations/primary', UserPrimaryWeaponRelationViewSet, basename='primary-weapon-relation')
router.register(r'relations/secondary', UserSecondaryWeaponRelationViewSet, basename='secondary-weapon-relation')
router.register(r'relations/throwable', UserThrowableRelationViewSet, basename='throwable-relation')

urlpatterns = [
    path('', include(router.urls)),
]
