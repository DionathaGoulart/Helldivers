'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';

import ComponentCard from '@/components/armory/ComponentCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { getTranslatedName } from '@/lib/i18n';

import { saveFiltersToStorage, getFiltersFromStorage, clearFiltersFromStorage } from '@/utils/filters-storage';
import { applyCustomOrdering } from '@/utils';

import type {
  Helmet,
  BattlePass,
} from '@/lib/types/armory';
import type {
  OrderingOption,
  SourceOption,
} from '@/lib/types/armory-page';

const DEFAULT_ORDERING: OrderingOption = 'name';

interface HelmetsClientProps {
  initialHelmets: Helmet[];
  initialPasses: BattlePass[];
}

export default function HelmetsClient({ initialHelmets, initialPasses }: HelmetsClientProps) {
  const { user, loading: authLoading } = useAuth();
  const { isPortuguese } = useLanguage();
  const { t } = useTranslation();

  const defaultFilters = {
    search: '',
    ordering: DEFAULT_ORDERING,
    source: '' as SourceOption,
    passField: '' as number | '',
  };

  const [search, setSearch] = useState(() => {
    if (typeof window === 'undefined') return defaultFilters.search;
    return getFiltersFromStorage('helmets', defaultFilters).search;
  });
  const [ordering, setOrdering] = useState<OrderingOption>(() => {
    if (typeof window === 'undefined') return defaultFilters.ordering;
    return getFiltersFromStorage('helmets', defaultFilters).ordering;
  });
  const [source, setSource] = useState<SourceOption>(() => {
    if (typeof window === 'undefined') return defaultFilters.source;
    return getFiltersFromStorage('helmets', defaultFilters).source;
  });
  const [passField, setPassField] = useState<number | ''>(() => {
    if (typeof window === 'undefined') return defaultFilters.passField;
    return getFiltersFromStorage('helmets', defaultFilters).passField;
  });

  const [animatedCount, setAnimatedCount] = useState(0);

  const warbondsMap: Record<number, string> = useMemo(() => {
    const map: Record<number, string> = {};
    initialPasses.forEach(p => {
      map[p.id] = isPortuguese() && p.name_pt_br ? p.name_pt_br : p.name;
    });
    return map;
  }, [initialPasses, isPortuguese]);

  useEffect(() => {
    saveFiltersToStorage('helmets', {
      search,
      ordering,
      source,
      passField,
    });
  }, [search, ordering, source, passField]);

  const filteredHelmets = useMemo(() => {
    let list = [...initialHelmets];

    if (search) {
      const searchLower = search.toLowerCase();
      list = list.filter((h) =>
        (h.name && h.name.toLowerCase().includes(searchLower)) ||
        (h.name_pt_br && h.name_pt_br.toLowerCase().includes(searchLower))
      );
    }
    
    if (source) {
      list = list.filter((h) => h.source === source);
    }

    if (passField) {
      list = list.filter((h) => (h as any).pass_field === passField);
    }

    return applyCustomOrdering(list, ordering);
  }, [initialHelmets, search, source, passField, ordering]);

  useEffect(() => {
    const targetCount = filteredHelmets.length;
    if (targetCount === animatedCount) return;
    const duration = 600;
    const steps = Math.abs(targetCount - animatedCount);
    const stepDuration = Math.max(20, duration / Math.max(steps, 1));
    const increment = targetCount > animatedCount ? 1 : -1;
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const newCount = animatedCount + (increment * currentStep);
      if ((increment > 0 && newCount >= targetCount) || (increment < 0 && newCount <= targetCount)) {
        setAnimatedCount(targetCount);
        clearInterval(interval);
      } else {
        setAnimatedCount(newCount);
      }
    }, stepDuration);
    return () => clearInterval(interval);
  }, [filteredHelmets.length, animatedCount]);

  const handleClearFilters = () => {
    setSearch('');
    setOrdering(DEFAULT_ORDERING);
    setSource('');
    setPassField('');
    clearFiltersFromStorage('helmets');
  };

  const handleSourceChange = (newSource: SourceOption) => {
    setSource(newSource);
    if (newSource !== 'pass') setPassField('');
  };

  return (
    <div className="container page-content">
      <div className="content-section flex flex-col items-center text-center">
        <h1 className="font-bold mb-2 uppercase font-['Orbitron'] text-white text-[clamp(2.25rem,5vw,3rem)]">
          {t('helmets.title')}
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">{t('helmets.subtitle')}</p>
      </div>

      <Card className="content-section" glowColor="cyan">
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('helmets.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full !pl-[3.5rem] !pr-4 !py-2.5 text-base border-2 border-[#3a4a5a] bg-[rgba(26,35,50,0.5)] text-white outline-none transition-all [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)] hover:border-[#00d9ff] focus:border-[#00d9ff] placeholder:text-gray-500"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 font-['Rajdhani'] text-[#00d9ff]">
              {t('armory.ordering')}
            </label>
            <Select
              value={ordering}
              onChange={(value) => setOrdering(value as OrderingOption)}
              options={[
                { value: 'name', label: t('sets.orderNameAZ') },
                { value: '-name', label: t('sets.orderNameZA') },
                { value: 'cost', label: t('sets.orderTotalLower') },
                { value: '-cost', label: t('sets.orderTotalHigher') },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 font-['Rajdhani'] text-[#00d9ff]">
              {t('armory.source')}
            </label>
            <Select
              value={source}
              onChange={(value) => handleSourceChange((value as SourceOption) || '')}
              options={[
                { value: '', label: t('armory.allSources') },
                { value: 'store', label: t('armory.store') },
                { value: 'pass', label: t('armory.pass') },
              ]}
            />
          </div>
        </div>

        {source === 'pass' && (
          <div className="mt-4">
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 font-['Rajdhani'] text-[#00d9ff]">
              {t('armory.specificPass')}
            </label>
            <select
              value={passField}
              onChange={(e) => setPassField(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-2.5 text-base border-2 border-[#3a4a5a] bg-[rgba(26,35,50,0.5)] text-white outline-none transition-all [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)] hover:border-[#00d9ff] focus:border-[#00d9ff]"
            >
              <option value="">{t('armory.allPasses')}</option>
              {initialPasses.map((pass) => (
                <option key={pass.id} value={pass.id}>
                  {getTranslatedName(pass, isPortuguese())}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            {t('armory.clear')}
          </Button>
        </div>
      </Card>

      {filteredHelmets.length === 0 ? (
        <Card className="text-center py-12" glowColor="cyan">
          <p className="text-gray-400">{t('helmets.noResults')}</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHelmets.map((helmet) => (
            <ComponentCard
              key={helmet.id}
              item={helmet}
              type="helmet"
              warbondsMap={warbondsMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}
