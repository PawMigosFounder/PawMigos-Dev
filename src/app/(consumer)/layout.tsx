'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth');
      } else if (!user.onboardingCompleted && pathname !== '/onboarding') {
        router.push('/onboarding');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent relative z-10">
        <div className="text-center">
          <div className="flex flex-col items-center">
            <Image src="/images/app-icon.png" alt="PawMigos" width={60} height={60} className="mb-2 mix-blend-multiply drop-shadow-sm" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F26F28] to-[#E85D15] bg-clip-text text-transparent mb-2">PawMigos</h1>
          </div>
          <div className="animate-pulse text-gray-500 font-medium">Loading your profile...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isOnboarding = pathname === '/onboarding';

  return (
    <div className="min-h-screen bg-[#FAF3E3]">
      {!isOnboarding && <Header />}
      <main className={`max-w-lg mx-auto ${!isOnboarding ? 'pb-20' : ''}`}>
        {children}
      </main>
      {!isOnboarding && <Navbar />}
    </div>
  );
}
