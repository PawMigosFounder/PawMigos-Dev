'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Gurgaon', 'Noida', 'Goa',
].map((c) => ({ value: c, label: c }));

const PET_TYPES = [
  { value: 'DOG', label: 'Dog' },
  { value: 'CAT', label: 'Cat' },
  { value: 'OTHER', label: 'Other' },
];

const AGE_GROUPS = [
  { value: 'PUPPY_KITTEN', label: 'Puppy/Kitten (0-1 year)' },
  { value: 'YOUNG', label: 'Young (1-3 years)' },
  { value: 'ADULT', label: 'Adult (3-7 years)' },
  { value: 'SENIOR', label: 'Senior (7+ years)' },
];

const SEXES = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
];

type Step = 'intent' | 'profile' | 'pet';

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState<Step>('intent');
  const [intent, setIntent] = useState<'HAS_PET' | 'PROVIDER' | ''>('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [petData, setPetData] = useState({ name: '', type: 'DOG', breed: '', ageGroup: 'ADULT', sex: 'MALE' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleProfileSubmit = async () => {
    if (!name || !city) {
      setError('Please fill all required fields');
      return;
    }
    setError('');
    setLoading(true);

    const res = await api.post<any>('/api/users/onboarding', {
      name,
      city,
      onboardingIntent: intent,
    });
    setLoading(false);

    if (res.success) {
      if (intent === 'HAS_PET') {
        setStep('pet');
      } else if (intent === 'PROVIDER') {
        await refreshUser();
        router.push('/provider/onboarding');
      } else {
        await refreshUser();
        router.push('/');
      }
    } else {
      setError(res.error || 'Failed to save profile');
    }
  };

  const handlePetSubmit = async () => {
    if (!petData.name) {
      setError('Pet name is required');
      return;
    }
    setError('');
    setLoading(true);

    const res = await api.post<any>('/api/pets', petData);
    setLoading(false);

    if (res.success) {
      await refreshUser();
      router.push('/');
    } else {
      setError(res.error || 'Failed to add pet');
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative z-10 px-6 py-8">
      <div className="max-w-sm mx-auto">
        <div className="mb-8 text-center pt-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F26F28] to-[#E85D15] bg-clip-text text-transparent mb-1">Welcome to PawMigos</h1>
          <p className="text-gray-600 font-medium mt-2">How do you plan to use PawMigos?</p>
          <div className="flex gap-2 mt-6">
            {['intent', 'profile', ...(intent === 'HAS_PET' ? ['pet'] : [])].map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full ${
                  (['intent', 'profile', 'pet'].indexOf(step) >= i) ? 'bg-[#F26F28]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-3xl shadow-xl shadow-[#F26F28]/5 p-6 md:p-8">
          {step === 'intent' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Select your path</h2>
              <div className="space-y-4">
                <button
                  onClick={() => { setIntent('HAS_PET'); setStep('profile'); }}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                    intent === 'HAS_PET' ? 'border-[#F26F28] bg-[#F26F28]/5 shadow-sm transform scale-[1.02]' : 'border-gray-100 bg-white hover:border-[#F26F28]/50 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl block mt-0.5">🐾</span>
                    <div>
                      <span className="font-bold text-gray-800 block text-lg">I&apos;m a Pet Parent</span>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">I am looking to book trusted hosts, groomers, and pet services.</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => { setIntent('PROVIDER'); setStep('profile'); }}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                    intent === 'PROVIDER' ? 'border-[#F26F28] bg-[#F26F28]/5 shadow-sm transform scale-[1.02]' : 'border-gray-100 bg-white hover:border-[#F26F28]/50 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl block mt-0.5">🏪</span>
                    <div>
                      <span className="font-bold text-gray-800 block text-lg">I&apos;m a Service Provider</span>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">I want to manage my business, set availability, and host pets.</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Your Profile</h2>
              <Input
                label="Full Name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Select
                label="City"
                options={CITIES}
                placeholder="Select your city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep('intent')}>Back</Button>
                <Button fullWidth loading={loading} onClick={handleProfileSubmit}>
                  {intent === 'HAS_PET' ? 'Next: Add Pet' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}

          {step === 'pet' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Add Your Pet</h2>
              <Input
                label="Pet Name"
                placeholder="e.g., Buddy"
                value={petData.name}
                onChange={(e) => setPetData({ ...petData, name: e.target.value })}
                required
              />
              <Select
                label="Pet Type"
                options={PET_TYPES}
                value={petData.type}
                onChange={(e) => setPetData({ ...petData, type: e.target.value })}
              />
              <Input
                label="Breed"
                placeholder="e.g., Golden Retriever"
                value={petData.breed}
                onChange={(e) => setPetData({ ...petData, breed: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Age Group"
                  options={AGE_GROUPS}
                  value={petData.ageGroup}
                  onChange={(e) => setPetData({ ...petData, ageGroup: e.target.value })}
                />
                <Select
                  label="Sex"
                  options={SEXES}
                  value={petData.sex}
                  onChange={(e) => setPetData({ ...petData, sex: e.target.value })}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep('profile')}>Back</Button>
                <Button fullWidth loading={loading} onClick={handlePetSubmit}>
                  Complete Setup
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
