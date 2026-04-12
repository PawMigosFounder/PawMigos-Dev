'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const STATUS_BADGE: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  PENDING: 'warning', ACCEPTED: 'success', REJECTED: 'error',
  COMPLETED: 'info', CANCELLED: 'error', EXPIRED: 'default',
};

export default function AdminBookingsPage() {
  const [data, setData] = useState<any>({ bookings: [], pagination: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>('/api/admin/bookings').then((res) => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">All Bookings</h1>
        {loading ? (
          <div className="animate-pulse bg-white rounded-2xl h-40" />
        ) : (
          <div className="space-y-3">
            {data.bookings.map((b: any) => (
              <Card key={b.id}>
                <CardContent>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">{b.service?.title}</p>
                      <p className="text-sm text-gray-500">Consumer: {b.user?.name} · Provider: {b.provider?.name}</p>
                      <p className="text-sm text-gray-500">Pet: {b.pet?.name} ({b.pet?.type}) · {new Date(b.date).toLocaleDateString()}</p>
                      <p className="text-sm font-medium text-[#F26F28]">₹{b.price}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <Badge variant={STATUS_BADGE[b.status]}>{b.status}</Badge>
                      <Badge variant={b.paymentStatus === 'PAID' ? 'success' : 'default'}>{b.paymentStatus}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <p className="text-center text-sm text-gray-400">
              Showing page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
