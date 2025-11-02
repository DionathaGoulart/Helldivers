'use client';

import { useState, useEffect } from 'react';
import { getWishlistSets, ArmorSet, removeSetRelation } from '@/lib/armory-cached';
import { getDefaultImage } from '@/lib/armory/images';
import { getTranslatedName } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { isPortuguese } = useLanguage();
  const { t } = useTranslation();
  const [sets, setSets] = useState<ArmorSet[]>([]);
  const [loading, setLoading] = useState(true);

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
        const data = await getWishlistSets();
        setSets(Array.isArray(data) ? data : []);
      } catch (error) {
        // Erro ao buscar wishlist
        setSets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, router, authLoading]);

  const handleRemoveFromWishlist = async (set: ArmorSet) => {
    try {
      await removeSetRelation(set.id, 'wishlist');
      setSets(sets.filter(s => s.id !== set.id));
    } catch (error: any) {
      // Erro ao remover da wishlist
      alert(error.response?.data?.detail || error.message || t('wishlist.removeError'));
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
            {sets.map((set) => (
              <Card key={set.id} className="hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  <img
                    src={set.image || getDefaultImage('set')}
                    alt={set.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveFromWishlist(set)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                    title={t('wishlist.remove')}
                  >
                    <svg
                      className="w-5 h-5 text-green-500 fill-current"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </button>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{getTranslatedName(set, isPortuguese())}</h3>
                  
                  {set.armor_stats?.category_display && (
                    <span className="inline-block mb-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {set.armor_stats.category_display}
                    </span>
                  )}

                  {set.armor_stats && (
                    <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                      <div className="p-2 bg-gray-50 rounded text-center">
                        <p className="text-gray-600 text-xs">{t('wishlist.armor')}</p>
                        <p className="font-semibold">{set.armor_stats.armor_display || set.armor_stats.armor}</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded text-center">
                        <p className="text-gray-600 text-xs">{t('wishlist.speed')}</p>
                        <p className="font-semibold">{set.armor_stats.speed_display || set.armor_stats.speed}</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded text-center">
                        <p className="text-gray-600 text-xs">{t('wishlist.stamina')}</p>
                        <p className="font-semibold">{set.armor_stats.stamina_display || set.armor_stats.stamina}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-semibold text-gray-700">{t('wishlist.totalCost')}</span>
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

