from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PassiveViewSet,
    ArmorViewSet,
    HelmetViewSet,
    CapeViewSet,
    ArmorSetViewSet
)

router = DefaultRouter()
router.register(r'passives', PassiveViewSet, basename='passive')
router.register(r'armors', ArmorViewSet, basename='armor')
router.register(r'helmets', HelmetViewSet, basename='helmet')
router.register(r'capes', CapeViewSet, basename='cape')
router.register(r'sets', ArmorSetViewSet, basename='armorset')

urlpatterns = [
    path('', include(router.urls)),
]