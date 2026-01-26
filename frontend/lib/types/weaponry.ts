export type WeaponTypePrimary = 'assault_rifle' | 'marksman_rifle' | 'submachine_gun' | 'shotgun' | 'explosive' | 'energy' | 'special';
export type WeaponTypeSecondary = 'pistol' | 'melee' | 'special';
export type WeaponTypeThrowable = 'standard' | 'special';

export type DamageType = 'acid' | 'arc' | 'ballistic' | 'explosion' | 'fire' | 'impact' | 'laser' | 'melee' | 'gas';

export type AcquisitionSource = 'store' | 'pass' | 'other' | string;

export interface AcquisitionSourceDetail {
    id: number;
    name: string;
    name_pt_br?: string;
    is_event: boolean;
    description: string;
}


export interface WeaponBase {
    id: number;
    name: string;
    name_pt_br?: string;
    image?: string;

    // Stats
    damage_value: number;
    damage_type: DamageType;
    max_penetration: number;

    // Acquisition
    source: AcquisitionSource;
    acquisition_source?: number;
    acquisition_source_detail?: AcquisitionSourceDetail;
    warbond?: AcquisitionSourceDetail | string; // Fallback for direct warbond relation
    cost: number;
}

export interface PrimaryWeapon extends WeaponBase {
    weapon_type: WeaponTypePrimary;
}

export interface SecondaryWeapon extends WeaponBase {
    weapon_type: WeaponTypeSecondary;
}

export interface Throwable extends WeaponBase {
    weapon_type: WeaponTypeThrowable;
}

export type AnyWeapon = PrimaryWeapon | SecondaryWeapon | Throwable;

export type WeaponCategory = 'primary' | 'secondary' | 'throwable';

export interface WeaponRelationStatus {
    favorite: boolean;
    collection: boolean;
    wishlist: boolean;
}
