import { DashboardSidebar } from '@/components/layout/DashboardSidebar';

/**
 * Dashboard layout — fixed sidebar + scrollable main area.
 * Authentication will be added here in a future task; for now
 * all routes under (dashboard) are unprotected.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-surface-base overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto focus:outline-none">
        {children}
      </main>
    </div>
  );
}
