'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Console</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card hover onClick={() => router.push('/admin/providers')}>
            <CardContent className="text-center py-8">
              <p className="text-3xl mb-2">🏪</p>
              <p className="font-semibold">Providers</p>
              <p className="text-sm text-gray-500">Manage & verify</p>
            </CardContent>
          </Card>
          <Card hover onClick={() => router.push('/admin/bookings')}>
            <CardContent className="text-center py-8">
              <p className="text-3xl mb-2">📋</p>
              <p className="font-semibold">Bookings</p>
              <p className="text-sm text-gray-500">View all bookings</p>
            </CardContent>
          </Card>
          <Card hover onClick={() => router.push('/admin/audit')}>
            <CardContent className="text-center py-8">
              <p className="text-3xl mb-2">📝</p>
              <p className="font-semibold">Audit Logs</p>
              <p className="text-sm text-gray-500">Admin actions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
