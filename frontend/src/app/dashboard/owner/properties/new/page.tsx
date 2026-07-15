'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MapView } from '@/components/map-view';
import { ArrowLeft, Save, Plus, Trash } from 'lucide-react';

const ROOM_TYPES = [
  { value: 'SINGLE_ROOM', label: 'Single Room' },
  { value: 'SHARED_ROOM', label: 'Shared Room' },
  { value: 'ONE_BHK', label: '1 BHK' },
  { value: 'TWO_BHK', label: '2 BHK' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'PG', label: 'PG' },
];

const FURNISHING_TYPES = [
  { value: 'FURNISHED', label: 'Furnished' },
  { value: 'SEMI_FURNISHED', label: 'Semi Furnished' },
  { value: 'UNFURNISHED', label: 'Unfurnished' },
];

export default function NewPropertyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    rent: '',
    address: '',
    city: '',
    lat: '12.9716',
    lng: '77.5946',
    roomType: 'SINGLE_ROOM',
    furnishing: 'FURNISHED',
    petFriendly: false,
    availableFrom: '',
  });

  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  
  // Photo files state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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
      };

      const property = await api.post('/properties', propertyBody);

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append('files', file);
        });
        await api.post(`/upload/property/${property.id}/photos`, formData);
      }

      router.push('/dashboard/owner');
    } catch (err: any) {
      alert(err.message || 'Failed to create listing');
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

  async function handleSearchAddress(addr: string) {
    if (!addr) return;
    try {
      const cityQuery = form.city ? `, ${form.city}` : '';
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          addr + cityQuery
        )}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setForm((prev) => ({ ...prev, lat, lng: lon }));
      } else {
        alert('Address not found. Try search using city, or click directly on the map to place the marker.');
      }
    } catch (err) {
      console.error('Geocoding failed:', err);
    }
  }

  function removeAmenity(item: string) {
    setAmenities(amenities.filter((a) => a !== item));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (selectedFiles.length + filesArray.length > 10) {
        alert('You can upload a maximum of 10 photos');
        return;
      }
      setSelectedFiles([...selectedFiles, ...filesArray]);
    }
  }

  function removeSelectedFile(index: number) {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  }

  return (
    <PageTransition className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">List Your Property</h1>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 flex flex-col justify-end">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input label="Address" placeholder="e.g. 5th Block, Koramangala" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              </div>
              <Button type="button" onClick={() => handleSearchAddress(form.address)} variant="secondary" className="h-10">
                Find on Map
              </Button>
            </div>
          </div>
          <Input label="City" placeholder="e.g. Bangalore" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        </div>

        <div className="h-56 rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)] relative">
          <MapView
            center={[parseFloat(form.lat || '12.9716'), parseFloat(form.lng || '77.5946')]}
            zoom={13}
            markers={form.lat && form.lng ? [{ id: 'pinned', lat: parseFloat(form.lat), lng: parseFloat(form.lng), label: 'Selected Location' }] : []}
            onMapClick={(lat, lng) => {
              setForm((prev) => ({ ...prev, lat: lat.toString(), lng: lng.toString() }));
            }}
            className="h-full"
          />
          <div className="absolute bottom-2 left-2 z-10 bg-black/70 px-2 py-1 rounded text-[10px] text-white pointer-events-none">
            Click on the map to pin listing location manually
          </div>
        </div>
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
          <label className="block text-sm font-medium text-[var(--foreground)]">Property Photos (Max 10)</label>
          
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border border-[var(--border)] border-dashed rounded-[var(--radius-lg)] cursor-pointer bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Plus className="w-8 h-8 text-[var(--foreground-muted)] mb-2" />
                <p className="mb-2 text-sm text-[var(--foreground-secondary)]"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-[var(--foreground-muted)]">PNG, JPG or WEBP (Max. 5MB per file)</p>
              </div>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
              {selectedFiles.map((file, index) => {
                const url = URL.createObjectURL(file);
                return (
                  <div key={index} className="relative aspect-video rounded-[var(--radius)] overflow-hidden border border-[var(--border)] group">
                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(index)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Button type="submit" disabled={saving} className="w-full gap-2">
          {saving ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Creating listing…' : 'List Property'}
        </Button>
      </form>
    </PageTransition>
  );
}
