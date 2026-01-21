'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from '@/lib/translations';
import { useLanguage } from '@/contexts/LanguageContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import WeaponCard from '@/components/weaponry/WeaponCard';
import { WeaponryService } from '@/lib/weaponry-service';
import { AnyWeapon, WeaponCategory } from '@/lib/types/weaponry';

export default function WeaponryPage() {
    const { t } = useTranslation();
    const { isPortuguese } = useLanguage();

    const [activeTab, setActiveTab] = useState<WeaponCategory>('primary');
    const [weapons, setWeapons] = useState<Record<WeaponCategory, AnyWeapon[]>>({
        primary: [],
        secondary: [],
        throwable: []
    });
    const [loading, setLoading] = useState(false);
    const [loadedTabs, setLoadedTabs] = useState<Record<WeaponCategory, boolean>>({
        primary: false,
        secondary: false,
        throwable: false
    });
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchWeapons = async () => {
            if (loadedTabs[activeTab]) return;

            setLoading(true);
            try {
                const data = await WeaponryService.getWeapons(activeTab);
                setWeapons(prev => ({ ...prev, [activeTab]: data }));
                setLoadedTabs(prev => ({ ...prev, [activeTab]: true }));
            } catch (error) {
                console.error(`Failed to fetch ${activeTab} weapons:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeapons();
    }, [activeTab, loadedTabs]);

    const filteredWeapons = useMemo(() => {
        const currentList = weapons[activeTab];
        if (!currentList) return [];

        return currentList.filter(w => {
            const name = isPortuguese() && w.name_pt_br ? w.name_pt_br : w.name;
            return name.toLowerCase().includes(search.toLowerCase());
        });
    }, [weapons, activeTab, search, isPortuguese]);

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

                {/* Search */}
                <div className="relative">
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
            </Card>

            {loading && filteredWeapons.length === 0 ? (
                <div className="text-center py-12">
                    <div className="spinner inline-block rounded-full h-12 w-12 border-[3px] border-t-[#00d9ff] border-r-transparent border-b-transparent border-l-transparent shadow-[0_0_20px_rgba(0,217,255,0.5)]"></div>
                    <p className="mt-4 text-gray-400 font-['Rajdhani'] font-bold text-[#00d9ff] uppercase tracking-wider">
                        {t('armory.loading')}
                    </p>
                </div>
            ) : filteredWeapons.length === 0 ? (
                <Card className="text-center py-12" glowColor="cyan">
                    <p className="text-gray-400">{t('armory.noResults')}</p>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredWeapons.map(weapon => (
                        <WeaponCard key={weapon.id} weapon={weapon} category={activeTab} />
                    ))}
                </div>
            )}
        </div>
    );
}
