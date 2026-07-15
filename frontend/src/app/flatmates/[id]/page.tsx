'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { MapView } from '@/components/map-view';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { MapPin, Calendar, Wallet, ArrowLeft, Send, Heart, Briefcase, Home, ChevronRight, CheckCircle2 } from 'lucide-react';

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
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6 animate-fade-in-up">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-[var(--radius-lg)]" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-24 rounded-[var(--radius-lg)]" />
        </div>
        <Skeleton className="h-64 w-full rounded-[var(--radius-lg)]" />
      </div>
    );
  }

  if (!seeker) {
    return <div className="flex-1 flex items-center justify-center"><p className="text-[var(--foreground-muted)]">Seeker not found</p></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] mb-5">
        <Link href="/" className="hover:text-[var(--foreground)] transition-colors flex items-center gap-1">
          <Home className="h-3.5 w-3.5" />
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/flatmates" className="hover:text-[var(--foreground)] transition-colors">
          Flatmates
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[var(--foreground)] font-medium truncate max-w-[200px]">{seeker.user?.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile header */}
          <div className="card overflow-hidden">
            {/* Gradient cover */}
            <div className="h-20 bg-gradient-to-r from-[var(--accent-flatmate)] to-[#EF4444] opacity-80" />
            <div className="p-6 -mt-10">
              <div className="flex items-end gap-4">
                <div className="ring-4 ring-[var(--surface)] rounded-full">
                  <Avatar src={seeker.user?.avatarUrl} name={seeker.user?.name || 'User'} size="xl" />
                </div>
                <div className="flex-1 pb-1">
                  <h1 className="text-2xl font-bold text-[var(--foreground)]">{seeker.user?.name}</h1>
                  <p className="text-[var(--foreground-secondary)] flex items-center gap-1.5 mt-0.5">
                    <MapPin className="h-4 w-4 text-[var(--foreground-muted)]" /> {seeker.preferredCity}
                  </p>
                </div>
                <Badge variant="flatmate" size="md">{seeker.type?.replace('_', ' ')}</Badge>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: Wallet, label: 'Budget Range', value: `${formatCurrency(seeker.budgetMin)} – ${formatCurrency(seeker.budgetMax)}`, color: 'var(--accent-room)' },
              { icon: Calendar, label: 'Move-in Date', value: seeker.moveInDate ? formatDate(seeker.moveInDate) : 'Flexible', color: 'var(--success)' },
              { icon: Briefcase, label: 'Occupation', value: seeker.occupation || 'Not specified', color: 'var(--primary)' },
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

          {seeker.bio && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">About</h2>
              <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">{seeker.bio}</p>
            </div>
          )}

          {seeker.preferredLat && seeker.preferredLng && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Preferred Area</h2>
              <div className="h-64 rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border)]">
                <MapView markers={[{ id: seeker.id, lat: seeker.preferredLat, lng: seeker.preferredLng, label: seeker.user?.name }]} center={[seeker.preferredLat, seeker.preferredLng]} zoom={14} className="h-full" />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {user?.role === 'TENANT' && user.id !== seeker.userId && (
            <div className="card p-5 lg:sticky lg:top-24">
              <AnimatePresence mode="wait">
                {interestSent ? (
                  <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-2">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }} className="h-14 w-14 rounded-full bg-[var(--success-light)] flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="h-7 w-7 text-[var(--success)]" />
                    </motion.div>
                    <p className="font-semibold text-[var(--foreground)]">Interest Sent!</p>
                    <p className="text-xs text-[var(--foreground-muted)] mt-1">They&apos;ll review your request.</p>
                  </motion.div>
                ) : (
                  <motion.div key="cta">
                    <p className="text-sm text-[var(--foreground-secondary)] mb-4">Want to connect with this flatmate?</p>
                    <Button onClick={handleExpressInterest} loading={interestLoading} className="w-full gap-2" variant="flatmate" size="lg">
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
              <p className="text-sm text-[var(--foreground-secondary)] mb-3">Sign in to connect with this flatmate seeker.</p>
              <Button variant="outline" size="sm" onClick={() => router.push('/login')} className="w-full">Sign In</Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
