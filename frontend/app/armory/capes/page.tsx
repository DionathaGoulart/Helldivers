import { getCapesData, getPassesData, getAcquisitionSourcesData } from '@/lib/data/armory';
import CapesClient from './CapesClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Capas | Helldivers 2 Armory',
  description: 'Lista completa de capas de Helldivers 2.',
};

export const revalidate = 3600;

export default async function CapesPage() {
  const [capes, passes, sources] = await Promise.all([
    getCapesData(),
    getPassesData(),
    getAcquisitionSourcesData(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-secondary uppercase tracking-widest text-center">
        Capas
      </h1>
      
      <CapesClient 
        initialCapes={capes} 
        initialPasses={passes}
        initialSources={sources}
      />
    </div>
  );
}
