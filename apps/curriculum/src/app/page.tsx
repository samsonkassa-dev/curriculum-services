"use client"

import { Login } from '@curriculum-services/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
;

export default function Home() {
  const router = useRouter();
  const [redirect, setRedirect] = useState<string>('/');

  useEffect(() => {
    try {
      const r = new URLSearchParams(window.location.search).get('redirect');
      if (r) setRedirect(r);
    } catch {}
  }, []);

  return (
    <Login onSuccess={() => {
      try {
        const r = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('redirect') : null
        router.replace(r || '/')
      } catch {
        router.replace('/')
      }
    }} />
  );
}
