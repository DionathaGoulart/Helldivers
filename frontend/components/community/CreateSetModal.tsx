import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/translations';
import * as ArmoryService from '@/lib/armory-cached';
import { CommunityService } from '@/lib/community-service';
import { Armor, Helmet, Cape } from '@/lib/types/armory';
import Button from '@/components/ui/Button';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface CreateSetModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateSetModal({ onClose, onSuccess }: CreateSetModalProps) {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [helmets, setHelmets] = useState<Helmet[]>([]);
    const [armors, setArmors] = useState<Armor[]>([]);
    const [capes, setCapes] = useState<Cape[]>([]);

    const [selectedHelmet, setSelectedHelmet] = useState<number | ''>('');
    const [selectedArmor, setSelectedArmor] = useState<number | ''>('');
    const [selectedCape, setSelectedCape] = useState<number | ''>('');

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all components to populate select dropdowns
                // Note: In a real large app we might need search/pagination for these selectors
                const [hRes, aRes, cRes] = await Promise.all([
                    ArmoryService.getHelmets({ ordering: 'name' }),
                    ArmoryService.getArmors({ ordering: 'name' }),
                    ArmoryService.getCapes({ ordering: 'name' })
                ]);
                setHelmets(hRes);
                setArmors(aRes);
                setCapes(cRes);
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
        if (!name || !selectedHelmet || !selectedArmor || !selectedCape) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('helmet', selectedHelmet.toString());
            formData.append('armor', selectedArmor.toString());
            formData.append('cape', selectedCape.toString());
            formData.append('is_public', isPublic.toString()); // Backend expects string/boolean form value
            if (image) {
                formData.append('image', image);
            }

            await CommunityService.create(formData);
            toast.success("Set created successfully!");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create set");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return null; // Or a spinner

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a2332] w-full max-w-lg border-2 border-[#00d9ff] relative shadow-[0_0_30px_rgba(0,217,255,0.2)]">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-[#00d9ff]/30 bg-[#2a3a4a]">
                    <h2 className="text-xl font-bold text-white font-['Orbitron'] uppercase tracking-wider">
                        {t('community.createSet')}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
                    {/* Image Upload */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-[#00d9ff] uppercase">Set Image</label>
                        <div className="relative w-full h-40 border-2 border-dashed border-gray-600 rounded flex items-center justify-center bg-black/20 hover:border-[#00d9ff] transition-colors cursor-pointer group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="h-full object-contain" />
                            ) : (
                                <div className="flex flex-col items-center text-gray-500 group-hover:text-[#00d9ff]">
                                    <PhotoIcon className="w-8 h-8 mb-1" />
                                    <span className="text-xs uppercase">Click to upload</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-[#00d9ff] uppercase">Set Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-black/40 border border-[#00d9ff]/30 p-2 text-white placeholder-gray-600 focus:border-[#00d9ff] outline-none font-['Rajdhani'] font-bold"
                            placeholder="Ex: Creek Veteran Loadout"
                            required
                        />
                    </div>

                    {/* Selectors */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-[#00d9ff] uppercase">Helmet</label>
                            <select
                                value={selectedHelmet}
                                onChange={(e) => setSelectedHelmet(Number(e.target.value))}
                                className="bg-black/40 border border-[#00d9ff]/30 p-2 text-white outline-none"
                                required
                            >
                                <option value="" disabled>Select Helmet</option>
                                {helmets.map(h => (
                                    <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-[#00d9ff] uppercase">Armor</label>
                            <select
                                value={selectedArmor}
                                onChange={(e) => setSelectedArmor(Number(e.target.value))}
                                className="bg-black/40 border border-[#00d9ff]/30 p-2 text-white outline-none"
                                required
                            >
                                <option value="" disabled>Select Armor</option>
                                {armors.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-[#00d9ff] uppercase">Cape</label>
                            <select
                                value={selectedCape}
                                onChange={(e) => setSelectedCape(Number(e.target.value))}
                                className="bg-black/40 border border-[#00d9ff]/30 p-2 text-white outline-none"
                                required
                            >
                                <option value="" disabled>Select Cape</option>
                                {capes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Visibility */}
                    <div className="flex items-center gap-3 py-2">
                        <input
                            type="checkbox"
                            id="is_public"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="w-5 h-5 accent-[#00d9ff]"
                        />
                        <label htmlFor="is_public" className="text-sm font-bold text-white uppercase cursor-pointer select-none">
                            {t('community.publishToCommunity')}
                        </label>
                    </div>
                    <p className="text-xs text-gray-400 -mt-2">
                        {isPublic ? "Everyone will be able to see and like this set." : "Only you will see this set in 'My Sets'."}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-4 mt-4">
                        <Button type="button" variant="secondary" onClick={onClose} fullWidth>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={loading} fullWidth>
                            Create Set
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
