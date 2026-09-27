import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notify';
import { z } from 'zod';

const proposalSchema = z.object({
  quoteRequestId: z.string(),
  price: z.number().positive(),
  duration: z.number().int().positive(),
  description: z.string().min(10),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = proposalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const proposal = await prisma.proposal.create({
      data: {
        ...parsed.data,
        createdById: session.user.id,
        status: 'PROPOSAL_SENT',
      },
    });

    await prisma.quoteRequest.update({
      where: { id: parsed.data.quoteRequestId },
      data: { status: 'PROPOSAL_SENT' },
    });

    const qr = await prisma.quoteRequest.findUnique({ where: { id: parsed.data.quoteRequestId } });
    if (qr) {
      await notify({
        userId: qr.clientId,
        title: 'New Proposal Received',
        body: 'You received a proposal of 
  } catch (error) {
    console.error('Create proposal error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
 + parsed.data.price,
        link: '/dashboard/quotes/' + qr.id,
      });
    }

    const qr = await prisma.quoteRequest.findUnique({ where: { id: parsed.data.quoteRequestId } });
    if (qr) {
      await notify({
        userId: qr.clientId,
        title: 'New Proposal Received',
        body: 'Proposal: 
  } catch (error) {
    console.error('Create proposal error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
 + parsed.data.price + ' | ' + parsed.data.duration + ' days',
        link: '/dashboard/quotes/' + qr.id,
      });
    }

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    console.error('Create proposal error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
