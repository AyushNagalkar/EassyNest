'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { MapView } from '@/components/map-view';
import { CompatibilityBadge } from '@/components/ui/compatibility-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  MapPin, Calendar, Sofa, PawPrint, Users, ArrowLeft, Heart, Send, Eye,
  ChevronRight, Home, CheckCircle2,
} from 'lucide-react';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [interestLoading, setInterestLoading] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [score, setScore] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get(`/properties/${id}`);
        setProperty(data);
        // If tenant, try to get their score for this property
        if (user?.role === 'TENANT') {
          try {
            const scoreData = await api.post(`/scores/property/${id}`);
            if (scoreData?.score != null) setScore(scoreData);
          } catch {}
        }
      } catch (err) {
        console.error('Failed to load property:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user]);

  async function handleExpressInterest() {
    setInterestLoading(true);
    try {
      await api.post('/interests', {
        targetType: 'PROPERTY',
        targetPropertyId: id,
      });
      setInterestSent(true);
    } catch (err: any) {
      alert(err.message || 'Failed to express interest');
    } finally {
      setInterestLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6 animate-fade-in-up">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 w-full rounded-[var(--radius-lg)]" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[var(--foreground-muted)]">Property not found</p>
      </div>
    );
  }

  const photos = property.photos || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] mb-5">
        <Link href="/" className="hover:text-[var(--foreground)] transition-colors flex items-center gap-1">
          <Home className="h-3.5 w-3.5" />
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/properties" className="hover:text-[var(--foreground)] transition-colors">
          Properties
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[var(--foreground)] font-medium truncate max-w-[200px]">{property.title}</span>
      </nav>

      {/* Photo gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-8">
        {/* Main photo */}
        <div className="lg:col-span-2 aspect-[16/10] rounded-[var(--radius-xl)] overflow-hidden bg-[var(--muted-light)] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPhoto}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              {photos[selectedPhoto]?.url ? (
                <img
                  src={photos[selectedPhoto].url}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--foreground-muted)]">
                  <Eye className="h-12 w-12" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          {/* Photo counter */}
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-[var(--radius-full)] bg-black/50 text-white text-xs font-medium backdrop-blur-sm">
              {selectedPhoto + 1} / {photos.length}
            </div>
          )}
        </div>
        {/* Thumbnails */}
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
          {photos.slice(0, 3).map((photo: any, i: number) => (
            <button
              key={photo.id}
              onClick={() => setSelectedPhoto(i)}
              className={`aspect-[16/10] rounded-[var(--radius-lg)] overflow-hidden border-2 transition-all duration-200 ${
                i === selectedPhoto ? 'border-[var(--primary)] shadow-md' : 'border-transparent hover:border-[var(--border-hover)] opacity-80 hover:opacity-100'
              }`}
            >
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                  {property.title}
                </h1>
                <p className="text-[var(--foreground-secondary)] flex items-center gap-1.5 mt-1.5">
                  <MapPin className="h-4 w-4 text-[var(--foreground-muted)]" /> {property.address}, {property.city}
                </p>
              </div>
              {score && (
                <CompatibilityBadge
                  score={score.score}
                  explanation={score.explanation}
                  size="lg"
                />
              )}
            </div>

            <p className="text-3xl font-bold text-[var(--foreground)] mt-5">
              {formatCurrency(property.rent)}
              <span className="text-base font-normal text-[var(--foreground-muted)]">/month</span>
            </p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Sofa, label: 'Room Type', value: property.roomType?.replace('_', ' '), color: 'var(--accent-room)' },
              { icon: Sofa, label: 'Furnishing', value: property.furnishing?.replace('_', ' '), color: 'var(--primary)' },
              { icon: Calendar, label: 'Available', value: formatDate(property.availableFrom), color: 'var(--success)' },
              { icon: PawPrint, label: 'Pets', value: property.petFriendly ? 'Allowed' : 'Not Allowed', color: 'var(--accent-flatmate)' },
            ].map((item) => (
              <div key={item.label} className="card p-4 group hover:border-[var(--border-hover)] transition-colors">
                <div className="h-8 w-8 rounded-[var(--radius)] flex items-center justify-center mb-2" style={{ backgroundColor: `color-mix(in srgb, ${item.color} 12%, transparent)` }}>
                  <item.icon className="h-4 w-4" style={{ color: item.color }} />
                </div>
                <p className="text-xs text-[var(--foreground-muted)]">{item.label}</p>
                <p className="text-sm font-semibold text-[var(--foreground)] mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">About this property</h2>
              <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a: string) => (
                  <Badge key={a} variant="outline" size="md">{a}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {property.lat && property.lng && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Location</h2>
              <div className="h-64 rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border)]">
                <MapView
                  markers={[{ id: property.id, lat: property.lat, lng: property.lng, label: property.title }]}
                  center={[property.lat, property.lng]}
                  zoom={15}
                  className="h-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Owner card */}
          <div className="card p-5">
            <h3 className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-3">Listed by</h3>
            <div className="flex items-center gap-3">
              <Avatar src={property.owner?.avatarUrl} name={property.owner?.name || 'Owner'} size="lg" />
              <div>
                <p className="font-semibold text-[var(--foreground)]">{property.owner?.name}</p>
                {property.owner?._count?.properties && (
                  <p className="text-xs text-[var(--foreground-muted)]">{property.owner._count.properties} listings</p>
                )}
              </div>
            </div>
          </div>

          {/* Interest CTA */}
          {user?.role === 'TENANT' && (
            <div className="card p-5 lg:sticky lg:top-24">
              <AnimatePresence mode="wait">
                {interestSent ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-2"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                      className="h-14 w-14 rounded-full bg-[var(--success-light)] flex items-center justify-center mx-auto mb-3"
                    >
                      <CheckCircle2 className="h-7 w-7 text-[var(--success)]" />
                    </motion.div>
                    <p className="font-semibold text-[var(--foreground)]">Interest Sent!</p>
                    <p className="text-xs text-[var(--foreground-muted)] mt-1">The owner will review your request.</p>
                  </motion.div>
                ) : (
                  <motion.div key="cta">
                    <p className="text-sm text-[var(--foreground-secondary)] mb-4">
                      Interested in this property? Let the owner know.
                    </p>
                    <Button
                      onClick={handleExpressInterest}
                      loading={interestLoading}
                      className="w-full gap-2"
                      size="lg"
                    >
                      <Send className="h-4 w-4" />
                      Express Interest
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {!user && (
            <div className="card p-5 text-center">
              <p className="text-sm text-[var(--foreground-secondary)] mb-3">
                Sign in as a tenant to express interest and see your compatibility score.
              </p>
              <Button variant="outline" size="sm" onClick={() => router.push('/login')} className="w-full">
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
