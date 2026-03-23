import { getArmorsData, getPassivesData, getPassesData } from '@/lib/data/armory';
import ArmorsClient from './ArmorsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Armaduras | Helldivers Armory',
  description: 'Explore o catálogo de armaduras do Universo Helldivers.',
};

export const revalidate = 3600;

export default async function ArmorsPage() {
  const [armors, passes, passives] = await Promise.all([
    getArmorsData(),
    getPassesData(),
    getPassivesData(),
  ]);

  return (
    <ArmorsClient 
      initialArmors={armors} 
      initialPasses={passes} 
      initialPassives={passives}
    />
  );
}
