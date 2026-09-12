import { getAdminReviews } from '@/lib/reviews.server';
import { ReviewsPanel, type AdminReview } from './ReviewsPanel';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const rows = await getAdminReviews();

  const reviews: AdminReview[] = rows.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    authorCity: r.authorCity,
    rating: r.rating,
    body: r.body,
    status: r.status,
    orderRef: r.orderRef,
    createdAt: r.createdAt.toISOString(),
    productName: r.product?.name ?? null,
  }));

  return (
    <div>
      <h1 className="mb-2 text-2xl font-amiri font-bold text-white">التقييمات</h1>
      <p className="mb-8 text-sm text-zinc-500">
        لا يظهر أي تقييم على الموقع قبل اعتماده هنا.
      </p>
      <ReviewsPanel reviews={reviews} />
    </div>
  );
}
