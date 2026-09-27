import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  postCount: z.number().int().min(0).optional(),
  followerGrowth: z.number().int().optional(),
  engagement: z.number().int().min(0).optional(),
  notes: z.string().nullable().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, title: true, clientId: true, smmId: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ report });
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
    const existing = await prisma.report.findUnique({ where: { id } });
    if (!existing || existing.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const report = await prisma.report.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ report });
  } catch (error) {
    console.error('Update report error:', error);
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
    const existing = await prisma.report.findUnique({ where: { id } });
    if (!existing || existing.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.report.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}