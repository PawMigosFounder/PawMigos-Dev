'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const CATEGORIES = [
  { value: 'GROOMING', label: 'Grooming' }, { value: 'BOARDING', label: 'Boarding' },
  { value: 'TRAINING', label: 'Training' }, { value: 'SITTING', label: 'Sitting' },
  { value: 'WALKING', label: 'Walking' }, { value: 'OTHER', label: 'Other' },
];

const SERVICE_TYPES = [
  { value: 'HOME_VISIT', label: 'Home Visit' },
  { value: 'AT_PROVIDER', label: 'At Provider' },
  { value: 'OUTDOOR', label: 'Outdoor' },
];

export default function ProviderServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newService, setNewService] = useState({ category: 'GROOMING', title: '', description: '', price: 0, serviceType: 'AT_PROVIDER' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchServices = () => {
    api.get<any>('/api/providers/services').then((res) => {
      if (res.success) setServices(res.data || []);
      setLoading(false);
    });
  };

  useEffect(fetchServices, []);

  const handleAdd = async () => {
    if (!newService.title || newService.price <= 0) { setError('Title and price are required'); return; }
    setSaving(true);
    const res = await api.post<any>('/api/providers/services', newService);
    setSaving(false);
    if (res.success) {
      setShowAdd(false);
      setNewService({ category: 'GROOMING', title: '', description: '', price: 0, serviceType: 'AT_PROVIDER' });
      fetchServices();
    } else {
      setError(res.error || 'Failed to add service');
    }
  };

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">My Services</h1>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>{showAdd ? 'Cancel' : '+ Add'}</Button>
      </div>

      {showAdd && (
        <Card className="mb-4">
          <CardContent className="space-y-3">
            <Select label="Category" options={CATEGORIES} value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value })} />
            <Input label="Title" value={newService.title} onChange={(e) => setNewService({ ...newService, title: e.target.value })} required />
            <Input label="Description" value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} />
            <Input label="Price (₹)" type="number" value={String(newService.price)} onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })} required />
            <Select label="Service Type" options={SERVICE_TYPES} value={newService.serviceType} onChange={(e) => setNewService({ ...newService, serviceType: e.target.value })} />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button fullWidth loading={saving} onClick={handleAdd}>Add Service</Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">{[1,2].map((i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)}</div>
      ) : services.length === 0 ? (
        <Card><CardContent className="text-center py-8 text-gray-500">No services yet. Add your first service!</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{s.title}</p>
                  {s.description && <p className="text-xs text-gray-500">{s.description}</p>}
                  <div className="flex gap-1 mt-1"><Badge>{CATEGORIES.find((c) => c.value === s.category)?.label}</Badge><Badge variant="info">{s.serviceType}</Badge></div>
                </div>
                <p className="font-bold text-[#F26F28]">₹{s.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
