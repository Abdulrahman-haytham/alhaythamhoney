/**
 * فاصل بين الأقسام مستوحى من انسياب العسل: خط ذهبي متدرّج أو موجة ناعمة.
 * CSS خالص (مكوّن خادم) — لا حركة، فقط انتقال لوني يربط القسم بما بعده.
 */
export function SectionDivider({ variant = 'line' }: { variant?: 'line' | 'wave' }) {
  if (variant === 'wave') {
    return (
      <div aria-hidden className="relative h-10 w-full overflow-hidden bg-zinc-950 sm:h-16">
        <svg
          viewBox="0 0 1440 64"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="honey-wave" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#d4af37" stopOpacity="0" />
              <stop offset="0.5" stopColor="#d4af37" stopOpacity="0.45" />
              <stop offset="1" stopColor="#d4af37" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 40 C 240 10, 480 70, 720 40 S 1200 10, 1440 40"
            fill="none"
            stroke="url(#honey-wave)"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    );
  }
  return (
    <div aria-hidden className="flex justify-center bg-zinc-950 py-2">
      <span className="h-px w-40 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent sm:w-64" />
    </div>
  );
}
