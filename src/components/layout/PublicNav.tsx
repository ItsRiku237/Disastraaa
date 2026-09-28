'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/Logo';
import { publicNavLinks } from '@/config/nav';

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16">
      {/* Frosted glass background */}
      <div className="absolute inset-0 bg-surface-base/80 backdrop-blur-xl border-b border-white/[0.06]" />

      <nav
        className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between"
        aria-label="Main navigation"
      >
        <Logo size="sm" />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0.5">
          {publicNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150',
                isActive(link.href)
                  ? 'text-accent bg-accent/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5',
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Authority login (desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-accent/40 text-accent hover:bg-accent/10 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            Authority Login
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-surface-card border-b border-white/[0.06] shadow-2xl animate-fade-in">
          <div className="px-4 py-3 flex flex-col gap-0.5">
            {publicNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'text-accent bg-accent/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5',
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 mt-1 border-t border-white/[0.06]">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium text-accent hover:bg-accent/10 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Authority Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
