import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  progress: z.number().int().min(0).max(100).optional(),
  currentStage: z.string().nullable().optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED']).optional(),
  objectives: z.string().nullable().optional(),
});

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
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing || existing.smmId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or not assigned to you' }, { status: 404 });
    }

    const project = await prisma.project.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Staff update project error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}