'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { RelationService } from '@/lib/armory/relation-service';
import { RelationType, SetRelationStatus } from '@/lib/types/armory';
import { toast } from 'react-hot-toast';
import { 
    HeartIcon as HeartOutline, 
    QueueListIcon as ListOutline, 
    BookmarkIcon as BookmarkOutline 
} from '@heroicons/react/24/outline';
import { 
    HeartIcon as HeartSolid, 
    QueueListIcon as ListSolid, 
    BookmarkIcon as BookmarkSolid 
} from '@heroicons/react/24/solid';

interface ItemRelationButtonsProps {
    itemType: string;
    itemId: number | string;
    initialStatus?: SetRelationStatus;
    itemData?: any;
    className?: string;
    onStatusChange?: (newStatus: SetRelationStatus) => void;
    userId?: string;
}

export default function ItemRelationButtons({
    itemType,
    itemId,
    initialStatus,
    itemData,
    className = "",
    onStatusChange,
    userId
}: ItemRelationButtonsProps) {
    const { user } = useAuth();
    const { t } = useTranslation();
    
    const [status, setStatus] = useState<SetRelationStatus>(initialStatus || {
        favorite: false,
        collection: false,
        wishlist: false
    });
    
    const [updating, setUpdating] = useState<Record<string, boolean>>({});

    // Sync with initialStatus if it changes (bulk fetch)
    React.useEffect(() => {
        if (initialStatus) {
            setStatus(initialStatus);
        }
    }, [initialStatus]);

    const handleToggle = async (type: RelationType, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error(t('auth.loginRequired') || 'Login required');
            return;
        }

        if (updating[type]) return;

        const currentVal = status[type];
        const nextVal = !currentVal;

        // Optimistic UI Update
        const nextStatus = { ...status, [type]: nextVal };
        
        // Mutual exclusion logic: if adding to collection, remove from wishlist and vice-versa
        if (type === 'collection' && nextVal) nextStatus.wishlist = false;
        if (type === 'wishlist' && nextVal) nextStatus.collection = false;

        setStatus(nextStatus);
        if (onStatusChange) onStatusChange(nextStatus);
        
        setUpdating(prev => ({ ...prev, [type]: true }));

        try {
            await RelationService.toggleRelation(itemType, itemId, type, currentVal, itemData, userId || user?.id);
            // toast.success(t(nextVal ? `success.added_${type}` : `success.removed_${type}`));
        } catch (error) {
            // Revert on error
            setStatus(status);
            if (onStatusChange) onStatusChange(status);
            console.error(`Failed to toggle ${type}`, error);
            toast.error(t('error.generic') || 'An error occurred');
        } finally {
            setUpdating(prev => ({ ...prev, [type]: false }));
        }
    };

    const buttons = [
        { 
            type: 'favorite' as RelationType, 
            iconOutline: HeartOutline, 
            iconSolid: HeartSolid, 
            activeColor: 'text-[#d4af37]', 
            hoverColor: 'hover:text-[#d4af37]',
            glowColor: 'shadow-[0_0_10px_rgba(212,175,55,0.4)]',
            title: t('actions.favorite')
        },
        { 
            type: 'collection' as RelationType, 
            iconOutline: ListOutline, 
            iconSolid: ListSolid, 
            activeColor: 'text-[#00d9ff]', 
            hoverColor: 'hover:text-[#00d9ff]',
            glowColor: 'shadow-[0_0_10px_rgba(0,217,255,0.4)]',
            title: t('actions.collection')
        },
        { 
            type: 'wishlist' as RelationType, 
            iconOutline: BookmarkOutline, 
            iconSolid: BookmarkSolid, 
            activeColor: 'text-[#10b981]', 
            hoverColor: 'hover:text-[#10b981]',
            glowColor: 'shadow-[0_0_10px_rgba(16,185,129,0.4)]',
            title: t('actions.wishlist')
        }
    ];

    if (!user) return null;

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {buttons.map((btn) => {
                const isActive = status[btn.type];
                const isBtnUpdating = updating[btn.type];
                const Icon = isActive ? btn.iconSolid : btn.iconOutline;

                return (
                    <button
                        key={btn.type}
                        onClick={(e) => handleToggle(btn.type, e)}
                        disabled={isBtnUpdating}
                        title={btn.title}
                        className={`
                            p-1.5 rounded-full transition-all duration-300
                            bg-black/40 backdrop-blur-md border border-white/10
                            hover:bg-black/60 hover:border-white/20 hover:scale-110
                            ${isActive ? `${btn.activeColor} ${btn.glowColor} border-${btn.type === 'favorite' ? '[#d4af37]' : btn.type === 'collection' ? '[#00d9ff]' : '[#10b981]'}/30` : 'text-gray-400'}
                            ${isBtnUpdating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                        `}
                    >
                        {isBtnUpdating ? (
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <Icon className={`w-4 h-4 ${isActive ? 'drop-shadow-[0_0_5px_currentColor]' : ''}`} />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
