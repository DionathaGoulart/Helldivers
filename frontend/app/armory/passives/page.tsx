/**
 * Página de Passivas
 * 
 * Exibe todas as passivas disponíveis com busca e filtros
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

// 1. React e Next.js
import { useState, useEffect } from 'react';

// 2. Contextos e Hooks customizados
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';

// 3. Componentes
import Card from '@/components/ui/Card';

// 4. Utilitários e Constantes
import { getTranslatedName, getTranslatedDescription, getTranslatedEffect } from '@/lib/i18n';

// 5. Tipos
import type { Passive } from '@/lib/types/armory';

// 6. Serviços e Libs
import { getPassives } from '@/lib/armory-cached';

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
                    <div className="mb-4">
                      <h3 className="text-2xl font-semibold text-gray-900">{getTranslatedName(passive, isPortuguese())}</h3>
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

