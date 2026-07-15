'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { MapView } from '@/components/map-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { StaggerContainer, StaggerItem } from '@/components/page-transition';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users, SlidersHorizontal, X, Map, List, MapPin, Calendar, Wallet,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

export default function BrowseFlatmatesPage() {
  const [seekers, setSeekers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 0 });
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const activeFilterCount = city ? 1 : 0;

  const fetchSeekers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      params.set('page', String(page));
      params.set('limit', '12');
      const data = await api.get(`/seekers?${params.toString()}`);
      setSeekers(data.data || []);
      setMeta(data.meta || { total: 0, page: 1, totalPages: 0 });
    } catch (err) {
      console.error('Failed to fetch seekers:', err);
    } finally {
      setLoading(false);
    }
  }, [city, page]);

  useEffect(() => { fetchSeekers(); }, [fetchSeekers]);
  useEffect(() => { setPage(1); }, [city]);

  const markers = seekers
    .filter((s) => s.preferredLat && s.preferredLng)
    .map((s) => ({ id: s.id, lat: s.preferredLat, lng: s.preferredLng, label: s.user?.name || 'Seeker' }));

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const total = meta.totalPages;
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
      if (page < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="page-header">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Find a Flatmate</h1>
              <p className="text-sm text-[var(--foreground-muted)]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={loading ? 'loading' : meta.total}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {loading ? 'Searching…' : `${meta.total} flatmate seekers found`}
                  </motion.span>
                </AnimatePresence>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex lg:hidden border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
                <button onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[var(--accent-flatmate-light)] text-[var(--accent-flatmate)]' : 'text-[var(--foreground-muted)] hover:bg-[var(--muted-light)]'}`}>
                  <List className="h-4 w-4" />
                </button>
                <button onClick={() => setViewMode('map')} className={`p-2 transition-colors ${viewMode === 'map' ? 'bg-[var(--accent-flatmate-light)] text-[var(--accent-flatmate)]' : 'text-[var(--foreground-muted)] hover:bg-[var(--muted-light)]'}`}>
                  <Map className="h-4 w-4" />
                </button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {activeFilterCount > 0 && <Badge variant="default" size="sm">{activeFilterCount}</Badge>}
              </Button>
            </div>
          </div>
          <AnimatePresence>
            {filtersOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="flex gap-3 pt-4">
                  <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="max-w-xs" />
                  <Button variant="ghost" size="sm" onClick={() => setCity('')} className="gap-1 h-10"><X className="h-3 w-3" /> Clear</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* List */}
        <div className={`flex-1 overflow-y-auto lg:max-w-[60%] ${viewMode === 'map' ? 'hidden lg:block' : ''}`}>
          <div className="mx-auto max-w-3xl px-4 py-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : seekers.length === 0 ? (
              <EmptyState
                icon={<Users className="h-8 w-8" />}
                title="No flatmate seekers found"
                description="Try searching a different city."
                action={activeFilterCount > 0 ? <Button variant="outline" size="sm" onClick={() => setCity('')}>Clear Filters</Button> : undefined}
              />
            ) : (
              <>
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {seekers.map((seeker) => (
                    <StaggerItem key={seeker.id}>
                      <Link href={`/flatmates/${seeker.id}`} className="block group">
                        <div className="card card-hover p-5">
                          <div className="flex items-start gap-3">
                            <Avatar src={seeker.user?.avatarUrl} name={seeker.user?.name || 'User'} size="lg" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent-flatmate)] transition-colors duration-200 truncate">
                                {seeker.user?.name}
                              </h3>
                              <p className="text-xs text-[var(--foreground-muted)] flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {seeker.preferredCity}
                              </p>
                            </div>
                            <Badge variant="flatmate" size="sm">{seeker.type?.replace('_', ' ')}</Badge>
                          </div>
                          {seeker.bio && (
                            <p className="text-xs text-[var(--foreground-secondary)] mt-3 line-clamp-2 leading-relaxed">{seeker.bio}</p>
                          )}
                          <div className="flex items-center gap-3 mt-3 text-xs text-[var(--foreground-muted)]">
                            <span className="flex items-center gap-1">
                              <Wallet className="h-3 w-3" />
                              {formatCurrency(seeker.budgetMin)} – {formatCurrency(seeker.budgetMax)}
                            </span>
                            {seeker.moveInDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {formatDate(seeker.moveInDate)}
                              </span>
                            )}
                          </div>

                          {/* Lifestyle tags */}
                          {(seeker.dietaryPref || seeker.smokingPref || seeker.petFriendly != null) && (
                            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                              {seeker.dietaryPref && <Badge variant="outline" size="sm">{seeker.dietaryPref}</Badge>}
                              {seeker.smokingPref && <Badge variant="outline" size="sm">{seeker.smokingPref}</Badge>}
                              {seeker.petFriendly && <Badge variant="success" size="sm">Pet Friendly</Badge>}
                            </div>
                          )}
                        </div>
                      </Link>
                    </StaggerItem>
                  ))}
                </StaggerContainer>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-8">
                    <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="h-9 w-9">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {getPageNumbers().map((p, i) =>
                      p === '...' ? (
                        <span key={`dots-${i}`} className="px-1 text-sm text-[var(--foreground-muted)]">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`h-9 w-9 rounded-[var(--radius)] text-sm font-medium transition-all duration-200 ${
                            page === p
                              ? 'bg-[var(--accent-flatmate)] text-white shadow-sm'
                              : 'text-[var(--foreground-secondary)] hover:bg-[var(--muted-light)]'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                    <Button variant="outline" size="icon" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)} className="h-9 w-9">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Map */}
        <div className={`lg:flex-1 lg:block ${viewMode === 'list' ? 'hidden lg:block' : 'flex-1'}`}>
          <div className="sticky top-16 h-[calc(100vh-4rem)] p-2">
            <MapView markers={markers} className="h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
