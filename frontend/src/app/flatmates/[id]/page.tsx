'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { MapView } from '@/components/map-view';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { MapPin, Calendar, Wallet, ArrowLeft, Send, Heart, Briefcase } from 'lucide-react';

export default function FlatmateDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [seeker, setSeeker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [interestLoading, setInterestLoading] = useState(false);
  const [interestSent, setInterestSent] = useState(false);

  useEffect(() => {
    api.get(`/seekers/${id}`).then(setSeeker).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  async function handleExpressInterest() {
    setInterestLoading(true);
    try {
      await api.post('/interests', { targetType: 'SEEKER_PROFILE', targetSeekerProfileId: id });
      setInterestSent(true);
    } catch (err: any) {
      alert(err.message || 'Failed');
    } finally {
      setInterestLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!seeker) {
    return <div className="flex-1 flex items-center justify-center"><p className="text-[var(--foreground-muted)]">Seeker not found</p></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile header */}
          <div className="card p-6 flex items-start gap-4">
            <Avatar src={seeker.user?.avatarUrl} name={seeker.user?.name || 'User'} size="lg" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">{seeker.user?.name}</h1>
              <p className="text-[var(--foreground-secondary)] flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" /> {seeker.preferredCity}
              </p>
              <Badge variant="flatmate" size="md" className="mt-2">{seeker.type?.replace('_', ' ')}</Badge>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="card p-4">
              <Wallet className="h-4 w-4 text-[var(--foreground-muted)] mb-1" />
              <p className="text-xs text-[var(--foreground-muted)]">Budget Range</p>
              <p className="text-sm font-semibold text-[var(--foreground)]">{formatCurrency(seeker.budgetMin)} – {formatCurrency(seeker.budgetMax)}</p>
            </div>
            <div className="card p-4">
              <Calendar className="h-4 w-4 text-[var(--foreground-muted)] mb-1" />
              <p className="text-xs text-[var(--foreground-muted)]">Move-in Date</p>
              <p className="text-sm font-semibold text-[var(--foreground)]">{seeker.moveInDate ? formatDate(seeker.moveInDate) : 'Flexible'}</p>
            </div>
            <div className="card p-4">
              <Briefcase className="h-4 w-4 text-[var(--foreground-muted)] mb-1" />
              <p className="text-xs text-[var(--foreground-muted)]">Occupation</p>
              <p className="text-sm font-semibold text-[var(--foreground)]">{seeker.occupation || 'Not specified'}</p>
            </div>
          </div>

          {seeker.bio && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">About</h2>
              <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">{seeker.bio}</p>
            </div>
          )}

          {seeker.preferredLat && seeker.preferredLng && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">Preferred Area</h2>
              <div className="h-64 rounded-[var(--radius-lg)] overflow-hidden">
                <MapView markers={[{ id: seeker.id, lat: seeker.preferredLat, lng: seeker.preferredLng, label: seeker.user?.name }]} center={[seeker.preferredLat, seeker.preferredLng]} zoom={14} className="h-full" />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {user?.role === 'TENANT' && user.id !== seeker.userId && (
            <div className="card p-5">
              {interestSent ? (
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-[var(--success-light)] flex items-center justify-center mx-auto mb-2"><Heart className="h-6 w-6 text-[var(--success)]" /></div>
                  <p className="font-medium text-[var(--foreground)]">Interest Sent!</p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">They&apos;ll review your request.</p>
                </div>
              ) : (
                <Button onClick={handleExpressInterest} disabled={interestLoading} className="w-full gap-2" variant="flatmate" size="lg">
                  {interestLoading ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
                  Express Interest
                </Button>
              )}
            </div>
          )}
          {!user && (
            <div className="card p-5 text-center">
              <p className="text-sm text-[var(--foreground-secondary)] mb-3">Sign in to connect with this flatmate seeker.</p>
              <Button variant="outline" size="sm" onClick={() => router.push('/login')} className="w-full">Sign In</Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
