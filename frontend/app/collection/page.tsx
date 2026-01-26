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
import { SetCard, ComponentCard, StratagemCard } from '@/components/armory';
import BoosterCard from '@/components/armory/BoosterCard';
import WeaponCard from '@/components/weaponry/WeaponCard';
import { WeaponryService } from '@/lib/weaponry-service';
import { AnyWeapon, WeaponCategory } from '@/lib/types/weaponry';

// 4. Utilitários e Constantes
import { Tab } from '@headlessui/react';
import clsx from 'clsx';

// 5. Tipos
import type { ArmorSet, Helmet, Armor, Cape, Stratagem, SetRelationStatus, Booster } from '@/lib/types/armory';

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
  getCollectionStratagems,
  getFavoriteStratagems,
  getWishlistStratagems,
  getCollectionBoosters,
  getFavoriteBoosters,
  getWishlistBoosters
} from '@/lib/armory-cached';

export default function CollectionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  // View Mode State
  const [viewMode, setViewMode] = useState<'selection' | 'armory' | 'stratagems' | 'boosters' | 'weaponry'>('selection');

  // Data States
  const [sets, setSets] = useState<ArmorSet[]>([]);
  const [helmets, setHelmets] = useState<Helmet[]>([]);
  const [armors, setArmors] = useState<Armor[]>([]);
  const [capes, setCapes] = useState<Cape[]>([]);
  const [stratagems, setStratagems] = useState<Stratagem[]>([]);
  const [boosters, setBoosters] = useState<Booster[]>([]);
  const [weapons, setWeapons] = useState<Record<WeaponCategory, AnyWeapon[]>>({
    primary: [],
    secondary: [],
    throwable: []
  });

  const [loading, setLoading] = useState(false);
  const [relations, setRelations] = useState<Record<string, SetRelationStatus>>({});
  const getRelationKey = (type: string, id: number) => `${type}-${id}`;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
    }
  }, [user, router, authLoading]);

  // Fetch Logic based on selection
  useEffect(() => {
    if (viewMode === 'selection' || authLoading || !user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (viewMode === 'armory') {
          const [colSets, colHelmets, colArmors, colCapes] = await Promise.all([
            getCollectionSets(), getCollectionHelmets(), getCollectionArmors(), getCollectionCapes()
          ]);
          setSets(colSets || []);
          setHelmets(colHelmets || []);
          setArmors(colArmors || []);
          setCapes(colCapes || []);

          // Context
          const [favSets, favHelmets, favArmors, favCapes, wishSets, wishHelmets, wishArmors, wishCapes] = await Promise.all([
            getFavoriteSets(), getFavoriteHelmets(), getFavoriteArmors(), getFavoriteCapes(),
            getWishlistSets(), getWishlistHelmets(), getWishlistArmors(), getWishlistCapes()
          ]);

          // Update Relations
          const newRelations: Record<string, SetRelationStatus> = { ...relations };
          const processItems = (items: { id: number }[], type: string, favList: { id: number }[], wishList: { id: number }[]) => {
            const favIds = new Set(favList.map(i => i.id));
            const wishIds = new Set(wishList.map(i => i.id));
            items.forEach(item => {
              newRelations[getRelationKey(type, item.id)] = {
                favorite: favIds.has(item.id),
                collection: true,
                wishlist: wishIds.has(item.id)
              };
            });
          };
          processItems(colSets, 'set', favSets, wishSets);
          processItems(colHelmets, 'helmet', favHelmets, wishHelmets);
          processItems(colArmors, 'armor', favArmors, wishArmors);
          processItems(colCapes, 'cape', favCapes, wishCapes);
          setRelations(newRelations);

        } else if (viewMode === 'stratagems') {
          const colStratagems = await getCollectionStratagems();
          setStratagems(colStratagems || []);

          // Context
          const [favStratagems, wishStratagems] = await Promise.all([
            getFavoriteStratagems(), getWishlistStratagems()
          ]);

          // Update Relations
          const newRelations: Record<string, SetRelationStatus> = { ...relations };
          const favIds = new Set(favStratagems.map(i => i.id));
          const wishIds = new Set(wishStratagems.map(i => i.id));
          colStratagems.forEach(item => {
            newRelations[getRelationKey('stratagem', item.id)] = {
              favorite: favIds.has(item.id),
              collection: true,
              wishlist: wishIds.has(item.id)
            };
          });
          setRelations(newRelations);

        } else if (viewMode === 'boosters') {
          const colBoosters = await getCollectionBoosters();
          setBoosters(colBoosters || []);

          const [favBoosters, wishBoosters] = await Promise.all([
            getFavoriteBoosters(), getWishlistBoosters()
          ]);

          const newRelations: Record<string, SetRelationStatus> = { ...relations };
          const favIds = new Set(favBoosters.map(i => i.id));
          const wishIds = new Set(wishBoosters.map(i => i.id));
          colBoosters.forEach(item => {
            newRelations[getRelationKey('booster', item.id)] = {
              favorite: favIds.has(item.id),
              collection: true,
              wishlist: wishIds.has(item.id)
            };
          });
          setRelations(newRelations);

        } else if (viewMode === 'weaponry') {
          const [colPrimary, colSecondary, colThrowable] = await Promise.all([
            WeaponryService.getUserItems('primary', 'collection'),
            WeaponryService.getUserItems('secondary', 'collection'),
            WeaponryService.getUserItems('throwable', 'collection')
          ]);
          setWeapons({
            primary: colPrimary,
            secondary: colSecondary,
            throwable: colThrowable
          });

          // Context (Favorite & Wishlist)
          const [favPrimary, favSecondary, favThrowable, wishPrimary, wishSecondary, wishThrowable] = await Promise.all([
            WeaponryService.getUserItems('primary', 'favorite'),
            WeaponryService.getUserItems('secondary', 'favorite'),
            WeaponryService.getUserItems('throwable', 'favorite'),
            WeaponryService.getUserItems('primary', 'wishlist'),
            WeaponryService.getUserItems('secondary', 'wishlist'),
            WeaponryService.getUserItems('throwable', 'wishlist')
          ]);

          // Update Relations
          const newRelations: Record<string, SetRelationStatus> = { ...relations };
          const processWeapons = (items: { id: number }[], category: string, favList: { id: number }[], wishList: { id: number }[]) => {
            const favIds = new Set(favList.map(i => i.id));
            const wishIds = new Set(wishList.map(i => i.id));
            items.forEach(item => {
              newRelations[getRelationKey(category, item.id)] = {
                favorite: favIds.has(item.id),
                collection: true,
                wishlist: wishIds.has(item.id)
              };
            });
          };
          processWeapons(colPrimary, 'primary', favPrimary, wishPrimary);
          processWeapons(colSecondary, 'secondary', favSecondary, wishSecondary);
          processWeapons(colThrowable, 'throwable', favThrowable, wishThrowable);
          setRelations(newRelations);
        }

      } catch (error) {
        console.error("Error fetching collection:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewMode, user, authLoading]);

  const armoryCategories = [
    { key: 'sets', label: t('nav.sets'), items: sets, type: 'set' },
    { key: 'helmets', label: t('nav.helmets'), items: helmets, type: 'helmet' },
    { key: 'armors', label: t('nav.armors'), items: armors, type: 'armor' },
    { key: 'capes', label: t('nav.capes'), items: capes, type: 'cape' },
  ];

  return (
    <div className="container page-content">
      <div className={`content-section mb-8 ${viewMode === 'selection' ? 'max-w-4xl mx-auto' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-bold mb-2 uppercase break-words font-['Orbitron'] text-white text-[clamp(2.25rem,5vw,3rem)]">
              {t('collection.title')}
            </h1>
            <p className="text-gray-400">
              {t('collection.subtitle')}
            </p>
          </div>
          {viewMode !== 'selection' && (
            <Button variant="secondary" size="md" onClick={() => setViewMode('selection')}>
              ← {t('actions.back')}
            </Button>
          )}
        </div>
      </div>

      {viewMode === 'selection' && (
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
          <div
            onClick={() => setViewMode('armory')}
            className="bg-[#1a2332] border border-[#00d9ff]/30 p-8 rounded-xl cursor-pointer hover:bg-[#1a2332]/80 hover:scale-[1.02] transition-all group flex flex-col items-center justify-center gap-4 h-64"
          >
            <h2 className="text-3xl font-bold font-['Orbitron'] text-white uppercase tracking-wider">{t('nav.armory')}</h2>
            <p className="text-gray-400 text-center">{t('nav.sets')}, {t('nav.helmets')}, {t('nav.armors')}, {t('nav.capes')}</p>
          </div>

          <div
            onClick={() => setViewMode('stratagems')}
            className="bg-[#1a2332] border border-[#00d9ff]/30 p-8 rounded-xl cursor-pointer hover:bg-[#1a2332]/80 hover:scale-[1.02] transition-all group flex flex-col items-center justify-center gap-4 h-64"
          >
            <h2 className="text-3xl font-bold font-['Orbitron'] text-white uppercase tracking-wider">{t('nav.stratagems')}</h2>
            <p className="text-gray-400 text-center">{t('nav.stratagems')}</p>
          </div>

          {/* Boosters Button - No Icon */}
          <div
            onClick={() => setViewMode('boosters')}
            className="bg-[#1a2332] border border-[#00d9ff]/30 p-8 rounded-xl cursor-pointer hover:bg-[#1a2332]/80 hover:scale-[1.02] transition-all group flex flex-col items-center justify-center gap-4 h-64"
          >
            <h2 className="text-3xl font-bold font-['Orbitron'] text-white uppercase tracking-wider">{t('header.boosters') || 'BOOSTERS'}</h2>
            <p className="text-gray-400 text-center">{t('boosters.subtitle') || 'Enhancements'}</p>
          </div>

          <div
            onClick={() => setViewMode('weaponry')}
            className="bg-[#1a2332] border border-[#00d9ff]/30 p-8 rounded-xl cursor-pointer hover:bg-[#1a2332]/80 hover:scale-[1.02] transition-all group flex flex-col items-center justify-center gap-4 h-64"
          >
            <h2 className="text-3xl font-bold font-['Orbitron'] text-white uppercase tracking-wider">{t('nav.weaponry')}</h2>
            <p className="text-gray-400 text-center">Primary, Secondary, Throwable</p>
          </div>
        </div>
      )}

      {(authLoading || loading) && viewMode !== 'selection' ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{t('collection.loading')}</p>
        </div>
      ) : null}

      {!loading && viewMode === 'armory' && (
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-8 overflow-x-auto">
            {armoryCategories.map((cat) => (
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
            {armoryCategories.map((cat, idx) => (
              <Tab.Panel key={idx} className="rounded-xl focus:outline-none">
                {cat.items.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">{t('collection.empty')}</div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cat.items.map((item) => {
                      const relStatus = relations[getRelationKey(cat.type, item.id)] || { favorite: false, collection: true, wishlist: false };
                      if (cat.type === 'set') {
                        return <SetCard key={item.id} set={item as ArmorSet} initialRelationStatus={relStatus} />;
                      } else {
                        return <ComponentCard key={item.id} item={item as any} type={cat.type as any} initialRelationStatus={relStatus} />;
                      }
                    })}
                  </div>
                )}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      )}

      {!loading && viewMode === 'stratagems' && (
        <>
          {stratagems.length === 0 ? (
            <div className="text-center text-gray-500 py-12">{t('collection.empty')}</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stratagems.map((item) => {
                const relStatus = relations[getRelationKey('stratagem', item.id)] || { favorite: false, collection: true, wishlist: false };
                return <StratagemCard key={item.id} stratagem={item} initialRelationStatus={relStatus} />;
              })}
            </div>
          )}
        </>
      )}

      {!loading && viewMode === 'boosters' && (
        <>
          {boosters.length === 0 ? (
            <div className="text-center text-gray-500 py-12">{t('collection.empty')}</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {boosters.map((item) => {
                const relStatus = relations[getRelationKey('booster', item.id)] || { favorite: false, collection: true, wishlist: false };
                return <BoosterCard key={item.id} booster={item} initialRelationStatus={relStatus} />;
              })}
            </div>
          )}
        </>
      )}

      {!loading && viewMode === 'weaponry' && (
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-8 overflow-x-auto">
            {(['primary', 'secondary', 'throwable'] as WeaponCategory[]).map((cat) => (
              <Tab
                key={cat}
                className={({ selected }) =>
                  clsx(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 uppercase',
                    'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-yellow-400 text-black shadow'
                      : 'text-gray-400 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                {t(`nav.${cat}`)} ({weapons[cat].length})
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {(['primary', 'secondary', 'throwable'] as WeaponCategory[]).map((cat) => (
              <Tab.Panel key={cat} className="rounded-xl focus:outline-none">
                {weapons[cat].length === 0 ? (
                  <div className="text-center text-gray-500 py-12">{t('collection.empty')}</div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {weapons[cat].map((weapon) => {
                      const relStatus = relations[getRelationKey(cat, weapon.id)] || { favorite: false, collection: true, wishlist: false };
                      return <WeaponCard key={weapon.id} weapon={weapon} category={cat} initialRelationStatus={relStatus} />;
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
