'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
        router.push('/');
        router.refresh();
      }}
      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-red-500/40 hover:text-red-300"
    >
      <LogOut className="h-4 w-4" /> تسجيل الخروج
    </button>
  );
}
