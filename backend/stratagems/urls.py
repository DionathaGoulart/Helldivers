from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StratagemViewSet, UserStratagemRelationViewSet

router = DefaultRouter()
router.register(r'user-stratagems', UserStratagemRelationViewSet, basename='user-stratagems')
router.register(r'', StratagemViewSet, basename='stratagem')

urlpatterns = [
    path('', include(router.urls)),
]
