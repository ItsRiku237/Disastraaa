/**
 * GeoJSON adapters — convert typed demo data into MapLibre-ready
 * GeoJSON FeatureCollections.
 *
 * Each function is pure and stateless so it can be replaced by
 * a real API adapter without touching any map component.
 */

import type {
  RiskZone,
  FloodArea,
  Shelter,
  DemoAlert,
  Infrastructure,
  BlockedRoad,
  DemoCitizenReport,
} from './types';
import type { HistoricalDisasterEvent } from '@/lib/historical/types';

import type {
  FeatureCollection,
  Feature,
  Polygon,
  Point,
  LineString,
  GeoJsonProperties,
} from 'geojson';

// ── Risk Zones → Polygon FeatureCollection ────────────────────────────────────

export function riskZonesToGeoJSON(
  zones: RiskZone[],
): FeatureCollection<Polygon, GeoJsonProperties> {
  return {
    type: 'FeatureCollection',
    features: zones.map<Feature<Polygon, GeoJsonProperties>>((z) => ({
      type: 'Feature',
      id: z.id,
      geometry: {
        type: 'Polygon',
        coordinates: z.coordinates,
      },
      properties: {
        id: z.id,
        name: z.name,
        severity: z.severity,
        primaryHazard: z.primaryHazard,
        riskScore: z.riskScore,
        affectedPopulation: z.affectedPopulation,
        description: z.description ?? '',
      },
    })),
  };
}

// ── Flood Areas → Polygon FeatureCollection ───────────────────────────────────

export function floodAreasToGeoJSON(
  areas: FloodArea[],
): FeatureCollection<Polygon, GeoJsonProperties> {
  return {
    type: 'FeatureCollection',
    features: areas.map<Feature<Polygon, GeoJsonProperties>>((a) => ({
      type: 'Feature',
      id: a.id,
      geometry: {
        type: 'Polygon',
        coordinates: a.coordinates,
      },
      properties: {
        id: a.id,
        name: a.name,
        severity: a.severity,
        type: a.type,
        depthMeters: a.depthMeters ?? null,
        areaKm2: a.areaKm2 ?? null,
        lastUpdated: a.lastUpdated,
        description: a.description ?? '',
      },
    })),
  };
}

// ── Shelters → Point FeatureCollection ───────────────────────────────────────

export function sheltersToGeoJSON(
  shelters: Shelter[],
): FeatureCollection<Point, GeoJsonProperties> {
  return {
    type: 'FeatureCollection',
    features: shelters.map<Feature<Point, GeoJsonProperties>>((s) => ({
      type: 'Feature',
      id: s.id,
      geometry: {
        type: 'Point',
        coordinates: s.coordinates,
      },
      properties: {
        id: s.id,
        name: s.name,
        status: s.status,
        capacity: s.capacity,
        occupancy: s.occupancy,
        address: s.address,
        contactPhone: s.contactPhone ?? null,
        hasMedical: s.hasMedical,
        hasFood: s.hasFood,
        hasPower: s.hasPower,
      },
    })),
  };
}

// ── Alerts → Point FeatureCollection ─────────────────────────────────────────

export function alertsToGeoJSON(
  alerts: DemoAlert[],
): FeatureCollection<Point, GeoJsonProperties> {
  return {
    type: 'FeatureCollection',
    features: alerts.map<Feature<Point, GeoJsonProperties>>((a) => ({
      type: 'Feature',
      id: a.id,
      geometry: {
        type: 'Point',
        coordinates: a.coordinates,
      },
      properties: {
        id: a.id,
        type: a.type,
        severity: a.severity,
        title: a.title,
        message: a.message,
        regionName: a.regionName,
        issuedAt: a.issuedAt,
        expiresAt: a.expiresAt ?? null,
        isActive: a.isActive,
      },
    })),
  };
}

// ── Infrastructure → Point FeatureCollection ──────────────────────────────────

export function infrastructureToGeoJSON(
  items: Infrastructure[],
): FeatureCollection<Point, GeoJsonProperties> {
  return {
    type: 'FeatureCollection',
    features: items.map<Feature<Point, GeoJsonProperties>>((i) => ({
      type: 'Feature',
      id: i.id,
      geometry: {
        type: 'Point',
        coordinates: i.coordinates,
      },
      properties: {
        id: i.id,
        name: i.name,
        type: i.type,
        address: i.address,
        contactPhone: i.contactPhone ?? null,
        isOperational: i.isOperational,
        capacity: i.capacity ?? null,
      },
    })),
  };
}

