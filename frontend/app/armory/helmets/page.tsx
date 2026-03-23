import { getHelmetsData, getPassesData, getAcquisitionSourcesData } from '@/lib/data/armory';
import HelmetsClient from './HelmetsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Capacetes | Helldivers 2 Armory',
  description: 'Lista completa de capacetes de Helldivers 2.',
};

export const revalidate = 3600;

export default async function HelmetsPage() {
  const [helmets, passes, sources] = await Promise.all([
    getHelmetsData(),
    getPassesData(),
    getAcquisitionSourcesData(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-secondary uppercase tracking-widest text-center">
        Capacetes
      </h1>
      
      <HelmetsClient 
        initialHelmets={helmets} 
        initialPasses={passes}
        initialSources={sources}
      />
    </div>
  );
}
