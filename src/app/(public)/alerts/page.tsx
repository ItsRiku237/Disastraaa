import type { Metadata } from 'next';
import { Bell } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = { title: 'Alerts' };

export default function AlertsPage() {
  return (
    <>
      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-slate-100">Active Alerts</h1>
            <p className="text-sm text-slate-400 mt-1">
              Real-time disaster warnings and official notifications
            </p>
          </header>

          <div className="rounded-xl bg-surface-card border border-white/[0.07]">
            <EmptyState
              icon={<Bell className="w-5 h-5" />}
              title="No active alerts"
              description="Alerts from connected weather and disaster monitoring systems will appear here once data sources are integrated."
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
