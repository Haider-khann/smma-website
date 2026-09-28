import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    select: {
      id: true,
      email: true,
      name: true,
      accepted: true,
      expiresAt: true,
    },
  });

  if (!invitation) {
    return NextResponse.json({ valid: false, error: 'Invalid invitation link' }, { status: 404 });
  }

  if (invitation.accepted) {
    return NextResponse.json({ valid: false, error: 'This invitation has already been used' }, { status: 410 });
  }

  if (invitation.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, error: 'This invitation has expired' }, { status: 410 });
  }

  return NextResponse.json({
    valid: true,
    name: invitation.name,
    email: invitation.email,
  });
}