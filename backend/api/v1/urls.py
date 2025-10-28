"""
API v1 - All v1 endpoints
"""
from django.urls import path, include

urlpatterns = [
    # Authentication endpoints (dj-rest-auth)
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    
    # Password reset (django.contrib.auth.urls)
    path('password/reset/', include('django.contrib.auth.urls')),
    
    # User endpoints (users app)
    path('', include('users.urls')),
    
    # Armory endpoints (armory app)
    path('armory/', include('armory.urls')),
]
