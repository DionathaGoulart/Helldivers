from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BoosterViewSet, UserBoosterRelationViewSet

router = DefaultRouter()
router.register(r'user-boosters', UserBoosterRelationViewSet, basename='user-boosters')
router.register(r'', BoosterViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
