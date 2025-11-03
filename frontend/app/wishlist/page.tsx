/**
 * Página de Wishlist
 * 
 * Exibe todos os sets de armadura na wishlist do usuário
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

// 1. React e Next.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 2. Contextos e Hooks customizados
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';

// 3. Componentes
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { SetCard } from '@/components/armory';

// 4. Utilitários e Constantes

// 5. Tipos
import type { ArmorSet, RelationType, SetRelationStatus } from '@/lib/types/armory';
import type { UpdatingState } from '@/lib/types/armory-page';

// 6. Serviços e Libs
import { getFavoriteSets, getCollectionSets, getWishlistSets, addSetRelation, removeSetRelation } from '@/lib/armory-cached';

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [sets, setSets] = useState<ArmorSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [relations, setRelations] = useState<Record<number, SetRelationStatus>>({});
  const [updating, setUpdating] = useState<UpdatingState>({});

  useEffect(() => {
    if (authLoading) {
      return; // Aguarda a verificação de autenticação terminar
    }
    
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchWishlist = async () => {
      setLoading(true);
      try {
        // Usa as listas completas de favoritos/coleção/wishlist do cache
        // Isso é MUITO mais eficiente: apenas 3 requisições em vez de N (uma por set)
        const [favoriteSets, collectionSets, wishlistSets] = await Promise.all([
          getFavoriteSets(),
          getCollectionSets(),
          getWishlistSets(),
        ]);
        
        const setsArray = Array.isArray(wishlistSets) ? wishlistSets : [];
        setSets(setsArray);
        
        // Cria mapas de IDs para acesso rápido (mesma lógica do armory)
        const favoriteIds = new Set(favoriteSets.map(s => s.id));
        const collectionIds = new Set(collectionSets.map(s => s.id));
        const wishlistIds = new Set(wishlistSets.map(s => s.id));
        
        // Constrói o mapa de relações para cada set (mesma lógica do armory)
        const relationsMap: Record<number, SetRelationStatus> = {};
        setsArray.forEach((setItem) => {
          relationsMap[setItem.id] = {
            favorite: favoriteIds.has(setItem.id),
            collection: collectionIds.has(setItem.id),
            wishlist: wishlistIds.has(setItem.id),
          };
        });
        
        setRelations(relationsMap);
      } catch (error) {
        // Erro ao buscar wishlist
        setSets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, router, authLoading]);

  /**
   * Handler para toggle de relação (favorito, coleção, wishlist)
   * Implementa atualização otimista e lógica de exclusão mútua entre coleção e wishlist
   */
  const handleToggleRelation = async (
    e: React.MouseEvent,
    set: ArmorSet,
    relationType: RelationType
  ): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('ACESSO NEGADO. Você precisa estar alistado para usar esta funcionalidade.');
      return;
    }

    const key = `${set.id}-${relationType}`;

    // Evitar múltiplos cliques simultâneos
    if (updating[key] === true) {
      return;
    }

    const currentStatus =
      relations[set.id] ||
      ({ favorite: false, collection: false, wishlist: false } as SetRelationStatus);
    const isActive = currentStatus[relationType];
    const newStatus = !isActive;

    // Marcar como atualizando
    setUpdating((prev) => ({ ...prev, [key]: true }));

    // Preparar novo status (lógica de exclusão mútua)
    const newRelationsStatus: SetRelationStatus = {
      ...currentStatus,
      [relationType]: newStatus,
    };

    // Se está adicionando à coleção, remover da wishlist
    if (relationType === 'collection' && newStatus === true && currentStatus.wishlist === true) {
      newRelationsStatus.wishlist = false;
    }
    // Se está adicionando à wishlist, remover da coleção
    if (relationType === 'wishlist' && newStatus === true && currentStatus.collection === true) {
      newRelationsStatus.collection = false;
    }

    // Atualização otimista - atualiza o estado ANTES da chamada à API
    setRelations((prev) => ({
      ...prev,
      [set.id]: newRelationsStatus,
    }));

    try {
      if (isActive) {
        // Remover relação
        await removeSetRelation(set.id, relationType);
        
        // Se estava removendo da wishlist e a página é de wishlist, remove da lista
        if (relationType === 'wishlist') {
          setSets(sets.filter(s => s.id !== set.id));
        }
      } else {
        // Adicionar relação
        await addSetRelation(set.id, relationType);
      }
    } catch (error: any) {
      // Reverter atualização otimista em caso de erro
      setRelations((prev) => ({
        ...prev,
        [set.id]: currentStatus,
      }));
      
      alert(error.response?.data?.detail || error.message || t('wishlist.removeError'));
    } finally {
      // Desmarcar como atualizando
      setUpdating((prev) => {
        const newUpdating = { ...prev };
        delete newUpdating[key];
        return newUpdating;
      });
    }
  };

  return (
    <div className="container page-content">
      <div className="content-section">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-bold mb-2 uppercase break-words font-['Orbitron'] text-white text-[clamp(2.25rem,5vw,3rem)]" suppressHydrationWarning>
              {t('wishlist.title')}
            </h1>
            <p className="text-gray-400">
              {t('wishlist.subtitle')}
            </p>
          </div>
          <Link href="/armory">
            <Button variant="secondary" size="md">
              {t('wishlist.viewAll')}
            </Button>
          </Link>
        </div>
      </div>

      {authLoading || loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">
            {authLoading ? t('wishlist.checkingAuth') : t('wishlist.loading')}
          </p>
        </div>
      ) : sets.length === 0 ? (
        <Card className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">{t('wishlist.noResults')}</h3>
          <p className="mt-2 text-gray-500">{t('wishlist.empty')}</p>
          <Link href="/armory">
            <Button variant="secondary" size="md" className="mt-4">
              {t('wishlist.explore')}
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-4">
            {t('wishlist.results', { count: sets.length })}
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sets.map((set) => {
              const relationStatus =
                relations[set.id] ||
                ({
                  favorite: false,
                  collection: false,
                  wishlist: false,
                } as SetRelationStatus);

              return (
                <SetCard
                  key={set.id}
                  set={set}
                  relationStatus={relationStatus}
                  updating={updating}
                  user={user}
                  onToggleRelation={handleToggleRelation}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

