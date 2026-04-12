'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface ProviderDetail {
  id: string;
  name: string;
  businessName: string | null;
  city: string;
  description: string | null;
  experience: string | null;
  profilePhoto: string | null;
  categories: string[];
  averageRating: number | null;
  reviewCount: number;
  totalCompletedBookings: number;
  verificationStatus: string;
  hostingProfileCompleted: boolean;
  services: { id: string; title: string; description: string | null; price: number; category: string; serviceType: string }[];
  availability: { dayOfWeek: number; startTime: string; endTime: string }[];
  accommodationProfile: {
    accommodationType: string;
    accommodationSize: string;
    outdoorSpaceAvailable: boolean;
    fencedProperty: boolean;
    emergencyVetAccess: boolean;
  } | null;
  reviews: { id: string; rating: number; reviewText: string | null; user: { name: string | null } }[];
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CATEGORY_LABELS: Record<string, string> = {
  GROOMING: 'Grooming', BOARDING: 'Boarding', TRAINING: 'Training',
  SITTING: 'Sitting', WALKING: 'Walking', OTHER: 'Other',
};

export default function ProviderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ProviderDetail>(`/api/marketplace/${id}`).then((res) => {
      if (res.success && res.data) setProvider(res.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="p-6 text-center text-gray-400">Loading...</div>;
  if (!provider) return <div className="p-6 text-center text-gray-500">Provider not found</div>;

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Profile header */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-[#F26F28]/10 flex items-center justify-center text-3xl flex-shrink-0">
              {provider.profilePhoto ? (
                <img src={provider.profilePhoto} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : '🐾'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{provider.name}</h1>
              {provider.businessName && (
                <p className="text-sm text-gray-500">{provider.businessName}</p>
              )}
              <p className="text-sm text-gray-500">{provider.city}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="success">Verified</Badge>
                {provider.averageRating && (
                  <span className="text-sm text-amber-500 font-medium">
                    ★ {provider.averageRating.toFixed(1)} ({provider.reviewCount} reviews)
                  </span>
                )}
              </div>
            </div>
          </div>
          {provider.description && (
            <p className="text-sm text-gray-600 mt-3">{provider.description}</p>
          )}
          {provider.experience && (
            <p className="text-sm text-gray-500 mt-1">Experience: {provider.experience}</p>
          )}
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {provider.categories.map((cat) => (
          <Badge key={cat} variant="info">{CATEGORY_LABELS[cat] || cat}</Badge>
        ))}
      </div>

      {/* Services */}
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-800">Services</h2></CardHeader>
        <CardContent className="space-y-3">
          {provider.services.map((service) => (
            <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800">{service.title}</p>
                {service.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
                )}
                <Badge className="mt-1">{CATEGORY_LABELS[service.category]}</Badge>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#F26F28]">₹{service.price}</p>
                <Button
                  size="sm"
                  className="mt-1"
                  onClick={() => router.push(`/bookings/new?providerId=${provider.id}&serviceId=${service.id}`)}
                >
                  Book
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Availability */}
      {provider.availability.length > 0 && (
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-800">Availability</h2></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {provider.availability.map((slot, i) => (
                <div key={i} className="text-sm bg-gray-50 rounded-lg p-2">
                  <span className="font-medium">{DAY_NAMES[slot.dayOfWeek]}</span>
                  <span className="text-gray-500 ml-2">{slot.startTime} - {slot.endTime}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accommodation */}
      {provider.accommodationProfile && (
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-800">Accommodation</h2></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Type:</span> {provider.accommodationProfile.accommodationType}</div>
              <div><span className="text-gray-500">Size:</span> {provider.accommodationProfile.accommodationSize}</div>
              <div>{provider.accommodationProfile.outdoorSpaceAvailable ? '✓ Outdoor space' : '✗ No outdoor space'}</div>
              <div>{provider.accommodationProfile.fencedProperty ? '✓ Fenced property' : '✗ Not fenced'}</div>
              <div>{provider.accommodationProfile.emergencyVetAccess ? '✓ Emergency vet access' : '✗ No emergency vet'}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews */}
      {provider.reviews.length > 0 && (
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-800">Reviews</h2></CardHeader>
          <CardContent className="space-y-3">
            {provider.reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-50 pb-3 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  <span className="text-sm text-gray-500">{review.user.name || 'Anonymous'}</span>
                </div>
                {review.reviewText && <p className="text-sm text-gray-600 mt-1">{review.reviewText}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="text-center text-sm text-gray-400 pb-4">
        {provider.totalCompletedBookings} bookings completed
      </div>
    </div>
  );
}
