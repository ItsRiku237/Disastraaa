import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Map, AlertTriangle, Shield, BarChart2, ChevronRight } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { brand } from '@/config/brand';

export const metadata: Metadata = {
  title: `${brand.name} — ${brand.tagline}`,
};

const pipeline = ['DETECT', 'ASSESS', 'PREDICT', 'PLAN', 'RESPOND', 'PROTECT'] as const;

const features = [
  {
    icon: Map,
    title: 'Live Geospatial Intelligence',
    description:
      'Real-time disaster mapping across India with multi-hazard risk layers, hazard zones, shelters, roads and live field updates on one unified map.',
  },
  {
    icon: AlertTriangle,
    title: 'Multi-Hazard Early Warning',
    description:
      'Integrated detection and alerting for floods, cyclones, heatwaves, lightning, landslides and more — architected to extend without redesign.',
  },
  {
    icon: Shield,
    title: 'Authority Command Center',
    description:
      'Role-based dashboards for state, district and block authorities — with AI-assisted recommendations that require human approval before action.',
  },
  {
    icon: BarChart2,
    title: 'Predictive Risk Analytics',
    description:
      'Risk scores grounded in rainfall, elevation, river levels, population density and historical events. AI explains the score; it does not invent it.',
  },
] as const;

export default function LandingPage() {
  return (
    <>
      <main className="relative overflow-x-hidden">
        {/* Ambient radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_-10%,rgba(34,211,238,0.07),transparent)]"
        />

        {/* ── Hero ── */}
        <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 text-center pt-16">
          <div className="animate-fade-in max-w-4xl">
            {/* Prototype badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
              Prototype · Hackathon Edition
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold tracking-tight text-slate-100 mb-6 leading-[1.1]">
              Intelligent{' '}
              <span className="text-gradient-accent">Disaster Intelligence</span>
              <br />for India
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              {brand.name} unifies multi-hazard detection, geospatial risk assessment,
              citizen intelligence and authority response — from the first warning
              to the last rescue.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/map"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-accent hover:bg-accent/90 text-surface-base font-semibold text-sm transition-all shadow-[0_0_24px_rgba(34,211,238,0.25)]"
              >
                View Live Map <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-surface-card border border-white/10 hover:border-white/20 text-slate-100 font-medium text-sm transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Response pipeline */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-1.5 text-[11px] font-mono text-slate-600">
            {pipeline.map((step, i) => (
              <span key={step} className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.07] text-slate-500 tracking-wider">
                  {step}
                </span>
                {i < pipeline.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-700" />
                )}
              </span>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section className="relative px-4 sm:px-6 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">
              From Detection to Protection
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              A complete disaster management pipeline — not a dashboard, a system.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="p-5 rounded-xl bg-surface-card border border-white/[0.07] hover:border-white/[0.12] transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/10 group-hover:bg-accent/15 flex items-center justify-center mb-4 text-accent transition-colors">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="px-4 sm:px-6 py-16 text-center">
          <div className="max-w-lg mx-auto p-8 rounded-2xl bg-surface-card border border-white/[0.07]">
            <h2 className="text-xl font-bold text-slate-100 mb-2">
              Explore the Platform
            </h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              View disaster intelligence on the live map or access the authority
              command center.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/map"
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-accent hover:bg-accent/90 text-surface-base font-semibold text-sm transition-all"
              >
                Open Map
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-surface-elevated border border-white/10 hover:border-white/20 text-slate-100 font-medium text-sm transition-all"
              >
                Authority Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
