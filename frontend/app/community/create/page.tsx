'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/translations';
import * as ArmoryService from '@/lib/armory-cached';
import { CommunityService } from '@/lib/community-service';
import { WeaponryService } from '@/lib/weaponry-service';
import { Armor, Helmet, Cape, Booster, Stratagem } from '@/lib/types/armory';
import { PrimaryWeapon, SecondaryWeapon, Throwable, AnyWeapon } from '@/lib/types/weaponry';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ArrowLeftIcon, PhotoIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ItemSelectorModal from '@/components/community/ItemSelectorModal';
import { getDefaultImage } from '@/lib/armory/images';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CreateSetPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { isPortuguese } = useLanguage();

    // Form State
    const [name, setName] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Data State (Resources)
    const [helmets, setHelmets] = useState<Helmet[]>([]);
    const [armors, setArmors] = useState<Armor[]>([]);
    const [capes, setCapes] = useState<Cape[]>([]);
    const [primaries, setPrimaries] = useState<PrimaryWeapon[]>([]);
    const [secondaries, setSecondaries] = useState<SecondaryWeapon[]>([]);
    const [throwables, setThrowables] = useState<Throwable[]>([]);
    const [boosters, setBoosters] = useState<Booster[]>([]);
    const [stratagems, setStratagems] = useState<Stratagem[]>([]);

    // Selection State
    const [selectedHelmetId, setSelectedHelmetId] = useState<number | ''>('');
    const [selectedArmorId, setSelectedArmorId] = useState<number | ''>('');
    const [selectedCapeId, setSelectedCapeId] = useState<number | ''>('');

    // New Selection State
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
                const [h, a, c, p, s, t, b, str] = await Promise.all([
                    ArmoryService.getHelmets({ ordering: 'name' }),
                    ArmoryService.getArmors({ ordering: 'name' }),
                    ArmoryService.getCapes({ ordering: 'name' }),
                    WeaponryService.getWeapons('primary'),
                    WeaponryService.getWeapons('secondary'),
                    WeaponryService.getWeapons('throwable'),
                    ArmoryService.getBoosters(),
                    ArmoryService.getStratagems({ ordering: 'name' }),
                ]);
                setHelmets(h);
                setArmors(a);
                setCapes(c);
                setPrimaries(p as PrimaryWeapon[]);
                setSecondaries(s as SecondaryWeapon[]);
                setThrowables(t as Throwable[]);
                setBoosters(b);
                setStratagems(str);
            } catch (err) {
                console.error("Failed to load components", err);
                toast.error("Failed to load equipment list");
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!name) { toast.error("Set Name is required"); return; }
        if (!image) { toast.error("Set Image is required"); return; }

        // Check required fields (assuming all slots must be filled for a "Loadout"?)
        // The user asked for "choose the same things as random". Random usually fills everything.
        // I'll make everything required for a complete loadout, or at least warn.
        // Let's make core equipment required, others optional? No, usually "Create Loadout" implies full set.
        // But maybe user wants partial. Let's make Equipment mandatory (legacy), others optional but encouraged?
        // User said "choose the same things". 
        // I will make Equipment Mandatory. Weapons/Stratagems Optional (to avoid blocking if user doesn't want to specify).
        // Actually, let's enforce Equipment + Weapons mainly. 

        if (!selectedHelmetId || !selectedArmorId || !selectedCapeId) {
            toast.error("Please select all Armor components (Helmet, Armor, Cape)");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('is_public', isPublic.toString());
            formData.append('image', image);

            // Equipment
            formData.append('helmet', selectedHelmetId.toString());
            formData.append('armor', selectedArmorId.toString());
            formData.append('cape', selectedCapeId.toString());

            // Weapons (Optional in backend if null=True, but let's send if selected)
            if (selectedPrimaryId) formData.append('primary', selectedPrimaryId.toString());
            if (selectedSecondaryId) formData.append('secondary', selectedSecondaryId.toString());
            if (selectedThrowableId) formData.append('throwable', selectedThrowableId.toString());
            if (selectedBoosterId) formData.append('booster', selectedBoosterId.toString());

            // Stratagems (Many to Many)
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

    const handleItemSelect = (items: any[]) => {
        // Handle single or multi based on modalType
        if (items.length === 0 && modalType !== 'stratagem') return;

        if (modalType === 'stratagem') {
            setSelectedStratagemIds(items.map(i => i.id));
            return; // Modal handles close for multi? No, modal stays open?
            // ItemSelectorModal implementation: 
            // - Single: onSelect([item]), onClose()
            // - Multi: onSelect(items), onClose() (on Confirm)
            // So logic here is fine.
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
            default: return [];
        }
    };

    const getSelectedIdsForModal = () => {
        if (modalType === 'stratagem') return selectedStratagemIds;
        const idMap: { [key: string]: number | '' } = {
            helmet: selectedHelmetId, armor: selectedArmorId, cape: selectedCapeId,
            primary: selectedPrimaryId, secondary: selectedSecondaryId, throwable: selectedThrowableId,
            booster: selectedBoosterId
        };
        const val = idMap[modalType];
        return val ? [val as number] : [];
    };

    const getName = (item: any) => {
        if (!item) return '';
        return isPortuguese() && item.name_pt_br ? item.name_pt_br : item.name;
    };

    const SelectorCard = ({ type, label, item }: { type: string, label: string, item: any }) => {
        // For stratagems (multi), use a different card? Or default handles single?
        // This is for single items.
        const defaultImg = getDefaultImage(type as any); // cast for safety if type is new
        const imgUrl = item ? (item.image || item.icon || item.url || defaultImg) : defaultImg;

        return (
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-[#00d9ff] uppercase">{label}</label>
                <button
                    type="button"
                    onClick={() => openModal(type)}
                    className="relative group bg-[#0f141e] border border-gray-700 hover:border-[#00d9ff] rounded-lg p-4 flex items-center gap-4 transition-all hover:bg-[#1a2332] text-left"
                >
                    <div className="w-16 h-16 bg-black/40 rounded flex items-center justify-center p-1 shrink-0 border border-gray-800 group-hover:border-[#00d9ff]/50 transition-colors">
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
                                <h3 className="font-bold text-white truncate group-hover:text-[#00d9ff] transition-colors">
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
                    <ChevronRightIcon className="w-5 h-5 text-gray-600 group-hover:text-[#00d9ff] transition-colors" />
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
                            {/* Fill empty slots */}
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

    // Load Items for Selectors
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
                        {t('community.createSet')}
                    </h1>
                    <p className="text-gray-400 font-['Rajdhani'] text-lg">
                        Create a full Loadout to share with the Helldivers community.
                    </p>
                </div>
            </div>

            <Card className="p-0 overflow-hidden" glowColor="cyan">
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                    {/* Top Section: Image & Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Image */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-[#00d9ff] uppercase">Loadout Image <span className="text-red-500">*</span></label>
                            <div className="relative w-full h-48 border-2 border-dashed border-gray-600 rounded flex items-center justify-center bg-black/20 hover:border-[#00d9ff] transition-colors cursor-pointer group overflow-hidden">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    required={!image}
                                />
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center text-gray-500 group-hover:text-[#00d9ff]">
                                        <PhotoIcon className="w-10 h-10 mb-2" />
                                        <span className="text-sm uppercase font-bold">Upload Image</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name & Visibility */}
                        <div className="flex flex-col justify-between">
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

                            <div className="bg-[#0f141e] p-4 rounded border border-gray-800 mt-auto">
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
                                            Visible to everyone. Uncheck for private.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-800 my-2" />

                    {/* Loadout Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Equipment Column */}
                        <div className="flex flex-col gap-4">
                            <h3 className="font-['Orbitron'] text-lg text-white border-l-4 border-[#00d9ff] pl-3">Equipment</h3>
                            <div className="flex flex-col gap-3">
                                <SelectorCard type="helmet" label="Helmet" item={helmet} />
                                <SelectorCard type="armor" label="Armor" item={armor} />
                                <SelectorCard type="cape" label="Cape" item={cape} />
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

                    {/* Stratagems - Full Width */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-['Orbitron'] text-lg text-white border-l-4 border-red-500 pl-3">Stratagems</h3>
                        <StratagemSelector />
                    </div>

                    {/* Actions */}
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
                title={`Select ${modalType}`}
                type={modalType}
                items={getItemsForModal()}
                maxSelection={modalType === 'stratagem' ? 4 : 1}
                selectedIds={getSelectedIdsForModal()}
            />
        </div>
    );
}
