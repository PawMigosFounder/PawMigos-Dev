'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth');
      } else if (!user.onboardingCompleted) {
        router.push('/onboarding');
      } else {
        router.push('/marketplace');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF3E3]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#F26F28] mb-2">PawMigos</h1>
        <p className="text-gray-500">Care Worth Wagging About</p>
      </div>
    </div>
  );
}
