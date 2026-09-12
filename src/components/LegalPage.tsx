import React from 'react';

/** غلاف موحّد لصفحات السياسات والشروط. */
export function LegalPage({
  icon,
  title,
  intro,
  updatedAt,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  intro: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  const formatted = new Intl.DateTimeFormat('ar-SY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(updatedAt));

  return (
    <section className="min-h-screen pt-32 pb-16 px-4 sm:px-6 bg-zinc-950">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
            {icon}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-amiri font-bold text-white mb-4">
            {title}
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">{intro}</p>
          <p className="text-zinc-600 text-xs mt-4">آخر تحديث: {formatted}</p>
        </div>

        <div className="space-y-5">{children}</div>
      </div>
    </section>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
      <h2 className="text-xl font-amiri font-bold text-amber-500 mb-4">{title}</h2>
      <div className="legal-prose space-y-3 text-zinc-300 leading-relaxed">{children}</div>
    </div>
  );
}