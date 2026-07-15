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
import { formatCurrency } from '@/lib/utils';
import {
  Building, Plus, Eye, Heart, Users, TrendingUp,
  ToggleLeft, ToggleRight, MapPin,
} from 'lucide-react';

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'OWNER') { router.push('/login'); return; }
    Promise.all([
      api.get('/properties/mine').catch(() => []),
      api.get('/interests/received').catch(() => []),
      api.get('/properties/mine/analytics').catch(() => []),
    ]).then(([props, ints, anal]) => {
      setProperties(Array.isArray(props) ? props : []);
      setInterests(Array.isArray(ints) ? ints : ints?.data || []);
      setAnalytics(Array.isArray(anal) ? anal : []);
    }).finally(() => setLoading(false));
  }, [user, router]);

  async function toggleStatus(id: string, current: string) {
    const newStatus = current === 'ACTIVE' ? 'FILLED' : 'ACTIVE';
    try {
      await api.patch(`/properties/${id}/status`, { status: newStatus });
      setProperties(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  const totalViews = analytics.reduce((s, a) => s + (a.viewCount || 0), 0);
  const totalInterests = interests.length;
  const activeCount = properties.filter(p => p.status === 'ACTIVE').length;

  return (
    <PageTransition className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Owner Dashboard</h1>
          <p className="text-sm text-[var(--foreground-muted)]">Manage your property listings</p>
        </div>
        <Link href="/dashboard/owner/properties/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> New Listing</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Listings', value: activeCount, icon: Building, color: 'var(--primary)' },
          { label: 'Total Views', value: totalViews, icon: Eye, color: 'var(--accent-room)' },
          { label: 'Interests', value: totalInterests, icon: Heart, color: 'var(--accent-flatmate)' },
          { label: 'Conversion', value: totalViews > 0 ? ((totalInterests / totalViews) * 100).toFixed(1) + '%' : '0%', icon: TrendingUp, color: 'var(--success)' },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <stat.icon className="h-5 w-5 mb-2" style={{ color: stat.color }} />
            <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
            <p className="text-xs text-[var(--foreground-muted)]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Properties grid */}
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Your Listings</h2>
      {properties.length === 0 ? (
        <EmptyState
          icon={<Building className="h-8 w-8" />}
          title="No listings yet"
          description="Create your first property listing to start receiving interests."
          action={<Link href="/dashboard/owner/properties/new"><Button className="gap-1"><Plus className="h-4 w-4" /> Create Listing</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((prop) => (
            <motion.div key={prop.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
              <div className="aspect-[16/10] bg-[var(--muted-light)] overflow-hidden">
                {prop.photos?.[0]?.url ? (
                  <img src={prop.photos[0].url} alt={prop.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--foreground-muted)]"><Building className="h-8 w-8" /></div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[var(--foreground)] truncate">{prop.title}</h3>
                    <p className="text-xs text-[var(--foreground-muted)] flex items-center gap-1"><MapPin className="h-3 w-3" />{prop.city}</p>
                  </div>
                  <Badge variant={prop.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">{prop.status}</Badge>
                </div>
                <p className="text-lg font-bold text-[var(--foreground)] mt-2">{formatCurrency(prop.rent)}<span className="text-xs font-normal text-[var(--foreground-muted)]">/mo</span></p>

                <div className="flex items-center gap-2 mt-3 text-xs text-[var(--foreground-muted)]">
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{prop.viewCount || 0} views</span>
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{prop._count?.favorites || 0}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{prop._count?.interests || 0}</span>
                </div>

                <div className="flex gap-2 mt-3">
                  <Link href={`/dashboard/owner/properties/${prop.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Edit</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStatus(prop.id, prop.status)}
                    className="gap-1"
                  >
                    {prop.status === 'ACTIVE' ? <ToggleRight className="h-4 w-4 text-[var(--success)]" /> : <ToggleLeft className="h-4 w-4" />}
                    {prop.status === 'ACTIVE' ? 'Mark Filled' : 'Reactivate'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Received Interests */}
      {interests.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Received Interests</h2>
            <Link href="/interests"><Button variant="ghost" size="sm">View All →</Button></Link>
          </div>
          <div className="space-y-3">
            {interests.slice(0, 5).map((int: any) => (
              <div key={int.id} className="card p-4 flex items-center gap-3">
                <Avatar src={int.fromUser?.avatarUrl} name={int.fromUser?.name || 'User'} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)]">{int.fromUser?.name}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">interested in {int.targetProperty?.title}</p>
                </div>
                <Badge variant={int.status === 'ACCEPTED' ? 'success' : int.status === 'DECLINED' ? 'destructive' : 'warning'} size="sm">
                  {int.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageTransition>
  );
}
