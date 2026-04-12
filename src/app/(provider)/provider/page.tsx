'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function ProviderDashboard() {
  const router = useRouter();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>('/api/providers/me').then((res) => {
      if (res.success) setProvider(res.data);
      else router.push('/provider/onboarding');
      setLoading(false);
    });
  }, [router]);

  if (loading) return <div className="p-6 text-center text-gray-400">Loading...</div>;
  if (!provider) return null;

  const STATUS_BADGE: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
    DRAFT: 'default', SUBMITTED: 'warning', PENDING_VERIFICATION: 'warning',
    VERIFIED: 'success', FAILED: 'error', ACTIVE: 'success', SUSPENDED: 'error',
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Provider Dashboard</h1>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg">{provider.name}</h2>
              <p className="text-sm text-gray-500">{provider.city}</p>
            </div>
            <div className="text-right space-y-1">
              <Badge variant={STATUS_BADGE[provider.onboardingState]}>{provider.onboardingState}</Badge>
              <Badge variant={provider.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}>{provider.verificationStatus}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-[#F26F28]">{provider.totalCompletedBookings}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-[#F26F28]">{provider.averageRating?.toFixed(1) || '-'}</p>
            <p className="text-xs text-gray-500">Rating ({provider.reviewCount} reviews)</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        {provider.verificationStatus !== 'VERIFIED' && (
          <Card hover onClick={() => router.push('/provider/verification')} className="border-amber-200">
            <CardContent className="flex items-center justify-between">
              <span className="font-medium text-amber-700">Complete Verification</span>
              <span className="text-amber-500">→</span>
            </CardContent>
          </Card>
        )}

        <Card hover onClick={() => router.push('/provider/services')}>
          <CardContent className="flex items-center justify-between">
            <div><span className="font-medium">Services</span><span className="text-sm text-gray-400 ml-2">{provider.services?.length || 0} active</span></div>
            <span className="text-gray-400">→</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => router.push('/provider/availability')}>
          <CardContent className="flex items-center justify-between">
            <div><span className="font-medium">Availability</span><span className="text-sm text-gray-400 ml-2">{provider.availability?.length || 0} slots</span></div>
            <span className="text-gray-400">→</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => router.push('/provider/bookings')}>
          <CardContent className="flex items-center justify-between">
            <span className="font-medium">Booking Requests</span>
            <span className="text-gray-400">→</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
