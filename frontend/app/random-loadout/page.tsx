'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@/lib/translations';
import { useLanguage } from '@/contexts/LanguageContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { getDefaultImage } from '@/lib/armory/images';
import { WeaponryService } from '@/lib/weaponry-service';
import {
    Stratagem,
    Booster,
    Helmet,
    Armor,
    Cape
} from '@/lib/types/armory';
import { AnyWeapon } from '@/lib/types/weaponry';
import Image from 'next/image';

interface Loadout {
    stratagems: Stratagem[];
    booster: Booster | null;
    helmet: Helmet | null;
    armor: Armor | null;
    cape: Cape | null;
    primary: AnyWeapon | null;
    secondary: AnyWeapon | null;
    throwable: AnyWeapon | null;
}

export default function RandomLoadoutPage() {
    const { t } = useTranslation();
    const { isPortuguese } = useLanguage();

    const [loading, setLoading] = useState(true);

    const [loadout, setLoadout] = useState<Loadout>({
        stratagems: [],
        booster: null,
        helmet: null,
        armor: null,
        cape: null,
        primary: null,
        secondary: null,
        throwable: null,
    });

    const fetchCount = async (url: string): Promise<number> => {
        try {
            // Fetch with minimal overhead to get count
            const response = await api.get(`${url}?limit=1&_t=${Date.now()}`);

            // Handle array response (non-paginated)
            if (Array.isArray(response.data)) {
                return response.data.length;
            }

            // Handle paginated response
            return response.data.count || 0;
        } catch (error) {
            console.error(`Failed to fetch count for ${url}`, error);
            return 0;
        }
    };

    const fetchItemAtIndex = async <T extends unknown>(url: string, index: number): Promise<T | null> => {
        try {
            // Robust Strategy: Assume default page size of 20 (backend default)
            const PAGE_SIZE = 20;
            const page = Math.floor(index / PAGE_SIZE) + 1;
            const itemIndex = index % PAGE_SIZE;

            const response = await api.get(`${url}?page=${page}&_t=${Date.now()}`);

            // Handle array response (non-paginated endpoints like Stratagems)
            if (Array.isArray(response.data)) {
                const results = response.data;
                if (results.length > index) {
                    return results[index];
                }
                return null;
            }

            // Handle paginated response
            const results = response.data.results;
            if (results && results.length > itemIndex) {
                return results[itemIndex];
            }
            return null;
        } catch (error) {
            console.error(`Failed to fetch item at index ${index} for ${url}`, error);
            return null;
        }
    };

    const randomize = useCallback(async () => {
        setLoading(true);
        // Clear previous loadout to give visual feedback
        setLoadout({
            stratagems: [],
            booster: null,
            helmet: null,
            armor: null,
            cape: null,
            primary: null,
            secondary: null,
            throwable: null,
        });

        try {
            // 1. Get counts for all categories in parallel
            const endpoints = {
                stratagems: '/api/v1/stratagems/',
                boosters: '/api/v1/boosters/',
                helmets: '/api/v1/armory/helmets/',
                armors: '/api/v1/armory/armors/',
                capes: '/api/v1/armory/capes/',
                primaries: '/api/v1/weaponry/primary/',
                secondaries: '/api/v1/weaponry/secondary/',
                throwables: '/api/v1/weaponry/throwable/',
            };

            const counts = await Promise.all([
                fetchCount(endpoints.stratagems),
                fetchCount(endpoints.boosters),
                fetchCount(endpoints.helmets),
                fetchCount(endpoints.armors),
                fetchCount(endpoints.capes),
                fetchCount(endpoints.primaries),
                fetchCount(endpoints.secondaries),
                fetchCount(endpoints.throwables),
            ]);

            const [
                stratagemCount,
                boosterCount,
                helmetCount,
                armorCount,
                capeCount,
                primaryCount,
                secondaryCount,
                throwableCount
            ] = counts;

            // 2. Generate random offsets
            const getOffsets = (total: number, count: number) => {
                if (total === 0) return [];
                const offsets = new Set<number>();
                while (offsets.size < Math.min(count, total)) {
                    offsets.add(Math.floor(Math.random() * total));
                }
                return Array.from(offsets);
            };

            const stratagemOffsets = getOffsets(stratagemCount, 4);
            const boosterOffset = boosterCount > 0 ? Math.floor(Math.random() * boosterCount) : -1;
            const helmetOffset = helmetCount > 0 ? Math.floor(Math.random() * helmetCount) : -1;
            const armorOffset = armorCount > 0 ? Math.floor(Math.random() * armorCount) : -1;
            const capeOffset = capeCount > 0 ? Math.floor(Math.random() * capeCount) : -1;
            const primaryOffset = primaryCount > 0 ? Math.floor(Math.random() * primaryCount) : -1;
            const secondaryOffset = secondaryCount > 0 ? Math.floor(Math.random() * secondaryCount) : -1;
            const throwableOffset = throwableCount > 0 ? Math.floor(Math.random() * throwableCount) : -1;

            // 3. Fetch items at offsets (indices) in parallel
            // Stratagems first
            const stratagemPromises = stratagemOffsets.map(index =>
                fetchItemAtIndex<Stratagem>(endpoints.stratagems, index)
            );

            // Other items
            const itemPromises = [
                boosterOffset >= 0 ? fetchItemAtIndex<Booster>(endpoints.boosters, boosterOffset) : Promise.resolve(null),
                helmetOffset >= 0 ? fetchItemAtIndex<Helmet>(endpoints.helmets, helmetOffset) : Promise.resolve(null),
                armorOffset >= 0 ? fetchItemAtIndex<Armor>(endpoints.armors, armorOffset) : Promise.resolve(null),
                capeOffset >= 0 ? fetchItemAtIndex<Cape>(endpoints.capes, capeOffset) : Promise.resolve(null),
                primaryOffset >= 0 ? fetchItemAtIndex<AnyWeapon>(endpoints.primaries, primaryOffset) : Promise.resolve(null),
                secondaryOffset >= 0 ? fetchItemAtIndex<AnyWeapon>(endpoints.secondaries, secondaryOffset) : Promise.resolve(null),
                throwableOffset >= 0 ? fetchItemAtIndex<AnyWeapon>(endpoints.throwables, throwableOffset) : Promise.resolve(null),
            ];

            const [
                fetchedStratagems,
                [fetchedBooster, fetchedHelmet, fetchedArmor, fetchedCape, fetchedPrimary, fetchedSecondary, fetchedThrowable]
            ] = await Promise.all([
                Promise.all(stratagemPromises),
                Promise.all(itemPromises)
            ]);

            setLoadout({
                stratagems: fetchedStratagems.filter(Boolean) as Stratagem[],
                booster: fetchedBooster as Booster | null,
                helmet: fetchedHelmet as Helmet | null,
                armor: fetchedArmor as Armor | null,
                cape: fetchedCape as Cape | null,
                primary: fetchedPrimary as AnyWeapon | null,
                secondary: fetchedSecondary as AnyWeapon | null,
                throwable: fetchedThrowable as AnyWeapon | null,
            });

        } catch (error) {
            console.error("Randomization failed", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial state: User must click button to randomize
    useEffect(() => {
        setLoading(false);
    }, []);

    const getName = (item: any) => {
        if (!item) return '';
        return isPortuguese() && item.name_pt_br ? item.name_pt_br : item.name;
    };

    const ItemBox = ({ item, label, shape = 'square', type }: { item: any, label?: string, shape?: 'square' | 'hexagon', type: 'stratagem' | 'booster' | 'helmet' | 'armor' | 'cape' | 'primary' | 'secondary' | 'throwable' }) => {
        const defaultImage = getDefaultImage(type);
        const [imgSrc, setImgSrc] = useState<string>(defaultImage);

        // Update image when item changes
        useEffect(() => {
            if (item) {
                setImgSrc(item.image || item.icon || defaultImage);
            } else {
                setImgSrc(defaultImage);
            }
        }, [item, defaultImage]);

        const handleError = () => {
            if (imgSrc !== defaultImage) {
                setImgSrc(defaultImage);
            }
        };

        return (
            <div className="flex flex-col items-center gap-2">
                <div
                    className={`
                        relative bg-[#1a2332] border-2 border-[#3a4a5a] 
                        flex items-center justify-center overflow-hidden
                        ${shape === 'hexagon'
                            ? 'w-16 h-16 [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)] hover:border-[#00d9ff]'
                            : 'w-20 h-20 rounded-sm hover:border-[#00d9ff] transition-colors'
                        }
                    `}
                >
                    {item ? (
                        <div className="relative w-full h-full p-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={imgSrc}
                                alt={getName(item)}
                                className="w-full h-full object-contain"
                                onError={handleError}
                            />
                        </div>
                    ) : (
                        <div className="relative w-full h-full p-4 opacity-20">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={defaultImage}
                                alt=""
                                className="w-full h-full object-contain filter grayscale"
                            />
                        </div>
                    )}
                </div>
                {item && <span className="text-[10px] text-center text-gray-300 line-clamp-2 h-6 w-24 leading-tight font-medium">{getName(item)}</span>}
                {!item && label && <span className="text-[10px] text-center text-gray-500 w-24 italic">{label}</span>}
            </div>
        );
    };

    return (
        <div className="container page-content max-w-4xl mx-auto">
            <div className="content-section text-center mb-8">
                <h1 className="font-bold mb-2 uppercase font-['Orbitron'] text-white text-[clamp(2rem,4vw,2.5rem)]">
                    {t('nav.randomLoadout') || "Random Loadout"}
                </h1>
            </div>

            <Card className="p-6 backdrop-blur-md" glowColor="cyan">
                {/* Top Section: Stratagems + Booster */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
                    {/* Stratagems */}
                    <div className="grid grid-cols-4 gap-2 md:gap-4 w-full max-w-lg">
                        {[0, 1, 2, 3].map(i => (
                            <ItemBox
                                key={`strat-${i}`}
                                item={loadout.stratagems[i]}
                                label="Stratagem"
                                type="stratagem"
                            />
                        ))}
                    </div>

                    {/* Booster */}
                    <div className="flex-shrink-0">
                        <ItemBox
                            item={loadout.booster}
                            label="Booster"
                            shape="hexagon"
                            type="booster"
                        />
                    </div>
                </div>

                {/* Bottom Section: Equipment & Weapons */}
                <div className="flex flex-col md:flex-row justify-center gap-12">
                    {/* Equipment */}
                    <div className="space-y-4">
                        <h3 className="text-[#00d9ff] text-xs uppercase font-bold tracking-widest text-center mb-2 border-b border-[#3a4a5a] pb-1">Equipment</h3>
                        <div className="flex justify-center gap-4">
                            <ItemBox item={loadout.helmet} label="Helmet" type="helmet" />
                            <ItemBox item={loadout.armor} label="Armor" type="armor" />
                            <ItemBox item={loadout.cape} label="Cape" type="cape" />
                        </div>
                    </div>

                    {/* Weapons */}
                    <div className="space-y-4">
                        <h3 className="text-[#00d9ff] text-xs uppercase font-bold tracking-widest text-center mb-2 border-b border-[#3a4a5a] pb-1">Weapons</h3>
                        <div className="flex justify-center gap-4">
                            <ItemBox item={loadout.primary} label="Primary" type="primary" />
                            <ItemBox item={loadout.secondary} label="Secondary" type="secondary" />
                            <ItemBox item={loadout.throwable} label="Throwable" type="throwable" />
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-8 flex flex-col items-center gap-2">
                    {loading && <span className="text-[#00d9ff] text-sm animate-pulse">ESTABLISHING UPLINK...</span>}
                    <Button
                        size="lg"
                        variant="primary"
                        onClick={randomize}
                        className="px-12 py-4 text-lg"
                        disabled={loading}
                    >
                        {loading ? 'PROCESSING...' : 'RANDOMIZE'}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
