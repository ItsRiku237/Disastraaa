'use client';

/**
 * LayerControl — responsive panel for toggling disaster map layers.
 *
 * On mobile: collapsed by default, expands via toggle button.
 * On desktop: always visible as a side panel.
 * Supports both dark and light themes.
 */

import { useState } from 'react';
import { Layers, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LayerToggle {
  id: string;
  label: string;
  icon: string;
  color: string;
  enabled: boolean;
}

interface LayerControlProps {
  layers: LayerToggle[];
  onToggle: (id: string) => void;
  className?: string;
}

export function LayerControl({ layers, onToggle, className }: LayerControlProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close layer control' : 'Open layer control'}
        className={cn(
          'md:hidden pointer-events-auto',
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
          'bg-surface-elevated/95 dark:bg-surface-elevated/95 backdrop-blur-sm',
          'border border-white/10 dark:border-white/10',
          'text-slate-100 dark:text-slate-100',
          'shadow-lg transition-all',
        )}
      >
        <Layers className="w-4 h-4 text-accent" />
        <span>Layers</span>
        <ChevronDown
          className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {/* Mobile flyout */}
      {open && (
        <div
          className={cn(
            'md:hidden pointer-events-auto',
            'absolute top-12 left-0 w-56 z-20',
            'rounded-xl shadow-2xl',
            'bg-surface-elevated/98 dark:bg-surface-elevated/98 backdrop-blur-xl',
            'border border-white/10',
            'p-3 animate-slide-up',
          )}
        >
          <LayerList layers={layers} onToggle={onToggle} onClose={() => setOpen(false)} />
        </div>
      )}

      {/* Desktop panel — always visible */}
      <div
        className={cn(
          'hidden md:flex md:flex-col pointer-events-auto',
          'w-52 rounded-xl shadow-2xl',
          'bg-surface-elevated/95 dark:bg-surface-elevated/95 backdrop-blur-xl',
          'border border-white/10',
          'p-3',
          className,
        )}
      >
        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/[0.07]">
          <Layers className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Map Layers
          </span>
        </div>
        <LayerList layers={layers} onToggle={onToggle} />
      </div>
    </>
  );
}

// ── Inner list ────────────────────────────────────────────────────────────────

function LayerList({
  layers,
  onToggle,
  onClose,
}: {
  layers: LayerToggle[];
  onToggle: (id: string) => void;
  onClose?: () => void;
}) {
  return (
    <ul className="space-y-1">
      {onClose && (
        <li className="flex items-center justify-between mb-1 pb-2 border-b border-white/[0.07]">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Layers</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-slate-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </li>
      )}
      {layers.map((layer) => (
        <li key={layer.id}>
          <button
            onClick={() => onToggle(layer.id)}
            className={cn(
              'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left',
              'transition-all text-sm',
              layer.enabled
                ? 'bg-white/[0.06] text-slate-100'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]',
            )}
            aria-pressed={layer.enabled}
          >
            {/* Colour dot */}
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-opacity"
              style={{
                backgroundColor: layer.color,
                opacity: layer.enabled ? 1 : 0.3,
              }}
            />
            {/* Icon + label */}
            <span className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-xs leading-none">{layer.icon}</span>
              <span className="text-xs font-medium truncate">{layer.label}</span>
            </span>
            {/* Toggle indicator */}
            <span
              className={cn(
                'w-7 h-4 rounded-full flex-shrink-0 relative transition-colors',
                layer.enabled ? 'bg-accent' : 'bg-white/10',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform',
                  layer.enabled ? 'translate-x-3.5' : 'translate-x-0.5',
                )}
              />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
