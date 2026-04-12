'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';

const CATEGORIES = [
  { value: '', label: 'All Services' },
  { value: 'GROOMING', label: 'Grooming' },
  { value: 'BOARDING', label: 'Boarding' },
  { value: 'TRAINING', label: 'Training' },
  { value: 'SITTING', label: 'Sitting' },
  { value: 'WALKING', label: 'Walking' },
  { value: 'OTHER', label: 'Other' },
];

const CITIES = [
  { value: '', label: 'All Cities' },
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Gurgaon', 'Noida', 'Goa',
].map((c) => typeof c === 'string' ? { value: c, label: c } : c);

interface Provider {
  id: string;
  name: string;
  city: string;
  profilePhoto: string | null;
  description: string | null;
  categories: string[];
  averageRating: number | null;
  reviewCount: number;
  totalCompletedBookings: number;
  verificationStatus: string;
  services: { id: string; title: string; price: number; category: string }[];
}

export default function MarketplacePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState(user?.city || '');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (category) params.set('category', category);

    setLoading(true);
    api.get<any>(`/api/marketplace?${params}`).then((res) => {
      if (res.success) setProviders(res.data.providers);
      setLoading(false);
    });
  }, [city, category]);

  const categoryLabels: Record<string, string> = {
    GROOMING: 'Grooming', BOARDING: 'Boarding', TRAINING: 'Training',
    SITTING: 'Sitting', WALKING: 'Walking', OTHER: 'Other',
  };

  return (
    <div className="px-4 py-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Find Services</h1>

      <div className="flex gap-3 mb-4">
        <Select options={CITIES} value={city} onChange={(e) => setCity(e.target.value)} />
        <Select options={CATEGORIES} value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-40 animate-pulse" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <EmptyState
          title="No providers found"
          description="Try adjusting your city or category filters"
        />
      ) : (
        <div className="space-y-4">
          {providers.map((provider) => (
            <Card
              key={provider.id}
              hover
              onClick={() => router.push(`/marketplace/${provider.id}`)}
            >
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#F26F28]/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {provider.profilePhoto ? (
                      <img src={provider.profilePhoto} alt="" className="w-full h-full rounded-xl object-cover" />
                    ) : '🐾'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 truncate">{provider.name}</h3>
                      {provider.verificationStatus === 'VERIFIED' && (
                        <Badge variant="success">Verified</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{provider.city}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {provider.categories.map((cat) => (
                        <Badge key={cat}>{categoryLabels[cat] || cat}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      {provider.averageRating && (
                        <span className="text-amber-500 font-medium">
                          ★ {provider.averageRating.toFixed(1)}
                          <span className="text-gray-400 ml-1">({provider.reviewCount})</span>
                        </span>
                      )}
                      {provider.services.length > 0 && (
                        <span className="text-gray-500">
                          From ₹{Math.min(...provider.services.map((s) => s.price))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
