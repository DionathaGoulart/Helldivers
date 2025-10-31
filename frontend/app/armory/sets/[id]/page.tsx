'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSet, ArmorSet, addSetRelation, removeSetRelation, checkSetRelation, SetRelationStatus, RelationType } from '@/lib/armory';
import { getDefaultImage } from '@/lib/armory/images';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [set, setSetData] = useState<ArmorSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [relationStatus, setRelationStatus] = useState<SetRelationStatus>({ favorite: false, collection: false, wishlist: false });
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchSet = async () => {
      setLoading(true);
      try {
        const setId = parseInt(params.id as string);
        if (isNaN(setId)) {
          router.push('/armory');
          return;
        }

        const data = await getSet(setId);
        setSetData(data);

        // Carregar relações se usuário estiver logado
        if (user) {
          try {
            const status = await checkSetRelation(setId);
            setRelationStatus(status);
          } catch (error) {
            console.error('Erro ao verificar relações:', error);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar set:', error);
        router.push('/armory');
      } finally {
        setLoading(false);
      }
    };

    fetchSet();
  }, [params.id, user, router]);

  const handleToggleRelation = async (relationType: RelationType) => {
    if (!user) {
      alert('Você precisa estar logado para usar esta funcionalidade');
      return;
    }

    if (!set) return;

    const key = relationType;
    
    // Evitar múltiplos cliques simultâneos
    if (updating[key] === true) {
      return;
    }

    setUpdating(prev => ({ ...prev, [key]: true }));

    // Salvar estado anterior para reversão em caso de erro
    const previousStatus = { ...relationStatus };

    try {
      const currentStatus = { ...relationStatus };
      const isActive = currentStatus[relationType];
      const newStatus = !isActive;

      // Lógica: se está adicionando à coleção, remover da wishlist (e vice-versa)
      const newRelationsStatus = { ...currentStatus, [relationType]: newStatus };
      
      if (relationType === 'collection' && newStatus === true && currentStatus.wishlist === true) {
        newRelationsStatus.wishlist = false;
      }
      if (relationType === 'wishlist' && newStatus === true && currentStatus.collection === true) {
        newRelationsStatus.collection = false;
      }

      // Atualização otimista
      setRelationStatus(newRelationsStatus);

      // Operação principal
      if (isActive) {
        await removeSetRelation(set.id, relationType);
      } else {
        await addSetRelation(set.id, relationType);
      }

      // Se está adicionando à coleção e tinha na wishlist, remover da wishlist
      if (relationType === 'collection' && newStatus === true && currentStatus.wishlist === true) {
        try {
          await removeSetRelation(set.id, 'wishlist');
        } catch (wishlistError) {
          console.error('Erro ao remover da wishlist:', wishlistError);
        }
      }
      
      // Se está adicionando à wishlist e tinha na coleção, remover da coleção
      if (relationType === 'wishlist' && newStatus === true && currentStatus.collection === true) {
        try {
          await removeSetRelation(set.id, 'collection');
        } catch (collectionError) {
          console.error('Erro ao remover da coleção:', collectionError);
        }
      }
    } catch (error: any) {
      // Reverter estado em caso de erro
      setRelationStatus(previousStatus);
      
      console.error('Erro ao atualizar relação:', error);
      const message = error.response?.data?.detail || error.message || 'Erro ao atualizar relação';
      alert(message);
    } finally {
      setUpdating(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!set) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Set não encontrado</h2>
            <Button onClick={() => router.push('/armory')}>Voltar para Armory</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Botão Voltar */}
        <Link href="/armory">
          <Button
            variant="outline"
            className="mb-6"
          >
            ← Voltar para Armory
          </Button>
        </Link>

        {/* Botões de ação (Favorito, Coleção, Wishlist) */}
        {user && (
          <div className="flex gap-3 mb-6">
            <Button
              variant={relationStatus.favorite ? 'primary' : 'outline'}
              onClick={() => handleToggleRelation('favorite')}
              disabled={updating.favorite}
              className="flex items-center gap-2"
            >
              <svg className={`w-5 h-5 ${relationStatus.favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {relationStatus.favorite ? 'Favoritado' : 'Favoritar'}
            </Button>
            <Button
              variant={relationStatus.collection ? 'primary' : 'outline'}
              onClick={() => handleToggleRelation('collection')}
              disabled={updating.collection}
              className="flex items-center gap-2"
            >
              <svg className={`w-5 h-5 ${relationStatus.collection ? 'text-blue-500 fill-current' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {relationStatus.collection ? 'Na Coleção' : 'Adicionar à Coleção'}
            </Button>
            <Button
              variant={relationStatus.wishlist ? 'primary' : 'outline'}
              onClick={() => handleToggleRelation('wishlist')}
              disabled={updating.wishlist}
              className="flex items-center gap-2"
            >
              <svg className={`w-5 h-5 ${relationStatus.wishlist ? 'text-green-500 fill-current' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {relationStatus.wishlist ? 'Na Lista' : 'Adicionar à Lista'}
            </Button>
          </div>
        )}

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{set.name}</h1>
          {set.armor_stats?.category_display && (
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {set.armor_stats.category_display}
            </span>
          )}
        </div>

        {/* Imagem do Set */}
        <Card className="mb-6 p-0 overflow-hidden">
          <div className="relative h-96 bg-gray-200 overflow-hidden">
            <img
              src={set.image || getDefaultImage('set')}
              alt={set.name}
              className="w-full h-full object-cover"
            />
          </div>
        </Card>

        {/* Stats da Armadura */}
        {set.armor_stats && (
          <Card className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Estatísticas</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600 text-sm mb-2">Armadura</p>
                <p className="text-3xl font-bold text-gray-900">
                  {set.armor_stats.armor_display || set.armor_stats.armor}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600 text-sm mb-2">Velocidade</p>
                <p className="text-3xl font-bold text-gray-900">
                  {set.armor_stats.speed_display || set.armor_stats.speed}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600 text-sm mb-2">Stamina</p>
                <p className="text-3xl font-bold text-gray-900">
                  {set.armor_stats.stamina_display || set.armor_stats.stamina}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Detalhes do Capacete */}
        {set.helmet_detail && (
          <Card className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Capacete</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="shrink-0">
                <img
                  src={set.helmet_detail.image || getDefaultImage('helmet')}
                  alt={set.helmet_detail.name}
                  className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
              <div className="flex-1">
                <p className="text-xl font-semibold text-gray-900 mb-2">{set.helmet_detail.name}</p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Custo:</span> {set.helmet_detail.cost.toLocaleString('pt-BR')} {set.helmet_detail.cost_currency}
                  </p>
                  {set.helmet_detail.source_display && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Fonte:</span> {set.helmet_detail.source_display}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Detalhes da Armadura */}
        {set.armor_detail && (
          <Card className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Armadura</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="shrink-0">
                <img
                  src={set.armor_detail.image || getDefaultImage('armor')}
                  alt={set.armor_detail.name}
                  className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
              <div className="flex-1">
                <p className="text-xl font-semibold text-gray-900 mb-3">{set.armor_detail.name}</p>
                
                {/* Stats da Armadura */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-gray-600 text-xs mb-1">Armadura</p>
                    <p className="text-lg font-bold text-blue-900">{set.armor_detail.armor_display}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-gray-600 text-xs mb-1">Velocidade</p>
                    <p className="text-lg font-bold text-green-900">{set.armor_detail.speed_display}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <p className="text-gray-600 text-xs mb-1">Stamina</p>
                    <p className="text-lg font-bold text-purple-900">{set.armor_detail.stamina_display}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Custo:</span> {set.armor_detail.cost.toLocaleString('pt-BR')} {set.armor_detail.cost_currency}
                  </p>
                  {set.armor_detail.source_display && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Fonte:</span> {set.armor_detail.source_display}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Detalhes da Capa */}
        {set.cape_detail && (
          <Card className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Capa</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="shrink-0">
                <img
                  src={set.cape_detail.image || getDefaultImage('cape')}
                  alt={set.cape_detail.name}
                  className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
              <div className="flex-1">
                <p className="text-xl font-semibold text-gray-900 mb-2">{set.cape_detail.name}</p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Custo:</span> {set.cape_detail.cost.toLocaleString('pt-BR')} {set.cape_detail.cost_currency}
                  </p>
                  {set.cape_detail.source_display && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Fonte:</span> {set.cape_detail.source_display}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Passiva do Set */}
        {set.passive_detail && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Passiva</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="shrink-0">
                <img
                  src={getDefaultImage('passive')}
                  alt={set.passive_detail.name}
                  className="w-48 h-48 object-cover rounded-lg border-2 border-blue-200"
                />
              </div>
              <div className="flex-1">
                <p className="text-xl font-semibold text-blue-900 mb-2">
                  {set.passive_detail.name}
                </p>
                <p className="text-blue-800 mb-3 text-lg">{set.passive_detail.effect}</p>
                {set.passive_detail.description && (
                  <p className="text-sm text-blue-700">{set.passive_detail.description}</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Custo Total */}
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold text-green-900">Custo Total do Set</span>
            <span className="text-4xl font-bold text-green-600">
              {set.total_cost?.toLocaleString('pt-BR') || 0} SC
            </span>
          </div>
        </Card>

        {/* Fonte de Aquisição */}
        {set.source && (
          <p className="text-sm text-gray-600 italic text-center mt-4">
            {set.source}
          </p>
        )}
      </div>
    </div>
  );
}

