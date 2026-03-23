import { getCapesData, getPassesData } from '@/lib/data/armory';
import CapesClient from './CapesClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Capas | Helldivers Armory',
  description: 'Explore o catálogo de capas do Universo Helldivers.',
};

export const revalidate = 3600;

export default async function CapesPage() {
  const [capes, passes] = await Promise.all([
    getCapesData(),
    getPassesData(),
  ]);

  return (
    <CapesClient 
      initialCapes={capes} 
      initialPasses={passes} 
    />
  );
}
