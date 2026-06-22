import DogLayoutClient from '@/components/layout/DogLayoutClient';

// Return empty array — no dog IDs known at build time.
// Client-side navigation works via the JS bundle;
// direct-URL navigation falls back to 404.html (SPA fallback).
export function generateStaticParams() {
  return [];
}

export default function DogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { dogId: string };
}) {
  return <DogLayoutClient dogId={params.dogId}>{children}</DogLayoutClient>;
}
