import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { token, password, phone } = parsed.data;

    const invitation = await prisma.invitation.findUnique({ where: { token } });
    if (!invitation) {
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
    }

    if (invitation.accepted) {
      return NextResponse.json({ error: 'Invitation already used' }, { status: 410 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invitation expired' }, { status: 410 });
    }

    const existing = await prisma.user.findUnique({ where: { email: invitation.email } });
    if (existing) {
      return NextResponse.json({ error: 'Account already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await prisma.$transaction([
      prisma.user.create({
        data: {
          name: invitation.name,
          email: invitation.email,
          password: hashedPassword,
          phone: phone || null,
          role: 'SMM',
        },
        select: { id: true, email: true, name: true, role: true },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { accepted: true, acceptedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Accept invite error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}