import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reportSchema = z.object({
  projectId: z.string().min(1),
  month: z.string().min(4),
  postCount: z.number().int().min(0).default(0),
  followerGrowth: z.number().int().default(0),
  engagement: z.number().int().min(0).default(0),
  notes: z.string().nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SMM') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reports = await prisma.report.findMany({
    where: { createdById: session.user.id },
    include: {
      project: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ reports });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SMM') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { projectId, ...rest } = parsed.data;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.smmId !== session.user.id) {
      return NextResponse.json({ error: 'Not assigned to this project' }, { status: 403 });
    }

    const report = await prisma.report.create({
      data: {
        ...rest,
        projectId,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}