'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@/lib/translations';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getDefaultImage } from '@/lib/armory/images';
import { WeaponryService } from '@/lib/weaponry-service';
import {
    getStratagems,
    getBoosters,
    getHelmets,
    getArmors,
    getCapes,
    getSets,
    getCollectionStratagems,
    getCollectionBoosters,
    getCollectionHelmets,
    getCollectionArmors,
    getCollectionCapes,
    getCollectionSets
} from '@/lib/armory-cached';
import {
    Stratagem,
    Booster,
    Helmet,
    Armor,
    Cape,
    ArmorSet
} from '@/lib/types/armory';
import { AnyWeapon } from '@/lib/types/weaponry';
import { Switch } from '@headlessui/react';

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
    const { user } = useAuth();

    // Initialize from sessionStorage if available (client-side)
    const [loading, setLoading] = useState(true);
    const [randomizeBySet, setRandomizeBySet] = useState(false);
    const [collectionOnly, setCollectionOnly] = useState(false);
    const [balancedLoadout, setBalancedLoadout] = useState(false);
    const [limitTurrets, setLimitTurrets] = useState(false);

    // Load saved settings on mount
    useEffect(() => {
        const savedBySet = sessionStorage.getItem('randomLoadout_bySet');
        if (savedBySet) setRandomizeBySet(savedBySet === 'true');

        const savedCollection = sessionStorage.getItem('randomLoadout_collection');
        if (savedCollection) setCollectionOnly(savedCollection === 'true');

        const savedBalanced = sessionStorage.getItem('randomLoadout_balanced');
        if (savedBalanced) setBalancedLoadout(savedBalanced === 'true');

        const savedTurrets = sessionStorage.getItem('randomLoadout_limitTurrets');
        if (savedTurrets) setLimitTurrets(savedTurrets === 'true');
    }, []);

    // Save settings when changed
    useEffect(() => {
        sessionStorage.setItem('randomLoadout_bySet', String(randomizeBySet));
    }, [randomizeBySet]);

    useEffect(() => {
        sessionStorage.setItem('randomLoadout_collection', String(collectionOnly));
    }, [collectionOnly]);

    useEffect(() => {
        sessionStorage.setItem('randomLoadout_balanced', String(balancedLoadout));
    }, [balancedLoadout]);

    useEffect(() => {
        sessionStorage.setItem('randomLoadout_limitTurrets', String(limitTurrets));
    }, [limitTurrets]);

    // Reset collectionOnly if user logs out - keep checking user logic separate
    useEffect(() => {
        if (!user && collectionOnly) {
            setCollectionOnly(false);
            sessionStorage.setItem('randomLoadout_collection', 'false');
        }
    }, [user, collectionOnly]);

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

        const getRandomItem = <T,>(items: T[]): T | null => {
            if (!items || items.length === 0) return null;
            return items[Math.floor(Math.random() * items.length)];
        };

        const getRandomItems = <T,>(items: T[], count: number): T[] => {
            if (!items || items.length === 0) return [];
            // Shuffle and slice
            const shuffled = [...items].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        };

        try {
            // 1. Fetch available pool of items (dependent on collectionOnly)
            let allStratagems, allBoosters, allHelmets, allArmors, allCapes, allSets;
            let allPrimaries, allSecondaries, allThrowables;

            if (collectionOnly && user) {
                [allStratagems, allBoosters, allHelmets, allArmors, allCapes, allSets] = await Promise.all([
                    getCollectionStratagems({ checkForUpdates: false }),
                    getCollectionBoosters({ checkForUpdates: false }),
                    getCollectionHelmets({ checkForUpdates: false }),
                    getCollectionArmors({ checkForUpdates: false }),
                    getCollectionCapes({ checkForUpdates: false }),
                    getCollectionSets({ checkForUpdates: false })
                ]);

                [allPrimaries, allSecondaries, allThrowables] = await Promise.all([
                    WeaponryService.getUserItems('primary', 'collection'),
                    WeaponryService.getUserItems('secondary', 'collection'),
                    WeaponryService.getUserItems('throwable', 'collection')
                ]);

            } else {
                [allStratagems, allBoosters, allHelmets, allArmors, allCapes, allSets] = await Promise.all([
                    getStratagems(undefined, { checkForUpdates: false }),
                    getBoosters({ checkForUpdates: false }),
                    getHelmets(undefined, { checkForUpdates: false }),
                    getArmors(undefined, { checkForUpdates: false }),
                    getCapes(undefined, { checkForUpdates: false }),
                    getSets(undefined, { checkForUpdates: false })
                ]);

                [allPrimaries, allSecondaries, allThrowables] = await Promise.all([
                    WeaponryService.getWeapons('primary'),
                    WeaponryService.getWeapons('secondary'),
                    WeaponryService.getWeapons('throwable'),
                ]);
            }

            // Helper to check standard constraints (no duplicates, max 1 mecha)
            const canAddStratagem = (candidate: Stratagem, currentList: Stratagem[]): boolean => {
                if (currentList.some(s => s.id === candidate.id)) return false; // Unique
                if (candidate.is_mecha && currentList.some(s => s.is_mecha)) return false; // Max 1 Mecha

                // Max 1 Turret if option enabled
                if (limitTurrets && candidate.is_turret && currentList.some(s => s.is_turret)) return false;

                return true;
            };

            // Stratagem Logic (Balanced vs Random)
            let selectedStratagems: Stratagem[] = [];

            if (balancedLoadout && allStratagems && allStratagems.length > 0) {
                // 1. Pick a Tertiary Weapon
                const tertiaryWeapons = allStratagems.filter(s => s.is_tertiary_weapon);
                const selectedWeapon = getRandomItem(tertiaryWeapons);

                if (selectedWeapon) {
                    selectedStratagems.push(selectedWeapon);
                }

                // 2. Need a backpack?
                // If we selected a weapon and it HAS a backpack (e.g. Autocannon), we don't *need* another one,
                // but usually people want a separate backpack if the weapon doesn't have one.
                // Or if the weapon HAS a backpack, that slot is filled.

                const hasBackpackAlready = selectedWeapon?.has_backpack;

                if (!hasBackpackAlready) {
                    // We need a backpack
                    // Filter specifically for items that HAVE backpack but are NOT the weapon we just picked
                    // And ideally NOT another tertiary weapon (unless we want 2 weapons?)
                    // To be safe and "balanced", try to pick a non-weapon backpack first (Supply Pack, Shield, Rover, etc)

                    const backpacks = allStratagems.filter(s => s.has_backpack && s.id !== selectedWeapon?.id);

                    // Prioritize backpacks that are NOT tertiary weapons to avoid 2 support weapons
                    const pureBackpacks = backpacks.filter(s => !s.is_tertiary_weapon);

                    let selectedBackpack;
                    if (pureBackpacks.length > 0) {
                        selectedBackpack = getRandomItem(pureBackpacks);
                    }
                    // Do NOT fallback to other backpacks if they are weapons, as that violates "max 1 tertiary" rule.

                    if (selectedBackpack) {
                        selectedStratagems.push(selectedBackpack);
                    }
                }

                // 3. Fill the rest with random items (excluding already picked AND excluding other backpacks/weapons)
                // Filter out items already in selectedStratagems
                const pickedIds = new Set(selectedStratagems.map(s => s.id));

                // CRITICAL: The remaining pool must NOT contain any other tertiary weapons or backpacks
                // to strictly enforce "only 1 of each" rule.
                let remainingPool = allStratagems.filter(s =>
                    !pickedIds.has(s.id) &&
                    !s.is_tertiary_weapon &&
                    !s.has_backpack
                );

                // Shuffle pool
                remainingPool = remainingPool.sort(() => 0.5 - Math.random());

                // Fill slots adhering to constraints (e.g. max 1 mecha)
                for (const candidate of remainingPool) {
                    if (selectedStratagems.length >= 4) break;

                    if (canAddStratagem(candidate, selectedStratagems)) {
                        selectedStratagems.push(candidate);
                    }
                }

                // Shuffle the result so the weapon/backpack aren't always in first slots
                selectedStratagems = selectedStratagems.sort(() => 0.5 - Math.random());

            } else {
                // Standard Random with Mecha Constraint
                const pool = [...(allStratagems || [])].sort(() => 0.5 - Math.random());
                selectedStratagems = [];

                for (const candidate of pool) {
                    if (selectedStratagems.length >= 4) break;
                    if (canAddStratagem(candidate, selectedStratagems)) {
                        selectedStratagems.push(candidate);
                    }
                }
            }

            // Equipment Logic
            let selectedHelmet = null;
            let selectedArmor = null;
            let selectedCape = null;

            if (randomizeBySet && allSets && allSets.length > 0) {
                const randomSet = getRandomItem(allSets);
                if (randomSet) {
                    selectedHelmet = randomSet.helmet_detail;
                    selectedArmor = randomSet.armor_detail;
                    selectedCape = randomSet.cape_detail;
                }
            } else {
                // If by set is off OR no sets found (fallback), pick individually
                selectedHelmet = getRandomItem(allHelmets || []);
                selectedArmor = getRandomItem(allArmors || []);
                selectedCape = getRandomItem(allCapes || []);
            }

            // 2. set random state
            setLoadout({
                stratagems: selectedStratagems,
                booster: getRandomItem(allBoosters || []),
                helmet: selectedHelmet,
                armor: selectedArmor,
                cape: selectedCape,
                primary: getRandomItem(allPrimaries || []),
                secondary: getRandomItem(allSecondaries || []),
                throwable: getRandomItem(allThrowables || []),
            });

        } catch (error) {
            console.error("Randomization failed", error);
        } finally {
            setLoading(false);
        }
    }, [collectionOnly, randomizeBySet, balancedLoadout, limitTurrets, user]);

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
                setImgSrc(item.image || item.icon || item.url || defaultImage);
            } else {
                setImgSrc(defaultImage);
            }
        }, [item, defaultImage]);

        const handleError = () => {
            if (imgSrc !== defaultImage) {
                if (imgSrc !== defaultImage) setImgSrc(defaultImage);
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
        <div className="container page-content max-w-6xl mx-auto">
            <div className="content-section text-center mb-8">
                <h1 className="font-bold mb-2 uppercase font-['Orbitron'] text-white text-[clamp(2rem,4vw,2.5rem)]">
                    {t('nav.randomLoadout') || "Random Loadout"}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Loadout Display (Takes 2/3 space on large screens) */}
                <div className="lg:col-span-2">
                    <Card className="p-6 backdrop-blur-md h-full" glowColor="cyan">
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
                                    <ItemBox item={loadout.cape} label={randomizeBySet && !loadout.cape ? "No Cape" : "Cape"} type="cape" />
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
                    </Card>
                </div>

                {/* Right Column: Options & Controls */}
                <div className="lg:col-span-1">
                    <Card className="p-6 backdrop-blur-md h-full flex flex-col justify-between" glowColor="gold">
                        <div>
                            <h2 className="font-['Orbitron'] text-xl text-yellow-500 mb-6 border-b border-yellow-500/30 pb-2">
                                MISSION SETTINGS
                            </h2>

                            <div className="space-y-6">
                                {/* Randomize by Set */}
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium">Randomize by Set</span>
                                        <span className="text-xs text-gray-400">Match helmet, armor and cape</span>
                                    </div>
                                    <Switch
                                        checked={randomizeBySet}
                                        onChange={setRandomizeBySet}
                                        className={`${randomizeBySet ? 'bg-yellow-500' : 'bg-gray-700'}
                                            relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
                                    >
                                        <span className="sr-only">Use setting</span>
                                        <span
                                            aria-hidden="true"
                                            className={`${randomizeBySet ? 'translate-x-5' : 'translate-x-0'}
                                                pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                                        />
                                    </Switch>
                                </div>

                                {/* Balanced Loadout */}
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium">Balanced Loadout</span>
                                        <span className="text-xs text-gray-400">Include Backpack + Weapon</span>
                                    </div>
                                    <Switch
                                        checked={balancedLoadout}
                                        onChange={setBalancedLoadout}
                                        className={`${balancedLoadout ? 'bg-yellow-500' : 'bg-gray-700'}
                                            relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
                                    >
                                        <span className="sr-only">Use setting</span>
                                        <span
                                            aria-hidden="true"
                                            className={`${balancedLoadout ? 'translate-x-5' : 'translate-x-0'}
                                                pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                                        />
                                    </Switch>
                                </div>

                                {/* Max 1 Turret */}
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium">Max 1 Turret</span>
                                        <span className="text-xs text-gray-400">Limit to one sentry/emplacement</span>
                                    </div>
                                    <Switch
                                        checked={limitTurrets}
                                        onChange={setLimitTurrets}
                                        className={`${limitTurrets ? 'bg-yellow-500' : 'bg-gray-700'}
                                            relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
                                    >
                                        <span className="sr-only">Use setting</span>
                                        <span
                                            aria-hidden="true"
                                            className={`${limitTurrets ? 'translate-x-5' : 'translate-x-0'}
                                                pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                                        />
                                    </Switch>
                                </div>

                                {/* Collection Only */}
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className={`font-medium ${!user ? 'text-gray-500' : 'text-white'}`}>Collection Only</span>
                                        <span className="text-xs text-gray-400">Only items you own</span>
                                        {!user && <span className="text-[10px] text-red-500 italic mt-0.5">Login required</span>}
                                    </div>
                                    <Switch
                                        checked={collectionOnly}
                                        onChange={user ? setCollectionOnly : () => { }}
                                        disabled={!user}
                                        className={`${collectionOnly ? 'bg-yellow-500' : 'bg-gray-700'} ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                            relative inline-flex h-[24px] w-[44px] shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
                                    >
                                        <span className="sr-only">Use setting</span>
                                        <span
                                            aria-hidden="true"
                                            className={`${collectionOnly ? 'translate-x-5' : 'translate-x-0'}
                                                pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                                        />
                                    </Switch>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-12 flex flex-col items-center gap-2">
                            {loading && <LoadingSpinner size="sm" />}
                            <Button
                                size="lg"
                                variant="primary"
                                onClick={randomize}
                                className="w-full py-4 text-lg font-['Orbitron'] tracking-wider"
                                disabled={loading}
                            >
                                {loading ? 'PROCESSING...' : 'RANDOMIZE'}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

