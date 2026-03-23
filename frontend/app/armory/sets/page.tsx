import { getSetsData, getPassivesData, getPassesData } from '@/lib/data/armory';
import SetsClient from './SetsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sets de Armadura | Helldivers Armory',
  description: 'Explore o catálogo de sets de armadura do Universo Helldivers.',
};

// Next.js App Router fará isso rodar no BUILD time (SSG) por padrão 
// quando não há dinamicidade (como cookies() ou headers() sem suspense) e não forçando dinâmico.
export const revalidate = 3600; // Atualiza o cache estático a cada hora se não usar 'export'

export default async function SetsPage() {
  const [sets, passives, passes] = await Promise.all([
    getSetsData(),
    getPassivesData(),
    getPassesData()
  ]);

  return (
    <SetsClient 
      initialSets={sets} 
      initialPassives={passives} 
      initialPasses={passes} 
    />
  );
}
