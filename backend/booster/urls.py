from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BoosterViewSet

router = DefaultRouter()
router.register(r'', BoosterViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
