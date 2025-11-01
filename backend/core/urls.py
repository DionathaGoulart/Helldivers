from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Versionada - v1
    path('api/v1/', include('api.v1.urls')),
    
    # Documentação da API
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Servir arquivos de mídia em desenvolvimento e produção
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # Em produção, servir via Django mesmo
    from django.views.static import serve
    # MEDIA_URL é '/media/' 
    urlpatterns += [
        path(settings.MEDIA_URL.strip('/') + '/<path:path>', serve, {'document_root': settings.MEDIA_ROOT}),
    ]