import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ReviewForm from './ReviewForm';

export default async function ClientReviewsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const reviews = await prisma.review.findMany({
    where: { clientId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className='max-w-3xl'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Reviews</h1>
        <p className='text-gray-600 mt-1'>Share your experience with our services.</p>
      </div>

      <ReviewForm />

      <h2 className='text-xl font-bold mt-8 mb-4'>Your Reviews</h2>
      {reviews.length === 0 ? (
        <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500'>
          You haven't submitted any reviews yet.
        </div>
      ) : (
        <div className='space-y-3'>
          {reviews.map((r) => (
            <div key={r.id} className='bg-white p-5 rounded-lg shadow-sm border border-gray-100'>
              <div className='flex justify-between items-start mb-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-yellow-500 text-lg'>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className='text-sm text-gray-500'>{r.rating}/5</span>
                </div>
                <span className={(r.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700') + ' px-2 py-0.5 rounded text-xs font-medium'}>
                  {r.approved ? 'Approved' : 'Pending Review'}
                </span>
              </div>
              <p className='text-gray-700 mt-2'>{r.comment}</p>
              <p className='text-xs text-gray-500 mt-2'>{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}