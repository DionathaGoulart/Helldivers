import { getStratagemsData } from '@/lib/data/armory';
import StratagemsClient from './StratagemsClient';

export const revalidate = 3600; // 1 hour

export default async function StratagemLastPage() {
    const stratagems = await getStratagemsData();

    return <StratagemsClient initialStratagems={stratagems} />;
}
