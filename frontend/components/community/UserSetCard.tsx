import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserSet } from '@/lib/types/armory';
import { CommunityCachedService as CommunityService } from '@/lib/community-cached';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import CachedImage from '@/components/ui/CachedImage';
import { HeartIcon, TrashIcon, BookmarkIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { HeartIcon as HeartOutline, BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { normalizeImageUrl } from '@/utils/images';
import { getDefaultImage } from '@/lib/armory/images';
import { useTranslation } from '@/lib/translations';
import ReactMarkdown from 'react-markdown';

interface UserSetCardProps {
    set: UserSet;
    onDelete?: (id: number) => void;
}

export default function UserSetCard({ set, onDelete }: UserSetCardProps) {
    const { user } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();
    const [liked, setLiked] = React.useState(set.is_liked);
    const [likes, setLikes] = React.useState(set.like_count);
    const [loading, setLoading] = React.useState(false);
    const [imgError, setImgError] = React.useState(false);

    const isOwner = user?.id === set.user;

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast.error(t('header.loginRequired') || 'Login required');
            // router.push('/login'); // Optional redirect
            return;
        }
        if (loading) return;

        // Optimistic update
        const newLiked = !liked;
        setLiked(newLiked);
        setLikes(prev => newLiked ? prev + 1 : prev - 1);
        setLoading(true);

        try {
            const result = await CommunityService.toggleLike(set.id);
            // Sync with server
            setLiked(result.liked);
            setLikes(result.total_likes);
        } catch (error) {
            // Revert
            setLiked(!newLiked);
            setLikes(prev => !newLiked ? prev + 1 : prev - 1);
            console.error('Failed to like set', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this set?')) return;

        try {
            await CommunityService.delete(set.id);
            if (onDelete) onDelete(set.id);
        } catch (error) {
            console.error('Failed to delete set', error);
        }
    }

    const [favorited, setFavorited] = React.useState(set.is_favorited);

    const handleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast.error(t('header.loginRequired') || 'Login required');
            return;
        }
        if (loading) return;

        const newFavorited = !favorited;
        setFavorited(newFavorited);
        setLoading(true);

        try {
            const result = await CommunityService.toggleFavorite(set.id);
            setFavorited(result.favorited);
        } catch (error) {
            setFavorited(!newFavorited);
            console.error('Failed to favorite set', error);
        } finally {
            setLoading(false);
        }
    };

    const imageSrc = imgError ? null : (set.image ? normalizeImageUrl(set.image) : null);

    const CompositePreview = () => {
        // LOADOUT PREVIEW (8 items grid)
        if (set.primary_detail || set.primary) {
            const items = [
                { item: set.helmet_detail, type: 'helmet', label: 'Helmet' },
                { item: set.armor_detail, type: 'armor', label: 'Armor' },
                { item: set.cape_detail, type: 'cape', label: 'Cape' },
                { item: set.booster_detail, type: 'booster', label: 'Booster' },
                { item: set.primary_detail, type: 'primary', label: 'Primary' },
                { item: set.secondary_detail, type: 'secondary', label: 'Secondary' },
                { item: set.throwable_detail, type: 'throwable', label: 'Nade' },
                // Special handling for Stratagems in the last slot
                { item: set.stratagems_detail, type: 'stratagem', label: 'Strats', isStratagemGroup: true }
            ];

            return (
                <div className="w-full h-full grid grid-cols-4 grid-rows-2 bg-[#1a2332]">
                    {items.map((entry, idx) => (
                        <div key={idx} className={`relative border-[0.5px] border-gray-800/50 flex items-center justify-center overflow-hidden ${!entry.item ? 'bg-black/20' : ''}`}>
                            {entry.isStratagemGroup ? (
                                // Mini grid for stratagems
                                <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-[1px] p-[2px]">
                                    {(entry.item as any[] || []).slice(0, 4).map((strat, sIdx) => (
                                        <div key={sIdx} className="bg-black/30 flex items-center justify-center">
                                            <CachedImage
                                                src={strat.icon}
                                                fallback={getDefaultImage('stratagem')}
                                                alt={strat.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                entry.item ? (
                                    <CachedImage
                                        src={(entry.item as any).image || (entry.item as any).icon}
                                        fallback={getDefaultImage(entry.type as any)}
                                        alt={(entry.item as any).name}
                                        className="w-full h-full object-contain p-1"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-10">
                                    </div>
                                )
                            )}

                            {/* Tiny Label Overlay */}
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] text-gray-400 text-center truncate px-0.5 leading-tight pointer-events-none">
                                {entry.label}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // STANDARD SET PREVIEW (Original 2x2 focus on armor)
        const items = [
            { item: set.helmet_detail, type: 'helmet' },
            { item: set.armor_detail, type: 'armor' },
            { item: set.cape_detail, type: 'cape' },
            // 4th slot logic equivalent to previous
            { item: set.primary_detail || set.cape_detail, type: set.primary_detail ? 'primary' : 'cape' }
            // Logic was a bit weird before, let's just make it balanced.
            // If set only, repeating cape or showing nothing is fine.
            // For standard sets, maybe showing a close up of armor?
            // Let's keep it simple: Helmet, Armor, Cape, and maybe the faction icon or nothing?
            // Previous code used: items[2] was Cape (or primary), items[3] was Stratagem or Cape.
            // Let's stick to Helmet, Armor, Cape, Empty/Logo for Set mode.
        ];

        // Re-creating the original 2x2 feel for Sets
        const setItems = [
            { item: set.helmet_detail, type: 'helmet' },
            { item: set.armor_detail, type: 'armor' },
            { item: set.cape_detail, type: 'cape' },
            { item: null, type: 'none' } // Empty slot for logo or something
        ];

        return (
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 bg-[#1a2332]">
                {setItems.map((entry, idx) => (
                    <div key={idx} className={`relative border-[0.5px] border-gray-800/50 flex items-center justify-center p-2 overflow-hidden ${!entry.item ? 'bg-black/20' : ''}`}>
                        {entry.item && (
                            <CachedImage
                                src={(entry.item as any).image || (entry.item as any).icon}
                                fallback={getDefaultImage(entry.type as any)}
                                alt={(entry.item as any).name}
                                className="w-full h-full object-contain"
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const [showDetails, setShowDetails] = React.useState(false);

    // ... (keep usage of imageSrc/CompositePreview)

    return (
        <>
            <Card className="flex flex-col h-full relative group transition-all hover:scale-[1.01]" glowColor={set.is_public ? 'cyan' : undefined}>
                <div
                    className="relative w-full h-48 bg-[#2a3a4a] border-b-2 border-[#00d9ff] flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                    onClick={() => setShowDetails(true)}
                >
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt={set.name}
                            onError={() => setImgError(true)}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <CompositePreview />
                    )}

                    <div className="absolute top-2 right-2 flex gap-2 z-10" onClick={e => e.stopPropagation()}>
                        {/* Like/Favorite Buttons... */}
                        <button
                            onClick={handleLike}
                            className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all flex items-center gap-1 backdrop-blur-sm"
                            title="Curtir"
                        >
                            {liked ? (
                                <HeartIcon className="w-5 h-5 text-red-500" />
                            ) : (
                                <HeartOutline className="w-5 h-5 text-white" />
                            )}
                            <span className="text-xs font-bold text-white">{likes}</span>
                        </button>
                        <button
                            onClick={handleFavorite}
                            className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all flex items-center gap-1 backdrop-blur-sm"
                            title="Salvar"
                        >
                            {favorited ? (
                                <BookmarkIcon className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <BookmarkOutline className="w-5 h-5 text-white" />
                            )}
                        </button>
                    </div>

                    {/* View Details Overlay Hint */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="px-3 py-1 rounded bg-[#00d9ff]/20 border border-[#00d9ff] text-[#00d9ff] text-xs font-bold uppercase backdrop-blur-md">
                            View Loadout
                        </span>
                    </div>
                </div>

                <div className="p-4 flex flex-col flex-1 gap-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3
                                className="text-lg font-bold text-white font-['Rajdhani'] uppercase leading-tight cursor-pointer hover:text-[#00d9ff] transition-colors"
                                onClick={() => setShowDetails(true)}
                            >
                                {set.name}
                            </h3>
                            <p className="text-xs text-gray-400">by {set.creator_username}</p>
                        </div>
                        <div className="flex gap-1">
                            {/* Delete Buttons */}
                            {(isOwner || set.is_mine) && (
                                <button onClick={handleDelete} className="text-red-500 hover:text-red-400 p-1 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors" title="Delete"><TrashIcon className="w-4 h-4" /></button>
                            )}
                            {(user?.is_staff || user?.is_superuser) && (
                                <button onClick={handleDelete} className="text-orange-500 hover:text-orange-400 p-1 bg-orange-500/10 hover:bg-orange-500/20 rounded ml-1" title="Delete (Admin)"><TrashIcon className="w-4 h-4" /></button>
                            )}
                        </div>
                    </div>
                    {/* Footer Preview (Sets Only - Larger Icons) */}
                    {!(set.primary_detail || set.primary) && (
                        <div className="flex justify-between mt-auto pt-3 border-t border-gray-700/50 gap-2">
                            {[set.helmet_detail, set.armor_detail, set.cape_detail].map((item, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-black/30 rounded border border-gray-700 flex items-center justify-center p-1 relative group/footer">
                                        <CachedImage src={item?.image} fallback={getDefaultImage(['helmet', 'armor', 'cape'][i] as any)} alt={item?.name || ''} className="w-full h-full object-contain" />
                                        {/* Optional tooltip on hover */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/footer:opacity-100 flex items-center justify-center transition-opacity rounded">
                                            <span className="text-[10px] text-center px-1 font-bold text-white line-clamp-2 leading-none">{item?.name}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}



                    {!set.is_public && isOwner && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-gray-800/80 rounded border border-gray-600 z-10">
                            <span className="text-[10px] text-gray-300 uppercase font-bold">Private</span>
                        </div>
                    )}
                </div>
            </Card>

            {/* Details Modal */}
            {showDetails && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setShowDetails(false)}>
                    <div className="bg-[#1a2332] w-full max-w-4xl max-h-[90vh] border border-[#00d9ff] relative shadow-[0_0_50px_rgba(0,217,255,0.2)] flex flex-col rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex justify-between items-start p-6 border-b border-gray-700 bg-[#151b26]">
                            <div>
                                <h2 className="text-3xl font-bold text-white font-['Orbitron'] uppercase tracking-wider text-[#00d9ff]">{set.name}</h2>
                                <p className="text-gray-400">Created by <span className="text-white font-bold">{set.creator_username}</span></p>
                            </div>
                            <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-white"><TrashIcon className="w-6 h-6 rotate-45" /></button> {/* X mark using TrashIcon rotated or actual XMark */}
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            {/* Description */}
                            {set.description && (
                                <div className="mb-8 p-4 bg-black/20 rounded border border-gray-800">
                                    <h3 className="text-sm font-bold text-[#00d9ff] uppercase mb-2">Operations Guide</h3>
                                    <div className="prose prose-invert prose-sm max-w-none font-['Rajdhani']">
                                        <ReactMarkdown>{set.description}</ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {/* Full Loadout Grid or Split View */}
                            {(set.primary_detail || set.primary) ? (
                                // LOADOUT VIEW (Unified)
                                <div className="mb-8">
                                    <h3 className="text-lg font-['Orbitron'] text-white border-l-4 border-[#00d9ff] pl-3 mb-4">Combat Loadout</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {/* Row 1: Armor & Booster */}
                                        <div className="bg-[#0f141e] p-3 rounded border border-gray-700 flex flex-col items-center gap-2">
                                            <div className="w-16 h-16 relative">
                                                <CachedImage src={set.helmet_detail?.image} fallback={getDefaultImage('helmet')} alt="Helmet" className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-300 text-center">{set.helmet_detail?.name || 'No Helmet'}</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Helmet</span>
                                        </div>
                                        <div className="bg-[#0f141e] p-3 rounded border border-gray-700 flex flex-col items-center gap-2">
                                            <div className="w-16 h-16 relative">
                                                <CachedImage src={set.armor_detail?.image} fallback={getDefaultImage('armor')} alt="Armor" className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-300 text-center">{set.armor_detail?.name || 'No Armor'}</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Armor</span>
                                        </div>
                                        <div className="bg-[#0f141e] p-3 rounded border border-gray-700 flex flex-col items-center gap-2">
                                            <div className="w-16 h-16 relative">
                                                <CachedImage src={set.cape_detail?.image} fallback={getDefaultImage('cape')} alt="Cape" className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-300 text-center">{set.cape_detail?.name || 'No Cape'}</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Cape</span>
                                        </div>
                                        <div className="bg-[#0f141e] p-3 rounded border border-yellow-900/30 flex flex-col items-center gap-2">
                                            <div className="w-16 h-16 relative">
                                                <CachedImage src={set.booster_detail?.icon} fallback={getDefaultImage('booster')} alt="Booster" className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-300 text-center">{set.booster_detail?.name || 'No Booster'}</span>
                                            <span className="text-[10px] text-yellow-500/50 uppercase tracking-widest">Booster</span>
                                        </div>

                                        {/* Row 2: Weapons */}
                                        <div className="bg-[#0f141e] p-3 rounded border border-gray-700 flex flex-col items-center gap-2">
                                            <div className="w-16 h-16 relative">
                                                <CachedImage src={set.primary_detail?.image} fallback={getDefaultImage('primary')} alt="Primary" className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-300 text-center">{set.primary_detail?.name || 'No Primary'}</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Primary</span>
                                        </div>
                                        <div className="bg-[#0f141e] p-3 rounded border border-gray-700 flex flex-col items-center gap-2">
                                            <div className="w-16 h-16 relative">
                                                <CachedImage src={set.secondary_detail?.image} fallback={getDefaultImage('secondary')} alt="Secondary" className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-300 text-center">{set.secondary_detail?.name || 'No Secondary'}</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Secondary</span>
                                        </div>
                                        <div className="bg-[#0f141e] p-3 rounded border border-gray-700 flex flex-col items-center gap-2">
                                            <div className="w-16 h-16 relative">
                                                <CachedImage src={set.throwable_detail?.image} fallback={getDefaultImage('throwable')} alt="Throwable" className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-300 text-center">{set.throwable_detail?.name || 'No Throwable'}</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Throwable</span>
                                        </div>

                                        {/* Stratagems in 4th slot? No, just list them below or in next row? */}
                                        {/* Let's put Stratagems in their own row below */}
                                    </div>

                                    {set.stratagems_detail && set.stratagems_detail.length > 0 && (
                                        <div className="mt-6">
                                            <h4 className="text-sm font-bold text-red-500 uppercase mb-3">Stratagems</h4>
                                            <div className="grid grid-cols-4 gap-4">
                                                {set.stratagems_detail.map((s, idx) => (
                                                    <div key={idx} className="bg-[#0f141e] p-2 rounded border border-gray-700 flex flex-col items-center gap-2 hover:border-red-500/50 transition-colors">
                                                        <div className="w-12 h-12">
                                                            <CachedImage src={s.icon} fallback={getDefaultImage('stratagem')} alt={s.name} className="w-full h-full object-contain" />
                                                        </div>
                                                        <span className="text-[10px] text-center font-bold text-gray-300 leading-tight line-clamp-2">{s.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // SET VIEW (Split)
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-lg font-['Orbitron'] text-white border-l-4 border-[#00d9ff] pl-3 mb-4">Equipment</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { l: 'Helmet', i: set.helmet_detail, t: 'helmet' },
                                                { l: 'Armor', i: set.armor_detail, t: 'armor' },
                                                { l: 'Cape', i: set.cape_detail, t: 'cape' }
                                            ].map((x, idx) => (
                                                <div key={idx} className="flex flex-col gap-2">
                                                    <div className="aspect-square bg-[#0f141e] rounded border border-gray-700 p-2 flex items-center justify-center relative group">
                                                        <CachedImage src={(x.i as any).image} fallback={getDefaultImage(x.t as any)} alt={x.i.name} className="w-full h-full object-contain" />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                            <span className="text-[10px] text-center px-1 font-bold">{x.i.name}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-center text-gray-500 uppercase font-bold">{x.l}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Only show Arsenal column if there's anything to show (unlikely for Set mode but possible partials) */}
                                    {(set.booster || set.throwable) && (
                                        <div>
                                            <h3 className="text-lg font-['Orbitron'] text-white border-l-4 border-yellow-500 pl-3 mb-4">Extras</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { l: 'Throwable', i: set.throwable_detail, t: 'throwable' },
                                                    { l: 'Booster', i: set.booster_detail, t: 'booster' }
                                                ].map((x, idx) => x.i ? (
                                                    <div key={idx} className="flex flex-col gap-1 items-center bg-[#0f141e] p-2 rounded border border-gray-700">
                                                        <div className="w-12 h-12 flex items-center justify-center">
                                                            <CachedImage src={(x.i as any).image || (x.i as any).icon} fallback={getDefaultImage(x.t as any)} alt={x.i.name} className="w-full h-full object-contain" />
                                                        </div>
                                                        <span className="text-[10px] text-center text-gray-300 leading-tight line-clamp-1">{x.i.name}</span>
                                                    </div>
                                                ) : null)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
