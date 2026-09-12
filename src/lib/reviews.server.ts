import 'server-only';
import { db } from '@/lib/db';

export interface PublicReview {
  id: string;
  authorName: string;
  authorCity: string | null;
  rating: number;
  body: string;
  verified: boolean;
  createdAt: string;
}

export interface RatingSummary {
  average: number;
  count: number;
}

function toPublic(r: {
  id: string; authorName: string; authorCity: string | null;
  rating: number; body: string; orderRef: string | null; createdAt: Date;
}): PublicReview {
  return {
    id: r.id,
    authorName: r.authorName,
    authorCity: r.authorCity,
    rating: r.rating,
    body: r.body,
    verified: Boolean(r.orderRef),
    createdAt: r.createdAt.toISOString(),
  };
}

/** تقييمات معتمدة — للموقع كله أو لمنتج بعينه. */
export async function getApprovedReviews(productSlug?: string, limit = 12): Promise<PublicReview[]> {
  try {
    const rows = await db.review.findMany({
      where: {
        status: 'APPROVED',
        ...(productSlug ? { product: { slug: productSlug } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map(toPublic);
  } catch (error) {
    console.error('[reviews] تعذّرت القراءة:', error);
    return [];
  }
}

/** متوسط التقييم وعدده — يغذّي aggregateRating في بيانات Schema.org. */
export async function getRatingSummary(productSlug?: string): Promise<RatingSummary | null> {
  try {
    const res = await db.review.aggregate({
      where: {
        status: 'APPROVED',
        ...(productSlug ? { product: { slug: productSlug } } : {}),
      },
      _avg: { rating: true },
      _count: { rating: true },
    });
    const count = res._count.rating;
    // جوجل لا يعرض النجوم بلا تقييمات فعلية — لا نختلق ملخّصاً فارغاً
    if (!count || res._avg.rating === null) return null;
    return { average: Math.round(res._avg.rating * 10) / 10, count };
  } catch (error) {
    console.error('[reviews] تعذّر حساب الملخّص:', error);
    return null;
  }
}

export async function getAdminReviews() {
  return db.review.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: { product: { select: { slug: true, name: true } } },
  });
}