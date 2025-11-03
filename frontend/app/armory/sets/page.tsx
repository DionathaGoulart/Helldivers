/**
 * Página de Sets de Armadura
 * 
 * Exibe todos os sets de armadura com filtros e busca
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

// 1. React e Next.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

// 2. Contextos e Hooks customizados
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';

// 3. Componentes
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

// 4. Utilitários e Constantes
import { translateCategory } from '@/utils/armory';
import { getDefaultImage } from '@/lib/armory/images';
import { getTranslatedName, getTranslatedEffect } from '@/lib/i18n';

// 5. Tipos
import type {
  ArmorSet,
  RelationType,
  SetRelationStatus,
} from '@/lib/types/armory';

// 6. Serviços e Libs
import {
  getSets,
  addSetRelation,
  removeSetRelation,
  checkSetRelation,
} from '@/lib/armory-cached';

export default function SetsPage() {
  const { user } = useAuth();
  const { isPortuguese } = useLanguage();
  const { t } = useTranslation();
  
  const [sets, setSets] = useState<ArmorSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('name');
  const [relations, setRelations] = useState<Record<number, SetRelationStatus>>({});
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchSets = async () => {
      setLoading(true);
      try {
        const data = await getSets({ search: search || undefined, ordering: ordering as any });
        setSets(Array.isArray(data) ? data : []);
        
        // Carregar relações para cada set se usuário estiver logado
        if (user) {
          const relationsMap: Record<number, SetRelationStatus> = {};
          for (const setItem of Array.isArray(data) ? data : []) {
            try {
              const relationStatus = await checkSetRelation(setItem.id);
              relationsMap[setItem.id] = relationStatus;
            } catch (error) {
              // Erro ao verificar relação do set
              relationsMap[setItem.id] = { favorite: false, collection: false, wishlist: false };
            }
          }
          setRelations(relationsMap);
        }
      } catch (error) {
        // Erro ao buscar sets
        setSets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSets();
  }, [search, ordering, user]);

  const handleToggleRelation = async (set: ArmorSet, relationType: RelationType) => {
    if (!user) {
      alert(t('sets.needLogin'));
      return;
    }

    const key = `${set.id}-${relationType}`;
    
    // Evitar múltiplos cliques simultâneos
    if (updating[key] === true) {
      return;
    }

    setUpdating(prev => ({ ...prev, [key]: true }));

    try {
      const currentStatus = relations[set.id] || { favorite: false, collection: false, wishlist: false };
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
      setRelations({
        ...relations,
        [set.id]: newRelationsStatus,
      });

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
          // Erro ao remover da wishlist
        }
      }
      
      // Se está adicionando à wishlist e tinha na coleção, remover da coleção
      if (relationType === 'wishlist' && newStatus === true && currentStatus.collection === true) {
        try {
          await removeSetRelation(set.id, 'collection');
        } catch (collectionError) {
          // Erro ao remover da coleção
        }
      }
    } catch (error: any) {
      // Reverter estado em caso de erro
      const currentStatus = relations[set.id] || { favorite: false, collection: false, wishlist: false };
      setRelations({
        ...relations,
        [set.id]: currentStatus,
      });
      
      // Erro ao atualizar relação
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

  /**
   * Limpa todos os filtros, resetando para valores padrão
   */
  const handleClearFilters = () => {
    setSearch('');
    setOrdering('name');
  };

  return (
    <div className="container page-content">
        <div className="content-section">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('sets.title')}</h1>
          <p className="text-gray-600">{t('armory.subtitle')}</p>
        </div>

        {/* Filtros */}
        <Card className="content-section">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('sets.filters')}</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <input
                type="text"
                placeholder={t('sets.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="name">{t('sets.orderNameAZ')}</option>
                <option value="-name">{t('sets.orderNameZA')}</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t('armory.clear')}
          </button>
        </Card>

        {/* Resultados */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{t('sets.loading')}</p>
          </div>
        ) : sets.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600">{t('sets.noResults')}</p>
          </Card>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {t('sets.results', { count: sets.length })}
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sets.map((set) => {
                const relationStatus = relations[set.id] || { favorite: false, collection: false, wishlist: false };
                const isUpdating = Object.keys(updating).some(key => key.startsWith(`${set.id}-`));
                
                return (
                  <Card key={set.id} className="hover:shadow-lg transition-shadow flex flex-col md:flex-row p-0 overflow-visible">
                    <div className="relative w-full md:w-48 lg:w-56 h-64 md:h-auto md:max-h-[500px] bg-gray-200 rounded-t-lg md:rounded-l-lg md:rounded-tr-none overflow-hidden flex items-center justify-center shrink-0 border-2 border-[#00d9ff]">
                      <img
                        src={set.image || getDefaultImage('set')}
                        alt={set.name}
                        className="w-full h-full max-h-[500px] object-contain"
                      />
                      {/* Botões de ação */}
                      {user && (
                        <div className="absolute top-2 right-2 flex flex-col gap-2">
                          {/* Favorito */}
                          <button
                            onClick={() => handleToggleRelation(set, 'favorite')}
                            disabled={isUpdating}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={relationStatus.favorite ? t('sets.removeFavorite') : t('sets.addFavorite')}
                          >
                            <svg
                              className={`w-5 h-5 ${relationStatus.favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                          
                          {/* Coleção */}
                          <button
                            onClick={() => handleToggleRelation(set, 'collection')}
                            disabled={isUpdating}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={relationStatus.collection ? t('sets.removeCollection') : t('sets.addCollection')}
                          >
                            <svg
                              className={`w-5 h-5 ${relationStatus.collection ? 'text-blue-500 fill-current' : 'text-gray-400'}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </button>
                          
                          {/* Wishlist */}
                          <button
                            onClick={() => handleToggleRelation(set, 'wishlist')}
                            disabled={isUpdating}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={relationStatus.wishlist ? t('sets.removeWishlist') : t('sets.addWishlist')}
                          >
                            <svg
                              className={`w-5 h-5 ${relationStatus.wishlist ? 'text-green-500 fill-current' : 'text-gray-400'}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col min-h-0">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">{getTranslatedName(set, isPortuguese())}</h3>
                        {set.armor_stats?.category_display && (
                          <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {translateCategory(set.armor_stats.category_display, t)}
                          </span>
                        )}
                      </div>

                      {/* Stats da Armadura (Herdados) */}
                      {set.armor_stats && (
                        <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                          <div className="p-2 bg-gray-50 rounded text-center">
                            <p className="text-gray-600 text-xs">{t('sets.armor')}</p>
                            <p className="font-semibold">{set.armor_stats.armor_display || set.armor_stats.armor}</p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded text-center">
                            <p className="text-gray-600 text-xs">{t('sets.speed')}</p>
                            <p className="font-semibold">{set.armor_stats.speed_display || set.armor_stats.speed}</p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded text-center">
                            <p className="text-gray-600 text-xs">{t('sets.stamina')}</p>
                            <p className="font-semibold">{set.armor_stats.stamina_display || set.armor_stats.stamina}</p>
                          </div>
                        </div>
                      )}

                      {/* Itens do Set */}
                      <div className="space-y-2 mb-4">
                        {/* Capacete */}
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <img
                            src={set.helmet_detail?.image || getDefaultImage('helmet')}
                            alt={set.helmet_detail?.name || 'Capacete'}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-gray-600">{t('sets.helmet')}</p>
                            <p className="text-sm font-medium text-gray-900">{set.helmet_detail ? getTranslatedName(set.helmet_detail, isPortuguese()) : 'N/A'}</p>
                          </div>
                        </div>
                        
                        {/* Armadura */}
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <img
                            src={set.armor_detail?.image || getDefaultImage('armor')}
                            alt={set.armor_detail?.name || t('sets.armor')}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-gray-600">{t('sets.armor')}</p>
                            <p className="text-sm font-medium text-gray-900">{set.armor_detail ? getTranslatedName(set.armor_detail, isPortuguese()) : 'N/A'}</p>
                          </div>
                        </div>
                        
                        {/* Capa */}
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <img
                            src={set.cape_detail?.image || getDefaultImage('cape')}
                            alt={set.cape_detail?.name || t('sets.cape')}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-gray-600">{t('sets.cape')}</p>
                            <p className="text-sm font-medium text-gray-900">{set.cape_detail ? getTranslatedName(set.cape_detail, isPortuguese()) : 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Passiva do Set */}
                      {set.passive_detail && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg mb-4">
                          <img
                            src={getDefaultImage('passive')}
                            alt={getTranslatedName(set.passive_detail, isPortuguese())}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900 mb-1">
                              {getTranslatedName(set.passive_detail, isPortuguese())}
                            </p>
                            <p className="text-xs text-blue-800">{getTranslatedEffect(set.passive_detail, isPortuguese())}</p>
                          </div>
                        </div>
                      )}

                      {/* Custo Total */}
                      <div className="flex items-center justify-between pt-4 pb-4 border-t border-gray-200">
                        <span className="text-lg font-semibold text-gray-700">{t('sets.totalCost')}</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {set.total_cost?.toLocaleString('pt-BR') || 0} {set.source === 'pass' ? 'MED' : 'SC'}
                        </span>
                      </div>

                      <Link href={`/armory/sets/${set.id}`}>
                        <Button 
                          fullWidth 
                          className="mt-4 visible block"
                        >
                          {t('armors.viewDetails')}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
  );
}

