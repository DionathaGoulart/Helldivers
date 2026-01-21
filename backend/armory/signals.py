from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import (
    ArmorSet,
    UserArmorSetRelation,
    UserHelmetRelation,
    UserArmorRelation,
    UserCapeRelation
)
from functools import wraps

# ==============================================================================
# UTILS
# ==============================================================================

def disable_signal(signal, receiver, sender):
    """Context manager to temporarily disable a signal"""
    class DisableSignal:
        def __enter__(self):
            signal.disconnect(receiver, sender=sender)
        def __exit__(self, type, value, traceback):
            signal.connect(receiver, sender=sender)
    return DisableSignal()

# ==============================================================================
# SINCRONIZAÇÃO SET -> COMPONENTES
# ==============================================================================

@receiver(post_save, sender=UserArmorSetRelation)
def sync_components_from_set(sender, instance, created, **kwargs):
    """
    Quando um set é favoritado/coleção/wishlist, propaga para os seus componentes.
    EVITA RECURSÃO: Desconecta os sinais reversos (Componente -> Set) durante a criação.
    """
    if not created: 
        return

    user = instance.user
    relation_type = instance.relation_type
    armor_set = instance.armor_set

    # Prepara os gerenciadores para desconectar
    disconnects = [
        (post_save, sync_set_from_helmet, UserHelmetRelation),
        (post_save, sync_set_from_armor, UserArmorRelation),
        (post_save, sync_set_from_cape, UserCapeRelation)
    ]

    # Executa dentro de um bloco "silencioso" para os sinais reversos
    try:
        for sig, recv, snd in disconnects:
            sig.disconnect(recv, sender=snd)

        # 1. Capacete
        if armor_set.helmet:
            UserHelmetRelation.objects.get_or_create(
                user=user, helmet=armor_set.helmet, relation_type=relation_type
            )
        
        # 2. Armadura
        if armor_set.armor:
            UserArmorRelation.objects.get_or_create(
                user=user, armor=armor_set.armor, relation_type=relation_type
            )
        
        # 3. Capa
        if armor_set.cape:
            UserCapeRelation.objects.get_or_create(
                user=user, cape=armor_set.cape, relation_type=relation_type
            )
            
    finally:
        # Reconecta tudo
        for sig, recv, snd in disconnects:
            sig.connect(recv, sender=snd)


@receiver(post_delete, sender=UserArmorSetRelation)
def sync_delete_components_from_set(sender, instance, **kwargs):
    """
    Quando um set é removido, remove componentes da mesma lista.
    EVITA RECURSÃO: Desconecta sinais reversos de deleção.
    """
    user = instance.user
    relation_type = instance.relation_type
    armor_set = instance.armor_set

    disconnects = [
        (post_delete, sync_delete_set_from_helmet, UserHelmetRelation),
        (post_delete, sync_delete_set_from_armor, UserArmorRelation),
        (post_delete, sync_delete_set_from_cape, UserCapeRelation)
    ]

    try:
        for sig, recv, snd in disconnects:
            sig.disconnect(recv, sender=snd)

        if armor_set.helmet:
            UserHelmetRelation.objects.filter(
                user=user, helmet=armor_set.helmet, relation_type=relation_type
            ).delete()
        
        if armor_set.armor:
            UserArmorRelation.objects.filter(
                user=user, armor=armor_set.armor, relation_type=relation_type
            ).delete()

        if armor_set.cape:
            UserCapeRelation.objects.filter(
                user=user, cape=armor_set.cape, relation_type=relation_type
            ).delete()

    finally:
        for sig, recv, snd in disconnects:
            sig.connect(recv, sender=snd)


# ==============================================================================
# SINCRONIZAÇÃO COMPONENTE -> SET
# ==============================================================================

def check_and_sync_set(user, relation_type, component_set_ids):
    """
    Verifica se completa um set e cria a relação.
    Desconecta o sinal de Set -> Componentes para evitar loop.
    """
    if not component_set_ids:
        return

    # Otimização: Select related para evitar queries extras nos campos
    potential_sets = ArmorSet.objects.filter(id__in=component_set_ids)\
        .select_related('helmet', 'armor', 'cape')

    try:
        # Desconecta o sinal que propagaria de volta para os componentes
        post_save.disconnect(sync_components_from_set, sender=UserArmorSetRelation)

        for armor_set in potential_sets:
            # Precisa ter os 3 componentes (jogo base normalmente tem)
            if not (armor_set.helmet_id and armor_set.armor_id and armor_set.cape_id):
                continue

            # Verifica existência (3 queries rápidas de exists)
            has_helmet = UserHelmetRelation.objects.filter(
                user=user, helmet_id=armor_set.helmet_id, relation_type=relation_type
            ).exists()
            
            if not has_helmet: continue

            has_armor = UserArmorRelation.objects.filter(
                user=user, armor_id=armor_set.armor_id, relation_type=relation_type
            ).exists()

            if not has_armor: continue
            
            has_cape = UserCapeRelation.objects.filter(
                user=user, cape_id=armor_set.cape_id, relation_type=relation_type
            ).exists()

            if has_cape:
                UserArmorSetRelation.objects.get_or_create(
                    user=user,
                    armor_set=armor_set,
                    relation_type=relation_type
                )
    finally:
        post_save.connect(sync_components_from_set, sender=UserArmorSetRelation)


@receiver(post_save, sender=UserHelmetRelation)
def sync_set_from_helmet(sender, instance, created, **kwargs):
    if created:
        set_ids = list(instance.helmet.sets.values_list('id', flat=True))
        check_and_sync_set(instance.user, instance.relation_type, set_ids)

@receiver(post_save, sender=UserArmorRelation)
def sync_set_from_armor(sender, instance, created, **kwargs):
    if created:
        set_ids = list(instance.armor.sets.values_list('id', flat=True))
        check_and_sync_set(instance.user, instance.relation_type, set_ids)

@receiver(post_save, sender=UserCapeRelation)
def sync_set_from_cape(sender, instance, created, **kwargs):
    if created:
        set_ids = list(instance.cape.sets.values_list('id', flat=True))
        check_and_sync_set(instance.user, instance.relation_type, set_ids)


@receiver(post_delete, sender=UserHelmetRelation)
def sync_delete_set_from_helmet(sender, instance, **kwargs):
    set_ids = list(instance.helmet.sets.values_list('id', flat=True))
    _safe_delete_set(instance.user, set_ids, instance.relation_type)

@receiver(post_delete, sender=UserArmorRelation)
def sync_delete_set_from_armor(sender, instance, **kwargs):
    set_ids = list(instance.armor.sets.values_list('id', flat=True))
    _safe_delete_set(instance.user, set_ids, instance.relation_type)

@receiver(post_delete, sender=UserCapeRelation)
def sync_delete_set_from_cape(sender, instance, **kwargs):
    set_ids = list(instance.cape.sets.values_list('id', flat=True))
    _safe_delete_set(instance.user, set_ids, instance.relation_type)

def _safe_delete_set(user, set_ids, relation_type):
    """
    Remove o set sem apagar os outros componentes.
    """
    if not set_ids: return

    try:
        post_delete.disconnect(sync_delete_components_from_set, sender=UserArmorSetRelation)
        
        UserArmorSetRelation.objects.filter(
            user=user,
            armor_set_id__in=set_ids,
            relation_type=relation_type
        ).delete()
    finally:
        post_delete.connect(sync_delete_components_from_set, sender=UserArmorSetRelation)
