'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/translations';
import * as ArmoryService from '@/lib/armory-cached';
import { CommunityService } from '@/lib/community-service';
import { WeaponryService } from '@/lib/weaponry-service';
import { Armor, Helmet, Cape, Booster, Stratagem, ArmorSet, UserSet } from '@/lib/types/armory';
import { PrimaryWeapon, SecondaryWeapon, Throwable } from '@/lib/types/weaponry';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ArrowLeftIcon, ChevronRightIcon, SwatchIcon, UserGroupIcon, WrenchIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ItemSelectorModal from '@/components/community/ItemSelectorModal';
import { getDefaultImage } from '@/lib/armory/images';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CreateLoadoutPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { isPortuguese } = useLanguage();

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    // Modes
    const [equipmentMode, setEquipmentMode] = useState<'custom' | 'set'>('custom');

    // Data State (Resources)
    const [helmets, setHelmets] = useState<Helmet[]>([]);
    const [armors, setArmors] = useState<Armor[]>([]);
    const [capes, setCapes] = useState<Cape[]>([]);
    const [primaries, setPrimaries] = useState<PrimaryWeapon[]>([]);
    const [secondaries, setSecondaries] = useState<SecondaryWeapon[]>([]);
    const [throwables, setThrowables] = useState<Throwable[]>([]);
    const [boosters, setBoosters] = useState<Booster[]>([]);
    const [stratagems, setStratagems] = useState<Stratagem[]>([]);

    // Sets Data
    const [standardSets, setStandardSets] = useState<ArmorSet[]>([]);
    const [communitySets, setCommunitySets] = useState<UserSet[]>([]);

    // Selection State
    const [selectedHelmetId, setSelectedHelmetId] = useState<number | ''>('');
    const [selectedArmorId, setSelectedArmorId] = useState<number | ''>('');
    const [selectedCapeId, setSelectedCapeId] = useState<number | ''>('');
    const [selectedPrimaryId, setSelectedPrimaryId] = useState<number | ''>('');
    const [selectedSecondaryId, setSelectedSecondaryId] = useState<number | ''>('');
    const [selectedThrowableId, setSelectedThrowableId] = useState<number | ''>('');
    const [selectedBoosterId, setSelectedBoosterId] = useState<number | ''>('');
    const [selectedStratagemIds, setSelectedStratagemIds] = useState<number[]>([]);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<string>('helmet');

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Using Promise.allSettled to handle potential failures gracefully, 
                // but Promise.all is faster if we assume essential services up.
                // Standard sets endpoint must exist.
                const [h, a, c, p, s, t, b, str, stdSets, commSets] = await Promise.all([
                    ArmoryService.getHelmets({ ordering: 'name' }),
                    ArmoryService.getArmors({ ordering: 'name' }),
                    ArmoryService.getCapes({ ordering: 'name' }),
                    WeaponryService.getWeapons('primary'),
                    WeaponryService.getWeapons('secondary'),
                    WeaponryService.getWeapons('throwable'),
                    ArmoryService.getBoosters(),
                    ArmoryService.getStratagems({ ordering: 'name' }),
                    ArmoryService.getSets({ ordering: 'name' }),
                    CommunityService.list({ mode: 'community' }) // Fetch recent community sets
                ]);
                setHelmets(h);
                setArmors(a);
                setCapes(c);
                setPrimaries(p as PrimaryWeapon[]);
                setSecondaries(s as SecondaryWeapon[]);
                setThrowables(t as Throwable[]);
                setBoosters(b);
                setStratagems(str);
                setStandardSets(stdSets);
                setCommunitySets(commSets.results);
            } catch (err) {
                console.error("Failed to load components", err);
                toast.error("Failed to load equipment list");
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name) { toast.error("Name is required"); return; }

        if (!selectedHelmetId || !selectedArmorId || !selectedCapeId) {
            toast.error("Please select all Armor components");
            return;
        }
        if (!selectedPrimaryId || !selectedSecondaryId || !selectedThrowableId || !selectedBoosterId) {
            toast.error("Please select all Weapons and Booster");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('is_public', isPublic.toString());
            // No image sent

            formData.append('helmet', selectedHelmetId.toString());
            formData.append('armor', selectedArmorId.toString());
            formData.append('cape', selectedCapeId.toString());
            formData.append('primary', selectedPrimaryId.toString());
            formData.append('secondary', selectedSecondaryId.toString());
            formData.append('throwable', selectedThrowableId.toString());
            formData.append('booster', selectedBoosterId.toString());

            selectedStratagemIds.forEach(id => {
                formData.append('stratagems', id.toString());
            });

            await CommunityService.create(formData);
            toast.success("Loadout created successfully!");
            router.push('/community');
        } catch (error) {
            console.error(error);
            toast.error("Failed to create loadout");
        } finally {
            setLoading(false);
        }
    };

    const openModal = (type: string) => {
        setModalType(type);
        setModalOpen(true);
    };

    const handleSetSelect = (items: any[]) => {
        const item = items[0];
        if (!item) return;

        // Use details to get IDs reliably
        const helmetId = item.helmet_detail?.id || (item.helmet ? Number(item.helmet) : null);
        const armorId = item.armor_detail?.id || (item.armor ? Number(item.armor) : null);
        const capeId = item.cape_detail?.id || (item.cape ? Number(item.cape) : null);

        if (helmetId && armorId) {
            setSelectedHelmetId(helmetId);
            setSelectedArmorId(armorId);

            if (capeId) {
                setSelectedCapeId(capeId);
            } else {
                setSelectedCapeId(''); // Clear cape if set has none
            }

            toast.success(`Applied equipment from ${item.name}`);
        } else {
            toast.error("This set appears incomplete (missing Helmet or Armor).");
        }
    };

    const handleItemSelect = (items: any[]) => {
        if (modalType === 'standard_set' || modalType === 'community_set') {
            handleSetSelect(items);
            return;
        }

        if (items.length === 0 && modalType !== 'stratagem') return;

        if (modalType === 'stratagem') {
            setSelectedStratagemIds(items.map(i => i.id));
            return;
        }

        const item = items[0];
        if (!item) return;

        switch (modalType) {
            case 'helmet': setSelectedHelmetId(item.id); break;
            case 'armor': setSelectedArmorId(item.id); break;
            case 'cape': setSelectedCapeId(item.id); break;
            case 'primary': setSelectedPrimaryId(item.id); break;
            case 'secondary': setSelectedSecondaryId(item.id); break;
            case 'throwable': setSelectedThrowableId(item.id); break;
            case 'booster': setSelectedBoosterId(item.id); break;
        }
    };

    const getItemsForModal = () => {
        switch (modalType) {
            case 'helmet': return helmets;
            case 'armor': return armors;
            case 'cape': return capes;
            case 'primary': return primaries;
            case 'secondary': return secondaries;
            case 'throwable': return throwables;
            case 'booster': return boosters;
            case 'stratagem': return stratagems;
            case 'standard_set': return standardSets;
            case 'community_set': return communitySets;
            default: return [];
        }
    };

    const getSelectedIdsForModal = () => {
        if (modalType === 'stratagem') return selectedStratagemIds;
        return [];
    };

    const getName = (item: any) => {
        if (!item) return '';
        return isPortuguese() && item.name_pt_br ? item.name_pt_br : item.name;
    };

    const SelectorCard = ({ type, label, item, disabled }: { type: string, label: string, item: any, disabled?: boolean }) => {
        const defaultImg = getDefaultImage(type as any);
        const imgUrl = item ? (item.image || item.icon || item.url || defaultImg) : defaultImg;

        return (
            <div className={`flex flex-col gap-2 ${disabled ? 'opacity-60' : ''}`}>
                <label className="text-sm font-bold text-[#00d9ff] uppercase">{label}</label>
                <button
                    type="button"
                    onClick={() => !disabled && openModal(type)}
                    disabled={disabled}
                    className={`relative group bg-[#0f141e] border rounded-lg p-4 flex items-center gap-4 transition-all text-left
                        ${disabled
                            ? 'border-gray-800 cursor-not-allowed'
                            : 'border-gray-700 hover:border-[#00d9ff] hover:bg-[#1a2332]'
                        }
                    `}
                >
                    <div className={`w-16 h-16 bg-black/40 rounded flex items-center justify-center p-1 shrink-0 border border-gray-800 ${!disabled && 'group-hover:border-[#00d9ff]/50'} transition-colors`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imgUrl}
                            alt={label}
                            className={`w-full h-full object-contain ${!item ? 'opacity-30 grayscale' : ''}`}
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        {item ? (
                            <>
                                <h3 className={`font-bold truncate transition-colors ${disabled ? 'text-gray-400' : 'text-white group-hover:text-[#00d9ff]'}`}>
                                    {getName(item)}
                                </h3>
                                {(item.warbond || item.department_display) && (
                                    <p className="text-xs text-gray-500 truncate">
                                        {item.warbond?.name || item.department_display}
                                    </p>
                                )}
                            </>
                        ) : (
                            <span className="text-gray-500 italic">Select {label}...</span>
                        )}
                    </div>
                    {!disabled && <ChevronRightIcon className="w-5 h-5 text-gray-600 group-hover:text-[#00d9ff] transition-colors" />}
                </button>
            </div>
        );
    };

    const StratagemSelector = () => {
        const selectedStrats = stratagems.filter(s => selectedStratagemIds.includes(s.id));
        return (
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-[#00d9ff] uppercase">Stratagems</label>
                    <span className="text-xs text-gray-400">{selectedStratagemIds.length}/4</span>
                </div>
                <button
                    type="button"
                    onClick={() => openModal('stratagem')}
                    className="w-full min-h-[100px] bg-[#0f141e] border border-gray-700 hover:border-[#00d9ff] rounded-lg p-4 transition-all hover:bg-[#1a2332] text-left group"
                >
                    {selectedStratagemIds.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                            {selectedStrats.map(s => (
                                <div key={s.id} className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 bg-black/40 rounded p-1 border border-gray-800">
                                        <img src={s.icon || ''} alt={getName(s)} className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-[10px] text-gray-400 text-center leading-tight line-clamp-2 w-full">
                                        {getName(s)}
                                    </span>
                                </div>
                            ))}
                            {Array.from({ length: 4 - selectedStratagemIds.length }).map((_, i) => (
                                <div key={`empty-${i}`} className="flex flex-col items-center gap-1 opacity-30">
                                    <div className="w-12 h-12 bg-black/40 rounded border border-dashed border-gray-600"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 italic gap-2 py-4">
                            <span>Select up to 4 Stratagems...</span>
                            <ChevronRightIcon className="w-5 h-5 group-hover:text-[#00d9ff]" />
                        </div>
                    )}
                </button>
            </div>
        );
    };

    if (fetching) {
        return (
            <div className="container page-content flex items-center justify-center min-h-[60vh]">
                <div className="spinner inline-block rounded-full h-12 w-12 border-[3px] border-t-[#00d9ff] border-r-transparent border-b-transparent border-l-transparent shadow-[0_0_20px_rgba(0,217,255,0.5)]"></div>
            </div>
        );
    }

    const helmet = helmets.find(i => i.id === selectedHelmetId);
    const armor = armors.find(i => i.id === selectedArmorId);
    const cape = capes.find(i => i.id === selectedCapeId);
    const primary = primaries.find(i => i.id === selectedPrimaryId);
    const secondary = secondaries.find(i => i.id === selectedSecondaryId);
    const throwable = throwables.find(i => i.id === selectedThrowableId);
    const booster = boosters.find(i => i.id === selectedBoosterId);

    return (
        <div className="container page-content max-w-4xl mx-auto">
            <div className="mb-6">
                <Link
                    href="/community"
                    className="inline-flex items-center text-gray-400 hover:text-[#00d9ff] transition-colors mb-4 gap-2 font-['Rajdhani'] uppercase font-bold"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to Community
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-white font-['Orbitron'] uppercase tracking-wider">
                        Create Loadout
                    </h1>
                    <p className="text-gray-400 font-['Rajdhani'] text-lg">
                        Assemble your full combat gear for the next dive.
                    </p>
                </div>
            </div>

            <Card className="p-0 overflow-hidden" glowColor="cyan">
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                    {/* Header: Name and Description */}
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-[#00d9ff] uppercase">Loadout Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-black/40 border border-[#00d9ff]/30 p-4 text-white placeholder-gray-600 focus:border-[#00d9ff] outline-none font-['Rajdhani'] font-bold text-xl rounded-lg"
                                placeholder="Ex: Helldive Specialist"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-[#00d9ff] uppercase">Description (Markdown)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-black/40 border border-[#00d9ff]/30 p-4 text-white placeholder-gray-600 focus:border-[#00d9ff] outline-none font-['Rajdhani'] rounded-lg h-32 resize-none"
                                placeholder="Describe your strategy, tips, or build details. Supports Markdown!"
                            />
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-800 my-2" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Equipment Column */}
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center border-l-4 border-[#00d9ff] pl-3">
                                <h3 className="font-['Orbitron'] text-lg text-white">Equipment</h3>
                                {/* Mode Toggle */}
                                <div className="flex bg-[#0f141e] rounded p-1 border border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => setEquipmentMode('custom')}
                                        className={`px-3 py-1.5 text-xs uppercase font-bold rounded flex items-center gap-2 transition-all ${equipmentMode === 'custom' ? 'bg-[#00d9ff] text-black shadow-[0_0_10px_rgba(0,217,255,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <WrenchIcon className="w-4 h-4" />
                                        Manual Armory
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEquipmentMode('set')}
                                        className={`px-3 py-1.5 text-xs uppercase font-bold rounded flex items-center gap-2 transition-all ${equipmentMode === 'set' ? 'bg-[#00d9ff] text-black shadow-[0_0_10px_rgba(0,217,255,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <SwatchIcon className="w-4 h-4" />
                                        Set Armor
                                    </button>
                                </div>
                            </div>

                            {equipmentMode === 'set' && (
                                <div className="p-4 bg-[#0f141e] rounded-lg border border-gray-700 flex flex-col gap-3 animate-fadeIn">
                                    <p className="text-xs text-gray-400 uppercase font-bold">Select a base set to autofill:</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="justify-start gap-2"
                                        onClick={() => openModal('standard_set')}
                                    >
                                        <SwatchIcon className="w-4 h-4" /> Standard Sets
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="justify-start gap-2"
                                        onClick={() => openModal('community_set')}
                                    >
                                        <UserGroupIcon className="w-4 h-4" /> Community Sets
                                    </Button>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <SelectorCard type="helmet" label="Helmet" item={helmet} disabled={equipmentMode === 'set'} />
                                <SelectorCard type="armor" label="Armor" item={armor} disabled={equipmentMode === 'set'} />
                                <SelectorCard type="cape" label="Cape" item={cape} disabled={equipmentMode === 'set' && !!cape} />
                            </div>
                        </div>

                        {/* Weaponry Column */}
                        <div className="flex flex-col gap-4">
                            <h3 className="font-['Orbitron'] text-lg text-white border-l-4 border-yellow-500 pl-3">Weaponry</h3>
                            <div className="flex flex-col gap-3">
                                <SelectorCard type="primary" label="Primary" item={primary} />
                                <SelectorCard type="secondary" label="Secondary" item={secondary} />
                                <SelectorCard type="throwable" label="Throwable" item={throwable} />
                                <SelectorCard type="booster" label="Booster" item={booster} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h3 className="font-['Orbitron'] text-lg text-white border-l-4 border-red-500 pl-3">Stratagems</h3>
                        <StratagemSelector />
                    </div>

                    {/* Visibility */}
                    <div className="bg-[#0f141e] p-4 rounded border border-gray-800 mt-2">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="is_public"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="w-5 h-5 accent-[#00d9ff] cursor-pointer"
                            />
                            <div>
                                <label htmlFor="is_public" className="block text-sm font-bold text-white uppercase cursor-pointer select-none">
                                    {t('community.publishToCommunity')}
                                </label>
                                <p className="text-xs text-gray-400">
                                    Visible to everyone.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-4 pt-4 border-t border-gray-700">
                        <Button type="button" variant="secondary" onClick={() => router.back()} fullWidth>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={loading} fullWidth>
                            Create Loadout
                        </Button>
                    </div>
                </form>
            </Card>

            <ItemSelectorModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSelect={handleItemSelect}
                title={`Select ${modalType.replace('_', ' ')}`}
                type={modalType}
                items={getItemsForModal() as any[]}
                maxSelection={modalType === 'stratagem' ? 4 : 1}
                selectedIds={getSelectedIdsForModal()}
            />
        </div>
    );
}
