import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const inviteSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [staff, invitations] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'SMM' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { projectsManaged: true, tasksAssigned: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invitation.findMany({
      where: { accepted: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return NextResponse.json({ staff, invitations });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    await prisma.invitation.deleteMany({ where: { email, accepted: false } });

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await prisma.invitation.create({
      data: {
        email,
        name: parsed.data.name,
        token,
        role: 'SMM',
        expiresAt,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error('Invite staff error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}