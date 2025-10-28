from django.urls import path
from .views import user_profile, update_profile, dashboard, google_auth, change_password, password_reset, password_reset_confirm

urlpatterns = [
    path('profile/', user_profile, name='user-profile'),
    path('profile/update/', update_profile, name='update-profile'),
    path('dashboard/', dashboard, name='dashboard'),
    path('auth/google/callback/', google_auth, name='google-auth'),
    # Endpoint seguro para trocar senha (replaces dj-rest-auth default)
    path('password/change/', change_password, name='change-password'),
    # Endpoint customizado para reset de senha (link do frontend)
    path('password/reset/', password_reset, name='password-reset'),
    # Endpoint customizado para confirmar reset de senha
    path('password/reset/confirm/', password_reset_confirm, name='password-reset-confirm'),
]