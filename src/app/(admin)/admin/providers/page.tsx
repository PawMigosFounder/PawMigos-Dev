'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = () => {
    api.get<any>('/api/admin/providers').then((res) => {
      if (res.success) setProviders(res.data || []);
      setLoading(false);
    });
  };

  useEffect(fetchProviders, []);

  const handleAction = async (id: string, action: string) => {
    const reason = prompt('Reason (optional):');
    await api.patch(`/api/admin/providers/${id}`, { action, reason });
    fetchProviders();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Providers</h1>
        {loading ? (
          <div className="animate-pulse bg-white rounded-2xl h-40" />
        ) : (
          <div className="space-y-3">
            {providers.map((p) => (
              <Card key={p.id}>
                <CardContent>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-gray-500">{p.city} · {p.user?.phone}</p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant={p.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}>{p.verificationStatus}</Badge>
                        <Badge variant={p.isActive ? 'success' : 'error'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                        <Badge>{p.onboardingState}</Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Bookings: {p._count?.bookings} · Reviews: {p._count?.reviews}</p>
                    </div>
                    <div className="flex gap-2">
                      {!p.isActive && p.verificationStatus === 'VERIFIED' && (
                        <Button size="sm" onClick={() => handleAction(p.id, 'activate')}>Activate</Button>
                      )}
                      {p.isActive && (
                        <Button size="sm" variant="danger" onClick={() => handleAction(p.id, 'suspend')}>Suspend</Button>
                      )}
                      {p.verificationStatus !== 'VERIFIED' && (
                        <Button size="sm" variant="outline" onClick={() => handleAction(p.id, 'override_verification')}>Override Verify</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
