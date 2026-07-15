'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { MapView } from '@/components/map-view';
import { ArrowLeft, Save, Plus, Trash } from 'lucide-react';

const ROOM_TYPES = [
  { value: 'SINGLE', label: 'Single Room' },
  { value: 'SHARED', label: 'Shared Room' },
  { value: 'ONE_BHK', label: '1 BHK' },
  { value: 'TWO_BHK', label: '2 BHK' },
  { value: 'STUDIO', label: 'Studio' },
];

const FURNISHING_TYPES = [
  { value: 'FULLY_FURNISHED', label: 'Fully Furnished' },
  { value: 'SEMI_FURNISHED', label: 'Semi Furnished' },
  { value: 'UNFURNISHED', label: 'Unfurnished' },
];

export default function EditPropertyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    rent: '',
    address: '',
    city: '',
    lat: '',
    lng: '',
    roomType: 'SINGLE',
    furnishing: 'SEMI_FURNISHED',
    petFriendly: false,
    availableFrom: '',
  });

  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get(`/properties/${id}`);
        setForm({
          title: data.title || '',
          description: data.description || '',
          rent: data.rent?.toString() || '',
          address: data.address || '',
          city: data.city || '',
          lat: data.lat?.toString() || '',
          lng: data.lng?.toString() || '',
          roomType: data.roomType || 'SINGLE',
          furnishing: data.furnishing || 'SEMI_FURNISHED',
          petFriendly: !!data.petFriendly,
          availableFrom: data.availableFrom ? new Date(data.availableFrom).toISOString().split('T')[0] : '',
        });
        setAmenities(data.amenities || []);
        setPhotoUrls(data.photos?.map((p: any) => p.url) || ['']);
      } catch (err) {
        console.error('Failed to load property:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const propertyBody = {
        title: form.title,
        description: form.description,
        rent: parseInt(form.rent),
        address: form.address,
        city: form.city,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        roomType: form.roomType,
        furnishing: form.furnishing,
        petFriendly: form.petFriendly,
        availableFrom: form.availableFrom ? new Date(form.availableFrom).toISOString() : new Date().toISOString(),
        amenities: amenities.filter(a => a.trim() !== ''),
        photos: photoUrls.filter(url => url.trim() !== '').map((url, index) => ({ url, order: index })),
      };

      await api.patch(`/properties/${id}`, propertyBody);
      router.push('/dashboard/owner');
    } catch (err: any) {
      alert(err.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  }

  function addAmenity() {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  }

  function removeAmenity(item: string) {
    setAmenities(amenities.filter((a) => a !== item));
  }

  function addPhotoField() {
    setPhotoUrls([...photoUrls, '']);
  }

  function updatePhotoUrl(index: number, value: string) {
    const next = [...photoUrls];
    next[index] = value;
    setPhotoUrls(next);
  }

  function removePhotoField(index: number) {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <PageTransition className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Edit Property Listing</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <Input label="Listing Title" placeholder="e.g. Cozy Single Room in Koramangala" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--foreground)]">Description</label>
          <textarea
            className="w-full h-28 px-3 py-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-sm placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
            placeholder="Describe the room, house rules, roommates, amenities, etc..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Monthly Rent (₹)" type="number" placeholder="10000" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} required />
          <Input label="Available From" type="date" value={form.availableFrom} onChange={(e) => setForm({ ...form, availableFrom: e.target.value })} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Room Type" options={ROOM_TYPES} value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })} />
          <Select label="Furnishing" options={FURNISHING_TYPES} value={form.furnishing} onChange={(e) => setForm({ ...form, furnishing: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Address" placeholder="e.g. 5th Block, Koramangala" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <Input label="City" placeholder="e.g. Bangalore" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Latitude" type="number" step="any" placeholder="12.9716" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
          <Input label="Longitude" type="number" step="any" placeholder="77.5946" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
        </div>

        {form.lat && form.lng && (
          <div className="h-48 rounded-[var(--radius-lg)] overflow-hidden">
            <MapView center={[parseFloat(form.lat), parseFloat(form.lng)]} zoom={13} className="h-full" />
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            id="petFriendly"
            type="checkbox"
            checked={form.petFriendly}
            onChange={(e) => setForm({ ...form, petFriendly: e.target.checked })}
            className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] h-4 w-4"
          />
          <label htmlFor="petFriendly" className="text-sm font-medium text-[var(--foreground)]">Pet Friendly</label>
        </div>

        {/* Amenities Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">Amenities</label>
          <div className="flex gap-2">
            <Input placeholder="e.g. Wifi, AC, Power Backup" value={newAmenity} onChange={(e) => setNewAmenity(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())} />
            <Button type="button" onClick={addAmenity} variant="secondary">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {amenities.map((item) => (
              <span key={item} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--radius-full)] bg-[var(--muted-light)] text-xs font-semibold text-[var(--foreground-secondary)]">
                {item}
                <button type="button" onClick={() => removeAmenity(item)} className="text-[var(--foreground-muted)] hover:text-[var(--destructive)]"><Trash className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </div>

        {/* Photos Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--foreground)]">Photo URLs</label>
          {photoUrls.map((url, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input placeholder="https://example.com/photo.jpg" value={url} onChange={(e) => updatePhotoUrl(index, e.target.value)} required />
              {photoUrls.length > 1 && (
                <Button type="button" variant="outline" size="icon" onClick={() => removePhotoField(index)} className="text-[var(--destructive)] hover:bg-[var(--destructive-light)]">
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addPhotoField} className="w-full gap-1">
            <Plus className="h-4 w-4" /> Add Photo URL
          </Button>
        </div>

        <Button type="submit" disabled={saving} className="w-full gap-2">
          {saving ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving changes…' : 'Save Listing'}
        </Button>
      </form>
    </PageTransition>
  );
}
