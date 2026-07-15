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
import { MapView } from '@/components/map-view';
import { Save, ArrowLeft } from 'lucide-react';

const SEEKER_TYPES = [
  { value: 'ROOM_SEEKER', label: 'Looking for a Room' },
  { value: 'FLATMATE_SEEKER', label: 'Looking for a Flatmate' },
  { value: 'BOTH', label: 'Looking for both' },
];

const SLEEP_SCHEDULE_OPTIONS = [
  { value: 'early_bird', label: 'Early Bird' },
  { value: 'night_owl', label: 'Night Owl' },
  { value: 'flexible', label: 'Flexible' },
];

const CLEANLINESS_OPTIONS = [
  { value: 'very_clean', label: 'Very Clean' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'relaxed', label: 'Relaxed' },
];

const SMOKING_OPTIONS = [
  { value: 'smoker', label: 'Smoker' },
  { value: 'non_smoker', label: 'Non-Smoker' },
  { value: 'outdoors_only', label: 'Outdoors Only' },
];

const PETS_OPTIONS = [
  { value: 'has_pets', label: 'Have Pets' },
  { value: 'no_pets', label: 'No Pets' },
  { value: 'pet_friendly', label: 'Pet Friendly' },
];

const GENDER_PREF_OPTIONS = [
  { value: 'ANY', label: 'Any Gender' },
  { value: 'MALE_ONLY', label: 'Male Only' },
  { value: 'FEMALE_ONLY', label: 'Female Only' },
];

export default function TenantProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({
    type: 'ROOM_SEEKER',
    preferredCity: '',
    preferredLat: '',
    preferredLng: '',
    budgetMin: '',
    budgetMax: '',
    moveInDate: '',
    bio: '',
    sleepSchedule: 'flexible',
    cleanliness: 'moderate',
    smoking: 'non_smoker',
    pets: 'no_pets',
    workFromHome: false,
    genderPreference: 'ANY',
    occupation: '',
    age: '',
  });

  async function handleSearchCity(city: string) {
    if (!city) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setForm((prev) => ({ ...prev, preferredLat: lat, preferredLng: lon }));
      } else {
        alert('City/location not found. Click directly on the map to pin it manually.');
      }
    } catch (err) {
      console.error('Geocoding failed:', err);
    }
  }

  useEffect(() => {
    if (!user || user.role !== 'TENANT') { router.push('/login'); return; }
    api.get('/seeker-profile/me').then((data) => {
      if (data) {
        setForm({
          type: data.type || 'ROOM_SEEKER',
          preferredCity: data.preferredCity || '',
          preferredLat: data.preferredLat?.toString() || '',
          preferredLng: data.preferredLng?.toString() || '',
          budgetMin: data.budgetMin?.toString() || '',
          budgetMax: data.budgetMax?.toString() || '',
          moveInDate: data.moveInDate ? new Date(data.moveInDate).toISOString().split('T')[0] : '',
          bio: data.bio || '',
          sleepSchedule: data.sleepSchedule || 'flexible',
          cleanliness: data.cleanliness || 'moderate',
          smoking: data.smoking || 'non_smoker',
          pets: data.pets || 'no_pets',
          workFromHome: !!data.workFromHome,
          genderPreference: data.genderPreference || 'ANY',
          occupation: data.occupation || '',
          age: data.age?.toString() || '',
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
        sleepSchedule: form.sleepSchedule,
        cleanliness: form.cleanliness,
        smoking: form.smoking,
        pets: form.pets,
        workFromHome: form.workFromHome,
        genderPreference: form.genderPreference,
        occupation: form.occupation || undefined,
        age: form.age ? parseInt(form.age) : undefined,
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 flex flex-col justify-end">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input label="Preferred City" placeholder="e.g. Bangalore" value={form.preferredCity} onChange={(e) => setForm({ ...form, preferredCity: e.target.value })} required />
              </div>
              <Button type="button" onClick={() => handleSearchCity(form.preferredCity)} variant="secondary" className="h-10">
                Find on Map
              </Button>
            </div>
          </div>
        </div>

        <div className="h-56 rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)] relative">
          <MapView
            center={[parseFloat(form.preferredLat || '12.9716'), parseFloat(form.preferredLng || '77.5946')]}
            zoom={12}
            markers={form.preferredLat && form.preferredLng ? [{ id: 'preferred', lat: parseFloat(form.preferredLat), lng: parseFloat(form.preferredLng), label: 'Preferred Area' }] : []}
            onMapClick={(lat, lng) => {
              setForm((prev) => ({ ...prev, preferredLat: lat.toString(), preferredLng: lng.toString() }));
            }}
            className="h-full"
          />
          <div className="absolute bottom-2 left-2 z-10 bg-black/70 px-2 py-1 rounded text-[10px] text-white pointer-events-none">
            Click on the map to pin preferred location manually
          </div>
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

        {/* Lifestyle Details (for match score) */}
        <div className="border-t border-[var(--border)] pt-5 space-y-4">
          <h3 className="text-md font-semibold text-[var(--foreground)]">Lifestyle & Preferences</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Occupation" placeholder="e.g. Software Dev" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} />
            <Input label="Age" type="number" min="18" max="100" placeholder="e.g. 25" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Sleep Schedule" options={SLEEP_SCHEDULE_OPTIONS} value={form.sleepSchedule} onChange={(e) => setForm({ ...form, sleepSchedule: e.target.value })} />
            <Select label="Cleanliness" options={CLEANLINESS_OPTIONS} value={form.cleanliness} onChange={(e) => setForm({ ...form, cleanliness: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Smoking" options={SMOKING_OPTIONS} value={form.smoking} onChange={(e) => setForm({ ...form, smoking: e.target.value })} />
            <Select label="Pets" options={PETS_OPTIONS} value={form.pets} onChange={(e) => setForm({ ...form, pets: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Gender Preference" options={GENDER_PREF_OPTIONS} value={form.genderPreference} onChange={(e) => setForm({ ...form, genderPreference: e.target.value })} />
            <div className="flex items-center gap-2 pt-8">
              <input
                id="wfh"
                type="checkbox"
                checked={form.workFromHome}
                onChange={(e) => setForm({ ...form, workFromHome: e.target.checked })}
                className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] h-4 w-4"
              />
              <label htmlFor="wfh" className="text-sm font-medium text-[var(--foreground)]">Work From Home</label>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={saving} className="w-full gap-2">
          {saving ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : isNew ? 'Create Profile' : 'Save Changes'}
        </Button>
      </form>
    </PageTransition>
  );
}
