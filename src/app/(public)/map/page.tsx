import type { Metadata } from 'next';
import { brand } from '@/config/brand';
import { MapPageClient } from './MapPageClient';

export const metadata: Metadata = {
  title: `Live Map | ${brand.name}`,
  description: 'Interactive disaster intelligence map — risk zones, flood areas, shelters, alerts and infrastructure.',
};

/**
 * Map page (RSC shell).
 *
 * All map logic is in MapPageClient ('use client') so MapLibre never
 * runs during SSR.  This server component only provides layout and
 * injects the demo dataset (later: fetched from a real API here).
 */
export default function MapPage() {
  return (
    <div className="mt-16 h-[calc(100vh-4rem)] w-full overflow-hidden">
      <MapPageClient />
    </div>
  );
}
