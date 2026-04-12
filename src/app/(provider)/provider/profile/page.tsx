'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';

export default function ProviderProfilePage() {
  const router = useRouter();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAccommodation, setShowAccommodation] = useState(false);
  const [accommodation, setAccommodation] = useState<any>({
    accommodationType: 'APARTMENT', accommodationSize: 'MEDIUM',
    outdoorSpaceAvailable: false, fencedProperty: false,
    numberOfExistingPets: 0, childrenInHome: false, elderlyInHome: false,
    smokingInHome: false, vehicleAvailableForEmergency: false, emergencyVetAccess: false,
  });
  const [restrictions, setRestrictions] = useState<any>({
    acceptsDogs: true, acceptsCats: true, acceptsOtherPets: false,
    maxPetSizeAllowed: 'GIANT', maxNumberOfGuestPets: 2,
    acceptsUnvaccinatedPets: false, acceptsPetsInHeat: false,
    acceptsUnneuteredUnspayed: true, acceptsSeniorPets: true,
    acceptsMedicationCases: false, acceptsSpecialNeedsPets: false,
    acceptsAggressiveReactive: false, acceptsPuppiesOrKittens: true,
    acceptsLargeBreeds: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<any>('/api/providers/me').then((res) => {
      if (res.success && res.data) {
        setProvider(res.data);
        if (res.data.accommodationProfile) setAccommodation(res.data.accommodationProfile);
        if (res.data.hostingRestrictions) setRestrictions(res.data.hostingRestrictions);
      }
      setLoading(false);
    });
  }, []);

  const saveAccommodation = async () => {
    setSaving(true);
    await api.put('/api/providers/accommodation', { accommodation, restrictions });
    setSaving(false);
    setShowAccommodation(false);
  };

  if (loading) return <div className="p-6 text-center text-gray-400">Loading...</div>;
  if (!provider) return <div className="p-6 text-center text-gray-500">Provider not found</div>;

  return (
    <div className="px-4 py-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Provider Profile</h1>

      <Card>
        <CardContent>
          <h2 className="font-semibold text-lg">{provider.name}</h2>
          <p className="text-sm text-gray-500">{provider.city} · {provider.phone}</p>
          <div className="flex gap-1 mt-2">
            {provider.categories?.map((c: string) => <Badge key={c}>{c}</Badge>)}
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant={provider.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}>{provider.verificationStatus}</Badge>
            <Badge variant={provider.isActive ? 'success' : 'error'}>{provider.isActive ? 'Active' : 'Inactive'}</Badge>
          </div>
        </CardContent>
      </Card>

      <Button fullWidth variant="secondary" onClick={() => setShowAccommodation(!showAccommodation)}>
        {showAccommodation ? 'Close' : provider.hostingProfileCompleted ? 'Edit Hosting Profile' : 'Set Up Hosting Profile'}
      </Button>

      {showAccommodation && (
        <div className="space-y-4">
          <Card>
            <CardHeader><h2 className="font-semibold">Accommodation Details</h2></CardHeader>
            <CardContent className="space-y-3">
              <Select label="Type" options={[
                { value: 'APARTMENT', label: 'Apartment' }, { value: 'HOUSE', label: 'House' },
                { value: 'VILLA', label: 'Villa' }, { value: 'FARM', label: 'Farm' }, { value: 'OTHER', label: 'Other' },
              ]} value={accommodation.accommodationType} onChange={(e) => setAccommodation({ ...accommodation, accommodationType: e.target.value })} />
              <Select label="Size" options={[
                { value: 'SMALL', label: 'Small' }, { value: 'MEDIUM', label: 'Medium' },
                { value: 'LARGE', label: 'Large' }, { value: 'EXTRA_LARGE', label: 'Extra Large' },
              ]} value={accommodation.accommodationSize} onChange={(e) => setAccommodation({ ...accommodation, accommodationSize: e.target.value })} />
              <Toggle label="Outdoor space available" checked={accommodation.outdoorSpaceAvailable} onChange={(v) => setAccommodation({ ...accommodation, outdoorSpaceAvailable: v })} />
              <Toggle label="Fenced property" checked={accommodation.fencedProperty} onChange={(v) => setAccommodation({ ...accommodation, fencedProperty: v })} />
              <Toggle label="Children in home" checked={accommodation.childrenInHome} onChange={(v) => setAccommodation({ ...accommodation, childrenInHome: v })} />
              <Toggle label="Emergency vet access" checked={accommodation.emergencyVetAccess} onChange={(v) => setAccommodation({ ...accommodation, emergencyVetAccess: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="font-semibold">Pet Acceptance Rules</h2></CardHeader>
            <CardContent className="space-y-3">
              <Toggle label="Accepts dogs" checked={restrictions.acceptsDogs} onChange={(v) => setRestrictions({ ...restrictions, acceptsDogs: v })} />
              <Toggle label="Accepts cats" checked={restrictions.acceptsCats} onChange={(v) => setRestrictions({ ...restrictions, acceptsCats: v })} />
              <Toggle label="Accepts other pets" checked={restrictions.acceptsOtherPets} onChange={(v) => setRestrictions({ ...restrictions, acceptsOtherPets: v })} />
              <Select label="Max pet size" options={[
                { value: 'SMALL', label: 'Small only' }, { value: 'MEDIUM', label: 'Up to Medium' },
                { value: 'LARGE', label: 'Up to Large' }, { value: 'GIANT', label: 'All sizes' },
              ]} value={restrictions.maxPetSizeAllowed} onChange={(e) => setRestrictions({ ...restrictions, maxPetSizeAllowed: e.target.value })} />
              <Input label="Max guest pets" type="number" value={String(restrictions.maxNumberOfGuestPets)} onChange={(e) => setRestrictions({ ...restrictions, maxNumberOfGuestPets: parseInt(e.target.value) || 1 })} />
              <Toggle label="Accepts unvaccinated pets" checked={restrictions.acceptsUnvaccinatedPets} onChange={(v) => setRestrictions({ ...restrictions, acceptsUnvaccinatedPets: v })} />
              <Toggle label="Accepts pets in heat" checked={restrictions.acceptsPetsInHeat} onChange={(v) => setRestrictions({ ...restrictions, acceptsPetsInHeat: v })} />
              <Toggle label="Accepts unneutered/unspayed" checked={restrictions.acceptsUnneuteredUnspayed} onChange={(v) => setRestrictions({ ...restrictions, acceptsUnneuteredUnspayed: v })} />
              <Toggle label="Accepts senior pets" checked={restrictions.acceptsSeniorPets} onChange={(v) => setRestrictions({ ...restrictions, acceptsSeniorPets: v })} />
              <Toggle label="Accepts medication cases" checked={restrictions.acceptsMedicationCases} onChange={(v) => setRestrictions({ ...restrictions, acceptsMedicationCases: v })} />
              <Toggle label="Accepts aggressive/reactive pets" checked={restrictions.acceptsAggressiveReactive} onChange={(v) => setRestrictions({ ...restrictions, acceptsAggressiveReactive: v })} />
              <Toggle label="Accepts puppies/kittens" checked={restrictions.acceptsPuppiesOrKittens} onChange={(v) => setRestrictions({ ...restrictions, acceptsPuppiesOrKittens: v })} />
              <Toggle label="Accepts large breeds" checked={restrictions.acceptsLargeBreeds} onChange={(v) => setRestrictions({ ...restrictions, acceptsLargeBreeds: v })} />
            </CardContent>
          </Card>

          <Button fullWidth loading={saving} onClick={saveAccommodation}>Save Hosting Profile</Button>
        </div>
      )}
    </div>
  );
}
