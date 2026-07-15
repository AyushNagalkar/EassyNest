'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
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
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </button>

      {/* Photo gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-8">
        {/* Main photo */}
        <div className="lg:col-span-2 aspect-[16/10] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--muted-light)]">
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
        </div>
        {/* Thumbnails */}
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
          {photos.slice(0, 3).map((photo: any, i: number) => (
            <button
              key={photo.id}
              onClick={() => setSelectedPhoto(i)}
              className={`aspect-[16/10] rounded-[var(--radius)] overflow-hidden border-2 transition-all ${
                i === selectedPhoto ? 'border-[var(--primary)]' : 'border-transparent hover:border-[var(--border-hover)]'
              }`}
            >
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                  {property.title}
                </h1>
                <p className="text-[var(--foreground-secondary)] flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" /> {property.address}, {property.city}
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

            <p className="text-3xl font-bold text-[var(--foreground)] mt-4">
              {formatCurrency(property.rent)}
              <span className="text-base font-normal text-[var(--foreground-muted)]">/month</span>
            </p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Sofa, label: 'Room Type', value: property.roomType?.replace('_', ' ') },
              { icon: Sofa, label: 'Furnishing', value: property.furnishing?.replace('_', ' ') },
              { icon: Calendar, label: 'Available', value: formatDate(property.availableFrom) },
              { icon: PawPrint, label: 'Pets', value: property.petFriendly ? 'Allowed' : 'Not Allowed' },
            ].map((item) => (
              <div key={item.label} className="card p-3">
                <item.icon className="h-4 w-4 text-[var(--foreground-muted)] mb-1" />
                <p className="text-xs text-[var(--foreground-muted)]">{item.label}</p>
                <p className="text-sm font-medium text-[var(--foreground)]">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">About</h2>
              <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a: string) => (
                  <Badge key={a} variant="outline">{a}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {property.lat && property.lng && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">Location</h2>
              <div className="h-64 rounded-[var(--radius-lg)] overflow-hidden">
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
            <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">Listed by</h3>
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
            <div className="card p-5">
              {interestSent ? (
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-[var(--success-light)] flex items-center justify-center mx-auto mb-2">
                    <Heart className="h-6 w-6 text-[var(--success)]" />
                  </div>
                  <p className="font-medium text-[var(--foreground)]">Interest Sent!</p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">The owner will review your request.</p>
                </div>
              ) : (
                <Button
                  onClick={handleExpressInterest}
                  disabled={interestLoading}
                  className="w-full gap-2"
                  size="lg"
                >
                  {interestLoading ? (
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Express Interest
                </Button>
              )}
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
