'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { UserSet } from '@/lib/types/armory';
import { CommunityCachedService as CommunityService } from '@/lib/community-cached';
import UserSetCard from '@/components/community/UserSetCard';
import Button from '@/components/ui/Button';
import { PlusIcon, UserGroupIcon, UserIcon, WrenchIcon, SwatchIcon, BookmarkIcon } from '@heroicons/react/24/outline';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { Toaster, toast } from 'react-hot-toast';

export default function CommunityPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();

    // Tab State: 'community_loadout' | 'community_set' | 'mine_loadout' | 'mine_set'
    const [activeTab, setActiveTab] = useState<string>('community_loadout');
    const [sets, setSets] = useState<UserSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const [ordering, setOrdering] = useState('smart');

    const getTabParams = (tab: string) => {
        switch (tab) {
            case 'community_loadout': return { mode: 'community' as const, type: 'loadout' as const };
            case 'community_set': return { mode: 'community' as const, type: 'set' as const };
            case 'saved_loadout': return { mode: 'favorites' as const, type: 'loadout' as const };
            case 'saved_set': return { mode: 'favorites' as const, type: 'set' as const };
            case 'mine_loadout': return { mode: 'mine' as const, type: 'loadout' as const };
            case 'mine_set': return { mode: 'mine' as const, type: 'set' as const };
            default: return { mode: 'community' as const, type: 'loadout' as const };
        }
    };


    const fetchSets = useCallback(async (reset = false) => {
        setLoading(true);
        const currentPage = reset ? 1 : page;
        const params = getTabParams(activeTab);

        try {
            const response = await CommunityService.list({
                mode: params.mode,
                type: params.type,
                ordering,
                page: currentPage
            });
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
        setSets([]); // Clear on tab/sort change to avoid flicker
        fetchSets(true);
    }, [activeTab, ordering]);

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
        const params = getTabParams(activeTab);
        CommunityService.list({
            mode: params.mode,
            type: params.type,
            ordering,
            page: page + 1
        }).then(response => {
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
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: 'rgba(26, 35, 50, 0.95)',
                        color: '#fff',
                        border: '1px solid rgba(0, 217, 255, 0.2)',
                        fontFamily: 'Rajdhani',
                        textTransform: 'uppercase',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(4px)',
                    },
                    error: {
                        style: {
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                            color: '#ff8888',
                            boxShadow: '0 0 15px rgba(239, 68, 68, 0.2)',
                        },
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                    success: {
                        style: {
                            border: '1px solid rgba(0, 217, 255, 0.5)',
                            color: '#00d9ff',
                            boxShadow: '0 0 15px rgba(0, 217, 255, 0.2)',
                        },
                        iconTheme: {
                            primary: '#00d9ff',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            <div className="content-section flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="font-bold mb-2 uppercase font-['Orbitron'] text-white text-[clamp(2.25rem,5vw,3rem)]">
                        {t('community.title').split(' ')[0]} <span className="text-[#00d9ff]">{t('community.title').split(' ')[1]}</span>
                    </h1>
                    <p className="text-gray-400 font-['Rajdhani'] text-lg uppercase tracking-wide">
                        {t('community.subtitle')}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="primary"
                        onClick={() => {
                            if (!user) {
                                toast.error(t('header.loginRequired') || 'Login required');
                                router.push('/login');
                                return;
                            }
                            router.push('/community/create-set');
                        }}
                        className="flex items-center gap-2 mb-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Create Set
                    </Button>

                    <Button
                        variant="primary"
                        onClick={() => {
                            if (!user) {
                                toast.error(t('header.loginRequired') || 'Login required');
                                router.push('/login');
                                return;
                            }
                            router.push('/community/create-loadout');
                        }}
                        className="flex items-center gap-2 mb-2 bg-yellow-500 hover:bg-yellow-600 border-yellow-400"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Create Loadout
                    </Button>
                </div>
            </div>

            <Card className="content-section" glowColor="cyan">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Tabs using Buttons */}
                    <div className="flex bg-[#0f141e] p-1 rounded-lg overflow-x-auto max-w-full">
                        <Button
                            variant={activeTab === 'community_loadout' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('community_loadout')}
                            className="flex items-center gap-2 uppercase tracking-wider whitespace-nowrap"
                        >
                            <WrenchIcon className="w-4 h-4" />
                            Loadouts
                        </Button>
                        <Button
                            variant={activeTab === 'community_set' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('community_set')}
                            className="flex items-center gap-2 uppercase tracking-wider whitespace-nowrap"
                        >
                            <SwatchIcon className="w-4 h-4" />
                            Armor Sets
                        </Button>
                        <div className="w-px bg-gray-700 mx-1 h-6 self-center hidden md:block"></div>
                        <Button
                            variant={activeTab === 'saved_loadout' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => {
                                if (!user) {
                                    toast.error(t('header.loginRequired') || 'Login required');
                                    router.push('/login');
                                    return;
                                }
                                setActiveTab('saved_loadout');
                            }}
                            className="flex items-center gap-2 uppercase tracking-wider whitespace-nowrap"
                        >
                            <BookmarkIcon className="w-4 h-4" />
                            Saved Loadouts
                        </Button>
                        <Button
                            variant={activeTab === 'saved_set' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => {
                                if (!user) {
                                    toast.error(t('header.loginRequired') || 'Login required');
                                    router.push('/login');
                                    return;
                                }
                                setActiveTab('saved_set');
                            }}
                            className="flex items-center gap-2 uppercase tracking-wider whitespace-nowrap"
                        >
                            <BookmarkIcon className="w-4 h-4" />
                            Saved Sets
                        </Button>
                        <div className="w-px bg-gray-700 mx-1 h-6 self-center hidden md:block"></div>
                        <Button
                            variant={activeTab === 'mine_loadout' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => {
                                if (!user) {
                                    toast.error(t('header.loginRequired') || 'Login required');
                                    router.push('/login');
                                    return;
                                }
                                setActiveTab('mine_loadout');
                            }}
                            className="flex items-center gap-2 uppercase tracking-wider whitespace-nowrap"
                        >
                            <UserGroupIcon className="w-4 h-4" />
                            My Loadouts
                        </Button>
                        <Button
                            variant={activeTab === 'mine_set' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => {
                                if (!user) {
                                    toast.error(t('header.loginRequired') || 'Login required');
                                    router.push('/login');
                                    return;
                                }
                                setActiveTab('mine_set');
                            }}
                            className="flex items-center gap-2 uppercase tracking-wider whitespace-nowrap"
                        >
                            <UserIcon className="w-4 h-4" />
                            My Sets
                        </Button>
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
        </div>
    );
}
