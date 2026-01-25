from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import GlobalVersion

# Import content models to monitor
from armory.models import Armor, Helmet, Cape, ArmorSet, Passive
from weaponry.models import PrimaryWeapon, SecondaryWeapon, Throwable
from stratagems.models import Stratagem
from warbonds.models import Warbond
from booster.models import Booster

MODELS_TO_MONITOR = [
    Armor, Helmet, Cape, ArmorSet, Passive,
    PrimaryWeapon, SecondaryWeapon, Throwable,
    Stratagem,
    Warbond,
    Booster
]

@receiver(post_save)
@receiver(post_delete)
def global_update_handler(sender, **kwargs):
    """
    Updates the global version timestamp whenever a monitored model is changed.
    """
    if sender in MODELS_TO_MONITOR:
        GlobalVersion.objects.update_or_create(
            resource='global',
            defaults={}  # auto_now=True on updated_at handles the timestamp
        )
