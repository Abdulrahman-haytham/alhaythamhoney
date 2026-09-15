import { Reveal } from '@/components/motion/Reveal';
import { ImageReveal } from '@/components/motion/ImageReveal';
import { SITE, yearsOfExperience } from '@/lib/config';

/**
 * حكاية الهيثم — الصورة تُكشف بقناع مرة واحدة، والنص يظهر بهدوء.
 * خط «البداية → اليوم» قصير عمداً: لا نخترع محطات تاريخية غير موثّقة.
 */
export default function Story() {
  const years = yearsOfExperience();
  const milestones = [
    { year: String(SITE.foundedYear), text: 'الوالد المؤسس يبدأ تربية النحل بشغف واحترام للخلية' },
    { year: 'اليوم', text: 'الجيل الثاني — عبد الرحمن وتركي — بالأمانة نفسها وخبرة أعمق' },
  ];
  return (
    <section
      id="story"
      className="relative overflow-hidden bg-zinc-950 px-4 py-16 sm:px-6 sm:py-24 md:py-32"
    >
      {/* توهّج زخرفي بتدرّج شعاعي (أرخص بكثير من blur على الجوال) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-40 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            'radial-gradient(closest-side, rgba(217,119,6,0.09), rgba(217,119,6,0.03) 55%, transparent 75%)',
        }}
      />

      <div className="container mx-auto grid grid-cols-1 items-center gap-12 sm:gap-16 md:gap-20 lg:grid-cols-2 lg:gap-24">
        <div className="relative">
          <ImageReveal className="relative z-10 aspect-square overflow-hidden rounded-2xl border border-amber-500/10 luxury-shadow sm:rounded-[2.5rem] md:rounded-[3rem]">
            <img
              src="/images/story.webp"
              alt="الأخوان في منحل الهيثم — الجيل الثاني من إرث عائلي منذ 1997"
              loading="lazy"
              width={1280}
              height={853}
              className="h-full w-full object-cover object-top"
            />
          </ImageReveal>
          <div className="absolute -bottom-10 -left-10 -z-0 h-full w-full translate-x-4 translate-y-4 rounded-[3rem] border border-amber-500/10" />
        </div>

        <div className="space-y-10">
          <Reveal>
            <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 sm:tracking-[0.3em] sm:text-xs md:mb-4">
              حكاية الهيثم… حين يكون العسل مسؤولية
            </span>
            <h2 className="mb-6 font-amiri text-3xl font-bold leading-tight sm:text-4xl md:mb-8 md:text-5xl lg:text-6xl">
              حكاية الهيثم - إرث يمتد عبر الأجيال
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-4 text-base font-light leading-relaxed text-zinc-300 sm:space-y-6 sm:text-lg md:text-xl">
              <p>
                بدأت رحلتنا عام {SITE.foundedYear} بشغف الوالد المؤسس، وباحترام عميق لعالم خلية
                النحل.
              </p>
              <p className="text-zinc-400">
                اليوم نتابع نحن <strong className="text-white">عبد الرحمن وتركي</strong> هذه الرسالة
                بنفس الأمانة، وبخبرة أعمق، محافظين على جودة لا نساوم عليها.
              </p>
            </div>
          </Reveal>

          {/* البداية → اليوم */}
          <Reveal delay={0.15}>
            <ol className="relative border-r border-amber-500/30 pr-6">
              {milestones.map((m, i) => (
                <li key={m.year} className={i === 0 ? 'pb-6' : ''}>
                  <span className="absolute -right-[5px] mt-2 h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-zinc-950" />
                  <p className="font-amiri text-2xl font-bold text-amber-400">{m.year}</p>
                  <p className="text-sm text-zinc-400 sm:text-base">{m.text}</p>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="rounded-l-2xl border-r-4 border-amber-500 bg-zinc-900/50 p-4 sm:rounded-l-3xl sm:p-6 md:p-8">
              <span className="mb-1 block font-amiri text-2xl italic text-amber-500 sm:mb-2 sm:text-3xl md:text-4xl">
                &quot;
              </span>
              <span className="mb-1 block font-amiri text-xl text-white sm:mb-2 sm:text-2xl md:text-3xl">
                النظافة وعد، والجودة عهد
              </span>
            </div>
            <div className="flex items-center gap-3 pt-6 sm:gap-6">
              <div className="flex -space-x-3 sm:-space-x-4">
                {['عبد الرحمن', 'تركي'].map((n) => (
                  <div
                    key={n}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-zinc-950 bg-zinc-800 text-[8px] font-bold text-zinc-400 sm:h-12 sm:w-12 sm:border-4 sm:text-[9px] md:h-14 md:w-14 md:text-[10px]"
                  >
                    {n}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-white sm:text-base">
                  بإدارة أبناء الوالد المؤسس
                </p>
                <p className="text-[10px] italic text-zinc-500 sm:text-xs">
                  {years} عاماً من الخبرة — نضع اسمنا ضماناً لكل قطرة عسل
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
