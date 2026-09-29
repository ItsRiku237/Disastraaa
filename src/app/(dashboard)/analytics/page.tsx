import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { parseRoleFromCookie, ROLE_COOKIE_NAME } from '@/lib/auth/roles';
import { SituationAnalyticsDashboard } from '@/components/analytics/SituationAnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Situation Analytics',
  description: 'Multi-hazard intelligence, impact trends and operational conditions.',
};

export default async function SituationAnalyticsPage() {
  const cookieStore = await cookies();
  const rawRole = cookieStore.get(ROLE_COOKIE_NAME)?.value;
  const initialRole = parseRoleFromCookie(rawRole ? `${ROLE_COOKIE_NAME}=${rawRole}` : undefined);

  return <SituationAnalyticsDashboard initialRole={initialRole} />;
}
