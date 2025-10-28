from django.urls import path
from .views import user_profile, update_profile, dashboard, google_auth, change_password

urlpatterns = [
    path('profile/', user_profile, name='user-profile'),
    path('profile/update/', update_profile, name='update-profile'),
    path('dashboard/', dashboard, name='dashboard'),
    path('auth/google/callback/', google_auth, name='google-auth'),
    # Endpoint seguro para trocar senha (replaces dj-rest-auth default)
    path('password/change/', change_password, name='change-password'),
]