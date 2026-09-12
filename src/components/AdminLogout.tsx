'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogout() {
  const router = useRouter();
  const [error, setError] = useState('');
  return (
    <div>
      <button
        className="rounded-lg border border-zinc-700 px-3 py-2 text-sm"
        onClick={async () => {
          try {
            const response = await fetch('/api/admin/logout', { method: 'POST' });
            if (!response.ok) throw new Error();
            router.replace('/admin/login');
            router.refresh();
          } catch {
            setError('تعذّر تسجيل الخروج. حاول مجدداً.');
          }
        }}
      >
        تسجيل الخروج
      </button>
      <span role="status">{error}</span>
    </div>
  );
}
