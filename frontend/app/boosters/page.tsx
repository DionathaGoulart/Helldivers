'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from '@/lib/translations';
import { useLanguage } from '@/contexts/LanguageContext';
import Card from '@/components/ui/Card';
import BoosterCard from '@/components/armory/BoosterCard';
import { getBoosters } from '@/lib/armory-cached';
import { Booster } from '@/lib/types/armory';

export default function BoostersPage() {
    const { t } = useTranslation();
    const { isPortuguese } = useLanguage();

    const [boosters, setBoosters] = useState<Booster[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchBoosters = async () => {
            setLoading(true);
            try {
                const data = await getBoosters();
                setBoosters(data);
            } catch (error) {
                console.error("Failed to fetch boosters:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBoosters();
    }, []);

    const filteredBoosters = useMemo(() => {
        return boosters.filter(b => {
            const name = isPortuguese() && b.name_pt_br ? b.name_pt_br : b.name;
            return name.toLowerCase().includes(search.toLowerCase());
        });
    }, [boosters, search, isPortuguese]);

    return (
        <div className="container page-content">
            <div className="content-section">
                <h1 className="font-bold mb-2 uppercase font-['Orbitron'] text-white text-[clamp(2.25rem,5vw,3rem)]">
                    {t('header.boosters') || "Boosters"}
                </h1>
                <p className="text-gray-400">
                    {t('boosters.subtitle') || "Enhance your squad's capabilities with these specialized enhancements."}
                </p>
            </div>

            <Card className="content-section" glowColor="cyan">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
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
                </div>
            </Card>

            {loading ? (
                <div className="text-center py-12">
                    <div className="spinner inline-block rounded-full h-12 w-12 border-[3px] border-t-[#00d9ff] border-r-transparent border-b-transparent border-l-transparent shadow-[0_0_20px_rgba(0,217,255,0.5)]"></div>
                    <p className="mt-4 text-gray-400 font-['Rajdhani'] font-bold text-[#00d9ff] uppercase tracking-wider">
                        {t('armory.loading')}
                    </p>
                </div>
            ) : filteredBoosters.length === 0 ? (
                <Card className="text-center py-12" glowColor="cyan">
                    <p className="text-gray-400">{t('armory.noResults')}</p>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBoosters.map(booster => (
                        <BoosterCard key={booster.id} booster={booster} />
                    ))}
                </div>
            )}
        </div>
    );
}
