'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { getDefaultImage } from '@/lib/armory/images';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/ui/Button';

interface Item {
    id: number;
    name: string;
    name_pt_br?: string | null;
    image?: string | null;
    icon?: string | null;
    url?: string | null; // fallback
    warbond?: { name: string } | number | null;
    [key: string]: any;
}

interface ItemSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (items: Item[]) => void;
    title: string;
    items: Item[];
    type: string; // 'helmet' | 'armor' | ...
    maxSelection?: number; // Default 1
    selectedIds?: number[]; // Previously selected
}

export default function ItemSelectorModal({
    isOpen,
    onClose,
    onSelect,
    title,
    items,
    type,
    maxSelection = 1,
    selectedIds = []
}: ItemSelectorModalProps) {
    const { isPortuguese } = useLanguage();
    const [search, setSearch] = useState('');
    const [filteredItems, setFilteredItems] = useState<Item[]>(items);
    const [currentSelection, setCurrentSelection] = useState<number[]>([]);

    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setFilteredItems(items);
            setCurrentSelection(selectedIds);
        }
    }, [isOpen, items, selectedIds]);

    useEffect(() => {
        const query = search.toLowerCase();
        const filtered = items.filter(item => {
            const name = item.name.toLowerCase();
            const namePt = item.name_pt_br?.toLowerCase() || '';
            const warbondName = (typeof item.warbond === 'object' && item.warbond?.name)
                ? item.warbond.name.toLowerCase()
                : (item as any).warbond_detail?.name?.toLowerCase() || '';
            const dept = (item as any).department_display?.toLowerCase() || '';
            return name.includes(query) || namePt.includes(query) || warbondName.includes(query) || dept.includes(query);
        });
        setFilteredItems(filtered);
    }, [search, items]);

    if (!isOpen) return null;

    const isMulti = maxSelection > 1;

    const getName = (item: Item) => {
        return isPortuguese() && item.name_pt_br ? item.name_pt_br : item.name;
    };

    const getImage = (item: Item) => {
        return item.image || item.icon || item.url || getDefaultImage(type as any); // cast for safety
    };

    const getWarbondName = (item: Item) => {
        if (typeof item.warbond === 'object' && item.warbond?.name) return item.warbond.name;
        if ((item as any).warbond_detail?.name) return (item as any).warbond_detail.name;
        return null;
    };

    const toggleSelection = (item: Item) => {
        if (isMulti) {
            setCurrentSelection(prev => {
                const isSelected = prev.includes(item.id);
                if (isSelected) {
                    return prev.filter(id => id !== item.id);
                } else {
                    if (prev.length >= maxSelection) {
                        return prev; // Max reached
                    }
                    return [...prev, item.id];
                }
            });
        } else {
            // Single select: immediate return
            onSelect([item]);
            onClose();
        }
    };

    const handleConfirm = () => {
        const selectedItems = items.filter(i => currentSelection.includes(i.id));
        onSelect(selectedItems);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-[#1a2332] w-full max-w-5xl h-[85vh] border-2 border-[#00d9ff] relative shadow-[0_0_50px_rgba(0,217,255,0.3)] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-[#00d9ff]/30 bg-[#2a3a4a]">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-white font-['Orbitron'] uppercase tracking-wider">
                            {title}
                        </h2>
                        {isMulti && (
                            <p className="text-sm text-[#00d9ff]">
                                Selected: {currentSelection.length} / {maxSelection}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <XMarkIcon className="w-8 h-8" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 bg-[#151b26] border-b border-gray-800">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, warbond, or department..."
                            className="w-full bg-black/40 border border-[#00d9ff]/30 rounded-lg py-3 pl-12 pr-4 text-white focus:border-[#00d9ff] outline-none font-['Rajdhani'] uppercase tracking-wide placeholder-gray-600"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredItems.map(item => {
                            const isSelected = currentSelection.includes(item.id);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => toggleSelection(item)}
                                    className={`group relative border rounded-lg p-3 flex flex-col items-center gap-3 transition-all text-left
                                        ${isSelected
                                            ? 'bg-[#1a2332] border-[#00d9ff] ring-1 ring-[#00d9ff] shadow-[0_0_15px_rgba(0,217,255,0.2)]'
                                            : 'bg-[#0f141e] border-gray-700 hover:border-[#00d9ff] hover:bg-[#1a2332] hover:scale-105'
                                        }
                                    `}
                                >
                                    {isMulti && isSelected && (
                                        <div className="absolute top-2 right-2 text-[#00d9ff] z-10">
                                            <CheckCircleSolidIcon className="w-6 h-6" />
                                        </div>
                                    )}

                                    <div className="w-full aspect-square bg-black/30 rounded flex items-center justify-center p-2 relative overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={getImage(item)}
                                            alt={getName(item)}
                                            className="w-full h-full object-contain drop-shadow-lg"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = getDefaultImage(type as any);
                                            }}
                                        />
                                    </div>
                                    <div className="w-full">
                                        <h3 className={`text-sm font-bold leading-tight line-clamp-2 min-h-[2.5em] text-center w-full ${isSelected ? 'text-[#00d9ff]' : 'text-gray-200 group-hover:text-[#00d9ff]'}`}>
                                            {getName(item)}
                                        </h3>
                                        {(getWarbondName(item) || (item as any).department_display) && (
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider text-center mt-1 truncate w-full">
                                                {getWarbondName(item) || (item as any).department_display}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {filteredItems.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <p className="text-xl font-['Rajdhani']">No items found</p>
                        </div>
                    )}
                </div>

                {/* Footer (Multi-select only) */}
                {isMulti && (
                    <div className="p-4 border-t border-[#00d9ff]/30 bg-[#2a3a4a] flex justify-end gap-4">
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleConfirm}>
                            Confirm ({currentSelection.length})
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
