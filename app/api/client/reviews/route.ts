import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reviews = await prisma.review.findMany({
    where: { clientId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ reviews });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        ...parsed.data,
        clientId: session.user.id,
        approved: false,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}