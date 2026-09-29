import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { parseRoleFromCookie, ROLE_COOKIE_NAME } from '@/lib/auth/roles';
import { CommandCenterDashboard } from '@/components/commandCenter/CommandCenterDashboard';

export const metadata: Metadata = {
  title: 'Emergency Operations Command Center',
  description: 'Authority-facing decision-support command center for disaster response.',
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const rawRole = cookieStore.get(ROLE_COOKIE_NAME)?.value;
  const initialRole = parseRoleFromCookie(rawRole ? `${ROLE_COOKIE_NAME}=${rawRole}` : undefined);

  return <CommandCenterDashboard initialRole={initialRole} />;
}
