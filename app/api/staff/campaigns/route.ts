import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const campaignSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(2).max(200),
  objective: z.string().nullable().optional(),
  platform: z.string().nullable().optional(),
  targetAudience: z.string().nullable().optional(),
  budget: z.number().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED']).default('DRAFT'),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SMM') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const campaigns = await prisma.campaign.findMany({
    where: { project: { smmId: session.user.id } },
    include: {
      project: { select: { id: true, title: true } },
      contents: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SMM') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = campaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { projectId, startDate, endDate, ...rest } = parsed.data;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.smmId !== session.user.id) {
      return NextResponse.json({ error: 'Not assigned to this project' }, { status: 403 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        ...rest,
        projectId,
        createdById: session.user.id,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error('Create campaign error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}