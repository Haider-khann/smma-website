import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notify';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  smmId: z.string().nullable().optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED']).optional(),
  startDate: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  currentStage: z.string().nullable().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      smm: { select: { id: true, name: true, email: true } },
      tasks: { include: { assignee: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } },
      services: { include: { service: true } },
    },
  });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
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
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { startDate, deadline, ...rest } = parsed.data;
    const data: any = { ...rest };
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;

    const project = await prisma.project.update({
      where: { id },
      data,
      include: {
        client: { select: { id: true, name: true, email: true } },
        smm: { select: { id: true, name: true, email: true } },
      },
    });

    const smmChanged = parsed.data.smmId && parsed.data.smmId !== existing.smmId;
    if (smmChanged && parsed.data.smmId) {
      await notify({
        userId: parsed.data.smmId,
        title: 'Project Assigned',
        body: project.title,
        link: '/staff/projects/' + project.id,
      });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Admin update project error:', error);
    return NextResponse.json({ error: 'Something went wrong', details: String(error) }, { status: 500 });
  }
}