import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AlertTriangle,
  Map,
  Activity,
  Users,
  Clock,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardSection,
  Badge,
} from '@/components/ui';
import { brand } from '@/config/brand';
import { demoDataset } from '@/data/demo';
import { demoHistoricalEvents } from '@/data/demo/historicalEvents';
import { summariseEvents } from '@/lib/historical/engine';
import { formatNumber } from '@/lib/utils';
import { DashboardAlertList } from './DashboardAlertList';

export const metadata: Metadata = { title: 'Dashboard' };

// ── Build stats from demo dataset (server-side, replace with DB query later) ──

const activeAlerts = demoDataset.alerts.filter((a) => a.isActive);
const criticalAlerts = activeAlerts.filter((a) => a.severity === 'CRITICAL');
const activeFloodAreas = demoDataset.floodAreas.filter((a) => a.severity !== 'LOW');
const openShelters = demoDataset.shelters.filter((s) => s.status === 'OPEN');
const pendingReports = demoDataset.citizenReports.filter((r) => r.status !== 'VERIFIED');

const stats = [
  {
    label:  'Active Alerts',
    value:  activeAlerts.length,
    sub:    criticalAlerts.length > 0 ? `${criticalAlerts.length} CRITICAL` : undefined,
    icon:   AlertTriangle,
    color:  'text-warning',
    iconBg: 'bg-warning/10',
    subColor: 'text-critical',
  },
  {
    label:  'Risk Zones',
    value:  demoDataset.riskZones.length,
    sub:    `${demoDataset.riskZones.filter((z) => z.severity === 'CRITICAL' || z.severity === 'HIGH').length} High+`,
    icon:   Map,
    color:  'text-critical',
    iconBg: 'bg-critical/10',
    subColor: 'text-slate-500',
  },
  {
    label:  'Shelters Open',
    value:  openShelters.length,
    sub:    `${demoDataset.shelters.filter((s) => s.status === 'FULL').length} Full`,
    icon:   Activity,
    color:  'text-accent',
    iconBg: 'bg-accent/10',
    subColor: 'text-slate-500',
  },
  {
    label:  'Open Reports',
    value:  pendingReports.length,
    sub:    `${demoDataset.citizenReports.filter((r) => r.status === 'COMMUNITY_CONFIRMED').length} confirmed`,
    icon:   Users,
    color:  'text-info',
    iconBg: 'bg-info/10',
    subColor: 'text-slate-500',
  },
] as const;

const systemStatus = [
  { label: 'Map Service',      status: 'Online',  color: 'text-safe'    },
  { label: 'Demo Data',        status: 'Active',  color: 'text-safe'    },
  { label: 'Alert Engine',     status: 'Standby', color: 'text-warning' },
  { label: 'Risk Engine',      status: 'Offline', color: 'text-slate-500' },
  { label: 'AI Service',       status: 'Offline', color: 'text-slate-500' },
  { label: 'Realtime (WS)',    status: 'Offline', color: 'text-slate-500' },
] as const;

