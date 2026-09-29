import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function escapeCsv(s: string) {
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'SMM') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, title: true, smmId: true } },
      contents: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!campaign || campaign.project.smmId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const csvLines = [
    'Field,Value',
    'Campaign Name,' + escapeCsv(campaign.name),
    'Project,' + escapeCsv(campaign.project.title),
    'Status,' + campaign.status,
    'Platform,' + escapeCsv(campaign.platform || ''),
    'Budget,' + (campaign.budget || ''),
    'Start Date,' + (campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : ''),
    'End Date,' + (campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : ''),
    'Total Content,' + campaign.contents.length,
    '',
    'Content Title,Platform,Status,Scheduled At,Caption,Hashtags',
  ];

  for (const c of campaign.contents) {
    csvLines.push([
      escapeCsv(c.title || ''),
      escapeCsv(c.platform || ''),
      c.status,
      c.scheduledAt ? new Date(c.scheduledAt).toISOString() : '',
      escapeCsv(c.caption || ''),
      escapeCsv(c.hashtags || ''),
    ].join(','));
  }

  const csv = csvLines.join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="campaign-' + id + '.csv"',
    },
  });
}