'use client';

/**
 * MapPageClient — client entry point for the public map page.
 * Powered by Live Intelligence stream overrides.
 */

import { useMemo } from 'react';
import { demoDataset } from '@/data/demo';
import { DisasterMap } from '@/components/map/DisasterMap';
import { useLiveIntelligence } from '@/context/LiveIntelligenceContext';

export function MapPageClient() {
  const { overrides } = useLiveIntelligence();

  const liveDataset = useMemo(
    () => ({
      ...demoDataset,
      alerts: overrides.alerts,
      shelters: overrides.shelters,
      citizenReports: overrides.reports,
    }),
    [overrides.alerts, overrides.shelters, overrides.reports],
  );

  return (
    <DisasterMap
      dataset={liveDataset}
      className="w-full h-full"
      center={[85.8, 20.0]}
      zoom={7.0}
    />
  );
}

