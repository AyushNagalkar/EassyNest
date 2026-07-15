'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ListingCard } from '@/components/listing-card';
import { MapView } from '@/components/map-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { StaggerContainer } from '@/components/page-transition';
import {
  Search, SlidersHorizontal, X, Map, List, ChevronLeft, ChevronRight,
} from 'lucide-react';

interface PropertyResult {
  id: string;
  title: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  rent: number;
  roomType: string;
  furnishing: string;
  petFriendly: boolean;
  photos: { id: string; url: string; order: number }[];
  owner: { id: string; name: string; avatarUrl?: string };
  _count?: { favorites: number };
  compatibilityScore?: { score: number; explanation: string } | null;
}

const ROOM_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'SINGLE', label: 'Single Room' },
  { value: 'SHARED', label: 'Shared Room' },
  { value: 'ONE_BHK', label: '1 BHK' },
  { value: 'TWO_BHK', label: '2 BHK' },
  { value: 'STUDIO', label: 'Studio' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'score', label: 'Best Match' },
];

export default function BrowsePropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<PropertyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 0 });

  // Filters
  const [city, setCity] = useState('');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [roomType, setRoomType] = useState('');
  const [sortBy, setSortBy] = useState(user?.role === 'TENANT' ? 'score' : 'newest');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Mobile view mode
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  // Count active filters
  const activeFilterCount = [city, minRent, maxRent, roomType].filter(Boolean).length;

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (minRent) params.set('minRent', minRent);
      if (maxRent) params.set('maxRent', maxRent);
      if (roomType) params.set('roomType', roomType);
      if (sortBy && sortBy !== 'newest') params.set('sortBy', sortBy);
      params.set('page', String(page));
      params.set('limit', '12');

      const data = await api.get(`/properties?${params.toString()}`);
      setProperties(data.data || []);
      setMeta(data.meta || { total: 0, page: 1, limit: 12, totalPages: 0 });
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  }, [city, minRent, maxRent, roomType, sortBy, page]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [city, minRent, maxRent, roomType, sortBy]);

  const markers = properties
    .filter((p) => p.lat && p.lng)
    .map((p) => ({
      id: p.id,
      lat: p.lat,
      lng: p.lng,
      label: `${p.title} — ₹${p.rent}/mo`,
      active: p.id === activeMarkerId,
    }));

  const mapCenter: [number, number] = markers.length > 0
    ? [markers[0].lat, markers[0].lng]
    : [12.9716, 77.5946]; // Default Bangalore

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const total = meta.totalPages;
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header + Filters */}
      <div className="page-header">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Find a Room</h1>
              <p className="text-sm text-[var(--foreground-muted)]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={loading ? 'loading' : meta.total}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {loading ? 'Searching…' : `${meta.total} listings found`}
                  </motion.span>
                </AnimatePresence>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile view toggle */}
              <div className="flex lg:hidden border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'text-[var(--foreground-muted)] hover:bg-[var(--muted-light)]'}`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 transition-colors ${viewMode === 'map' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'text-[var(--foreground-muted)] hover:bg-[var(--muted-light)]'}`}
                >
                  <Map className="h-4 w-4" />
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="default" size="sm" className="ml-0.5">{activeFilterCount}</Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Filter bar */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
                  <Input
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <Input
                    placeholder="Min ₹"
                    type="number"
                    value={minRent}
                    onChange={(e) => setMinRent(e.target.value)}
                  />
                  <Input
                    placeholder="Max ₹"
                    type="number"
                    value={maxRent}
                    onChange={(e) => setMaxRent(e.target.value)}
                  />
                  <Select
                    options={ROOM_TYPES}
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    placeholder="Room Type"
                  />
                  <Select
                    options={user?.role === 'TENANT' ? SORT_OPTIONS : SORT_OPTIONS.filter(o => o.value !== 'score')}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    placeholder="Sort By"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCity(''); setMinRent(''); setMaxRent('');
                      setRoomType(''); setSortBy(user?.role === 'TENANT' ? 'score' : 'newest');
                    }}
                    className="gap-1 h-10"
                  >
                    <X className="h-3 w-3" /> Clear
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main content: list + map split */}
      <div className="flex-1 flex overflow-hidden">
        {/* List panel */}
        <div className={`flex-1 overflow-y-auto lg:max-w-[60%] ${viewMode === 'map' ? 'hidden lg:block' : ''}`}>
          <div className="mx-auto max-w-3xl px-4 py-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <EmptyState
                icon={<Search className="h-8 w-8" />}
                title="No properties found"
                description="Try adjusting your filters or searching a different city."
                action={
                  activeFilterCount > 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCity(''); setMinRent(''); setMaxRent('');
                        setRoomType(''); setSortBy('newest');
                      }}
                    >
                      Clear All Filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <>
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {properties.map((property, i) => (
                    <ListingCard key={property.id} property={property} index={i} />
                  ))}
                </StaggerContainer>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-8">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page <= 1}
                      onClick={() => setPage(p => p - 1)}
                      className="h-9 w-9"
                    >
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
                              ? 'bg-[var(--primary)] text-white shadow-sm'
                              : 'text-[var(--foreground-secondary)] hover:bg-[var(--muted-light)]'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page >= meta.totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="h-9 w-9"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Map panel */}
        <div className={`lg:flex-1 lg:block ${viewMode === 'list' ? 'hidden lg:block' : 'flex-1'}`}>
          <div className="sticky top-16 h-[calc(100vh-4rem)] p-2">
            <MapView
              markers={markers}
              center={mapCenter}
              onMarkerClick={(id) => setActiveMarkerId(id)}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
