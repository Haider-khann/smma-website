import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notify';
import { z } from 'zod';

const taskSchema = z.object({
  projectId: z.string(),
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']).default('PENDING'),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SMM') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: { project: { smmId: session.user.id } },
    include: {
      project: { select: { id: true, title: true } },
      assignee: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SMM') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { projectId, dueDate, ...rest } = parsed.data;

    // Verify SMM owns this project
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.smmId !== session.user.id) {
      return NextResponse.json({ error: 'Not assigned to this project' }, { status: 403 });
    }

    const task = await prisma.task.create({
      data: {
        ...rest,
        projectId,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: { assignee: { select: { id: true, name: true } } },
    });

    if (task.assigneeId) {
      await notify({
        userId: task.assigneeId,
        title: 'New Task Assigned',
        body: task.title,
        link: '/staff/tasks',
      });
    }

    if (task.assigneeId) {
      await notify({
        userId: task.assigneeId,
        title: 'New Task Assigned',
        body: task.title,
        link: '/staff/tasks',
      });
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}