'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

const STATUS_BADGE: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  PENDING: 'warning', ACCEPTED: 'success', REJECTED: 'error',
  COMPLETED: 'info', CANCELLED: 'error', EXPIRED: 'default',
};

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'active' | 'past'>('pending');

  const fetchBookings = () => {
    api.get<any>('/api/bookings?role=provider').then((res) => {
      if (res.success) setBookings(res.data || []);
      setLoading(false);
    });
  };

  useEffect(fetchBookings, []);

  const pending = bookings.filter((b) => b.status === 'PENDING');
  const active = bookings.filter((b) => b.status === 'ACCEPTED');
  const past = bookings.filter((b) => ['COMPLETED', 'REJECTED', 'CANCELLED', 'EXPIRED'].includes(b.status));
  const current = tab === 'pending' ? pending : tab === 'active' ? active : past;

  const handleRespond = async (bookingId: string, action: string) => {
    const reason = action === 'reject' ? prompt('Reason for rejection:') : undefined;
    if (action === 'reject' && !reason) return;
    await api.post(`/api/bookings/${bookingId}`, { action, reason });
    fetchBookings();
  };

  const handleComplete = async (bookingId: string) => {
    await api.post(`/api/bookings/${bookingId}`, { action: 'complete' });
    fetchBookings();
  };

  const handleMarkPaid = async (bookingId: string) => {
    const mode = prompt('Payment mode (UPI/CASH/BANK_TRANSFER):');
    if (!mode) return;
    await api.post(`/api/bookings/${bookingId}`, { action: 'mark_paid', paymentMode: mode.toUpperCase() });
    fetchBookings();
  };

  return (
    <div className="px-4 py-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Bookings</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {([['pending', `Requests (${pending.length})`], ['active', `Active (${active.length})`], ['past', `Past (${past.length})`]] as const).map(([key, label]) => (
          <button key={key}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${tab === key ? 'bg-[#F26F28] text-white' : 'bg-white text-gray-600'}`}
            onClick={() => setTab(key)}
          >{label}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2].map((i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />)}</div>
      ) : current.length === 0 ? (
        <EmptyState title={`No ${tab} bookings`} />
      ) : (
        <div className="space-y-3">
          {current.map((booking) => (
            <Card key={booking.id}>
              <CardContent>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{booking.service?.title}</p>
                    <p className="text-sm text-gray-500">Consumer: {booking.user?.name}</p>
                    <p className="text-sm text-gray-500">Pet: {booking.pet?.name} ({booking.pet?.type})</p>
                    <p className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString()} at {booking.startTime}</p>
                    <p className="font-medium text-[#F26F28] mt-1">₹{booking.price}</p>
                    {booking.compatibilityNotes && (
                      <p className="text-xs text-amber-600 mt-1">Compatibility: {JSON.parse(booking.compatibilityNotes).summary}</p>
                    )}
                  </div>
                  <div className="space-y-1 text-right">
                    <Badge variant={STATUS_BADGE[booking.status]}>{booking.status}</Badge>
                    <Badge variant={booking.paymentStatus === 'PAID' ? 'success' : 'default'}>{booking.paymentStatus}</Badge>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {booking.status === 'PENDING' && (
                    <>
                      <Button size="sm" onClick={() => handleRespond(booking.id, 'accept')}>Accept</Button>
                      <Button size="sm" variant="danger" onClick={() => handleRespond(booking.id, 'reject')}>Reject</Button>
                    </>
                  )}
                  {booking.status === 'ACCEPTED' && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => handleComplete(booking.id)}>Mark Complete</Button>
                      {booking.paymentStatus !== 'PAID' && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkPaid(booking.id)}>Mark Paid</Button>
                      )}
                    </>
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
