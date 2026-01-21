/**
 * Página de Coleção
 * 
 * Exibe todos os itens marcados como coleção pelo usuário, separados por abas
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
import { SetCard, ComponentCard } from '@/components/armory';

// 4. Utilitários e Constantes
import { Tab } from '@headlessui/react';
import clsx from 'clsx';

// 5. Tipos
import type { ArmorSet, Helmet, Armor, Cape, RelationType, SetRelationStatus } from '@/lib/types/armory';
import type { UpdatingState } from '@/lib/types/armory-page';

// 6. Serviços e Libs
import {
  getFavoriteSets,
  getFavoriteHelmets,
  getFavoriteArmors,
  getFavoriteCapes,
  getCollectionSets,
  getCollectionHelmets,
  getCollectionArmors,
  getCollectionCapes,
  getWishlistSets,
  getWishlistHelmets,
  getWishlistArmors,
  getWishlistCapes,
} from '@/lib/armory-cached';

export default function CollectionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  // Data States
  const [sets, setSets] = useState<ArmorSet[]>([]);
  const [helmets, setHelmets] = useState<Helmet[]>([]);
  const [armors, setArmors] = useState<Armor[]>([]);
  const [capes, setCapes] = useState<Cape[]>([]);

  const [loading, setLoading] = useState(true);
  const [relations, setRelations] = useState<Record<string, SetRelationStatus>>({}); // Key can be 'type-id'

  // Helper to generate unique relation key based on type and id
  const getRelationKey = (type: string, id: number) => `${type}-${id}`;

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const fetchAllCollection = async () => {
      setLoading(true);
      try {
        // 1. Fetch ALL collection items
        const [
          colSets, colHelmets, colArmors, colCapes
        ] = await Promise.all([
          getCollectionSets(),
          getCollectionHelmets(),
          getCollectionArmors(),
          getCollectionCapes()
        ]);

        setSets(colSets || []);
        setHelmets(colHelmets || []);
        setArmors(colArmors || []);
        setCapes(colCapes || []);

        // 2. Fetch context (Favorite/Wishlist status) for these items
        const [
          favSets, favHelmets, favArmors, favCapes,
          wishSets, wishHelmets, wishArmors, wishCapes
        ] = await Promise.all([
          getFavoriteSets(), getFavoriteHelmets(), getFavoriteArmors(), getFavoriteCapes(),
          getWishlistSets(), getWishlistHelmets(), getWishlistArmors(), getWishlistCapes()
        ]);

        // Build Relations Map
        const newRelations: Record<string, SetRelationStatus> = {};

        // Helper to process items
        const processItems = (items: { id: number }[], type: string, favList: { id: number }[], wishList: { id: number }[]) => {
          const favIds = new Set(favList.map(i => i.id));
          const wishIds = new Set(wishList.map(i => i.id));

          items.forEach(item => {
            newRelations[getRelationKey(type, item.id)] = {
              favorite: favIds.has(item.id),
              collection: true, // Inherently true on collection page
              wishlist: wishIds.has(item.id)
            };
          });
        };

        processItems(colSets, 'set', favSets, wishSets);
        processItems(colHelmets, 'helmet', favHelmets, wishHelmets);
        processItems(colArmors, 'armor', favArmors, wishArmors);
        processItems(colCapes, 'cape', favCapes, wishCapes);

        setRelations(newRelations);

      } catch (error) {
        console.error("Error fetching collection:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCollection();
  }, [user, router, authLoading]);


  const categories = [
    { key: 'sets', label: t('nav.sets'), items: sets, type: 'set' },
    { key: 'helmets', label: t('nav.helmets'), items: helmets, type: 'helmet' },
    { key: 'armors', label: t('nav.armors'), items: armors, type: 'armor' },
    { key: 'capes', label: t('nav.capes'), items: capes, type: 'cape' },
  ];

  return (
    <div className="container page-content">
      <div className="content-section mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-bold mb-2 uppercase break-words font-['Orbitron'] text-white text-[clamp(2.25rem,5vw,3rem)]">
              {t('collection.title')}
            </h1>
            <p className="text-gray-400">
              {t('collection.subtitle')}
            </p>
          </div>
          <Link href="/armory">
            <Button variant="secondary" size="md">
              {t('collection.viewAll')}
            </Button>
          </Link>
        </div>
      </div>

      {authLoading || loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{t('collection.loading')}</p>
        </div>
      ) : (
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-8 overflow-x-auto">
            {categories.map((cat) => (
              <Tab
                key={cat.key}
                className={({ selected }) =>
                  clsx(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-yellow-400 text-black shadow'
                      : 'text-gray-400 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                {cat.label} ({cat.items.length})
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {categories.map((cat, idx) => (
              <Tab.Panel
                key={idx}
                className={clsx(
                  'rounded-xl focus:outline-none'
                )}
              >
                {cat.items.length === 0 ? (
                  <Card className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">{t('collection.noResults')}</h3>
                    <p className="mt-2 text-gray-500">{t('collection.empty')}</p>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cat.items.map((item) => {
                      const relStatus = relations[getRelationKey(cat.type, item.id)] || { favorite: false, collection: true, wishlist: false };

                      if (cat.type === 'set') {
                        return (
                          <SetCard
                            key={item.id}
                            set={item as ArmorSet}
                            initialRelationStatus={relStatus}
                          />
                        );
                      } else {
                        return (
                          <ComponentCard
                            key={item.id}
                            item={item as any}
                            type={cat.type as any}
                            initialRelationStatus={relStatus}
                          />
                        );
                      }
                    })}
                  </div>
                )}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      )}
    </div>
  );
}
