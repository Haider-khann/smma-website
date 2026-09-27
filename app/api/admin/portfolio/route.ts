import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const portfolioSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10),
  category: z.string().min(2),
  image: z.string().url(),
  projectDate: z.string(),
  active: z.boolean().default(true),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const items = await prisma.portfolio.findMany({ orderBy: { projectDate: 'desc' } });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = portfolioSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { projectDate, ...rest } = parsed.data;
    const item = await prisma.portfolio.create({
      data: { ...rest, projectDate: new Date(projectDate) },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Create portfolio error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
