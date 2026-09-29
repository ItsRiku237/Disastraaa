'use client';

/**
 * RouteMapOverlay — wires RoutePlanner into the existing DisasterMap.
 *
 * Sits as an absolute overlay panel (right side desktop, bottom sheet mobile).
 * Calls onRouteSelected / onRouteClear to let DisasterMap draw the route line.
 * Does NOT touch any other map layers.
 *
 * ⚠️  PROTOTYPE ROUTE INTELLIGENCE — not live traffic, not official routing.
 */

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { RoutePlanner } from './RoutePlanner';
import type { RouteResult } from '@/lib/routing/types';
import type { LngLat } from '@/data/types';

interface RouteMapOverlayProps {
  onRouteSelected: (coords: LngLat[], mode: RouteResult['mode']) => void;
  onRouteClear: () => void;
  className?: string;
}

export function RouteMapOverlay({ onRouteSelected, onRouteClear, className }: RouteMapOverlayProps) {
  const [open, setOpen] = useState(false);

  const handleRouteClear = useCallback(() => {
    onRouteClear();
  }, [onRouteClear]);

  return (
    <>
      {/* Toggle button — always visible */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg backdrop-blur-md transition-all active:scale-98',
          open
            ? 'bg-accent text-slate-950 hover:bg-accent/90'
            : 'bg-white/10 dark:bg-white/10 text-slate-200 hover:bg-white/20 border border-white/10',
          className,
        )}
        title="Safe Route Planner"
        aria-label={open ? 'Close Route Planner' : 'Open Route Planner'}
      >
        <span>🗺️</span>
        <span className="hidden sm:inline">{open ? 'Close Routes' : 'Route Planner'}</span>
      </button>

      {/* Overlay panel */}
      {open && (
        <div
          className={cn(
            'absolute z-30 pointer-events-auto',
            // Mobile: bottom sheet
            'bottom-0 left-0 right-0',
            // Tablet/Desktop: right side panel
            'md:bottom-auto md:top-12 md:left-auto md:right-3 md:mt-1 md:w-[22rem]',
            'max-h-[80dvh] md:max-h-[calc(100%-5rem)] overflow-y-auto',
            'rounded-t-2xl md:rounded-xl',
            'bg-slate-50/98 dark:bg-surface-card/98 border border-slate-200/80 dark:border-white/10 shadow-2xl backdrop-blur-md',
          )}
          role="dialog"
          aria-label="Route Planner"
        >
          {/* Panel header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-100/95 dark:bg-surface-elevated/95 rounded-t-2xl md:rounded-t-xl backdrop-blur-md">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500">Task 13</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">🗺️ Safe Route Planner</div>
            </div>
            <button
              onClick={() => { setOpen(false); onRouteClear(); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-sm"
              aria-label="Close route planner"
            >
              ✕
            </button>
          </div>

          {/* Planner body */}
          <div className="p-4">
            <RoutePlanner
              onRouteSelected={onRouteSelected}
              onRouteClear={handleRouteClear}
            />
          </div>
        </div>
      )}
    </>
  );
}