// ── Historical summary (server-side) ─────────────────────────────────────────
const historicalSummary = summariseEvents(demoHistoricalEvents);

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Command Center</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {brand.name} · Authority Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="text-xs gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse-slow inline-block" />
            System Online
          </Badge>
          <Badge className="text-xs">
            <Clock className="w-3 h-3" />
            Demo Mode
          </Badge>
          {criticalAlerts.length > 0 && (
            <Badge severity="CRITICAL" dot className="text-xs">
              {criticalAlerts.length} Critical
            </Badge>
          )}
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} variant="default" padding="md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  {s.sub && (
                    <p className={`text-[11px] mt-0.5 ${s.subColor}`}>{s.sub}</p>
                  )}
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.iconBg}`}>
                  <Icon className={`w-4 h-4 ${s.color}`} aria-hidden="true" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Active alerts panel */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="p-4">
              <CardHeader className="mb-0">
                <CardTitle>Active Alerts</CardTitle>
                <Badge severity={criticalAlerts.length > 0 ? 'CRITICAL' : 'MODERATE'} dot>
                  {activeAlerts.length} Active
                </Badge>
              </CardHeader>
            </div>
            <DashboardAlertList alerts={activeAlerts} />
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* System status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <div className="space-y-2.5">
              {systemStatus.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <span className={`text-xs font-medium ${item.color}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
            <CardSection>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Map service and demo data are online. Risk engine, AI service and
                realtime infrastructure are not yet implemented.
              </p>
            </CardSection>
          </Card>

          {/* Shelter summary */}
          <Card>
            <CardHeader>
              <CardTitle>Shelter Status</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {demoDataset.shelters.map((s) => {
                const pct = Math.round((s.occupancy / s.capacity) * 100);
                const barColor =
                  s.status === 'FULL' ? 'bg-warning' :
                  s.status === 'CLOSED' ? 'bg-critical' :
                  s.status === 'PREPARING' ? 'bg-info' :
                  'bg-safe';
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] text-slate-300 truncate">{s.name.split(' ').slice(0, 3).join(' ')}</span>
                        <span className="text-[10px] text-slate-500 ml-2 flex-shrink-0">
                          {s.status === 'PREPARING' ? 'Prep' : `${pct}%`}
                        </span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor} transition-all`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Blocked roads summary */}
      <Card padding="none">
        <div className="p-4">
          <CardHeader className="mb-0">
            <CardTitle>Blocked Roads</CardTitle>
            <Badge severity="HIGH" dot>{demoDataset.blockedRoads.length} Blocked</Badge>
          </CardHeader>
        </div>
        <div className="border-t border-white/[0.06]">
          {demoDataset.blockedRoads.map((r, i) => (
            <div
              key={r.id}
              className={`px-4 py-3 flex items-start gap-3 ${i < demoDataset.blockedRoads.length - 1 ? 'border-b border-white/[0.04]' : ''}`}
            >
              <span className={`mt-0.5 flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${r.severity === 'FULL' ? 'bg-critical/15 text-critical' : 'bg-orange-400/15 text-orange-400'}`}>
                {r.severity}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">{r.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{r.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Historical Analysis quick card */}
      <Card padding="none">
        <div className="p-4">
          <CardHeader className="mb-0">
            <CardTitle>Historical Analysis</CardTitle>
            <Link
              href="/historical"
              className="text-[11px] text-accent hover:text-accent/80 transition-colors font-medium"
            >
              View full analysis →
            </Link>
          </CardHeader>
          <p className="text-[11px] text-slate-500 mt-1">
            Demo dataset · {historicalSummary.yearRange[0]}–{historicalSummary.yearRange[1]} ·{' '}
            {historicalSummary.totalEvents} events recorded
          </p>
        </div>
        <div className="border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4">
          {[
            { label: 'Total Events',   value: historicalSummary.totalEvents,    color: 'text-accent'      },
            { label: 'Max Affected',   value: formatNumber(historicalSummary.maxAffectedPopulation), color: 'text-critical' },
            { label: 'Buildings',      value: historicalSummary.totalBuildingsAffected.toLocaleString('en-IN'), color: 'text-orange-400' },
            { label: 'Roads (km)',     value: historicalSummary.totalRoadsAffectedKm.toLocaleString('en-IN'), color: 'text-warning' },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`px-4 py-3 ${
                i < 3 ? 'border-r border-white/[0.04]' : ''
              } last:border-r-0`}
            >
              <p className="text-[10px] text-slate-500">{s.label}</p>
              <p className={`text-sm font-bold mt-0.5 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <CardSection className="mx-4 my-0 py-2">
          <p className="text-[10px] text-slate-600">
            ⚠️ Demo/prototype data — not verified government records.
          </p>
        </CardSection>
      </Card>
    </div>
  );
}
