'use client';

import { useState, useEffect } from 'react';
import { getCollectionSets, ArmorSet, removeSetRelation } from '@/lib/armory';
import { getDefaultImage } from '@/lib/armory/images';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CollectionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sets, setSets] = useState<ArmorSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchCollection = async () => {
      setLoading(true);
      try {
        const data = await getCollectionSets();
        setSets(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao buscar coleção:', error);
        setSets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [user, router]);

  const handleRemoveFromCollection = async (set: ArmorSet) => {
    try {
      await removeSetRelation(set.id, 'collection');
      setSets(sets.filter(s => s.id !== set.id));
    } catch (error: any) {
      console.error('Erro ao remover da coleção:', error);
      alert(error.response?.data?.detail || error.message || 'Erro ao remover da coleção');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Minha Coleção</h1>
              <p className="text-gray-600">Sets de armadura que você possui</p>
            </div>
            <Link href="/armory/sets">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Ver Todos os Sets
              </button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando coleção...</p>
          </div>
        ) : sets.length === 0 ? (
          <Card className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Coleção vazia</h3>
            <p className="mt-2 text-gray-500">Você ainda não adicionou nenhum set à sua coleção.</p>
            <Link href="/armory/sets">
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Explorar Sets
              </button>
            </Link>
          </Card>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {sets.length} set(s) na coleção
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sets.map((set) => (
                <Card key={set.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                    <img
                      src={set.image || getDefaultImage('set')}
                      alt={set.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveFromCollection(set)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                      title="Remover da coleção"
                    >
                      <svg
                        className="w-5 h-5 text-blue-500 fill-current"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{set.name}</h3>
                    
                    {set.armor_stats?.category_display && (
                      <span className="inline-block mb-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {set.armor_stats.category_display}
                      </span>
                    )}

                    {set.armor_stats && (
                      <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                        <div className="p-2 bg-gray-50 rounded text-center">
                          <p className="text-gray-600 text-xs">Armadura</p>
                          <p className="font-semibold">{set.armor_stats.armor_display || set.armor_stats.armor}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded text-center">
                          <p className="text-gray-600 text-xs">Velocidade</p>
                          <p className="font-semibold">{set.armor_stats.speed_display || set.armor_stats.speed}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded text-center">
                          <p className="text-gray-600 text-xs">Stamina</p>
                          <p className="font-semibold">{set.armor_stats.stamina_display || set.armor_stats.stamina}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-semibold text-gray-700">Custo Total</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {set.total_cost?.toLocaleString('pt-BR') || 0} SC
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

