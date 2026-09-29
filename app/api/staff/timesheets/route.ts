import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { notify } from '@/lib/notify';

const schema = z.object({
  projectId: z.string().nullable().optional(),
  hours: z.number().positive().max(12, 'Max 12 hours per entry'),
  date: z.string(),
  description: z.string().max(500).optional(),
});

const MAX_HOURS_PER_DAY = 16;
const MAX_DAYS_IN_PAST = 30;

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SMM') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const entries = await prisma.timesheet.findMany({
    where: { userId: session.user.id },
    include: {
      project: { select: { id: true, title: true } },
      reviewedBy: { select: { name: true, email: true } },
    },
    orderBy: { date: 'desc' },
    take: 100,
  });

  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SMM') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const entryDate = new Date(parsed.data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (entryDate > today) {
      return NextResponse.json({ error: 'Cannot log hours for future dates' }, { status: 400 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - MAX_DAYS_IN_PAST);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    if (entryDate < thirtyDaysAgo) {
      return NextResponse.json(
        { error: 'Cannot log hours more than ' + MAX_DAYS_IN_PAST + ' days in the past' },
        { status: 400 }
      );
    }

    const dayStart = new Date(entryDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(entryDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existingForDay = await prisma.timesheet.aggregate({
      where: {
        userId: session.user.id,
        date: { gte: dayStart, lte: dayEnd },
        status: { not: 'REJECTED' },
      },
      _sum: { hours: true },
    });

    const alreadyLogged = existingForDay._sum.hours || 0;
    const totalAfter = alreadyLogged + parsed.data.hours;

    if (totalAfter > MAX_HOURS_PER_DAY) {
      return NextResponse.json(
        {
          error: 'Daily limit exceeded. You already logged ' + alreadyLogged + 'h today. Maximum ' + MAX_HOURS_PER_DAY + 'h per day allowed.',
        },
        { status: 400 }
      );
    }

    const entry = await prisma.timesheet.create({
      data: {
        userId: session.user.id,
        projectId: parsed.data.projectId || null,
        hours: parsed.data.hours,
        date: entryDate,
        description: parsed.data.description || null,
        status: 'PENDING',
      },
    });

    // Notify all admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    for (const admin of admins) {
      await notify({
        userId: admin.id,
        title: 'New timesheet entry',
        body: parsed.data.hours + 'h logged by ' + (session.user.name || 'SMM') + ' on ' + entryDate.toLocaleDateString(),
        link: '/admin/timesheets',
      });
    }

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Create timesheet error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}