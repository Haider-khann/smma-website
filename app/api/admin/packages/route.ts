import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const packageSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  duration: z.number().int().positive(),
  features: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const packages = await prisma.package.findMany({
    include: { features: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ packages });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = packageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { features, ...rest } = parsed.data;

    const pkg = await prisma.package.create({
      data: {
        ...rest,
        features: {
          create: features.map((f) => ({ feature: f })),
        },
      },
      include: { features: true },
    });

    return NextResponse.json({ package: pkg }, { status: 201 });
  } catch (error) {
    console.error('Create package error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
