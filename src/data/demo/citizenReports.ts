/**
 * DEMO DATA — Citizen Field Reports
 *
 * ⚠️  SIMULATED DATA ONLY. Not real government data. For prototype demonstration.
 */

import type { DemoCitizenReport } from '@/data/types';

export const demoCitizenReports: DemoCitizenReport[] = [
  {
    id: 'cr-001',
    type: 'FLOOD',
    title: 'Water entering homes in Ward 4',
    description: 'Ground floor of buildings in Ward 4 flooded. Residents stranded. Need boats.',
    coordinates: [85.8900, 20.4600],
    address: 'Ward 4, Cuttack North',
    confirmCount: 14,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'COMMUNITY_CONFIRMED',
  },
  {
    id: 'cr-002',
    type: 'CYCLONE',
    title: 'Trees fallen on road near temple',
    description: 'Large banyan tree uprooted — blocking road near main temple. Transformer also fallen, no power.',
    coordinates: [85.8320, 19.8100],
    address: 'Near Jagannath Temple, Puri',
    confirmCount: 22,
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    status: 'VERIFIED',
  },
  {
    id: 'cr-003',
    type: 'FLOOD',
    title: 'Elderly person needs rescue',
    description: 'Elderly woman aged ~70 stranded on rooftop of single-storey house. Cannot swim. Water ~1.2m.',
    coordinates: [86.4300, 20.4900],
    address: 'Kendrapara, near river embankment',
    confirmCount: 5,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    status: 'VERIFIED',
  },
  {
    id: 'cr-004',
    type: 'LANDSLIDE',
    title: 'Small landslide on hill road',
    description: 'Rocks and soil sliding onto road. About 2 vehicles stuck. No injuries so far.',
    coordinates: [83.2300, 18.2200],
    address: 'Ghats Road, Eastern Ghats, Vizag district',
    confirmCount: 8,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'COMMUNITY_CONFIRMED',
  },
  {
    id: 'cr-005',
    type: 'FLOOD',
    title: 'Underpass completely submerged',
    description: 'Vizag Port Area underpass underwater — two-wheelers turned back. Depth looks 1m+.',
    coordinates: [83.3100, 17.7100],
    address: 'Port Area Underpass, Visakhapatnam',
    confirmCount: 31,
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    status: 'VERIFIED',
  },
  {
    id: 'cr-006',
    type: 'FLOOD',
    title: 'Bridge seems unstable — vibrating',
    description: 'The wooden bridge across local canal shaking badly. People crossing it still. Very dangerous.',
    coordinates: [86.5100, 21.0400],
    address: 'Bhadrak outskirts, near canal',
    confirmCount: 4,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    status: 'PENDING',
  },
];
