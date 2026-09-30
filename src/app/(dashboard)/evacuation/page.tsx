import type { Metadata } from 'next';
import { demoEvacuationZones } from '@/data/demo/evacuationZones';
import { EvacuationDashboard } from '@/components/evacuation/EvacuationDashboard';

export const metadata: Metadata = {
  title: 'Evacuation Management',
  description: 'Coordinate evacuation zones, safe routes and shelter capacity across active disaster areas.',
};

export default function EvacuationPage() {
  return <EvacuationDashboard zones={demoEvacuationZones} />;
}
