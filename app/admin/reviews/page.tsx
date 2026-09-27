import { prisma } from '@/lib/prisma';
import ReviewActions from './ReviewActions';

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: { client: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const reviewsForUI = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    approved: r.approved,
    createdAt: r.createdAt.toISOString(),
    client: r.client,
  }));

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Reviews</h1>
        <p className='text-gray-600 mt-1'>Approve or reject client reviews before they appear publicly.</p>
      </div>

      <ReviewActions reviews={reviewsForUI} />
    </div>
  );
}