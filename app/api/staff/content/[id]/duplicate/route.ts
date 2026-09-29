import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SMM') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const original = await prisma.content.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!original || original.project.smmId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const duplicate = await prisma.content.create({
      data: {
        projectId: original.projectId,
        campaignId: original.campaignId,
        createdById: session.user.id,
        title: (original.title || 'Untitled') + ' (Copy)',
        caption: original.caption,
        hashtags: original.hashtags,
        platform: original.platform,
        mediaUrl: original.mediaUrl,
        status: 'DRAFT',
      },
    });

    return NextResponse.json({ content: duplicate }, { status: 201 });
  } catch (error) {
    console.error('Duplicate content error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}