'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', icon: '🏠', label: 'Home' },
  { href: '/walks', icon: '🦮', label: 'Walks' },
  { href: '/training', icon: '🎓', label: 'Train' },
  { href: '/behaviours', icon: '📊', label: 'Log' },
  { href: '/milestones', icon: '🏆', label: 'Goals' },
];

export function BottomNav({ dogId }: { dogId: string }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-100 pb-safe">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const href = `/dogs/${dogId}${item.href}`;
          const isActive =
            item.href === '/dashboard'
              ? pathname === href || pathname === `/dogs/${dogId}`
              : pathname.startsWith(href);
          return (
            <Link
              key={item.href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-colors min-w-[56px]
                ${isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-semibold ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
