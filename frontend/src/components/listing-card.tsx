'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Heart } from 'lucide-react';
import { CompatibilityBadge } from '@/components/ui/compatibility-badge';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface Property {
  id: string;
  title: string;
  city: string;
  address: string;
  rent: number;
  roomType: string;
  furnishing: string;
  petFriendly: boolean;
  photos: { id: string; url: string; order: number }[];
  owner: { id: string; name: string; avatarUrl?: string };
  _count?: { favorites: number };
  compatibilityScore?: {
    score: number;
    explanation: string;
  } | null;
}

interface ListingCardProps {
  property: Property;
  index?: number;
}

export function ListingCard({ property, index = 0 }: ListingCardProps) {
  const photo = property.photos?.[0]?.url;
  const score = property.compatibilityScore?.score ?? null;
  const explanation = property.compatibilityScore?.explanation ?? null;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1, y: 0,
          transition: { duration: 0.3, ease: 'easeOut' },
        },
      }}
    >
      <Link href={`/properties/${property.id}`} className="block group">
        <div className="card card-hover overflow-hidden">
          {/* Image */}
          <div className="relative aspect-[16/10] bg-[var(--muted-light)] overflow-hidden">
            {photo ? (
              <img
                src={photo}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--foreground-muted)]">
                <MapPin className="h-8 w-8" />
              </div>
            )}

            {/* Score overlay */}
            {score != null && (
              <div className="absolute top-3 right-3">
                <CompatibilityBadge
                  score={score}
                  explanation={explanation}
                  size="sm"
                  animate={true}
                />
              </div>
            )}

            {/* Room type badge */}
            <div className="absolute bottom-3 left-3">
              <Badge variant="room" size="sm">
                {property.roomType?.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
                  {property.title}
                </h3>
                <p className="text-xs text-[var(--foreground-muted)] flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {property.city}
                </p>
              </div>
              <p className="text-base font-bold text-[var(--foreground)] whitespace-nowrap">
                {formatCurrency(property.rent)}
                <span className="text-xs font-normal text-[var(--foreground-muted)]">/mo</span>
              </p>
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant="outline" size="sm">{property.furnishing?.replace('_', ' ')}</Badge>
              {property.petFriendly && <Badge variant="success" size="sm">Pet Friendly</Badge>}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
