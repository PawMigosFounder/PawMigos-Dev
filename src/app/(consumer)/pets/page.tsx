'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';

const PET_TYPES = [
  { value: 'DOG', label: 'Dog' }, { value: 'CAT', label: 'Cat' }, { value: 'OTHER', label: 'Other' },
];
const AGE_GROUPS = [
  { value: 'PUPPY_KITTEN', label: 'Puppy/Kitten' }, { value: 'YOUNG', label: 'Young' },
  { value: 'ADULT', label: 'Adult' }, { value: 'SENIOR', label: 'Senior' },
];
const SEXES = [{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }];
const WEIGHT_RANGES = [
  { value: 'SMALL', label: 'Small (<10kg)' }, { value: 'MEDIUM', label: 'Medium (10-25kg)' },
  { value: 'LARGE', label: 'Large (25-45kg)' }, { value: 'GIANT', label: 'Giant (>45kg)' },
];

export default function PetsPage() {
  const router = useRouter();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newPet, setNewPet] = useState({ name: '', type: 'DOG', breed: '', ageGroup: 'ADULT', sex: 'MALE', weightRange: 'MEDIUM', neuteredOrSpayed: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchPets = () => {
    api.get<any>('/api/pets').then((res) => {
      if (res.success) setPets(res.data || []);
      setLoading(false);
    });
  };

  useEffect(fetchPets, []);

  const handleAdd = async () => {
    if (!newPet.name) { setError('Pet name is required'); return; }
    setSaving(true);
    const res = await api.post<any>('/api/pets', newPet);
    setSaving(false);
    if (res.success) {
      setShowAdd(false);
      setNewPet({ name: '', type: 'DOG', breed: '', ageGroup: 'ADULT', sex: 'MALE', weightRange: 'MEDIUM', neuteredOrSpayed: false });
      fetchPets();
    } else {
      setError(res.error || 'Failed to add pet');
    }
  };

  const handleArchive = async (petId: string) => {
    const res = await api.patch<any>(`/api/pets/${petId}`, { isActive: false });
    if (res.success) fetchPets();
    else alert(res.error || 'Cannot archive pet');
  };

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">My Pets</h1>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ Add Pet'}
        </Button>
      </div>

      {showAdd && (
        <Card className="mb-4">
          <CardContent className="space-y-3">
            <Input label="Pet Name" value={newPet.name} onChange={(e) => setNewPet({ ...newPet, name: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Type" options={PET_TYPES} value={newPet.type} onChange={(e) => setNewPet({ ...newPet, type: e.target.value })} />
              <Select label="Sex" options={SEXES} value={newPet.sex} onChange={(e) => setNewPet({ ...newPet, sex: e.target.value })} />
            </div>
            <Input label="Breed" value={newPet.breed} onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })} placeholder="e.g., Labrador" />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Age Group" options={AGE_GROUPS} value={newPet.ageGroup} onChange={(e) => setNewPet({ ...newPet, ageGroup: e.target.value })} />
              <Select label="Size" options={WEIGHT_RANGES} value={newPet.weightRange} onChange={(e) => setNewPet({ ...newPet, weightRange: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={newPet.neuteredOrSpayed} onChange={(e) => setNewPet({ ...newPet, neuteredOrSpayed: e.target.checked })} className="rounded" />
              Neutered / Spayed
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button fullWidth loading={saving} onClick={handleAdd}>Add Pet</Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">{[1,2].map((i) => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />)}</div>
      ) : pets.length === 0 ? (
        <EmptyState title="No pets yet" description="Add your first pet to get started" />
      ) : (
        <div className="space-y-3">
          {pets.map((pet) => (
            <Card key={pet.id} hover onClick={() => router.push(`/pets/${pet.id}`)}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#F26F28]/10 flex items-center justify-center text-xl">
                      {pet.type === 'DOG' ? '🐕' : pet.type === 'CAT' ? '🐈' : '🐾'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{pet.name}</p>
                      <p className="text-sm text-gray-500">{pet.breed || pet.type} · {pet.ageGroup} · {pet.sex}</p>
                      <div className="flex gap-1 mt-1">
                        {pet.careProfileCompleted && <Badge variant="success">Care Profile</Badge>}
                        {pet.weightRange && <Badge>{pet.weightRange}</Badge>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleArchive(pet.id); }}
                    className="text-gray-400 hover:text-red-500 text-sm"
                  >
                    Archive
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
