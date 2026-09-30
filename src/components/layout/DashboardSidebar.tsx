'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  Bell,
  FileText,
  Home,
  Package,
  Activity,
  Calendar,
  Clock,
  Truck,
  Settings,
  BarChart2,
  Sliders,
  Bot,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/Logo';
import { brand } from '@/config/brand';
import { dashboardNavGroups } from '@/config/nav';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

// Icon registry — avoids dynamic require; extend when adding nav items
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  BarChart2,
  Sliders,
  Bot,
  Map,
  Bell,
  FileText,
  Home,
  Package,
  Activity,
  Calendar,
  Clock,
  Truck,
  Settings,
};

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      className={cn(
        'relative flex-shrink-0 h-full flex flex-col',
        'bg-white dark:bg-surface-card border-r border-slate-200 dark:border-white/[0.06]',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-14' : 'w-56',
      )}
      aria-label="Dashboard navigation"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-3 border-b border-slate-200 dark:border-white/[0.06] flex-shrink-0">
        <Logo size="sm" showName={!collapsed} />
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {dashboardNavGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                {group.label}
              </p>
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon ? iconMap[item.icon] : null;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-2.5 px-2 py-2 rounded-lg',
                      'text-sm font-medium transition-colors duration-150',
                      active
                        ? 'bg-accent/15 dark:bg-accent/10 text-cyan-700 dark:text-accent font-semibold'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5',
                    )}
                  >
                    {Icon && (
                      <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    )}
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer controls: Theme toggle + Version badge */}
      <div className="p-2 border-t border-slate-200 dark:border-white/[0.06] flex-shrink-0 flex items-center justify-between gap-1.5">
        <ThemeToggle size="sm" showLabel={!collapsed} className={collapsed ? 'w-full px-0 justify-center' : ''} />
        {!collapsed && (
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600 pr-1">
            {brand.version}
          </span>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'absolute -right-3 top-[72px]',
          'w-6 h-6 rounded-full',
          'bg-white dark:bg-surface-elevated border border-slate-200 dark:border-white/10',
          'flex items-center justify-center',
          'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors',
          'shadow-md z-10',
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3" />
          : <ChevronLeft className="w-3 h-3" />
        }
      </button>
    </aside>
  );
}
