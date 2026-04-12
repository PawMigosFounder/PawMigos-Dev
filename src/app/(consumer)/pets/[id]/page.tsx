'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';

export default function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [pet, setPet] = useState<any>(null);
  const [careProfile, setCareProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCare, setShowCare] = useState(false);

  useEffect(() => {
    api.get<any>(`/api/pets/${id}`).then((res) => {
      if (res.success && res.data) {
        setPet(res.data);
        if (res.data.careProfile) setCareProfile(res.data.careProfile);
      }
      setLoading(false);
    });
  }, [id]);

  const saveCareProfile = async () => {
    setSaving(true);
    const res = await api.put<any>(`/api/pets/${id}/care-profile`, careProfile);
    setSaving(false);
    if (res.success) {
      setPet({ ...pet, careProfileCompleted: true, careProfile: res.data });
      setShowCare(false);
    }
  };

  const updateCare = (field: string, value: any) => {
    setCareProfile({ ...careProfile, [field]: value });
  };

  if (loading) return <div className="p-6 text-center text-gray-400">Loading...</div>;
  if (!pet) return <div className="p-6 text-center text-gray-500">Pet not found</div>;

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">← Back</button>
      </div>

      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F26F28]/10 flex items-center justify-center text-3xl">
              {pet.type === 'DOG' ? '🐕' : pet.type === 'CAT' ? '🐈' : '🐾'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{pet.name}</h1>
              <p className="text-sm text-gray-500">{pet.breed || pet.type} · {pet.ageGroup} · {pet.sex}</p>
              <div className="flex gap-1 mt-1">
                {pet.weightRange && <Badge>{pet.weightRange}</Badge>}
                {pet.neuteredOrSpayed && <Badge variant="info">Neutered/Spayed</Badge>}
                {pet.careProfileCompleted && <Badge variant="success">Care Profile Complete</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button fullWidth variant={pet.careProfileCompleted ? 'secondary' : 'primary'} onClick={() => setShowCare(!showCare)}>
        {showCare ? 'Close Care Profile' : pet.careProfileCompleted ? 'Edit Care Profile' : 'Complete Care Profile'}
      </Button>

      {showCare && (
        <div className="space-y-4">
          {/* Health & Vaccination */}
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-800">Health & Vaccination</h2></CardHeader>
            <CardContent className="space-y-3">
              <Select label="Vaccination Status" options={[
                { value: 'UP_TO_DATE', label: 'Up to date' }, { value: 'PARTIALLY_DONE', label: 'Partially done' },
                { value: 'NOT_VACCINATED', label: 'Not vaccinated' }, { value: 'UNKNOWN', label: 'Unknown' },
              ]} value={careProfile.vaccinationStatus || 'UNKNOWN'} onChange={(e) => updateCare('vaccinationStatus', e.target.value)} />
              <Toggle label="Rabies vaccinated" checked={careProfile.rabiesVaccinated || false} onChange={(v) => updateCare('rabiesVaccinated', v)} />
              <Toggle label="Dewormed" checked={careProfile.dewormedStatus || false} onChange={(v) => updateCare('dewormedStatus', v)} />
              <Toggle label="Flea/tick treated" checked={careProfile.fleaTickTreated || false} onChange={(v) => updateCare('fleaTickTreated', v)} />
              <Input label="Medical conditions" value={careProfile.medicalConditions || ''} onChange={(e) => updateCare('medicalConditions', e.target.value)} />
              <Toggle label="Medication required" checked={careProfile.medicationRequired || false} onChange={(v) => updateCare('medicationRequired', v)} />
              {careProfile.medicationRequired && (
                <Input label="Medication instructions" value={careProfile.medicationInstructions || ''} onChange={(e) => updateCare('medicationInstructions', e.target.value)} />
              )}
              <Input label="Allergies" value={careProfile.allergies || ''} onChange={(e) => updateCare('allergies', e.target.value)} />
              <Input label="Emergency contact" value={careProfile.emergencyContact || ''} onChange={(e) => updateCare('emergencyContact', e.target.value)} />
            </CardContent>
          </Card>

          {/* Reproductive */}
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-800">Reproductive & Hygiene</h2></CardHeader>
            <CardContent className="space-y-3">
              {pet.sex === 'FEMALE' && (
                <>
                  <Toggle label="Currently in heat" checked={careProfile.femaleInHeatCurrently || false} onChange={(v) => updateCare('femaleInHeatCurrently', v)} />
                  <Toggle label="Pregnant" checked={careProfile.pregnant || false} onChange={(v) => updateCare('pregnant', v)} />
                </>
              )}
              <Toggle label="Toilet trained" checked={careProfile.toiletTrained ?? true} onChange={(v) => updateCare('toiletTrained', v)} />
              <Toggle label="Marking behavior" checked={careProfile.markingBehavior || false} onChange={(v) => updateCare('markingBehavior', v)} />
            </CardContent>
          </Card>

          {/* Feeding */}
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-800">Food & Feeding</h2></CardHeader>
            <CardContent className="space-y-3">
              <Select label="Food type" options={[
                { value: 'DRY_KIBBLE', label: 'Dry kibble' }, { value: 'WET_FOOD', label: 'Wet food' },
                { value: 'RAW', label: 'Raw' }, { value: 'HOME_COOKED', label: 'Home cooked' }, { value: 'MIXED', label: 'Mixed' },
              ]} placeholder="Select" value={careProfile.foodType || ''} onChange={(e) => updateCare('foodType', e.target.value)} />
              <Select label="Feeding schedule" options={[
                { value: 'ONCE_DAILY', label: 'Once daily' }, { value: 'TWICE_DAILY', label: 'Twice daily' },
                { value: 'THREE_TIMES_DAILY', label: 'Three times' }, { value: 'FREE_FEEDING', label: 'Free feeding' },
              ]} placeholder="Select" value={careProfile.feedingSchedule || ''} onChange={(e) => updateCare('feedingSchedule', e.target.value)} />
              <Input label="Food allergies" value={careProfile.foodAllergies || ''} onChange={(e) => updateCare('foodAllergies', e.target.value)} />
              <Toggle label="Treats allowed" checked={careProfile.treatsAllowed ?? true} onChange={(v) => updateCare('treatsAllowed', v)} />
            </CardContent>
          </Card>

          {/* Behavior */}
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-800">Behavior & Handling</h2></CardHeader>
            <CardContent className="space-y-3">
              <Select label="Temperament" options={[
                { value: 'CALM', label: 'Calm' }, { value: 'FRIENDLY', label: 'Friendly' },
                { value: 'ENERGETIC', label: 'Energetic' }, { value: 'ANXIOUS', label: 'Anxious' },
                { value: 'AGGRESSIVE', label: 'Aggressive' }, { value: 'SHY', label: 'Shy' },
              ]} placeholder="Select" value={careProfile.temperament || ''} onChange={(e) => updateCare('temperament', e.target.value)} />
              <Select label="Friendly with dogs" options={[
                { value: 'VERY_FRIENDLY', label: 'Very friendly' }, { value: 'FRIENDLY', label: 'Friendly' },
                { value: 'NEUTRAL', label: 'Neutral' }, { value: 'CAUTIOUS', label: 'Cautious' }, { value: 'NOT_FRIENDLY', label: 'Not friendly' },
              ]} placeholder="Select" value={careProfile.friendlyWithDogs || ''} onChange={(e) => updateCare('friendlyWithDogs', e.target.value)} />
              <Select label="Friendly with cats" options={[
                { value: 'VERY_FRIENDLY', label: 'Very friendly' }, { value: 'FRIENDLY', label: 'Friendly' },
                { value: 'NEUTRAL', label: 'Neutral' }, { value: 'CAUTIOUS', label: 'Cautious' }, { value: 'NOT_FRIENDLY', label: 'Not friendly' },
              ]} placeholder="Select" value={careProfile.friendlyWithCats || ''} onChange={(e) => updateCare('friendlyWithCats', e.target.value)} />
              <Select label="Friendly with children" options={[
                { value: 'VERY_FRIENDLY', label: 'Very friendly' }, { value: 'FRIENDLY', label: 'Friendly' },
                { value: 'NEUTRAL', label: 'Neutral' }, { value: 'CAUTIOUS', label: 'Cautious' }, { value: 'NOT_FRIENDLY', label: 'Not friendly' },
              ]} placeholder="Select" value={careProfile.friendlyWithChildren || ''} onChange={(e) => updateCare('friendlyWithChildren', e.target.value)} />
              <Toggle label="Bite history" checked={careProfile.biteHistory || false} onChange={(v) => updateCare('biteHistory', v)} />
              <Toggle label="Aggression history" checked={careProfile.aggressionHistory || false} onChange={(v) => updateCare('aggressionHistory', v)} />
              <Toggle label="Separation anxiety" checked={careProfile.separationAnxiety || false} onChange={(v) => updateCare('separationAnxiety', v)} />
              <Toggle label="Crate trained" checked={careProfile.crateTrained || false} onChange={(v) => updateCare('crateTrained', v)} />
              <Toggle label="Leash trained" checked={careProfile.leashTrained || false} onChange={(v) => updateCare('leashTrained', v)} />
              <Toggle label="Escape risk" checked={careProfile.escapeRisk || false} onChange={(v) => updateCare('escapeRisk', v)} />
            </CardContent>
          </Card>

          {/* Care expectations */}
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-800">Care Expectations</h2></CardHeader>
            <CardContent className="space-y-3">
              <Select label="Exercise needs" options={[
                { value: 'LOW', label: 'Low' }, { value: 'MODERATE', label: 'Moderate' },
                { value: 'HIGH', label: 'High' }, { value: 'VERY_HIGH', label: 'Very high' },
              ]} placeholder="Select" value={careProfile.exerciseNeeds || ''} onChange={(e) => updateCare('exerciseNeeds', e.target.value)} />
              <Input label="Comfort items" value={careProfile.comfortItems || ''} onChange={(e) => updateCare('comfortItems', e.target.value)} placeholder="e.g., favorite toy, blanket" />
              <Input label="Special handling notes" value={careProfile.specialHandlingNotes || ''} onChange={(e) => updateCare('specialHandlingNotes', e.target.value)} />
            </CardContent>
          </Card>

          <Button fullWidth loading={saving} onClick={saveCareProfile}>
            Save Care Profile
          </Button>
        </div>
      )}
    </div>
  );
}
