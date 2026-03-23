import { getWeaponsData, getPassesData } from '@/lib/data/armory';
import WeaponryClient from './WeaponryClient';
import { WeaponCategory } from '@/lib/types/weaponry';

export const revalidate = 3600; // 1 hour

export default async function WeaponryPage() {
    const [primary, secondary, throwable, passes] = await Promise.all([
        getWeaponsData('primary'),
        getWeaponsData('secondary'),
        getWeaponsData('throwable'),
        getPassesData()
    ]);

    const initialWeapons: Record<WeaponCategory, any[]> = {
        primary,
        secondary,
        throwable
    };

    return <WeaponryClient initialWeapons={initialWeapons} initialPasses={passes} />;
}
