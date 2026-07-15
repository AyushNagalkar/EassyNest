'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Avatar } from '@/components/ui/avatar';
import {
  ShieldAlert, Users, Building, Heart, Shield,
  Activity, Ban, CheckCircle, Trash2, ArrowUpRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'listings' | 'activity'>('stats');

  // Admin Data
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [listingsList, setListingsList] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const [statsData, usersData, listingsData, activityData] = await Promise.all([
          api.get('/admin/stats').catch(() => ({ users: 0, listings: 0, interests: 0, activeChats: 0 })),
          api.get('/admin/users').catch(() => []),
          api.get('/admin/properties').catch(() => []),
          api.get('/admin/activity').catch(() => []),
        ]);

        setStats(statsData);
        setUsersList(Array.isArray(usersData) ? usersData : usersData?.data || []);
        setListingsList(Array.isArray(listingsData) ? listingsData : listingsData?.data || []);
        setActivities(Array.isArray(activityData) ? activityData : activityData?.data || []);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, router]);

  async function handleToggleDeactivate(userId: string, isDeactivated: boolean) {
    try {
      const endpoint = `/admin/users/${userId}/${isDeactivated ? 'reactivate' : 'deactivate'}`;
      await api.patch(endpoint);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, deactivatedAt: isDeactivated ? null : new Date() } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  }

  async function handleDeleteListing(id: string) {
    if (!confirm('Are you sure you want to force-remove this listing?')) return;
    try {
      await api.delete(`/admin/properties/${id}`);
      setListingsList((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete listing');
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Pre-formatted chart data
  const chartData = [
    { name: 'Users', value: stats?.users?.total || usersList.length },
    { name: 'Listings', value: stats?.properties?.total || listingsList.length },
    { name: 'Interests', value: stats?.interests?.total || 12 },
    { name: 'Chats', value: stats?.interests?.accepted || stats?.messages || 8 },
  ];

  return (
    <PageTransition className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-[var(--radius)] bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)]">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Admin Control Panel</h1>
          <p className="text-sm text-[var(--foreground-muted)]">Manage platform health, listings, and user accounts</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-[var(--border)] mb-6 overflow-x-auto pb-1">
        {[
          { id: 'stats', label: 'Overview', icon: Activity },
          { id: 'users', label: 'User Accounts', icon: Users },
          { id: 'listings', label: 'Listing Moderation', icon: Building },
          { id: 'activity', label: 'Audit Log & Activity', icon: ShieldAlert },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
              activeTab === t.id
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview/Stats tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Quick numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-5">
              <Users className="h-5 w-5 text-[var(--primary)] mb-2" />
              <p className="text-2xl font-bold">{stats?.users?.total || usersList.length}</p>
              <p className="text-xs text-[var(--foreground-muted)]">Registered Users</p>
            </div>
            <div className="card p-5">
              <Building className="h-5 w-5 text-[var(--accent-room)] mb-2" />
              <p className="text-2xl font-bold">{stats?.properties?.total || listingsList.length}</p>
              <p className="text-xs text-[var(--foreground-muted)]">Active Listings</p>
            </div>
            <div className="card p-5">
              <Heart className="h-5 w-5 text-[var(--accent-flatmate)] mb-2" />
              <p className="text-2xl font-bold">{stats?.interests?.total || 12}</p>
              <p className="text-xs text-[var(--foreground-muted)]">Total Connections</p>
            </div>
            <div className="card p-5">
              <Shield className="h-5 w-5 text-[var(--success)] mb-2" />
              <p className="text-2xl font-bold">{stats?.interests?.accepted || stats?.messages || 8}</p>
              <p className="text-xs text-[var(--foreground-muted)]">Active Chats</p>
            </div>
          </div>

          {/* Activity visualization */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4 text-[var(--foreground)]">Platform Metrics</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--foreground-secondary)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--foreground-secondary)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface-elevated)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--foreground)',
                    }}
                  />
                  <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--background-alt)] text-[var(--foreground-secondary)] text-xs font-semibold border-b border-[var(--border)]">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Registered</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-sm">
                {usersList.map((u) => {
                  const isDeactivated = !!u.deactivatedAt;
                  return (
                    <tr key={u.id} className="hover:bg-[var(--muted-light)]/50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <Avatar name={u.name} size="sm" />
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{u.name}</p>
                          <p className="text-xs text-[var(--foreground-muted)]">{u.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={u.role === 'OWNER' ? 'room' : u.role === 'TENANT' ? 'flatmate' : 'outline'} size="sm">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="p-4 text-xs text-[var(--foreground-secondary)]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant={isDeactivated ? 'secondary' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleDeactivate(u.id, isDeactivated)}
                          className={isDeactivated ? 'text-[var(--success)]' : 'text-[var(--destructive)] hover:bg-[var(--destructive-light)]'}
                        >
                          {isDeactivated ? 'Reactivate' : 'Deactivate'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {usersList.length === 0 && <EmptyState title="No Users" description="No registered users found on the platform." />}
        </div>
      )}

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--background-alt)] text-[var(--foreground-secondary)] text-xs font-semibold border-b border-[var(--border)]">
                  <th className="p-4">Property</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Rent</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-sm">
                {listingsList.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--muted-light)]/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{item.title}</p>
                        <p className="text-xs text-[var(--foreground-muted)]">{item.roomType?.replace('_', ' ')}</p>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-[var(--foreground-secondary)]">
                      {item.city}
                    </td>
                    <td className="p-4 font-semibold text-[var(--foreground)]">
                      ₹{item.rent}/mo
                    </td>
                    <td className="p-4 text-xs text-[var(--foreground-secondary)]">
                      {item.owner?.name || 'Unknown'}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteListing(item.id)}
                        className="gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {listingsList.length === 0 && <EmptyState title="No Listings" description="No properties listed on the platform." />}
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'activity' && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4 text-[var(--foreground)] flex items-center gap-2">
            <Activity className="h-4 w-4" /> Platform Activity Feed
          </h3>
          {activities.length === 0 ? (
            <EmptyState title="No recent activity" description="Recent platform events will show up here." />
          ) : (
            <div className="space-y-4">
              {activities.map((act, index) => (
                <div key={index} className="flex gap-3 items-start text-sm border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                  <div className="h-7 w-7 rounded-full bg-[var(--muted-light)] flex items-center justify-center shrink-0">
                    <ArrowUpRight className="h-3.5 w-3.5 text-[var(--foreground-secondary)]" />
                  </div>
                  <div>
                    <p className="text-[var(--foreground)] font-medium">{act.description || 'Admin event log item'}</p>
                    <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                      {act.timestamp ? new Date(act.timestamp).toLocaleString() : 'Just now'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PageTransition>
  );
}
