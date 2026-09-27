import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const serviceSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10),
  price: z.number().positive(),
  duration: z.number().int().positive(),
  image: z.string().optional(),
  category: z.string().optional(),
  active: z.boolean().default(true),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const services = await prisma.service.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ services });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = serviceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: parsed.data,
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}