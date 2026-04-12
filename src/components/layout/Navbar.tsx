'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePathname } from 'next/navigation';

const consumerLinks = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/marketplace', label: 'Services', icon: '🔍' },
  { href: '/bookings', label: 'Bookings', icon: '📋' },
  { href: '/community', label: 'Community', icon: '💬' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

const providerLinks = [
  { href: '/provider', label: 'Dashboard', icon: '📊' },
  { href: '/provider/services', label: 'Services', icon: '🛠️' },
  { href: '/provider/bookings', label: 'Bookings', icon: '📋' },
  { href: '/provider/availability', label: 'Availability', icon: '📅' },
  { href: '/provider/profile', label: 'Profile', icon: '👤' },
];

export function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user || !user.onboardingCompleted) return null;

  const isProvider = pathname.startsWith('/provider');
  const links = isProvider ? providerLinks : consumerLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto flex justify-around py-2">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-[#F26F28]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
