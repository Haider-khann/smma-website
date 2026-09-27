import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notify';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  hashtags: z.string().nullable().optional(),
  platform: z.string().nullable().optional(),
  mediaUrl: z.string().nullable().optional(),
  scheduledAt: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'INTERNAL_REVIEW', 'CLIENT_REVIEW', 'APPROVED', 'REVISION_REQUESTED']).optional(),
  feedback: z.string().nullable().optional(),
});

async function checkOwnership(id: string, userId: string) {
  const content = await prisma.content.findUnique({
    where: { id },
    include: { project: true },
  });
  return content && content.project.smmId === userId ? content : null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const content = await prisma.content.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, title: true } },
      campaign: { select: { id: true, name: true } },
    },
  });

  if (!content) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ content });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SMM') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const existing = await checkOwnership(id, session.user.id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { scheduledAt, ...rest } = parsed.data;
    const data: any = { ...rest };
    if (scheduledAt !== undefined) data.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;

    const content = await prisma.content.update({ where: { id }, data, include: { project: { select: { clientId: true, id: true } } } });
    if (parsed.data.status === 'CLIENT_REVIEW') {
      await notify({
        userId: content.project.clientId,
        title: 'Content Ready for Review',
        body: content.title || 'New content awaiting your approval',
        link: '/dashboard/projects/' + content.project.id,
      });
    }
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SMM') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const existing = await checkOwnership(id, session.user.id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.content.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete content error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}