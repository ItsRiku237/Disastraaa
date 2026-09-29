import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { parseRoleFromCookie, ROLE_COOKIE_NAME } from '@/lib/auth/roles';
import { ResponseSimulatorDashboard } from '@/components/simulation/ResponseSimulatorDashboard';

export const metadata: Metadata = {
  title: 'Response Simulator',
  description: 'Model disaster conditions and assess potential operational impact.',
};

export default async function ResponseSimulatorPage() {
  const cookieStore = await cookies();
  const rawRole = cookieStore.get(ROLE_COOKIE_NAME)?.value;
  const initialRole = parseRoleFromCookie(rawRole ? `${ROLE_COOKIE_NAME}=${rawRole}` : undefined);

  return <ResponseSimulatorDashboard initialRole={initialRole} />;
}
