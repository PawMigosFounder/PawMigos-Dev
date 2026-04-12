'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Profile</h1>

      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F26F28]/10 flex items-center justify-center text-2xl">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (user.name?.[0] || '👤')}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{user.name || 'User'}</h2>
              <p className="text-sm text-gray-500">{user.phone}</p>
              <p className="text-sm text-gray-500">{user.city}</p>
              <Badge variant="info">{user.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Card hover onClick={() => router.push('/pets')}>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🐾</span>
              <span className="font-medium">My Pets</span>
            </div>
            <span className="text-gray-400">→</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => router.push('/bookings')}>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">📋</span>
              <span className="font-medium">My Bookings</span>
            </div>
            <span className="text-gray-400">→</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => router.push('/notifications')}>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔔</span>
              <span className="font-medium">Notifications</span>
            </div>
            <span className="text-gray-400">→</span>
          </CardContent>
        </Card>

        {user.role !== 'PROVIDER' && (
          <Card hover onClick={() => router.push('/provider/onboarding')}>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">🏪</span>
                <span className="font-medium">Become a Provider</span>
              </div>
              <span className="text-gray-400">→</span>
            </CardContent>
          </Card>
        )}
      </div>

      <Button variant="outline" fullWidth onClick={handleLogout}>
        Log Out
      </Button>
    </div>
  );
}
