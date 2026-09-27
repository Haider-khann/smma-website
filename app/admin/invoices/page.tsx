import { prisma } from '@/lib/prisma';
import InvoiceManager from './InvoiceManager';

export default async function AdminInvoicesPage() {
  const [invoices, clients, projects] = await Promise.all([
    prisma.invoice.findMany({
      include: {
        client: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: { id: true, name: true, email: true },
    }),
    prisma.project.findMany({
      select: { id: true, title: true, clientId: true },
    }),
  ]);

  const invoicesForClient = invoices.map((inv) => ({
    id: inv.id,
    amount: inv.amount,
    status: inv.status,
    issueDate: inv.issueDate.toISOString(),
    dueDate: inv.dueDate.toISOString(),
    client: inv.client,
    project: inv.project,
  }));

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Invoices</h1>
        <p className='text-gray-600 mt-1'>Create and manage client invoices.</p>
      </div>

      <InvoiceManager
        invoices={invoicesForClient}
        clients={clients}
        projects={projects}
      />
    </div>
  );
}