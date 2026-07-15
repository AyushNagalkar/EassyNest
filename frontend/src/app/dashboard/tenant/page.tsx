'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  User, Heart, Send, MessageCircle, MapPin, Plus,
  ArrowRight, Wallet, Calendar, FileText,
} from 'lucide-react';

export default function TenantDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [interests, setInterests] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'TENANT') { router.push('/login'); return; }
    Promise.all([
      api.get('/seeker-profile/me').catch(() => null),
      api.get('/interests/sent').catch(() => []),
      api.get('/favorites').catch(() => []),
    ]).then(([prof, ints, favs]) => {
      setProfile(prof);
      setInterests(Array.isArray(ints) ? ints : ints?.data || []);
      setFavorites(Array.isArray(favs) ? favs : favs?.data || []);
    }).finally(() => setLoading(false));
  }, [user, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48" /><Skeleton className="h-48" /><Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-[var(--foreground-muted)]">Your tenant dashboard</p>
        </div>
        <Avatar src={user?.avatarUrl} name={user?.name || 'User'} size="lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seeker Profile Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
              <User className="h-4 w-4 text-[var(--primary)]" /> Seeker Profile
            </h2>
            {profile && (
              <Link href="/dashboard/tenant/profile">
                <Button variant="ghost" size="sm">Edit</Button>
              </Link>
            )}
          </div>
          {profile ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-[var(--foreground-secondary)]">
                <MapPin className="h-3.5 w-3.5" /> {profile.preferredCity}
              </div>
              <div className="flex items-center gap-2 text-[var(--foreground-secondary)]">
                <Wallet className="h-3.5 w-3.5" /> {formatCurrency(profile.budgetMin)} – {formatCurrency(profile.budgetMax)}
              </div>
              <div className="flex items-center gap-2 text-[var(--foreground-secondary)]">
                <Calendar className="h-3.5 w-3.5" /> {profile.moveInDate ? formatDate(profile.moveInDate) : 'Flexible'}
              </div>
              <Badge variant="flatmate" size="sm">{profile.type?.replace('_', ' ')}</Badge>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-[var(--foreground-muted)] mb-3">Create a profile to get compatibility scores</p>
              <Link href="/dashboard/tenant/profile">
                <Button size="sm" className="gap-1"><Plus className="h-3 w-3" /> Create Profile</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Sent Interests */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Send className="h-4 w-4 text-[var(--accent-room)]" /> Sent Interests
            </h2>
            <Badge variant="default">{interests.length}</Badge>
          </div>
          {interests.length === 0 ? (
            <EmptyState title="No interests sent" description="Browse listings to find matches." icon={<Send className="h-6 w-6" />} />
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {interests.slice(0, 5).map((interest: any) => (
                <div key={interest.id} className="flex items-center gap-3 p-2 rounded-[var(--radius)] hover:bg-[var(--muted-light)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                      {interest.targetProperty?.title || interest.targetSeekerProfile?.user?.name || 'Interest'}
                    </p>
                    <p className="text-xs text-[var(--foreground-muted)]">{formatDate(interest.createdAt)}</p>
                  </div>
                  <Badge
                    variant={interest.status === 'ACCEPTED' ? 'success' : interest.status === 'DECLINED' ? 'destructive' : 'warning'}
                    size="sm"
                  >
                    {interest.status}
                  </Badge>
                </div>
              ))}
              {interests.length > 5 && (
                <Link href="/interests" className="block text-center text-sm text-[var(--primary)] hover:underline">View all →</Link>
              )}
            </div>
          )}
        </div>

        {/* Favorites */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Heart className="h-4 w-4 text-[var(--destructive)]" /> Saved Favorites
            </h2>
            <Badge variant="default">{favorites.length}</Badge>
          </div>
          {favorites.length === 0 ? (
            <EmptyState title="No favorites" description="Save listings you like." icon={<Heart className="h-6 w-6" />} />
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {favorites.slice(0, 5).map((fav: any) => (
                <Link key={fav.id} href={`/properties/${fav.property?.id || fav.propertyId}`} className="flex items-center gap-3 p-2 rounded-[var(--radius)] hover:bg-[var(--muted-light)] transition-colors">
                  <div className="h-10 w-10 rounded-[var(--radius)] bg-[var(--muted-light)] overflow-hidden shrink-0">
                    {fav.property?.photos?.[0]?.url && <img src={fav.property.photos[0].url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{fav.property?.title || 'Property'}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">{fav.property?.city}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <Link href="/properties" className="card card-hover p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-[var(--radius)] bg-[var(--accent-room-light)] flex items-center justify-center">
            <MapPin className="h-5 w-5 text-[var(--accent-room)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">Browse Rooms</p>
            <p className="text-xs text-[var(--foreground-muted)]">Find your next home</p>
          </div>
          <ArrowRight className="h-4 w-4 text-[var(--foreground-muted)] ml-auto" />
        </Link>
        <Link href="/flatmates" className="card card-hover p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-[var(--radius)] bg-[var(--accent-flatmate-light)] flex items-center justify-center">
            <FileText className="h-5 w-5 text-[var(--accent-flatmate)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">Browse Flatmates</p>
            <p className="text-xs text-[var(--foreground-muted)]">Find compatible people</p>
          </div>
          <ArrowRight className="h-4 w-4 text-[var(--foreground-muted)] ml-auto" />
        </Link>
        <Link href="/interests" className="card card-hover p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-[var(--radius)] bg-[var(--primary-light)] flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">My Chats</p>
            <p className="text-xs text-[var(--foreground-muted)]">View conversations</p>
          </div>
          <ArrowRight className="h-4 w-4 text-[var(--foreground-muted)] ml-auto" />
        </Link>
      </div>
    </PageTransition>
  );
}
