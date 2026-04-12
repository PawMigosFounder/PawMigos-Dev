'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Gurgaon', 'Noida', 'Goa'].map((c) => ({ value: c, label: c }));

const CATEGORIES = [
  { value: 'GROOMING', label: 'Grooming' }, { value: 'BOARDING', label: 'Boarding' },
  { value: 'TRAINING', label: 'Training' }, { value: 'SITTING', label: 'Sitting' },
  { value: 'WALKING', label: 'Walking' }, { value: 'OTHER', label: 'Other' },
];

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [data, setData] = useState({
    name: user?.name || '', businessName: '', city: user?.city || '', phone: user?.phone || '',
    description: '', experience: '', categories: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleCategory = (cat: string) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const handleSubmit = async () => {
    if (!data.name || !data.city || !data.phone || data.categories.length === 0) {
      setError('Please fill all required fields and select at least one category');
      return;
    }
    setLoading(true);
    const res = await api.post<any>('/api/providers', data);
    setLoading(false);
    if (res.success) {
      await refreshUser();
      router.push('/provider');
    } else {
      setError(res.error || 'Failed to create provider profile');
    }
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Become a Provider</h1>
      <p className="text-gray-500">Set up your service provider profile</p>

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <Input label="Your Name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} required />
        <Input label="Business Name (optional)" value={data.businessName} onChange={(e) => setData({ ...data, businessName: e.target.value })} />
        <Select label="City" options={CITIES} value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} required />
        <Input label="Phone" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} required />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Service Categories *</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => toggleCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  data.categories.includes(cat.value)
                    ? 'bg-[#F26F28] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#F26F28]"
          rows={3} placeholder="Describe your services..."
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
        />

        <Input label="Experience" value={data.experience} onChange={(e) => setData({ ...data, experience: e.target.value })} placeholder="e.g., 5 years with dogs" />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button fullWidth loading={loading} onClick={handleSubmit}>Create Provider Profile</Button>
      </div>
    </div>
  );
}
