'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PageSpinner } from '@/components/ui/Spinner';
import { BottomNav } from '@/components/layout/BottomNav';

export default function DogLayoutClient({
  children,
  dogId,
}: {
  children: React.ReactNode;
  dogId: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading, router]);

  if (loading) return <PageSpinner />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <BottomNav dogId={dogId} />
    </div>
  );
}
