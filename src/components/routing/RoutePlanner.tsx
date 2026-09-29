'use client';

/**
 * RoutePlanner — Safe & Alternative Route Intelligence
 *
 * ⚠️  PROTOTYPE ROUTE ANALYSIS — Not live traffic, not official evacuation routes.
 *
 * Lets the user select an origin and destination from the known node list,
 * then shows Shortest / Safest / Alternative route comparison.
 *
 * Responsive: stacked on mobile, side-by-side on desktop.
 * Dark + light mode via Tailwind tokens.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { DEMO_NODES, calculateRoutes } from '@/lib/routing';
import type { RouteResult, RouteNode } from '@/lib/routing/types';
import type { LngLat } from '@/data/types';

// ── Constants ────────────────────────────────────────────────────────────────

const NODE_ICON: Record<RouteNode['type'], string> = {
  SHELTER:  '⛺',
  HOSPITAL: '🏥',
  JUNCTION: '🔀',
  LANDMARK: '📍',
  EOC:      '📡',
};

const SEVERITY_COLOR: Record<string, string> = {
  LOW:      'text-safe',
  MODERATE: 'text-warning',
  HIGH:     'text-orange-400',
  CRITICAL: 'text-critical',
};

const SEVERITY_BG: Record<string, string> = {
  LOW:      'bg-safe/10 border-safe/20',
  MODERATE: 'bg-warning/10 border-warning/20',
  HIGH:     'bg-orange-400/10 border-orange-400/20',
  CRITICAL: 'bg-critical/10 border-critical/20',
};

const STATUS_COLOR: Record<string, string> = {
  OPEN:              'text-safe',
  CAUTION:           'text-warning',
  PARTIALLY_BLOCKED: 'text-orange-400',
  BLOCKED:           'text-critical',
  CLOSED:            'text-critical',
  UNKNOWN:           'text-slate-400',
};

const MODE_CONFIG = {
  SHORTEST: {
    label:    'Shortest Route',
    icon:     '⚡',
    accent:   'border-accent/30 bg-accent/5',
    tabColor: 'text-accent',
  },
  SAFEST: {
    label:    'Safest Route',
    icon:     '🛡️',
    accent:   'border-safe/30 bg-safe/5',
    tabColor: 'text-safe',
  },
  ALTERNATIVE: {
    label:    'Alternative Route',
    icon:     '🔄',
    accent:   'border-warning/30 bg-warning/5',
    tabColor: 'text-warning',
  },
} as const;

// ── Sub-components ────────────────────────────────────────────────────────────

function RouteMetric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-sm font-bold text-slate-100">{value}</span>
      {sub && <span className="text-[10px] text-slate-500">{sub}</span>}
    </div>
  );
}

function RouteCard({
  result,
  isSelected,
  onSelect,
}: {
  result: RouteResult;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const cfg = MODE_CONFIG[result.mode];

  if (!result.found) {
    return (
      <div className={cn(
        'rounded-xl border p-4',
        'border-white/[0.07] bg-white/[0.02]',
        'opacity-60',
      )}>
        <div className="flex items-center gap-2 mb-2">
          <span>{cfg.icon}</span>
          <span className="text-xs font-semibold text-slate-400">{cfg.label}</span>
        </div>
        <p className="text-[11px] text-slate-500">
          {result.notFoundReason ?? 'No route found.'}
        </p>
      </div>
    );
  }

  const hrs = Math.floor(result.totalMinutes / 60);
  const m   = result.totalMinutes % 60;
  const timeStr = hrs > 0 ? `${hrs}h ${m}m` : `${m} min`;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-xl border p-4 transition-all',
        isSelected
          ? cn('ring-2 ring-accent/60', cfg.accent)
          : 'border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04]',
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{cfg.icon}</span>
          <span className="text-xs font-bold text-slate-200">{cfg.label}</span>
        </div>
        <span className={cn(
          'text-[10px] font-bold px-2 py-0.5 rounded-full border',
          SEVERITY_BG[result.riskSeverity],
          SEVERITY_COLOR[result.riskSeverity],
        )}>
          {result.riskSeverity} RISK
        </span>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <RouteMetric label="Distance" value={`${result.totalDistanceKm} km`} />
        <RouteMetric label="Estimated" value={timeStr} sub="prototype" />
        <RouteMetric label="Risk Score" value={`${result.riskScore}/100`} />
      </div>

      {/* Avoided / hazards */}
      {result.mode === 'SAFEST' && result.blockedAvoided > 0 && (
        <div className="text-[11px] text-safe font-medium">
          ✓ Avoids {result.blockedAvoided} blocked road{result.blockedAvoided > 1 ? 's' : ''}
        </div>
      )}
      {result.mode === 'SHORTEST' && result.segments.some((s) => s.isBlocked) && (
        <div className="text-[11px] text-critical font-medium">
          ⚠️ Passes through blocked road
        </div>
      )}
      {result.hazardsEncountered.length > 0 && result.mode !== 'SHORTEST' && (
        <div className="text-[11px] text-slate-400 mt-1">
          {result.hazardsEncountered.length} road issue{result.hazardsEncountered.length > 1 ? 's' : ''} on route
        </div>
      )}
    </button>
  );
}

