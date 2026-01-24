'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { UserSet } from '@/lib/types/armory';
import { CommunityService } from '@/lib/community-service';
import UserSetCard from '@/components/community/UserSetCard';
import CreateSetModal from '@/components/community/CreateSetModal';
import Button from '@/components/ui/Button';
import { PlusIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';

import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { Toaster } from 'react-hot-toast';

export default function CommunityPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'community' | 'mine'>('community');
    const [sets, setSets] = useState<UserSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const [ordering, setOrdering] = useState('smart');

    const fetchSets = useCallback(async (reset = false) => {
        setLoading(true);
        const currentPage = reset ? 1 : page;
        try {
            const response = await CommunityService.list({ mode: activeTab, ordering, page: currentPage });
            setSets(prev => reset ? response.results : [...prev, ...response.results]);
            setHasMore(!!response.next);
            if (reset) setPage(1);
        } catch (error) {
            console.error('Failed to fetch sets', error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, page, ordering]);

    useEffect(() => {
        fetchSets(true);
    }, [activeTab, ordering]);

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        // If we created a private set, switch to 'mine'. If public, either is fine, but let's refresh.
        // For simplicity, just refresh current list.
        fetchSets(true);
    };

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
        // Note: fetchSets depends on page, but we need to ensure state update triggers it correct.
        // Actually, better to call service directly here or use a better pagination hook. 
        // For now, simpler implementation:
        CommunityService.list({ mode: activeTab, ordering, page: page + 1 }).then(response => {
            setSets(prev => [...prev, ...response.results]);
            setHasMore(!!response.next);
            setPage(prev => prev + 1);
        });
    };

    const handleDelete = (id: number) => {
        setSets(prev => prev.filter(s => s.id !== id));
    };

    const sortOptions = [
        { value: 'smart', label: t('community.trending') },
        { value: '-created_at', label: t('community.newest') },
        { value: '-likes_count', label: t('community.mostLiked') },
        { value: '-favorites_count', label: t('community.mostFavorited') },
        { value: 'random', label: t('community.random') },
    ];

    return (
        <div className="container page-content">
            <Toaster position="bottom-right" />

            <div className="content-section flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="font-bold mb-2 uppercase font-['Orbitron'] text-white text-[clamp(2.25rem,5vw,3rem)]">
                        {t('community.title').split(' ')[0]} <span className="text-[#00d9ff]">{t('community.title').split(' ')[1]}</span>
                    </h1>
                    <p className="text-gray-400 font-['Rajdhani'] text-lg uppercase tracking-wide">
                        {t('community.subtitle')}
                    </p>
                </div>

                {user && (
                    <Button
                        variant="primary"
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 mb-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        {t('community.createSet')}
                    </Button>
                )}
            </div>

            <Card className="content-section" glowColor="cyan">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Tabs using Buttons */}
                    <div className="flex bg-[#0f141e] p-1 rounded-lg">
                        <Button
                            variant={activeTab === 'community' ? 'secondary' : 'ghost'}
                            size="md"
                            onClick={() => setActiveTab('community')}
                            className="flex items-center gap-2 uppercase tracking-wider"
                        >
                            <UserGroupIcon className="w-4 h-4" />
                            {t('community.community')}
                        </Button>
                        {user && (
                            <Button
                                variant={activeTab === 'mine' ? 'secondary' : 'ghost'}
                                size="md"
                                onClick={() => setActiveTab('mine')}
                                className="flex items-center gap-2 uppercase tracking-wider"
                            >
                                <UserIcon className="w-4 h-4" />
                                {t('community.mySets')}
                            </Button>
                        )}
                    </div>

                    {/* Sorting */}
                    <div className="w-full md:w-64">
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 font-['Rajdhani'] text-[#00d9ff]">
                            {t('community.sortBy')}
                        </label>
                        <Select
                            value={ordering}
                            onChange={(value) => setOrdering(value)}
                            options={sortOptions}
                        />
                    </div>
                </div>
            </Card>

            {/* Grid */}
            {loading && sets.length === 0 ? (
                <div className="text-center py-20">
                    <div className="spinner inline-block rounded-full h-12 w-12 border-[3px] border-t-[#00d9ff] border-r-transparent border-b-transparent border-l-transparent shadow-[0_0_20px_rgba(0,217,255,0.5)]"></div>
                    <p className="mt-4 text-gray-400 font-['Rajdhani'] font-bold text-[#00d9ff] uppercase tracking-wider">
                        {t('community.loadingSets')}
                    </p>
                </div>
            ) : (
                <>
                    {sets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {sets.map(set => (
                                <UserSetCard key={set.id} set={set} onDelete={handleDelete} />
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-20" glowColor="cyan">
                            <p className="text-xl font-['Rajdhani'] mb-2 text-white">{t('community.noSetsFound')}</p>
                            <p className="text-sm text-gray-400">{t('community.beFirstToCreate')}</p>
                        </Card>
                    )}

                    {hasMore && (
                        <div className="flex justify-center mt-12 mb-8">
                            <Button variant="outline" onClick={handleLoadMore}>
                                {t('community.loadMore')}
                            </Button>
                        </div>
                    )}
                </>
            )}

            {showCreateModal && (
                <CreateSetModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}
        </div>
    );
}
