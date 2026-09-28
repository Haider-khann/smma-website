import { prisma } from '@/lib/prisma';
import StaffManager from './StaffManager';

export default async function AdminStaffPage() {
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

  const staffForUI = staff.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    createdAt: s.createdAt.toISOString(),
    _count: s._count,
  }));

  const invitesForUI = invitations.map((i) => ({
    id: i.id,
    name: i.name,
    email: i.email,
    token: i.token,
    expiresAt: i.expiresAt.toISOString(),
    createdAt: i.createdAt.toISOString(),
  }));

  return (
    <div className='p-6 md:p-8 max-w-6xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-slate-900 tracking-tight'>Staff</h1>
        <p className='text-slate-500 mt-1'>
          Manage your team. Invite new social media managers to collaborate on projects.
        </p>
      </div>
      <StaffManager initialStaff={staffForUI} initialInvitations={invitesForUI} />
    </div>
  );
}