function RouteDetailPanel({ result }: { result: RouteResult }) {
  if (!result.found) {
    return (
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 text-center">
        <p className="text-sm text-slate-500">{result.notFoundReason}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      {/* Risk explanation */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
          Route Analysis
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">{result.riskExplanation}</p>
      </div>

      {/* Segments */}
      <div className="px-4 py-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Route Segments ({result.segments.length})
        </div>
        <div className="space-y-0">
          {result.segments.map((seg, i) => (
            <div
              key={seg.edgeId}
              className={cn(
                'py-2.5 flex items-start gap-3',
                i < result.segments.length - 1 && 'border-b border-white/[0.04]',
              )}
            >
              {/* Index bubble */}
              <div className="w-5 h-5 rounded-full bg-white/8 flex items-center justify-center text-[10px] font-bold text-slate-400 flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-medium text-slate-200 truncate">{seg.roadName}</span>
                  {seg.roadCode && (
                    <span className="text-[10px] text-slate-500 font-mono">{seg.roadCode}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span>{seg.distanceKm} km</span>
                  <span>{seg.travelMinutes} min</span>
                  <span className={STATUS_COLOR[seg.status]}>{seg.status.replace('_', ' ')}</span>
                  {seg.riskScore > 25 && (
                    <span className={SEVERITY_COLOR[seg.riskSeverity]}>
                      Risk {seg.riskScore}/100
                    </span>
                  )}
                </div>
                {seg.hazardNote && (
                  <div className="text-[10px] text-warning mt-0.5">{seg.hazardNote}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assumptions footer */}
      <div className="px-4 py-2 border-t border-white/[0.06] text-[10px] text-slate-600">
        ⚠️ Estimated travel time based on road type and status. Prototype model only.
        Not live traffic. Not an official evacuation route.
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface RoutePlannerProps {
  /** Callback when a route is selected — passes map coordinates for display */
  onRouteSelected?: (coords: LngLat[], mode: RouteResult['mode']) => void;
  onRouteClear?: () => void;
  className?: string;
}

export function RoutePlanner({ onRouteSelected, onRouteClear, className }: RoutePlannerProps) {
  const [originId,      setOriginId]      = useState<string>('');
  const [destinationId, setDestinationId] = useState<string>('');
  const [calculated,    setCalculated]    = useState(false);
  const [activeMode,    setActiveMode]    = useState<RouteResult['mode']>('SAFEST');
  const [error,         setError]         = useState<string>('');

  const results = useMemo(() => {
    if (!calculated || !originId || !destinationId) return null;
    return calculateRoutes({ originNodeId: originId, destinationNodeId: destinationId });
  }, [calculated, originId, destinationId]);

  const activeResult = results
    ? results[activeMode.toLowerCase() as keyof typeof results] as RouteResult
    : null;

  const handleCalculate = useCallback(() => {
    setError('');
    if (!originId)      { setError('Please select an origin.'); return; }
    if (!destinationId) { setError('Please select a destination.'); return; }
    if (originId === destinationId) { setError('Origin and destination cannot be the same.'); return; }
    setCalculated(true);
    setActiveMode('SAFEST');
  }, [originId, destinationId]);

  const handleClear = useCallback(() => {
    setCalculated(false);
    setOriginId('');
    setDestinationId('');
    setError('');
    onRouteClear?.();
  }, [onRouteClear]);

  // Emit map coordinates when active route changes
  useEffect(() => {
    if (activeResult?.found) {
      onRouteSelected?.(activeResult.mapCoordinates, activeResult.mode);
    } else if (!activeResult) {
      onRouteClear?.();
    }
  }, [activeResult, onRouteSelected, onRouteClear]);

  const nodeOptions = DEMO_NODES.filter((n) => n.type !== 'JUNCTION');

  return (
    <div className={cn('flex flex-col gap-4', className)}>

      {/* Prototype disclaimer */}
      <div className="px-3 py-2 rounded-lg bg-warning/8 border border-warning/20 text-[11px] text-warning/90 leading-relaxed">
        🗺️ <strong>Prototype Route Intelligence</strong> — Based on available disaster
        intelligence. Not live traffic. Not an official evacuation route.
      </div>

      {/* Origin + Destination selects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Origin
          </label>
          <select
            value={originId}
            onChange={(e) => { setOriginId(e.target.value); setCalculated(false); }}
            className={cn(
              'w-full rounded-lg border text-sm px-3 py-2',
              'bg-white/5 dark:bg-white/5 border-white/10',
              'text-slate-200 dark:text-slate-200',
              'focus:outline-none focus:ring-1 focus:ring-accent/50',
            )}
          >
            <option value="">Select origin…</option>
            {nodeOptions.map((n) => (
              <option key={n.id} value={n.id} disabled={n.id === destinationId}>
                {NODE_ICON[n.type]} {n.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Destination
          </label>
          <select
            value={destinationId}
            onChange={(e) => { setDestinationId(e.target.value); setCalculated(false); }}
            className={cn(
              'w-full rounded-lg border text-sm px-3 py-2',
              'bg-white/5 dark:bg-white/5 border-white/10',
              'text-slate-200 dark:text-slate-200',
              'focus:outline-none focus:ring-1 focus:ring-accent/50',
            )}
          >
            <option value="">Select destination…</option>
            {nodeOptions.map((n) => (
              <option key={n.id} value={n.id} disabled={n.id === originId}>
                {NODE_ICON[n.type]} {n.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-[11px] text-critical bg-critical/10 border border-critical/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCalculate}
          disabled={!originId || !destinationId}
          className={cn(
            'flex-1 py-2 rounded-lg text-sm font-semibold transition-colors',
            'bg-accent text-white',
            'hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed',
          )}
        >
          Calculate Routes
        </button>
        {calculated && (
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Route cards */}
      {results && (
        <div className="space-y-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Route Options
          </div>
          <div className="grid grid-cols-1 gap-3">
            {(['SAFEST', 'SHORTEST', 'ALTERNATIVE'] as const).map((mode) => {
              const r = results[mode.toLowerCase() as keyof typeof results] as RouteResult;
              return (
                <RouteCard
                  key={mode}
                  result={r}
                  isSelected={activeMode === mode}
                  onSelect={() => { setActiveMode(mode); }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Route detail */}
      {activeResult && (
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            {MODE_CONFIG[activeMode].label} — Segment Detail
          </div>
          <RouteDetailPanel result={activeResult} />
        </div>
      )}
    </div>
  );
}
