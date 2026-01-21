/**
 * Página de Wishlist
 * 
 * Exibe todos os itens marcados como wishlist pelo usuário, separados por abas
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

export default function WishlistPage() {
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

    const fetchAllWishlist = async () => {
      setLoading(true);
      try {
        // 1. Fetch ALL wishlist items
        const [
          wishSets, wishHelmets, wishArmors, wishCapes
        ] = await Promise.all([
          getWishlistSets(),
          getWishlistHelmets(),
          getWishlistArmors(),
          getWishlistCapes()
        ]);

        setSets(wishSets || []);
        setHelmets(wishHelmets || []);
        setArmors(wishArmors || []);
        setCapes(wishCapes || []);

        // 2. Fetch context (Favorite/Collection status) for these items
        const [
          favSets, favHelmets, favArmors, favCapes,
          colSets, colHelmets, colArmors, colCapes
        ] = await Promise.all([
          getFavoriteSets(), getFavoriteHelmets(), getFavoriteArmors(), getFavoriteCapes(),
          getCollectionSets(), getCollectionHelmets(), getCollectionArmors(), getCollectionCapes()
        ]);

        // Build Relations Map
        const newRelations: Record<string, SetRelationStatus> = {};

        // Helper to process items
        const processItems = (items: { id: number }[], type: string, favList: { id: number }[], colList: { id: number }[]) => {
          const favIds = new Set(favList.map(i => i.id));
          const colIds = new Set(colList.map(i => i.id));

          items.forEach(item => {
            newRelations[getRelationKey(type, item.id)] = {
              favorite: favIds.has(item.id),
              collection: colIds.has(item.id),
              wishlist: true // Inherently true on wishlist page
            };
          });
        };

        processItems(wishSets, 'set', favSets, colSets);
        processItems(wishHelmets, 'helmet', favHelmets, colHelmets);
        processItems(wishArmors, 'armor', favArmors, colArmors);
        processItems(wishCapes, 'cape', favCapes, colCapes);

        setRelations(newRelations);

      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllWishlist();
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
          <p className="mt-4 text-gray-600">{t('wishlist.loading')}</p>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">{t('wishlist.noResults')}</h3>
                    <p className="mt-2 text-gray-500">{t('wishlist.empty')}</p>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cat.items.map((item) => {
                      const relStatus = relations[getRelationKey(cat.type, item.id)] || { favorite: false, collection: false, wishlist: true };

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
