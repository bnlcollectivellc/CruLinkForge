'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect old /upload route to the new /quote page
export default function UploadRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/quote');
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
      <div className="text-neutral-500">Redirecting...</div>
    </div>
  );
}
