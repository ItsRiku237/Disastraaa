'use client';

import { Shield, Radio, Activity, RefreshCw, AlertTriangle, Layers } from 'lucide-react';
import { Badge } from '@/components/ui';
import { AuthorityRoleSwitcher } from '@/components/auth/AuthorityRoleSwitcher';
import { type Role } from '@/types/roles';
import { getDemoUserContext } from '@/lib/auth/roles';

interface CommandCenterHeaderProps {
  currentRole: Role;
  onRoleChange: (newRole: Role) => void;
  activeDisastersCount: number;
  highestRiskLocation: string;
  onRefresh?: () => void;
}

export function CommandCenterHeader({
  currentRole,
  onRoleChange,
  activeDisastersCount,
  highestRiskLocation,
  onRefresh,
}: CommandCenterHeaderProps) {
  const userContext = getDemoUserContext(currentRole);

  return (
    <header className="relative bg-gradient-to-r from-slate-900/90 via-surface-card to-slate-900/90 border-b border-white/[0.08] px-4 sm:px-6 py-4 rounded-2xl shadow-xl backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Branding & Status */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-accent/15 border border-accent/30 text-accent">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Emergency Operations Command Center
                </h1>
                <Badge severity="CRITICAL" dot className="text-[11px] font-bold">
                  {activeDisastersCount} Active Emergencies
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="text-cyan-400 font-medium">{userContext.regionName}</span>
                <span className="text-slate-600">·</span>
                <span>Active Incident: Cyclone Landfall & Riverine Basin Surge</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Badges, Role Switcher, Controls */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-elevated/80 border border-white/[0.06] text-[11px] text-slate-300">
            <Radio className="w-3.5 h-3.5 text-safe animate-pulse" />
            <span className="font-mono">SEOC FEED ONLINE</span>
          </div>

          <Badge className="text-[11px] bg-amber-500/10 text-amber-300 border-amber-500/30">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-400" />
            Decision-Support Only
          </Badge>

          <Badge className="text-[11px] bg-blue-500/10 text-blue-300 border-blue-500/30">
            Demo Data
          </Badge>

          <AuthorityRoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-100 border border-white/10 transition-colors"
              title="Refresh intelligence streams"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Operational alert ticker banner */}
      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 gap-2 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <span className="w-2 h-2 rounded-full bg-critical animate-ping" />
          <span className="font-semibold text-slate-200">Priority Operational Focus:</span>
          <span className="text-critical font-bold">{highestRiskLocation}</span>
          <span className="text-slate-500">|</span>
          <span>Wind velocities 175 km/h · Dam outflow 8.2 lakh cusecs · Evacuations active</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
          UTC+05:30 · SYNOPTIC T0
        </span>
      </div>
    </header>
  );
}
