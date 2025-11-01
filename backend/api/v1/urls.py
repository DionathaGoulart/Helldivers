"""
API v1 - All v1 endpoints
"""
from django.urls import path, include
from users.views.auth_cookies import login_view, register_view, logout_view, token_refresh_view

urlpatterns = [
    # Authentication endpoints customizados com cookies HttpOnly
    path('auth/login/', login_view, name='rest_login'),
    path('auth/logout/', logout_view, name='rest_logout'),
    path('auth/token/refresh/', token_refresh_view, name='token_refresh'),
    # Manter endpoint de usuário do dj-rest-auth
    path('auth/user/', include('dj_rest_auth.urls')),  # Manter outros endpoints do dj-rest-auth
    path('auth/registration/', register_view, name='rest_register'),
    
    # Password reset (django.contrib.auth.urls)
    path('password/reset/', include('django.contrib.auth.urls')),
    
    # User endpoints (users app)
    path('', include('users.urls')),
    
    # Armory endpoints (armory app)
    path('armory/', include('armory.urls')),
]
