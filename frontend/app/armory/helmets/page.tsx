import { getHelmetsData, getPassesData } from '@/lib/data/armory';
import HelmetsClient from './HelmetsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Capacetes | Helldivers Armory',
  description: 'Explore o catálogo de capacetes do Universo Helldivers.',
};

export const revalidate = 3600;

export default async function HelmetsPage() {
  const [helmets, passes] = await Promise.all([
    getHelmetsData(),
    getPassesData(),
  ]);

  return (
    <HelmetsClient 
      initialHelmets={helmets} 
      initialPasses={passes} 
    />
  );
}
