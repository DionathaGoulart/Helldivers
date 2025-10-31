'use client';

import { useState, useEffect } from 'react';
import { getFavoriteSets, ArmorSet, removeSetRelation, RelationType } from '@/lib/armory';
import { getDefaultImage } from '@/lib/armory/images';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FavoritesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sets, setSets] = useState<ArmorSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const data = await getFavoriteSets();
        setSets(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao buscar favoritos:', error);
        setSets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, router]);

  const handleRemoveFavorite = async (set: ArmorSet) => {
    try {
      await removeSetRelation(set.id, 'favorite');
      setSets(sets.filter(s => s.id !== set.id));
    } catch (error: any) {
      console.error('Erro ao remover favorito:', error);
      alert(error.response?.data?.detail || error.message || 'Erro ao remover favorito');
    }
  };

  return (
    <div className="container page-content">
      <div className="content-section">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Meus Favoritos</h1>
            <p className="text-gray-600">Sets de armadura que você favoritou</p>
          </div>
          <Link href="/armory">
            <Button variant="secondary" size="md">
              VER TODOS OS SETS
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando favoritos...</p>
        </div>
      ) : sets.length === 0 ? (
        <Card className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum favorito</h3>
            <p className="mt-2 text-gray-500">Você ainda não favoritou nenhum set.</p>
          <Link href="/armory">
            <Button variant="secondary" size="md" className="mt-4">
              EXPLORAR SETS
            </Button>
          </Link>
          </Card>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {sets.length} set(s) favoritado(s)
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
                      onClick={() => handleRemoveFavorite(set)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                      title="Remover dos favoritos"
                    >
                      <svg
                        className="w-5 h-5 text-yellow-500 fill-current"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
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
  );
}

