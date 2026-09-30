import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { parseRoleFromCookie, ROLE_COOKIE_NAME } from '@/lib/auth/roles';
import { IncidentManagementDashboard } from '@/components/incidents/IncidentManagementDashboard';

export const metadata: Metadata = {
  title: 'Incident Management | Disastraaa',
  description: 'Coordinate active emergencies, response teams and operational actions.',
};

export default async function IncidentsPage() {
  const cookieStore = await cookies();
  const rawRole     = cookieStore.get(ROLE_COOKIE_NAME)?.value;
  const initialRole = parseRoleFromCookie(rawRole ? `${ROLE_COOKIE_NAME}=${rawRole}` : undefined);

  return <IncidentManagementDashboard initialRole={initialRole} />;
}