// ── Blocked Roads → LineString FeatureCollection ──────────────────────────────

export function blockedRoadsToGeoJSON(
  roads: BlockedRoad[],
): FeatureCollection<LineString, GeoJsonProperties> {
  return {
    type: 'FeatureCollection',
    features: roads.map<Feature<LineString, GeoJsonProperties>>((r) => ({
      type: 'Feature',
      id: r.id,
      geometry: {
        type: 'LineString',
        coordinates: r.coordinates,
      },
      properties: {
        id: r.id,
        name: r.name,
        severity: r.severity,
        reason: r.reason,
        since: r.since,
        alternateRoute: r.alternateRoute ?? null,
      },
    })),
  };
}

// ── Cyclone Zones → Polygon FeatureCollection ────────────────────────────────

export function cycloneZonesToGeoJSON(
  zones: RiskZone[],
): FeatureCollection<Polygon, GeoJsonProperties> {
  return {
    type: 'FeatureCollection',
    features: zones.map<Feature<Polygon, GeoJsonProperties>>((z) => ({
      type: 'Feature',
      id: z.id,
      geometry: {
        type: 'Polygon',
        coordinates: z.coordinates,
      },
      properties: {
        id: z.id,
        name: z.name,
        severity: z.severity,
        primaryHazard: z.primaryHazard,
        riskScore: z.riskScore,
        affectedPopulation: z.affectedPopulation,
        description: z.description ?? '',
      },
    })),
  };
}

// ── Cyclone Track → LineString + Point FeatureCollections ─────────────────────

interface CycloneTrack {
  id: string;
  name: string;
  coordinates: [number, number][];
  landfallPoint: [number, number];
}

export function cycloneTrackToGeoJSON(
  track: CycloneTrack,
): FeatureCollection<LineString, GeoJsonProperties> {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: track.id,
        geometry: {
          type: 'LineString',
          coordinates: track.coordinates,
        },
        properties: {
          id: track.id,
          name: track.name,
        },
      },
    ],
  };
}

export function cycloneLandfallToGeoJSON(
  track: CycloneTrack,
): FeatureCollection<Point, GeoJsonProperties> {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: `${track.id}-landfall`,
        geometry: {
          type: 'Point',
          coordinates: track.landfallPoint,
        },
        properties: {
          id: `${track.id}-landfall`,
          name: 'Projected Landfall',
        },
      },
    ],
  };
}

// ── Citizen Reports → Point FeatureCollection ─────────────────────────────────

export function citizenReportsToGeoJSON(
  reports: DemoCitizenReport[],
): FeatureCollection<Point, GeoJsonProperties> {
  return {
    type: 'FeatureCollection',
    features: reports.map<Feature<Point, GeoJsonProperties>>((r) => ({
      type: 'Feature',
      id: r.id,
      geometry: {
        type: 'Point',
        coordinates: r.coordinates,
      },
      properties: {
        id: r.id,
        type: r.type,
        title: r.title,
        description: r.description,
        address: r.address,
        confirmCount: r.confirmCount,
        createdAt: r.createdAt,
        status: r.status,
      },
    })),
  };
}

// ── Historical Events → Point FeatureCollection ─────────────────────────────────────────────

export function historicalEventsToGeoJSON(
  events: HistoricalDisasterEvent[],
): FeatureCollection<Point, GeoJsonProperties> {
  return {
    type: 'FeatureCollection',
    features: events.map<Feature<Point, GeoJsonProperties>>((e) => ({
      type: 'Feature',
      id: e.id,
      geometry: {
        type: 'Point',
        coordinates: e.coordinates,
      },
      properties: {
        id: e.id,
        type: e.type,
        name: e.name,
        year: e.year,
        severity: e.severity,
        regionName: e.regionName,
        regionCode: e.regionCode,
        affectedPopulation: e.affectedPopulation,
        buildingsAffected: e.buildingsAffected,
        roadsAffectedKm: e.roadsAffectedKm,
        schoolsAffected: e.schoolsAffected,
        hospitalsAffected: e.hospitalsAffected,
        totalRainfallMm: e.totalRainfallMm,
        peakWindKmh: e.peakWindKmh,
        description: e.description,
        sourceLabel: e.sourceLabel,
      },
    })),
  };
}
