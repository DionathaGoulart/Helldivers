import { getArmorsData, getPassivesData, getPassesData, getAcquisitionSourcesData } from '@/lib/data/armory';
import ArmorsClient from './ArmorsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Armaduras | Helldivers 2 Armory',
  description: 'Lista completa de armaduras de Helldivers 2 com status e passivas.',
};

export const revalidate = 3600;

export default async function ArmorsPage() {
  const [armors, passes, passives, sources] = await Promise.all([
    getArmorsData(),
    getPassesData(),
    getPassivesData(),
    getAcquisitionSourcesData(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-secondary uppercase tracking-widest text-center">
        Armaduras
      </h1>
      
      <ArmorsClient 
        initialArmors={armors} 
        initialPasses={passes}
        initialPassives={passives}
        initialSources={sources}
      />
    </div>
  );
}
