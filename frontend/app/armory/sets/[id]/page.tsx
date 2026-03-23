import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSetData, getSetsData } from '@/lib/data/armory';
import SetDetailClient from './SetDetailClient';

export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const sets = await getSetsData();
  return sets.map((set) => ({
    id: set.id.toString(),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const set = await getSetData(parseInt(resolvedParams.id, 10));

  if (!set) {
    return {
      title: 'Set Não Encontrado | Helldivers Armory',
    };
  }

  return {
    title: `${set.name_pt_br || set.name} | Helldivers Armory`,
    description: `Detalhes do set de armadura ${set.name_pt_br || set.name} no Helldivers 2.`,
  };
}

export default async function SetDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const setId = parseInt(resolvedParams.id, 10);
  
  if (isNaN(setId)) {
    notFound();
  }

  const set = await getSetData(setId);

  if (!set) {
    notFound();
  }

  return <SetDetailClient initialSet={set} />;
}
