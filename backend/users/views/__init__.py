from .profile import user_profile, update_profile
from .dashboard import dashboard
from .auth import google_auth
from .password import change_password
from .password_reset import password_reset
from .password_reset_confirm import password_reset_confirm

__all__ = [
    'user_profile',
    'update_profile',
    'dashboard',
    'google_auth',
    'change_password',
    'password_reset',
    'password_reset_confirm',
]