import Link from 'next/link';
import { auth } from '@/lib/auth';
import ChatWindow from '@/components/ChatWindow';

export default async function ClientConversationPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { userId } = await params;

  return (
    <div className='max-w-3xl'>
      <Link href='/dashboard/messages' className='text-blue-600 hover:underline text-sm'>Back to Messages</Link>
      <div className='mt-4'>
        <ChatWindow otherUserId={userId} myUserId={session.user.id} />
      </div>
    </div>
  );
}