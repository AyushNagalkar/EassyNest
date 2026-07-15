'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, ArrowLeft } from 'lucide-react';

const SEEKER_TYPES = [
  { value: 'LOOKING_FOR_ROOM', label: 'Looking for a Room' },
  { value: 'LOOKING_FOR_FLATMATE', label: 'Looking for a Flatmate' },
];

export default function TenantProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({
    type: 'LOOKING_FOR_ROOM',
    preferredCity: '',
    preferredLat: '',
    preferredLng: '',
    budgetMin: '',
    budgetMax: '',
    moveInDate: '',
    bio: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'TENANT') { router.push('/login'); return; }
    api.get('/seeker-profile/me').then((data) => {
      if (data) {
        setForm({
          type: data.type || 'LOOKING_FOR_ROOM',
          preferredCity: data.preferredCity || '',
          preferredLat: data.preferredLat?.toString() || '',
          preferredLng: data.preferredLng?.toString() || '',
          budgetMin: data.budgetMin?.toString() || '',
          budgetMax: data.budgetMax?.toString() || '',
          moveInDate: data.moveInDate ? new Date(data.moveInDate).toISOString().split('T')[0] : '',
          bio: data.bio || '',
        });
      } else {
        setIsNew(true);
      }
    }).catch(() => setIsNew(true)).finally(() => setLoading(false));
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        type: form.type,
        preferredCity: form.preferredCity,
        preferredLat: form.preferredLat ? parseFloat(form.preferredLat) : undefined,
        preferredLng: form.preferredLng ? parseFloat(form.preferredLng) : undefined,
        budgetMin: parseInt(form.budgetMin),
        budgetMax: parseInt(form.budgetMax),
        moveInDate: form.moveInDate ? new Date(form.moveInDate).toISOString() : undefined,
        bio: form.bio || undefined,
      };
      if (isNew) {
        await api.post('/seeker-profile', body);
      } else {
        await api.patch('/seeker-profile/me', body);
      }
      router.push('/dashboard/tenant');
    } catch (err: any) {
      alert(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-2xl px-4 py-8 space-y-4"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-40 w-full" /></div>;
  }

  return (
    <PageTransition className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">{isNew ? 'Create' : 'Edit'} Seeker Profile</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <Select label="I am..." options={SEEKER_TYPES} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
        <Input label="Preferred City" placeholder="e.g. Bangalore" value={form.preferredCity} onChange={(e) => setForm({ ...form, preferredCity: e.target.value })} required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Latitude" type="number" step="any" placeholder="12.9716" value={form.preferredLat} onChange={(e) => setForm({ ...form, preferredLat: e.target.value })} />
          <Input label="Longitude" type="number" step="any" placeholder="77.5946" value={form.preferredLng} onChange={(e) => setForm({ ...form, preferredLng: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Min Budget (₹)" type="number" placeholder="5000" value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} required />
          <Input label="Max Budget (₹)" type="number" placeholder="15000" value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} required />
        </div>
        <Input label="Move-in Date" type="date" value={form.moveInDate} onChange={(e) => setForm({ ...form, moveInDate: e.target.value })} />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--foreground)]">Bio</label>
          <textarea
            className="w-full h-24 px-3 py-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-sm placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
            placeholder="Tell potential flatmates about yourself..."
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        <Button type="submit" disabled={saving} className="w-full gap-2">
          {saving ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : isNew ? 'Create Profile' : 'Save Changes'}
        </Button>
      </form>
    </PageTransition>
  );
}
