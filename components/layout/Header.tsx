'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  title?: string;
  backHref?: string;
  actions?: React.ReactNode;
}

export function Header({ title, backHref, actions }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {backHref ? (
            <Link
              href={backHref}
              className="p-1.5 -ml-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Back"
            >
              ←
            </Link>
          ) : (
            <span className="text-lg font-black text-gray-900">
              Pup<span className="text-indigo-500">Quest</span>
            </span>
          )}
          {title && <h1 className="text-base font-bold text-gray-900 truncate">{title}</h1>}
        </div>

        <div className="flex items-center gap-2">
          {actions}
          {user && (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 py-1 px-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Sign out"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? 'User'}
                  className="w-7 h-7 rounded-full ring-2 ring-indigo-100"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                  {(user.displayName ?? 'U')[0]}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
