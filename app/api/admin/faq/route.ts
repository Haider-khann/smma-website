import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const faqSchema = z.object({
  question: z.string().min(5).max(500),
  answer: z.string().min(5),
  order: z.number().int().default(0),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json({ faqs });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = faqSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const faq = await prisma.fAQ.create({ data: parsed.data });
    return NextResponse.json({ faq }, { status: 201 });
  } catch (error) {
    console.error('Create FAQ error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
