import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');

  const role = (session.user as any).role;

  let where: any = {};
  if (projectId) {
    where.projectId = projectId;

    // Role-based access
    if (role === 'CLIENT') {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project || project.clientId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (role === 'SMM') {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project || project.smmId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
  }

  const files = await prisma.file.findMany({
    where,
    include: { uploader: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ files });
}