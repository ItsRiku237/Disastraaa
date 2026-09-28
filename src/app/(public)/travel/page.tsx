import type { Metadata } from 'next';
import { Navigation } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = { title: 'Travel Safety' };

export default function TravelPage() {
  return (
    <>
      <main className="pt-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-slate-100">Travel Safety Check</h1>
            <p className="text-sm text-slate-400 mt-1">
              Enter a destination and travel date to receive a disaster risk assessment
            </p>
          </header>

          <div className="rounded-xl bg-surface-card border border-white/[0.07]">
            <EmptyState
              icon={<Navigation className="w-5 h-5" />}
              title="Route assessment coming soon"
              description="This feature will assess travel risk based on weather forecasts, flood risk, road conditions and active alerts. This is an advisory tool — not a guarantee of safety."
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
