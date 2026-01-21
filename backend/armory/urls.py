from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PassiveViewSet,
    BattlePassViewSet,
    ArmorViewSet,
    HelmetViewSet,
    CapeViewSet,
    ArmorSetViewSet,
    ArmorSetViewSet,
    UserArmorSetRelationViewSet
)
from .views.component_relations import (
    UserHelmetRelationViewSet,
    UserArmorRelationViewSet,
    UserCapeRelationViewSet
)

router = DefaultRouter()
router.register(r'passives', PassiveViewSet, basename='passive')
router.register(r'passes', BattlePassViewSet, basename='battlepass')
router.register(r'armors', ArmorViewSet, basename='armor')
router.register(r'helmets', HelmetViewSet, basename='helmet')
router.register(r'capes', CapeViewSet, basename='cape')
router.register(r'sets', ArmorSetViewSet, basename='armorset')
router.register(r'user-sets', UserArmorSetRelationViewSet, basename='user-sets')
router.register(r'user-helmets', UserHelmetRelationViewSet, basename='user-helmets')
router.register(r'user-armors', UserArmorRelationViewSet, basename='user-armors')
router.register(r'user-capes', UserCapeRelationViewSet, basename='user-capes')

urlpatterns = [
    path('', include(router.urls)),
]