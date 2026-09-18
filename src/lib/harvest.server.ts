import 'server-only';
import { db } from '@/lib/db';
import { HARVEST_STEPS, type HarvestStep } from '@/lib/harvest';
import { getEntriesBySlugs, type GlossaryCard } from '@/lib/glossary.server';

export type HarvestMedia = {
  id: string;
  url: string;
  caption: string | null;
  type: 'IMAGE' | 'VIDEO';
};

export type HarvestJourneyStep = HarvestStep & {
  tools: GlossaryCard[];
  /** لقطات الاستديو الموسومة بهذه الخطوة — «هكذا نعمل في مناحل الهيثم» */
  media: HarvestMedia[];
};

export type HarvestPassport = {
  code: string;
  title: string;
  harvestDate: Date | null;
  region: string | null;
  floralSource: string | null;
  moisture: string | null;
  labReportUrl: string | null;
  product: { slug: string; name: string; image: string; weight: string | null } | null;
};

/**
 * رحلة القطاف كاملة: أدوات كل خطوة من الموسوعة، لقطات الاستديو الموسومة،
 * وآخر جواز دفعة منشور (بمنتجه) لتنتهي الرحلة عند مرطبان حقيقي.
 */
export async function getHarvestJourney(mediaPerStep = 3) {
  const slugs = HARVEST_STEPS.flatMap((s) => s.toolSlugs);
  const [entries, media, passport] = await Promise.all([
    getEntriesBySlugs(slugs),
    db.studioPhoto.findMany({
      where: { tag: { in: HARVEST_STEPS.map((s) => s.key) } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, url: true, caption: true, type: true, tag: true },
    }),
    db.batch.findFirst({
      where: { published: true },
      orderBy: [{ harvestDate: 'desc' }, { createdAt: 'desc' }],
      select: {
        code: true,
        title: true,
        harvestDate: true,
        region: true,
        floralSource: true,
        moisture: true,
        labReportUrl: true,
        product: {
          select: { slug: true, name: true, image: true, weight: true, published: true },
        },
      },
    }),
  ]);

  const steps: HarvestJourneyStep[] = HARVEST_STEPS.map((step) => ({
    ...step,
    tools: step.toolSlugs.map((slug) => entries.get(slug)).filter((e): e is GlossaryCard => !!e),
    media: media
      .filter((m) => m.tag === step.key)
      .slice(0, mediaPerStep)
      .map(({ tag: _tag, ...m }) => m),
  }));

  const passportOut: HarvestPassport | null = passport
    ? {
        ...passport,
        product: passport.product?.published
          ? {
              slug: passport.product.slug,
              name: passport.product.name,
              image: passport.product.image,
              weight: passport.product.weight,
            }
          : null,
      }
    : null;

  return { steps, passport: passportOut };
}
