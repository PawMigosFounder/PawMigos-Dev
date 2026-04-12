'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const DAYS = [
  { value: '0', label: 'Sunday' }, { value: '1', label: 'Monday' }, { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' }, { value: '4', label: 'Thursday' }, { value: '5', label: 'Friday' }, { value: '6', label: 'Saturday' },
];

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSlot, setNewSlot] = useState({ dayOfWeek: '1', startTime: '09:00', endTime: '17:00' });
  const [saving, setSaving] = useState(false);

  const fetchSlots = () => {
    api.get<any>('/api/providers/availability').then((res) => {
      if (res.success) setSlots(res.data || []);
      setLoading(false);
    });
  };

  useEffect(fetchSlots, []);

  const handleAdd = async () => {
    setSaving(true);
    const res = await api.post<any>('/api/providers/availability', {
      dayOfWeek: parseInt(newSlot.dayOfWeek),
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
    });
    setSaving(false);
    if (res.success) fetchSlots();
  };

  const handleDelete = async (slotId: string) => {
    await api.delete(`/api/providers/availability?id=${slotId}`);
    fetchSlots();
  };

  return (
    <div className="px-4 py-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Availability</h1>

      <Card className="mb-4">
        <CardContent className="space-y-3">
          <Select label="Day" options={DAYS} value={newSlot.dayOfWeek} onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start" type="time" value={newSlot.startTime} onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })} />
            <Input label="End" type="time" value={newSlot.endTime} onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })} />
          </div>
          <Button fullWidth loading={saving} onClick={handleAdd}>Add Slot</Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="animate-pulse bg-white rounded-2xl h-32" />
      ) : slots.length === 0 ? (
        <Card><CardContent className="text-center py-8 text-gray-500">No availability slots set</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {slots.map((slot) => (
            <Card key={slot.id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{DAYS.find((d) => d.value === String(slot.dayOfWeek))?.label}</span>
                  <span className="text-gray-500 ml-2">{slot.startTime} - {slot.endTime}</span>
                </div>
                <button onClick={() => handleDelete(slot.id)} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
