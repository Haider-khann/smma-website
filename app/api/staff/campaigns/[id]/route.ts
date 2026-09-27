import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  objective: z.string().optional().nullable(),
  platform: z.string().optional().nullable(),
  targetAudience: z.string().optional().nullable(),
  budget: z.number().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).optional(),
});

async function checkOwnership(id: string, userId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: { project: true },
  });
  return campaign && campaign.project.smmId === userId ? campaign : null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, title: true, smmId: true, clientId: true } },
      createdBy: { select: { id: true, name: true } },
      contents: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ campaign });
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

    const { startDate, endDate, ...rest } = parsed.data;
    const data: any = { ...rest };
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;

    const campaign = await prisma.campaign.update({ where: { id }, data });
    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Update campaign error:', error);
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

    await prisma.campaign.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete campaign error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}