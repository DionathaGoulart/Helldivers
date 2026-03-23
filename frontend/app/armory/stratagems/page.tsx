import { getStratagemsData, getPassesData } from '@/lib/data/armory';
import StratagemsClient from './StratagemsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estratagemas | Helldivers 2 Armory',
  description: 'Lista completa de estratagemas de Helldivers 2.',
};

export const revalidate = 3600;

export default async function StratagemsPage() {
  const [stratagems, passes] = await Promise.all([
    getStratagemsData(),
    getPassesData(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-secondary uppercase tracking-widest text-center">
        Estratagemas
      </h1>
      
      <StratagemsClient initialStratagems={stratagems} initialPasses={passes} />
    </div>
  );
}
