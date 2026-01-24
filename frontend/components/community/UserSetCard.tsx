import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserSet } from '@/lib/types/armory';
import { CommunityService } from '@/lib/community-service';
import Card from '@/components/ui/Card';
import CachedImage from '@/components/ui/CachedImage';
import { HeartIcon, TrashIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { normalizeImageUrl } from '@/utils/images';
import { getDefaultImage } from '@/lib/armory/images';
import { useTranslation } from '@/lib/translations';

interface UserSetCardProps {
    set: UserSet;
    onDelete?: (id: number) => void;
}

export default function UserSetCard({ set, onDelete }: UserSetCardProps) {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [liked, setLiked] = React.useState(set.is_liked);
    const [likes, setLikes] = React.useState(set.like_count);
    const [loading, setLoading] = React.useState(false);
    const [imgError, setImgError] = React.useState(false);

    const isOwner = user?.id === set.user;

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user || loading) return;

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
        if (!user || loading) return;

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

    const imageSrc = imgError || !set.image ? getDefaultImage('set') : normalizeImageUrl(set.image);

    return (
        <Card className="flex flex-col h-full relative group transition-all hover:scale-[1.01]" glowColor={set.is_public ? 'cyan' : undefined}>
            <div className="relative w-full h-48 bg-[#2a3a4a] border-b-2 border-[#00d9ff] flex items-center justify-center shrink-0 overflow-hidden">
                <img
                    src={imageSrc}
                    alt={set.name}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                />

                <div className="absolute top-2 right-2 flex gap-2">
                    {/* Like Button */}
                    <button
                        onClick={handleLike}
                        disabled={!user}
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

                    {/* Favorite Button */}
                    <button
                        onClick={handleFavorite}
                        disabled={!user}
                        className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all flex items-center gap-1 backdrop-blur-sm"
                        title="Favoritar"
                    >
                        {favorited ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500">
                                <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1 gap-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-white font-['Rajdhani'] uppercase leading-tight">{set.name}</h3>
                        <p className="text-xs text-gray-400">by {set.creator_username}</p>
                    </div>
                    <div className="flex gap-1">
                        {/* Botão de Delete do Dono */}
                        {(isOwner || set.is_mine) && (
                            <button
                                onClick={handleDelete}
                                className="text-red-500 hover:text-red-400 p-1 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors"
                                title="Delete (Owner)"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}

                        {/* Botão de Delete de Admin - Aparece ADICIONALMENTE se for admin */}
                        {(user?.is_staff || user?.is_superuser) && (
                            <button
                                onClick={handleDelete}
                                className="text-orange-500 hover:text-orange-400 p-1 bg-orange-500/10 hover:bg-orange-500/20 rounded transition-colors border border-orange-500/30 ml-1"
                                title="Delete (Admin)"
                            >
                                <div className="flex items-center gap-1">
                                    <span className="text-[8px] font-bold uppercase">ADM</span>
                                    <TrashIcon className="w-4 h-4" />
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                {/* Components Image Preview */}
                <div className="flex justify-between mt-auto pt-3 border-t border-gray-700/50 gap-2">
                    <div className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">{t('armory.helmet')}</span>
                        <div className="w-12 h-12 bg-black/30 rounded border border-gray-700 flex items-center justify-center p-1">
                            <CachedImage
                                src={set.helmet_detail.image}
                                fallback={getDefaultImage('helmet')}
                                alt={set.helmet_detail.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="text-[10px] text-cyan-400 truncate max-w-full px-1 text-center font-medium" title={set.helmet_detail.name}>
                            {set.helmet_detail.name}
                        </span>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">{t('armory.armorLabel')}</span>
                        <div className="w-12 h-12 bg-black/30 rounded border border-gray-700 flex items-center justify-center p-1">
                            <CachedImage
                                src={set.armor_detail.image}
                                fallback={getDefaultImage('armor')}
                                alt={set.armor_detail.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="text-[10px] text-cyan-400 truncate max-w-full px-1 text-center font-medium" title={set.armor_detail.name}>
                            {set.armor_detail.name}
                        </span>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">{t('armory.cape')}</span>
                        <div className="w-12 h-12 bg-black/30 rounded border border-gray-700 flex items-center justify-center p-1">
                            <CachedImage
                                src={set.cape_detail.image}
                                fallback={getDefaultImage('cape')}
                                alt={set.cape_detail.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="text-[10px] text-cyan-400 truncate max-w-full px-1 text-center font-medium" title={set.cape_detail.name}>
                            {set.cape_detail.name}
                        </span>
                    </div>
                </div>

                {!set.is_public && isOwner && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-gray-800/80 rounded border border-gray-600">
                        <span className="text-[10px] text-gray-300 uppercase font-bold">Private</span>
                    </div>
                )}
            </div>
        </Card>
    );
}
