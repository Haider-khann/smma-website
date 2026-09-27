import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notify';
import { z } from 'zod';

const invoiceSchema = z.object({
  clientId: z.string().min(1),
  projectId: z.string().nullable().optional(),
  amount: z.number().positive(),
  dueDate: z.string().min(4),
  items: z.string().nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const invoices = await prisma.invoice.findMany({
    include: {
      client: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ invoices });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = invoiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { dueDate, projectId, ...rest } = parsed.data;

    const invoice = await prisma.invoice.create({
      data: {
        ...rest,
        projectId: projectId || null,
        dueDate: new Date(dueDate),
        status: 'PENDING',
      },
    });

    const amountStr = '$' + parsed.data.amount;
    const dueStr = new Date(parsed.data.dueDate).toLocaleDateString();

    await notify({
      userId: parsed.data.clientId,
      title: 'New Invoice',
      body: 'Invoice ' + amountStr + ' due ' + dueStr,
      link: '/dashboard/invoices',
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}