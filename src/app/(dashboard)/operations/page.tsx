import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { parseRoleFromCookie, ROLE_COOKIE_NAME } from '@/lib/auth/roles';
import { ResponseOperationsDashboard } from '@/components/response/ResponseOperationsDashboard';

export const metadata: Metadata = {
  title: 'Response Operations',
  description: 'Multi-agency tactical response coordination, resource readiness, and allocation platform.',
};

export default async function ResponseOperationsPage() {
  const cookieStore = await cookies();
  const rawRole = cookieStore.get(ROLE_COOKIE_NAME)?.value;
  const initialRole = parseRoleFromCookie(rawRole ? `${ROLE_COOKIE_NAME}=${rawRole}` : undefined);

  return <ResponseOperationsDashboard initialRole={initialRole} />;
}
