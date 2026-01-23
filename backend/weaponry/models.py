from django.db import models
from django.conf import settings
from armory.models.user_component_relations import BaseComponentRelation

# Enums
class DamageType(models.TextChoices):
    ACID = 'acid', 'Acid Damage'
    ARC = 'arc', 'Arc Damage'
    BALLISTIC = 'ballistic', 'Ballistic Damage'
    EXPLOSION = 'explosion', 'Explosion Damage'
    FIRE = 'fire', 'Fire Damage'
    IMPACT = 'impact', 'Impact Damage'
    LASER = 'laser', 'Continuous Laser'
    MELEE = 'melee', 'Melee Damage'
    GAS = 'gas', 'Gas Damage'

class MaxPenetration(models.IntegerChoices):
    NO_HITBOX = 0, 'No Hitbox'
    UNARMORED_I = 1, 'Unarmored I'
    UNARMORED_II = 2, 'Unarmored II'
    LIGHT = 3, 'Light'
    MEDIUM = 4, 'Medium'
    HEAVY = 5, 'Heavy'
    TANK_I = 6, 'Tank I'
    TANK_II = 7, 'Tank II'
    TANK_III = 8, 'Tank III'
    TANK_IV = 9, 'Tank IV'
    TANK_V = 10, 'Tank V'
    TANK_VI = 11, 'Tank VI'
    INDESTRUCTIBLE = 12, 'Indestructible'

class WeaponTypePrimary(models.TextChoices):
    ASSAULT_RIFLE = 'assault_rifle', 'Assault Rifle'
    MARKSMAN_RIFLE = 'marksman_rifle', 'Marksman Rifle'
    SUBMACHINE_GUN = 'submachine_gun', 'Submachine Gun'
    SHOTGUN = 'shotgun', 'Shotgun'
    EXPLOSIVE = 'explosive', 'Explosive'
    ENERGY = 'energy', 'Energy-Based'
    SPECIAL = 'special', 'Special'

class WeaponTypeSecondary(models.TextChoices):
    PISTOL = 'pistol', 'Pistol'
    MELEE = 'melee', 'Melee'
    SPECIAL = 'special', 'Special'

class WeaponTypeThrowable(models.TextChoices):
    STANDARD = 'standard', 'Standard'
    SPECIAL = 'special', 'Special'

# Base Model
class WeaponryBase(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Name")
    name_pt_br = models.CharField(max_length=100, blank=True, null=True, verbose_name="Name (PT-BR)")
    image = models.ImageField(upload_to='weaponry/', blank=True, null=True, verbose_name="Image")
    
    # Stats
    damage_value = models.IntegerField(default=0, verbose_name="Standard Damage")
    damage_type = models.CharField(max_length=20, choices=DamageType.choices, default=DamageType.BALLISTIC, verbose_name="Damage Type")
    max_penetration = models.IntegerField(choices=MaxPenetration.choices, default=MaxPenetration.LIGHT, verbose_name="Max Penetration")

    # Acquisition
    ACQUISITION_CHOICES = [
        ('store', 'Store'),
        ('pass', 'Pass'),
        ('other', 'Other'),
    ]
    source = models.CharField(max_length=20, choices=ACQUISITION_CHOICES, default='store', verbose_name="Source")
    cost = models.IntegerField(default=0, verbose_name="Cost")

    class Meta:
        abstract = True
    
    def __str__(self):
        return self.name

# Models
class PrimaryWeapon(WeaponryBase):
    weapon_type = models.CharField(max_length=20, choices=WeaponTypePrimary.choices, verbose_name="Weapon Type")
    
    class Meta:
        verbose_name = "Primary Weapon"
        verbose_name_plural = "Primary Weapons"

class SecondaryWeapon(WeaponryBase):
    weapon_type = models.CharField(max_length=20, choices=WeaponTypeSecondary.choices, verbose_name="Weapon Type")

    class Meta:
        verbose_name = "Secondary Weapon"
        verbose_name_plural = "Secondary Weapons"

class Throwable(WeaponryBase):
    weapon_type = models.CharField(max_length=20, choices=WeaponTypeThrowable.choices, verbose_name="Weapon Type")

    class Meta:
        verbose_name = "Throwable"
        verbose_name_plural = "Throwables"

# User Relations
class UserPrimaryWeaponRelation(BaseComponentRelation):
    """Relação entre usuário e armas primárias"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='primary_weapon_relations',
        verbose_name="Usuário"
    )
    item = models.ForeignKey(
        PrimaryWeapon,
        on_delete=models.CASCADE,
        related_name='user_relations',
        verbose_name="Arma Primária"
    )

    class Meta(BaseComponentRelation.Meta):
        verbose_name = "Relação Usuário-Arma Primária"
        verbose_name_plural = "Relações Usuário-Arma Primária"
        unique_together = [['user', 'item', 'relation_type']]
        indexes = [
            models.Index(fields=['user', 'relation_type']),
            models.Index(fields=['item', 'relation_type']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.item.name} ({self.get_relation_type_display()})"

class UserSecondaryWeaponRelation(BaseComponentRelation):
    """Relação entre usuário e armas secundárias"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='secondary_weapon_relations',
        verbose_name="Usuário"
    )
    item = models.ForeignKey(
        SecondaryWeapon,
        on_delete=models.CASCADE,
        related_name='user_relations',
        verbose_name="Arma Secundária"
    )

    class Meta(BaseComponentRelation.Meta):
        verbose_name = "Relação Usuário-Arma Secundária"
        verbose_name_plural = "Relações Usuário-Arma Secundária"
        unique_together = [['user', 'item', 'relation_type']]
        indexes = [
            models.Index(fields=['user', 'relation_type']),
            models.Index(fields=['item', 'relation_type']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.item.name} ({self.get_relation_type_display()})"

class UserThrowableRelation(BaseComponentRelation):
    """Relação entre usuário e granadas/arremessáveis"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='throwable_relations',
        verbose_name="Usuário"
    )
    item = models.ForeignKey(
        Throwable,
        on_delete=models.CASCADE,
        related_name='user_relations',
        verbose_name="Arremessável"
    )

    class Meta(BaseComponentRelation.Meta):
        verbose_name = "Relação Usuário-Arremessável"
        verbose_name_plural = "Relações Usuário-Arremessável"
        unique_together = [['user', 'item', 'relation_type']]
        indexes = [
            models.Index(fields=['user', 'relation_type']),
            models.Index(fields=['item', 'relation_type']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.item.name} ({self.get_relation_type_display()})"
