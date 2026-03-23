import { getBoostersData } from '@/lib/data/armory';
import BoostersClient from './BoostersClient';

export const revalidate = 3600; // 1 hour

export default async function BoostersPage() {
    const boosters = await getBoostersData();

    return <BoostersClient initialBoosters={boosters} />;
}
