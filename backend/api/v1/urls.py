"""
API v1 - All v1 endpoints
"""
from django.urls import path, include
from users.views.auth_cookies import CookieLoginView, CookieRegisterView, CookieLogoutView, CookieTokenRefreshView
from users.views.profile import user_profile
from .views import GlobalVersionView

urlpatterns = [
    # Version check
    path('version/', GlobalVersionView.as_view(), name='global_version'),
    # Authentication endpoints customizados com cookies HttpOnly
    path('auth/login/', CookieLoginView.as_view(), name='rest_login'),
    path('auth/logout/', CookieLogoutView.as_view(), name='rest_logout'),
    path('auth/token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    # Endpoint de usuário customizado (substitui dj-rest-auth)
    path('auth/user/', user_profile, name='rest_user_details'),
    path('auth/registration/', CookieRegisterView.as_view(), name='rest_register'),
    
    # Password reset (django.contrib.auth.urls)
    path('password/reset/', include('django.contrib.auth.urls')),
    
    # User endpoints (users app)
    path('', include('users.urls')),
    
    # Armory endpoints (armory app)
    # Armory endpoints (armory app)
    path('armory/', include('armory.urls')),
    
    
    # Stratagems endpoints (stratagems app)
    path('stratagems/', include('stratagems.urls')),

    # Weaponry endpoints (weaponry app)
    path('weaponry/', include('weaponry.urls')),
    
    # Warbonds endpoints (warbonds app)
    path('warbonds/', include('warbonds.urls')),
    
    # Booster endpoints (booster app)
    path('boosters/', include('booster.urls')),
]
