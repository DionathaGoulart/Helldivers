import { getBoostersData, getPassesData } from '@/lib/data/armory';
import BoostersClient from './BoostersClient';

export const revalidate = 3600;

export default async function BoostersPage() {
    const [boosters, passes] = await Promise.all([
        getBoostersData(),
        getPassesData(),
    ]);

    return <BoostersClient initialBoosters={boosters} initialPasses={passes} />;
}
