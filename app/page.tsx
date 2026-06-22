'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PageSpinner } from '@/components/ui/Spinner';

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return <PageSpinner />;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10 max-w-sm">
        <div className="text-7xl mb-4 animate-bounce">🐾</div>
        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
          Pup<span className="text-indigo-500">Quest</span>
        </h1>
        <p className="text-gray-500 text-base leading-relaxed">
          Level up your dog training. Track walks, sessions, and behaviour — together.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-10">
        {[
          { icon: '🦮', text: 'Log Walks' },
          { icon: '🎓', text: 'Training Sessions' },
          { icon: '📊', text: 'Behaviour Tracking' },
          { icon: '🏆', text: 'XP & Levels' },
        ].map((f) => (
          <div
            key={f.text}
            className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl p-3 shadow-sm border border-gray-100"
          >
            <span className="text-xl">{f.icon}</span>
            <span className="text-sm font-semibold text-gray-700">{f.text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={signInWithGoogle}
        className="w-full max-w-xs flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 px-6 rounded-2xl shadow-sm hover:shadow-md hover:bg-gray-50 active:scale-95 transition-all"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      <p className="mt-6 text-xs text-gray-400 text-center max-w-xs">
        By signing in you agree to our Terms of Service. Your data is stored securely in Firebase.
      </p>
    </main>
  );
}
