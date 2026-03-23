'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from '@/lib/translations';
import { useLanguage } from '@/contexts/LanguageContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import MultiSelect from '@/components/ui/MultiSelect';
import WeaponCard from '@/components/weaponry/WeaponCard';
import { AnyWeapon, WeaponCategory, PrimaryWeapon, SecondaryWeapon, Throwable } from '@/lib/types/weaponry';
import { BattlePass, SetRelationStatus, AcquisitionSource } from '@/lib/types/armory';
import { useAuth } from '@/contexts/AuthContext';
import { RelationService } from '@/lib/armory/relation-service';

interface WeaponryClientProps {
    initialWeapons: Record<WeaponCategory, AnyWeapon[]>;
    initialPasses: BattlePass[];
    initialSources: AcquisitionSource[];
}

export default function WeaponryClient({ initialWeapons, initialPasses, initialSources }: WeaponryClientProps) {
    const { t } = useTranslation();
    const { isPortuguese } = useLanguage();

    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<WeaponCategory>('primary');
    const [search, setSearch] = useState('');
    const [selectedWeaponTypes, setSelectedWeaponTypes] = useState<string[]>([]);
    
    const [relationStatuses, setRelationStatuses] = useState<Record<string, Record<string, SetRelationStatus>>>({
        primary: {},
        secondary: {},
        throwable: {}
    });

    useEffect(() => {
        if (!user) return;

        const fetchAllStatuses = async () => {
            const [primary, secondary, throwable] = await Promise.all([
                RelationService.checkBulkStatus('primary_weapon', initialWeapons.primary?.map(w => w.id) || [], user.id),
                RelationService.checkBulkStatus('secondary_weapon', initialWeapons.secondary?.map(w => w.id) || [], user.id),
                RelationService.checkBulkStatus('throwable_weapon', initialWeapons.throwable?.map(w => w.id) || [], user.id)
            ]);

            setRelationStatuses({
                primary,
                secondary,
                throwable: throwable as any // Throwable uses 'throwable' in client but 'throwable_weapon' in service
            });
        };

        fetchAllStatuses();
    }, [user, initialWeapons]);
    
    // Warbonds Map for efficient lookup
    const warbondsMap = useMemo(() => {
        const map: Record<number, string> = {};
        initialPasses.forEach(p => {
            map[p.id] = isPortuguese() && p.name_pt_br ? p.name_pt_br : p.name;
        });
        return map;
    }, [initialPasses, isPortuguese]);
    
    // Acquisition Sources Map
    const acquisitionSourcesMap = useMemo(() => {
        const map: Record<number, string> = {};
        initialSources.forEach(s => {
            map[s.id] = isPortuguese() && s.name_pt_br ? s.name_pt_br : s.name;
        });
        return map;
    }, [initialSources, isPortuguese]);

    // Reset filters when tab changes
    useEffect(() => {
        setSelectedWeaponTypes([]);
        setSearch('');
    }, [activeTab]);

    const filteredWeapons = useMemo(() => {
        const currentList = initialWeapons[activeTab] || [];

        return currentList.filter(w => {
            const name = isPortuguese() && w.name_pt_br ? w.name_pt_br : w.name;
            const matchesSearch = name.toLowerCase().includes(search.toLowerCase());

            let matchesType = true;
            if (activeTab === 'primary') {
                const weapon = w as PrimaryWeapon;
                if (selectedWeaponTypes.length > 0) {
                    matchesType = selectedWeaponTypes.includes(weapon.weapon_type);
                }
            } else if (activeTab === 'secondary') {
                const weapon = w as SecondaryWeapon;
                if (selectedWeaponTypes.length > 0) {
                    matchesType = selectedWeaponTypes.includes(weapon.weapon_type);
                }
            } else if (activeTab === 'throwable') {
                const weapon = w as Throwable;
                if (selectedWeaponTypes.length > 0) {
                    matchesType = selectedWeaponTypes.includes(weapon.weapon_type);
                }
            }

            return matchesSearch && matchesType;
        });
    }, [initialWeapons, activeTab, search, selectedWeaponTypes, isPortuguese]);

    const getWeaponTypeOptions = () => {
        switch (activeTab) {
            case 'primary':
                return [
                    { value: 'assault_rifle', label: t('weaponry.weaponTypes.assault_rifle') },
                    { value: 'marksman_rifle', label: t('weaponry.weaponTypes.marksman_rifle') },
                    { value: 'submachine_gun', label: t('weaponry.weaponTypes.submachine_gun') },
                    { value: 'shotgun', label: t('weaponry.weaponTypes.shotgun') },
                    { value: 'explosive', label: t('weaponry.weaponTypes.explosive') },
                    { value: 'energy', label: t('weaponry.weaponTypes.energy') },
                    { value: 'special', label: t('weaponry.weaponTypes.special') },
                ];
            case 'secondary':
                return [
                    { value: 'pistol', label: t('weaponry.weaponTypes.pistol') },
                    { value: 'melee', label: t('weaponry.weaponTypes.melee') },
                    { value: 'special', label: t('weaponry.weaponTypes.special') },
                ];
            case 'throwable':
                return [
                    { value: 'standard', label: t('weaponry.weaponTypes.standard') },
                    { value: 'special', label: t('weaponry.weaponTypes.special') },
                ];
            default:
                return [];
        }
    };

    return (
        <div className="container page-content">
            <div className="content-section">
                <h1 className="font-bold mb-2 uppercase font-['Orbitron'] text-white text-[clamp(2.25rem,5vw,3rem)]">
                    {t('nav.weaponry')}
                </h1>
                <p className="text-gray-400">
                    {t('armory.subtitle') || 'Explore your arsenal.'}
                </p>
            </div>

            <Card className="content-section" glowColor="cyan">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {(['primary', 'secondary', 'throwable'] as WeaponCategory[]).map((tab) => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? 'primary' : 'ghost'}
                            onClick={() => setActiveTab(tab)}
                            className="flex-1 sm:flex-none uppercase"
                        >
                            {t(`nav.${tab}`)}
                        </Button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder={t('armory.searchPlaceholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full !pl-[3.5rem] !pr-4 !py-2.5 text-base border-2 border-[#3a4a5a] bg-[rgba(26,35,50,0.5)] text-white outline-none transition-all [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)] hover:border-[#00d9ff] focus:border-[#00d9ff] placeholder:text-gray-500"
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Multi-Select Type Filter */}
                    <div className="w-full md:w-64">
                        <MultiSelect
                            value={selectedWeaponTypes}
                            onChange={setSelectedWeaponTypes}
                            options={getWeaponTypeOptions()}
                            placeholder={t('armory.filters')}
                        />
                    </div>
                </div>
            </Card>

            {filteredWeapons.length === 0 ? (
                <Card className="text-center py-12" glowColor="cyan">
                    <p className="text-gray-400">{t('armory.noResults')}</p>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredWeapons.map(weapon => (
                        <WeaponCard 
                            key={weapon.id} 
                            weapon={weapon} 
                            category={activeTab} 
                            warbondsMap={warbondsMap} 
                            acquisitionSourcesMap={acquisitionSourcesMap}
                            initialRelationStatus={relationStatuses[activeTab]?.[String(weapon.id)]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
