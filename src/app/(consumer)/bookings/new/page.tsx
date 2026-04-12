'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerId = searchParams.get('providerId') || '';
  const serviceId = searchParams.get('serviceId') || '';

  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [compatibility, setCompatibility] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);

  useEffect(() => {
    api.get<any>('/api/pets').then((res) => {
      if (res.success) setPets(res.data || []);
    });
    if (providerId) {
      api.get<any>(`/api/marketplace/${providerId}`).then((res) => {
        if (res.success && res.data) {
          setProvider(res.data);
          const svc = res.data.services?.find((s: any) => s.id === serviceId);
          if (svc) setService(svc);
        }
      });
    }
  }, [providerId, serviceId]);

  // Check compatibility when pet is selected
  useEffect(() => {
    if (selectedPet && providerId) {
      api.post<any>('/api/compatibility/check', { petId: selectedPet, providerId }).then((res) => {
        if (res.success) setCompatibility(res.data);
      });
    }
  }, [selectedPet, providerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet || !date || !startTime) {
      setError('Please fill all required fields');
      return;
    }
    if (compatibility?.outcome === 'NOT_COMPATIBLE') {
      setError('Booking cannot proceed due to compatibility issues');
      return;
    }

    setError('');
    setLoading(true);

    const res = await api.post<any>('/api/bookings', {
      providerId,
      serviceId,
      petId: selectedPet,
      date,
      startTime,
      paymentMode: paymentMode || undefined,
    });

    setLoading(false);
    if (res.success) {
      router.push('/bookings');
    } else {
      setError(res.error || 'Failed to create booking');
    }
  };

  if (!provider || !service) {
    return <div className="p-6 text-center text-gray-400">Loading...</div>;
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="px-4 py-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Book Service</h1>

      <Card>
        <CardContent>
          <p className="font-semibold text-gray-800">{service.title}</p>
          <p className="text-sm text-gray-500">{provider.name} - {provider.city}</p>
          <p className="text-lg font-bold text-[#F26F28] mt-1">₹{service.price}</p>
        </CardContent>
      </Card>

      {pets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-gray-600 mb-3">You need to add a pet before booking</p>
            <Button onClick={() => router.push('/pets')}>Add Pet</Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Select Pet"
            options={pets.map((p) => ({ value: p.id, label: `${p.name} (${p.type})` }))}
            placeholder="Choose your pet"
            value={selectedPet}
            onChange={(e) => setSelectedPet(e.target.value)}
            required
          />

          {compatibility && (
            <Card className={
              compatibility.outcome === 'COMPATIBLE' ? 'border-green-200 bg-green-50' :
              compatibility.outcome === 'REVIEW_REQUIRED' ? 'border-amber-200 bg-amber-50' :
              'border-red-200 bg-red-50'
            }>
              <CardContent>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={
                    compatibility.outcome === 'COMPATIBLE' ? 'success' :
                    compatibility.outcome === 'REVIEW_REQUIRED' ? 'warning' : 'error'
                  }>
                    {compatibility.outcome === 'COMPATIBLE' ? 'Compatible' :
                     compatibility.outcome === 'REVIEW_REQUIRED' ? 'Review Required' : 'Not Compatible'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">{compatibility.summary}</p>
                {compatibility.reasons?.map((r: any, i: number) => (
                  <p key={i} className={`text-xs mt-1 ${r.severity === 'blocking' ? 'text-red-600' : 'text-amber-600'}`}>
                    {r.severity === 'blocking' ? '✗' : '⚠'} {r.message}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}

          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={minDate}
            required
          />

          <Input
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />

          <Select
            label="Payment Mode"
            options={[
              { value: 'UPI', label: 'UPI' },
              { value: 'CASH', label: 'Cash' },
              { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
            ]}
            placeholder="Select payment mode (optional)"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={compatibility?.outcome === 'NOT_COMPATIBLE'}
          >
            Request Booking - ₹{service.price}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-400">Loading...</div>}>
      <BookingForm />
    </Suspense>
  );
}
