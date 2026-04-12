'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useRouter } from 'next/navigation';

const STATUS_BADGE: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'error',
  COMPLETED: 'info',
  CANCELLED: 'error',
  EXPIRED: 'default',
};

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    api.get<any>('/api/bookings').then((res) => {
      if (res.success) setBookings(res.data || []);
      setLoading(false);
    });
  }, []);

  const upcoming = bookings.filter((b) => ['PENDING', 'ACCEPTED'].includes(b.status));
  const past = bookings.filter((b) => ['COMPLETED', 'REJECTED', 'CANCELLED', 'EXPIRED'].includes(b.status));
  const current = tab === 'upcoming' ? upcoming : past;

  const handleCancel = async (bookingId: string) => {
    const reason = prompt('Reason for cancellation:');
    if (!reason) return;
    const res = await api.delete<any>(`/api/bookings/${bookingId}`, { reason });
    if (res.success) {
      setBookings(bookings.map((b) => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
    }
  };

  const handleReview = (bookingId: string) => {
    const rating = prompt('Rating (1-5):');
    const reviewText = prompt('Review (optional):');
    if (!rating) return;
    api.post('/api/reviews', {
      bookingId,
      rating: parseInt(rating),
      reviewText: reviewText || undefined,
    }).then((res: any) => {
      if (res.success) {
        setBookings(bookings.map((b) => b.id === bookingId ? { ...b, review: res.data } : b));
      }
    });
  };

  return (
    <div className="px-4 py-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">My Bookings</h1>

      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === 'upcoming' ? 'bg-[#F26F28] text-white' : 'bg-white text-gray-600'
          }`}
          onClick={() => setTab('upcoming')}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === 'past' ? 'bg-[#F26F28] text-white' : 'bg-white text-gray-600'
          }`}
          onClick={() => setTab('past')}
        >
          Past ({past.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />)}</div>
      ) : current.length === 0 ? (
        <EmptyState
          title={tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
          description="Browse services to find a provider"
          action={<Button onClick={() => router.push('/marketplace')}>Find Services</Button>}
        />
      ) : (
        <div className="space-y-3">
          {current.map((booking) => (
            <Card key={booking.id}>
              <CardContent>
                <div className="flex justify-between items-start">
                  <div>
                    <p key={booking.id} className="font-semibold text-gray-800">{booking.service?.title}</p>
                    <p className="text-sm text-gray-500">{booking.provider?.name}</p>
                    <p className="text-sm text-gray-500">
                      Pet: {booking.pet?.name} | {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                    </p>
                    <p className="text-sm font-medium text-[#F26F28] mt-1">₹{booking.price}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={STATUS_BADGE[booking.status]}>{booking.status}</Badge>
                      <Badge variant={booking.paymentStatus === 'PAID' ? 'success' : 'default'}>
                        {booking.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {['PENDING', 'ACCEPTED'].includes(booking.status) && (
                    <Button size="sm" variant="danger" onClick={() => handleCancel(booking.id)}>Cancel</Button>
                  )}
                  {booking.status === 'COMPLETED' && !booking.review && (
                    <Button size="sm" variant="secondary" onClick={() => handleReview(booking.id)}>Leave Review</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
