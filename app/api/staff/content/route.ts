import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const contentSchema = z.object({
  projectId: z.string().min(1),
  campaignId: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  hashtags: z.string().nullable().optional(),
  platform: z.string().nullable().optional(),
  mediaUrl: z.string().nullable().optional(),
  scheduledAt: z.string().nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SMM') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contents = await prisma.content.findMany({
    where: { project: { smmId: session.user.id } },
    include: {
      project: { select: { id: true, title: true } },
      campaign: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ contents });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SMM') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const parsed = contentSchema.safeParse(body);
    if (!parsed.success) {
      console.error('Validation failed:', JSON.stringify(parsed.error.issues));
      return NextResponse.json({
        error: parsed.error.issues[0].message,
        issues: parsed.error.issues,
      }, { status: 400 });
    }

    const { projectId, campaignId, scheduledAt, ...rest } = parsed.data;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.smmId !== session.user.id) {
      return NextResponse.json({ error: 'Not assigned to this project' }, { status: 403 });
    }

    const content = await prisma.content.create({
      data: {
        ...rest,
        projectId,
        campaignId: campaignId || null,
        createdById: session.user.id,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: 'DRAFT',
      },
    });

    return NextResponse.json({ content }, { status: 201 });
  } catch (error) {
    console.error('Create content error:', error);
    return NextResponse.json({ error: 'Something went wrong', details: String(error) }, { status: 500 });
  }
}