'use client';

import { useState, useEffect } from 'react';
import { getPassives, Passive, addFavorite, removeFavorite, isFavorite } from '@/lib/armory-cached';
import { getTranslatedName, getTranslatedDescription, getTranslatedEffect } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';
import Card from '@/components/ui/Card';

export default function PassivesPage() {
  const { isPortuguese } = useLanguage();
  const { t } = useTranslation();
  const [passives, setPassives] = useState<Passive[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPassives = async () => {
      setLoading(true);
      try {
        const data = await getPassives();
        setPassives(Array.isArray(data) ? data : []);
      } catch (error) {
        // Erro ao buscar passivas
        setPassives([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPassives();
  }, []);

  const handleToggleFavorite = (passive: Passive) => {
    const favorite = isFavorite('armor', passive.id);
    
    if (favorite) {
      removeFavorite('armor', passive.id);
    } else {
      addFavorite({
        type: 'armor',
        id: passive.id,
        name: passive.name
      });
    }
  };

  const filteredPassives = passives.filter(passive => {
    const name = getTranslatedName(passive, isPortuguese()).toLowerCase();
    const description = getTranslatedDescription(passive, isPortuguese()).toLowerCase();
    const effect = getTranslatedEffect(passive, isPortuguese()).toLowerCase();
    const searchLower = search.toLowerCase();
    return name.includes(searchLower) || description.includes(searchLower) || effect.includes(searchLower);
  });

  return (
    <div className="container page-content">
        <div className="content-section">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('passives.title')}</h1>
          <p className="text-gray-600">{t('passives.subtitle')}</p>
        </div>

        {/* Busca */}
        <Card className="content-section">
          <input
            type="text"
            placeholder={t('passives.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </Card>

        {/* Resultados */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{t('passives.loading')}</p>
          </div>
        ) : filteredPassives.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600">{t('passives.noResults')}</p>
          </Card>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {t('passives.results', { count: filteredPassives.length })}
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {filteredPassives.map((passive) => (
                <Card key={passive.id} className="hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-2xl font-semibold text-gray-900">{getTranslatedName(passive, isPortuguese())}</h3>
                      <button
                        onClick={() => handleToggleFavorite(passive)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{t('passives.description')}</p>
                        <p className="text-gray-600">{getTranslatedDescription(passive, isPortuguese())}</p>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">{t('passives.effect')}</p>
                        <p className="text-sm text-blue-800">{getTranslatedEffect(passive, isPortuguese())}</p>
                      </div>
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

