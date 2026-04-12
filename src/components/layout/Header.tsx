'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

export function Header() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.get<any>('/api/notifications?unread=true').then((res) => {
        if (res.success) setUnreadCount(res.data?.unreadCount || 0);
      });
    }
  }, [user]);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-white/50 shadow-sm">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
          <Image src="/images/app-icon.png" alt="PawMigos Icon" width={40} height={40} className="w-auto h-auto mix-blend-multiply hover:opacity-90 transition-opacity" priority />
          <span className="text-2xl font-bold bg-gradient-to-r from-[#F26F28] to-[#E85D15] bg-clip-text text-transparent">PawMigos</span>
        </Link>
        <div className="flex items-center gap-3">
          {user.role === 'PROVIDER' && (
            <Link
              href="/provider"
              className="text-sm font-medium text-[#F26F28] bg-[#F26F28]/10 px-3 py-1 rounded-full"
            >
              Provider
            </Link>
          )}
          <Link href="/notifications" className="relative p-2">
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
