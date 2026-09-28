'use client';

/**
 * MapPageClient — client entry point for the public map page.
 *
 * Imports demo dataset and renders DisasterMap.
 * Swap `demoDataset` for a real API fetch (SWR / React Query / server action)
 * without touching any map or layer component.
 */

import { demoDataset } from '@/data/demo';
import { DisasterMap } from '@/components/map/DisasterMap';

export function MapPageClient() {
  return (
    <DisasterMap
      dataset={demoDataset}
      className="w-full h-full"
      // Centred on Odisha coast where most demo events are clustered
      center={[85.8, 20.0]}
      zoom={7.0}
    />
  );
}
