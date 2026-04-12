'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>('/api/notifications').then((res) => {
      if (res.success) setNotifications(res.data?.notifications || []);
      setLoading(false);
    });
  }, []);

  const markAllRead = async () => {
    await api.put('/api/notifications', { markAllRead: true });
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <Button size="sm" variant="ghost" onClick={markAllRead}>Mark all read</Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}</div>
      ) : notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={!n.isRead ? 'border-l-4 border-l-[#F26F28]' : ''}>
              <CardContent className="py-3">
                <p className={`text-sm font-medium ${!n.isRead ? 'text-gray-800' : 'text-gray-600'}`}>{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
