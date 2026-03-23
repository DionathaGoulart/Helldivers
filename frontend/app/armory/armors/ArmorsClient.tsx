'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';

import ComponentCard from '@/components/armory/ComponentCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { PassiveSelect } from '@/components/armory';
import { getTranslatedName } from '@/lib/i18n';

import { saveFiltersToStorage, getFiltersFromStorage, clearFiltersFromStorage } from '@/utils/filters-storage';
import { applyCustomOrdering } from '@/utils';

import type {
  Armor,
  BattlePass,
  Passive
} from '@/lib/types/armory';
import type {
  OrderingOption,
  SourceOption,
  CategoryOption,
  PassiveOption
} from '@/lib/types/armory-page';

const DEFAULT_ORDERING: OrderingOption = 'name';

interface ArmorsClientProps {
  initialArmors: Armor[];
  initialPasses: BattlePass[];
  initialPassives: Passive[];
}

export default function ArmorsClient({ initialArmors, initialPasses, initialPassives }: ArmorsClientProps) {
  const { user, loading: authLoading } = useAuth();
  const { isPortuguese } = useLanguage();
  const { t } = useTranslation();

  const defaultFilters = {
    search: '',
    ordering: DEFAULT_ORDERING,
    category: '' as CategoryOption,
    source: '' as SourceOption,
    passField: '' as number | '',
    selectedPassiveIds: [] as number[],
    maxCost: '' as number | '',
  };

  const [search, setSearch] = useState(() => {
    if (typeof window === 'undefined') return defaultFilters.search;
    return getFiltersFromStorage('armors', defaultFilters).search;
  });
  const [ordering, setOrdering] = useState<OrderingOption>(() => {
    if (typeof window === 'undefined') return defaultFilters.ordering;
    return getFiltersFromStorage('armors', defaultFilters).ordering;
  });
  const [category, setCategory] = useState<CategoryOption>(() => {
    if (typeof window === 'undefined') return defaultFilters.category;
    return getFiltersFromStorage('armors', defaultFilters).category;
  });
  const [source, setSource] = useState<SourceOption>(() => {
    if (typeof window === 'undefined') return defaultFilters.source;
    return getFiltersFromStorage('armors', defaultFilters).source;
  });
  const [passField, setPassField] = useState<number | ''>(() => {
    if (typeof window === 'undefined') return defaultFilters.passField;
    return getFiltersFromStorage('armors', defaultFilters).passField;
  });
  const [selectedPassiveIds, setSelectedPassiveIds] = useState<number[]>(() => {
    if (typeof window === 'undefined') return defaultFilters.selectedPassiveIds;
    return getFiltersFromStorage('armors', defaultFilters).selectedPassiveIds;
  });
  const [maxCost, setMaxCost] = useState<number | ''>(() => {
    if (typeof window === 'undefined') return defaultFilters.maxCost;
    return getFiltersFromStorage('armors', defaultFilters).maxCost;
  });

  const [animatedCount, setAnimatedCount] = useState(0);

  const passives: PassiveOption[] = useMemo(() => 
    initialPassives.map(p => ({
      id: p.id,
      name: p.name,
      name_pt_br: p.name_pt_br,
      effect: p.effect || '',
      effect_pt_br: p.effect_pt_br,
      image: p.image,
    })), [initialPassives]);

  const warbondsMap: Record<number, string> = useMemo(() => {
    const map: Record<number, string> = {};
    initialPasses.forEach(p => {
      map[p.id] = isPortuguese() && p.name_pt_br ? p.name_pt_br : p.name;
    });
    return map;
  }, [initialPasses, isPortuguese]);

  const passivesMap: Record<number, any> = useMemo(() => {
    const map: Record<number, any> = {};
    initialPassives.forEach(p => {
      map[p.id] = p;
    });
    return map;
  }, [initialPassives]);

  useEffect(() => {
    saveFiltersToStorage('armors', {
      search,
      ordering,
      category,
      source,
      passField,
      selectedPassiveIds,
      maxCost
    });
  }, [search, ordering, category, source, passField, selectedPassiveIds, maxCost]);

  const filteredArmors = useMemo(() => {
    let list = [...initialArmors];

    if (search) {
      const searchLower = search.toLowerCase();
      list = list.filter((a) =>
        (a.name && a.name.toLowerCase().includes(searchLower)) ||
        (a.name_pt_br && a.name_pt_br.toLowerCase().includes(searchLower))
      );
    }

    if (maxCost) {
      list = list.filter((a) => (a.cost || 0) <= Number(maxCost));
    }
    
    if (selectedPassiveIds.length > 0) {
      list = list.filter((a) => a.passive_detail?.id && selectedPassiveIds.includes(a.passive_detail.id));
    }
    
    if (category) {
      list = list.filter((a) => a.category === category);
    }
    
    if (source) {
      list = list.filter((a) => a.source === source);
    }

    if (passField) {
      list = list.filter((a) => (a as any).pass_field === passField);
    }

    return applyCustomOrdering(list, ordering);
  }, [initialArmors, search, maxCost, selectedPassiveIds, category, source, passField, ordering]);

  useEffect(() => {
    const targetCount = filteredArmors.length;
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
  }, [filteredArmors.length, animatedCount]);

  const handleClearFilters = () => {
    setSearch('');
    setOrdering(DEFAULT_ORDERING);
    setCategory('');
    setSource('');
    setPassField('');
    setSelectedPassiveIds([]);
    setMaxCost('');
    clearFiltersFromStorage('armors');
  };

  const handleSourceChange = (newSource: SourceOption) => {
    setSource(newSource);
    if (newSource !== 'pass') setPassField('');
  };

  return (
    <div className="container page-content">
      <div className="content-section flex flex-col items-center text-center">
        <h1 className="font-bold mb-2 uppercase font-['Orbitron'] text-white text-[clamp(2.25rem,5vw,3rem)]">
          {t('armors.title')}
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">{t('armors.subtitle')}</p>
      </div>

      <Card className="content-section" glowColor="cyan">
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('armors.searchByName')}
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
                { value: 'armor', label: t('sets.orderArmorLower') },
                { value: '-armor', label: t('sets.orderArmorHigher') },
                { value: 'speed', label: t('sets.orderSpeedLower') },
                { value: '-speed', label: t('sets.orderSpeedHigher') },
                { value: 'stamina', label: t('sets.orderStaminaLower') },
                { value: '-stamina', label: t('sets.orderStaminaHigher') },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 font-['Rajdhani'] text-[#00d9ff]">
              {t('armory.category')}
            </label>
            <Select
              value={category}
              onChange={(value) => setCategory((value as CategoryOption) || '')}
              options={[
                { value: '', label: t('armory.allCategories') },
                { value: 'light', label: t('armory.light') },
                { value: 'medium', label: t('armory.medium') },
                { value: 'heavy', label: t('armory.heavy') },
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 font-['Rajdhani'] text-[#00d9ff]">
              {t('armory.passive')}
            </label>
            <PassiveSelect
              passives={passives}
              selectedIds={selectedPassiveIds}
              onChange={(ids) => setSelectedPassiveIds(ids)}
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

      {filteredArmors.length === 0 ? (
        <Card className="text-center py-12" glowColor="cyan">
          <p className="text-gray-400">{t('armors.noResults')}</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArmors.map((armor) => (
            <ComponentCard
              key={armor.id}
              item={armor}
              type="armor"
              warbondsMap={warbondsMap}
              passivesMap={passivesMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}
