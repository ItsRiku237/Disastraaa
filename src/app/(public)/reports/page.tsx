import type { Metadata } from 'next';
import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = { title: 'Reports' };

export default function ReportsPage() {
  return (
    <>
      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-slate-100">Citizen Reports</h1>
            <p className="text-sm text-slate-400 mt-1">
              Verified and community-confirmed disaster reports
            </p>
          </header>

          <div className="rounded-xl bg-surface-card border border-white/[0.07]">
            <EmptyState
              icon={<FileText className="w-5 h-5" />}
              title="No reports yet"
              description="Citizen reports go through AI triage, community confirmation, and authority verification before appearing here."
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
