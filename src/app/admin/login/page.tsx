"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "تعذّر تسجيل الدخول.");
        setLoading(false);
        return;
      }
      router.replace("/admin/reviews");
      router.refresh();
    } catch {
      setError("تعذّر الاتصال. تحقق من الإنترنت.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
            <Lock className="h-6 w-6 text-amber-500" strokeWidth={1.5} />
          </div>
          <h1 className="font-amiri text-2xl font-bold text-white">لوحة التحكم</h1>
          <p className="mt-1 text-sm text-zinc-500">سجّل دخولك لمتابعة الطلبات والتقييمات</p>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm text-zinc-400">اسم المستخدم</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-base text-zinc-100 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block text-sm text-zinc-400">كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-base text-zinc-100 focus:border-amber-500 focus:outline-none"
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-amber-500 font-bold text-zinc-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
        >
          {loading ? "جارٍ الدخول…" : "دخول"}
        </button>
      </form>
    </div>
  );
}
