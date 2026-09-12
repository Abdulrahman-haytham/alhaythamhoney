import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

const TABS = [
  { href: "/admin/reviews", label: "التقييمات" },
  { href: "/admin/mixtures", label: "الخلطات" },
  { href: "/admin/studio", label: "استديو الهيثم" },
];

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="font-amiri text-lg font-bold text-white">
            الهيثم <span className="text-amber-500">— لوحة التحكم</span>
          </Link>
          <span className="text-sm text-zinc-500">{admin.name}</span>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-4 sm:px-6">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="rounded-t-lg border-b-2 border-transparent px-4 py-2 text-sm text-zinc-400 transition hover:border-amber-500/50 hover:text-white"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
