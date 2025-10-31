'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  getSets, 
  getPassives, 
  ArmorSet, 
  addSetRelation, 
  removeSetRelation, 
  checkSetRelation,
  SetRelationStatus,
  RelationType 
} from '@/lib/armory';
import { getDefaultImage } from '@/lib/armory/images';
import { useAuth } from '@/contexts/AuthContext';

export default function ArmoryPage() {
  const { user } = useAuth();
  const [sets, setSets] = useState<ArmorSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState<'name' | '-name' | 'cost' | '-cost' | 'armor' | '-armor' | 'speed' | '-speed' | 'stamina' | '-stamina'>('name');
  const [passives, setPassives] = useState<{ id: number; name: string }[]>([]);
  const [passiveId, setPassiveId] = useState<number | ''>('');
  const [category, setCategory] = useState<'' | 'light' | 'medium' | 'heavy'>('');
  const [source, setSource] = useState<'' | 'store' | 'pass'>('');
  const [relations, setRelations] = useState<Record<number, SetRelationStatus>>({});
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [setsData, passivesData] = await Promise.all([
          getSets({ search: search || undefined, ordering: ordering === 'name' || ordering === '-name' ? ordering : 'name' }),
          getPassives(),
        ]);
        const setsList = Array.isArray(setsData) ? setsData : [];
        setSets(setsList);
        setPassives((passivesData || []).map((p: { id: number; name: string }) => ({ id: p.id, name: p.name })));
        
        // Carregar relações para cada set se usuário estiver logado
        if (user) {
          const relationsMap: Record<number, SetRelationStatus> = {};
          for (const setItem of setsList) {
            try {
              const relationStatus = await checkSetRelation(setItem.id);
              relationsMap[setItem.id] = relationStatus;
            } catch (error) {
              console.error(`Erro ao verificar relação do set ${setItem.id}:`, error);
              relationsMap[setItem.id] = { favorite: false, collection: false, wishlist: false };
            }
          }
          setRelations(relationsMap);
        }
      } catch (e) {
        console.error('Erro ao buscar sets/passivas:', e);
        setSets([]);
        setPassives([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [search, ordering, user]);

  const displayedSets = useMemo(() => {
    let list = [...sets];
    if (passiveId) {
      list = list.filter((s) => s.passive_detail?.id === passiveId);
    }
    if (category) {
      list = list.filter((s) => s.armor_stats?.category === category);
    }
    if (source) {
      list = list.filter((s) => s.source === source);
    }
    if (ordering === 'cost' || ordering === '-cost') {
      list.sort((a, b) => (a.total_cost || 0) - (b.total_cost || 0));
      if (ordering === '-cost') list.reverse();
    } else if (ordering === 'armor' || ordering === '-armor') {
      list.sort((a, b) => {
        const aArmor = typeof a.armor_stats?.armor === 'number' ? a.armor_stats.armor : 0;
        const bArmor = typeof b.armor_stats?.armor === 'number' ? b.armor_stats.armor : 0;
        return aArmor - bArmor;
      });
      if (ordering === '-armor') list.reverse();
    } else if (ordering === 'speed' || ordering === '-speed') {
      list.sort((a, b) => {
        const aSpeed = typeof a.armor_stats?.speed === 'number' ? a.armor_stats.speed : 0;
        const bSpeed = typeof b.armor_stats?.speed === 'number' ? b.armor_stats.speed : 0;
        return aSpeed - bSpeed;
      });
      if (ordering === '-speed') list.reverse();
    } else if (ordering === 'stamina' || ordering === '-stamina') {
      list.sort((a, b) => {
        const aStamina = typeof a.armor_stats?.stamina === 'number' ? a.armor_stats.stamina : 0;
        const bStamina = typeof b.armor_stats?.stamina === 'number' ? b.armor_stats.stamina : 0;
        return aStamina - bStamina;
      });
      if (ordering === '-stamina') list.reverse();
    }
    return list;
  }, [sets, passiveId, category, source, ordering]);

  const handleToggleRelation = async (e: React.MouseEvent, set: ArmorSet, relationType: RelationType) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert('Você precisa estar logado para usar esta funcionalidade');
      return;
    }

    const key = `${set.id}-${relationType}`;
    
    // Evitar múltiplos cliques simultâneos
    if (updating[key] === true) {
      return;
    }

    const currentStatus = relations[set.id] || { favorite: false, collection: false, wishlist: false };
    const isActive = currentStatus[relationType];
    const newStatus = !isActive;

    // Marcar como atualizando
    setUpdating(prev => ({ ...prev, [key]: true }));

    // Lógica: se está adicionando à coleção, remover da wishlist
    // Se está removendo da wishlist e tem na coleção, não fazer nada (ou vice-versa)
    const newRelationsStatus = { ...currentStatus, [relationType]: newStatus };
    
    // Se está adicionando à coleção, remover da wishlist
    if (relationType === 'collection' && newStatus === true && currentStatus.wishlist === true) {
      newRelationsStatus.wishlist = false;
    }
    // Se está adicionando à wishlist, remover da coleção (não faz sentido ter na coleção e na wishlist)
    if (relationType === 'wishlist' && newStatus === true && currentStatus.collection === true) {
      newRelationsStatus.collection = false;
    }

    // Atualização otimista - atualiza o estado ANTES da chamada à API
    setRelations(prev => ({
      ...prev,
      [set.id]: newRelationsStatus,
    }));

    try {
      // Primeiro, fazer a operação principal
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
          // Não é crítico, continua
        }
      }
      
      // Se está adicionando à wishlist e tinha na coleção, remover da coleção
      if (relationType === 'wishlist' && newStatus === true && currentStatus.collection === true) {
        try {
          await removeSetRelation(set.id, 'collection');
        } catch (collectionError) {
          console.error('Erro ao remover da coleção:', collectionError);
          // Não é crítico, continua
        }
      }
    } catch (error) {
      // Reverter estado em caso de erro
      setRelations(prev => ({
        ...prev,
        [set.id]: {
          ...currentStatus,
          [relationType]: isActive, // Reverter para o estado anterior
        },
      }));
      
      console.error('Erro ao atualizar relação:', error);
      const message = (error as { response?: { data?: { detail?: string } }; message?: string })?.response?.data?.detail || 
                      (error as { message?: string })?.message || 
                      'Erro ao atualizar relação';
      alert(message);
    } finally {
      // Sempre resetar o estado de updating, mesmo em caso de erro
      setUpdating(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sets de Armadura</h1>
          <p className="text-gray-600">Conjuntos completos de equipamento</p>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <div className="grid md:grid-cols-5 gap-4 mb-4">
            <div>
              <input
                type="text"
                placeholder="Buscar sets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value as 'name' | '-name' | 'cost' | '-cost' | 'armor' | '-armor' | 'speed' | '-speed' | 'stamina' | '-stamina')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="name">Nome (A-Z)</option>
                <option value="-name">Nome (Z-A)</option>
                <option value="cost">Valor total (Menor)</option>
                <option value="-cost">Valor total (Maior)</option>
                <option value="armor">Classificação (Menor)</option>
                <option value="-armor">Classificação (Maior)</option>
                <option value="speed">Velocidade (Menor)</option>
                <option value="-speed">Velocidade (Maior)</option>
                <option value="stamina">Regeneração (Menor)</option>
                <option value="-stamina">Regeneração (Maior)</option>
              </select>
            </div>

            <div>
              <select
                value={passiveId}
                onChange={(e) => setPassiveId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todas as passivas</option>
                {passives.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={category}
                onChange={(e) => setCategory((e.target.value as 'light' | 'medium' | 'heavy' | '') || '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todas as categorias</option>
                <option value="light">Leve</option>
                <option value="medium">Médio</option>
                <option value="heavy">Pesado</option>
              </select>
            </div>

            <div>
              <select
                value={source}
                onChange={(e) => setSource((e.target.value as 'store' | 'pass' | '') || '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todas as fontes</option>
                <option value="store">Loja</option>
                <option value="pass">Passe</option>
              </select>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setSearch('');
              setOrdering('name');
              setPassiveId('');
              setCategory('');
              setSource('');
            }}
          >
            Limpar Filtros
          </Button>
        </Card>

        {/* Resultados */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando sets...</p>
          </div>
        ) : displayedSets.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600">Nenhum set encontrado</p>
          </Card>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {displayedSets.length} set(s) encontrado(s)
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedSets.map((set) => {
                const relationStatus = relations[set.id] || { favorite: false, collection: false, wishlist: false };
                
                return (
                <Link key={set.id} href={`/armory/sets/${set.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                    <img
                      src={set.image || getDefaultImage('set')}
                      alt={set.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Botões de ação */}
                    {user && (
                      <div className="absolute top-2 right-2 flex flex-col gap-2">
                        {/* Favorito */}
                        <button
                          onClick={(e) => handleToggleRelation(e, set, 'favorite')}
                          disabled={updating[`${set.id}-favorite`] === true}
                          className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                            relationStatus.favorite ? 'scale-110' : ''
                          }`}
                          title={relationStatus.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                          {updating[`${set.id}-favorite`] === true ? (
                            <svg className="w-5 h-5 text-yellow-500 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg
                              className={`w-5 h-5 transition-all duration-200 ${relationStatus.favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`}
                              fill={relationStatus.favorite ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          )}
                        </button>
                        
                        {/* Coleção */}
                        <button
                          onClick={(e) => handleToggleRelation(e, set, 'collection')}
                          disabled={updating[`${set.id}-collection`] === true}
                          className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                            relationStatus.collection ? 'scale-110' : ''
                          }`}
                          title={relationStatus.collection ? 'Remover da coleção' : 'Adicionar à coleção'}
                        >
                          {updating[`${set.id}-collection`] === true ? (
                            <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg
                              className={`w-5 h-5 transition-all duration-200 ${relationStatus.collection ? 'text-blue-500 fill-current' : 'text-gray-400'}`}
                              fill={relationStatus.collection ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          )}
                        </button>
                        
                        {/* Wishlist */}
                        <button
                          onClick={(e) => handleToggleRelation(e, set, 'wishlist')}
                          disabled={updating[`${set.id}-wishlist`] === true}
                          className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                            relationStatus.wishlist ? 'scale-110' : ''
                          }`}
                          title={relationStatus.wishlist ? 'Remover da lista de desejo' : 'Adicionar à lista de desejo'}
                        >
                          {updating[`${set.id}-wishlist`] === true ? (
                            <svg className="w-5 h-5 text-green-500 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg
                              className={`w-5 h-5 transition-all duration-200 ${relationStatus.wishlist ? 'text-green-500 fill-current' : 'text-gray-400'}`}
                              fill={relationStatus.wishlist ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{set.name}</h3>
                      {set.armor_stats?.category_display && (
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {set.armor_stats.category_display}
                        </span>
                      )}
                    </div>

                    {/* Stats resumidos */}
                    {set.armor_stats && (
                      <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                        <div className="p-2 bg-gray-50 rounded text-center">
                          <p className="text-gray-600 text-xs">Armadura</p>
                          <p className="font-semibold">{set.armor_stats.armor}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded text-center">
                          <p className="text-gray-600 text-xs">Velocidade</p>
                          <p className="font-semibold">{set.armor_stats.speed}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded text-center">
                          <p className="text-gray-600 text-xs">Regeneração</p>
                          <p className="font-semibold">{set.armor_stats.stamina}</p>
                        </div>
                      </div>
                    )}

                    {/* Custo Total */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-semibold text-gray-700">Custo Total</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {(set.total_cost || 0).toLocaleString('pt-BR')} {set.source === 'pass' ? 'Medalhas' : 'Supercréditos'}
                      </span>
                    </div>
                    
                    <Button fullWidth className="mt-4">
                      Ver Detalhes
                    </Button>
                  </div>
                  </Card>
                </Link>
              );
              })}
        </div>
          </>
        )}
      </div>
    </div>
  );
}

