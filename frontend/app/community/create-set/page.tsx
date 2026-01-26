'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/translations';
import * as ArmoryService from '@/lib/armory-cached';
import { CommunityService } from '@/lib/community-service';
import { Armor, Helmet, Cape } from '@/lib/types/armory';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ArrowLeftIcon, PhotoIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
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

    // Data State
    const [helmets, setHelmets] = useState<Helmet[]>([]);
    const [armors, setArmors] = useState<Armor[]>([]);
    const [capes, setCapes] = useState<Cape[]>([]);

    // Selection State
    const [selectedHelmetId, setSelectedHelmetId] = useState<number | ''>('');
    const [selectedArmorId, setSelectedArmorId] = useState<number | ''>('');
    const [selectedCapeId, setSelectedCapeId] = useState<number | ''>('');

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'helmet' | 'armor' | 'cape'>('helmet');

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [h, a, c] = await Promise.all([
                    ArmoryService.getHelmets({ ordering: 'name' }),
                    ArmoryService.getArmors({ ordering: 'name' }),
                    ArmoryService.getCapes({ ordering: 'name' })
                ]);
                setHelmets(h);
                setArmors(a);
                setCapes(c);
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

        if (!name) { toast.error("Name is required"); return; }
        if (!image) { toast.error("Image is required"); return; }

        if (!selectedHelmetId || !selectedArmorId || !selectedCapeId) {
            toast.error("Please select Helmet, Armor and Cape");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('is_public', isPublic.toString());
            formData.append('image', image);

            formData.append('helmet', selectedHelmetId.toString());
            formData.append('armor', selectedArmorId.toString());
            formData.append('cape', selectedCapeId.toString());

            await CommunityService.create(formData);
            toast.success("Armor Set created successfully!");
            router.push('/community');
        } catch (error) {
            console.error(error);
            toast.error("Failed to create set");
        } finally {
            setLoading(false);
        }
    };

    const openModal = (type: 'helmet' | 'armor' | 'cape') => {
        setModalType(type);
        setModalOpen(true);
    };

    const handleItemSelect = (items: any[]) => {
        // Single select always for Armor Set
        const item = items[0];
        if (!item) return;

        if (modalType === 'helmet') setSelectedHelmetId(item.id);
        if (modalType === 'armor') setSelectedArmorId(item.id);
        if (modalType === 'cape') setSelectedCapeId(item.id);
    };

    const getItemsForModal = () => {
        if (modalType === 'helmet') return helmets;
        if (modalType === 'armor') return armors;
        if (modalType === 'cape') return capes;
        return [];
    };

    const getName = (item: any) => {
        if (!item) return '';
        return isPortuguese() && item.name_pt_br ? item.name_pt_br : item.name;
    };

    const SelectorCard = ({ type, label }: { type: 'helmet' | 'armor' | 'cape', label: string }) => {
        const id = type === 'helmet' ? selectedHelmetId : type === 'armor' ? selectedArmorId : selectedCapeId;
        const list = type === 'helmet' ? helmets : type === 'armor' ? armors : capes;
        const item = list.find(i => i.id === id);

        const defaultImg = getDefaultImage(type);
        const imgUrl = item ? (item.image || (item as any).icon || (item as any).url || defaultImg) : defaultImg;

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
                                {(item as any).warbond && (
                                    <p className="text-xs text-gray-500 truncate">
                                        {(item as any).warbond.name}
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

    if (fetching) {
        return (
            <div className="container page-content flex items-center justify-center min-h-[60vh]">
                <div className="spinner inline-block rounded-full h-12 w-12 border-[3px] border-t-[#00d9ff] border-r-transparent border-b-transparent border-l-transparent shadow-[0_0_20px_rgba(0,217,255,0.5)]"></div>
            </div>
        );
    }

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
                        Create Armor Set
                    </h1>
                    <p className="text-gray-400 font-['Rajdhani'] text-lg">
                        Share your best fashion combination with the community.
                    </p>
                </div>
            </div>

            <Card className="p-0 overflow-hidden" glowColor="cyan">
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-[#00d9ff] uppercase">Set Image <span className="text-red-500">*</span></label>
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

                        <div className="flex flex-col justify-between">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-[#00d9ff] uppercase">Set Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-black/40 border border-[#00d9ff]/30 p-4 text-white placeholder-gray-600 focus:border-[#00d9ff] outline-none font-['Rajdhani'] font-bold text-xl rounded-lg"
                                    placeholder="Ex: Creek Veteran"
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
                                            Visible to everyone.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-800 my-2" />

                    {/* Equipment Selectors */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SelectorCard type="helmet" label="Helmet" />
                        <SelectorCard type="armor" label="Armor" />
                        <SelectorCard type="cape" label="Cape" />
                    </div>

                    <div className="flex gap-4 mt-4 pt-4 border-t border-gray-700">
                        <Button type="button" variant="secondary" onClick={() => router.back()} fullWidth>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={loading} fullWidth>
                            Create Set
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
            />
        </div>
    );
}
