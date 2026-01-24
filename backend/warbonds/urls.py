from rest_framework.routers import DefaultRouter
from .views import WarbondViewSet

router = DefaultRouter()
router.register(r'warbonds', WarbondViewSet)

urlpatterns = router.urls
