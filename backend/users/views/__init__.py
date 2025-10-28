from .profile import user_profile, update_profile
from .dashboard import dashboard
from .auth import google_auth
from .password import change_password

__all__ = [
    'user_profile',
    'update_profile',
    'dashboard',
    'google_auth',
    'change_password',
]