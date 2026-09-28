/**
 * MapLibre layer registration helpers.
 *
 * Each function adds sources + layers to an existing MapLibre map instance.
 * They are designed to be idempotent — calling twice will not throw.
 *
 * Only import these inside 'use client' components (never in RSC/SSR).
 */


import type { Map as MLMap, GeoJSONSource, ExpressionSpecification } from 'maplibre-gl';
import type {
  FeatureCollection,
  Polygon,
  Point,
  LineString,
  GeoJsonProperties,
} from 'geojson';
import { mapLayerIds } from '@/config/map';
import {
  severityColorExpr,
  severityOpacityExpr,
  shelterStatusColorExpr,
  infraColorExpr,
  blockedRoadColorExpr,
  reportStatusColorExpr,
} from './styles';

// ── Helpers ───────────────────────────────────────────────────────────────────

function hasSource(map: MLMap, id: string): boolean {
  return !!map.getSource(id);
}

function hasLayer(map: MLMap, id: string): boolean {
  return !!map.getLayer(id);
}

function addOrUpdateSource(
  map: MLMap,
  id: string,
  data: FeatureCollection,
): void {
  if (hasSource(map, id)) {
    (map.getSource(id) as GeoJSONSource).setData(data);
  } else {
    map.addSource(id, { type: 'geojson', data });
  }
}

// ── Risk Zones ────────────────────────────────────────────────────────────────

export function addRiskZoneLayers(
  map: MLMap,
  data: FeatureCollection<Polygon, GeoJsonProperties>,
): void {
  addOrUpdateSource(map, 'risk-zones', data);

  if (!hasLayer(map, mapLayerIds.riskZoneFill)) {
    map.addLayer({
      id: mapLayerIds.riskZoneFill,
      type: 'fill',
      source: 'risk-zones',
      paint: {
        'fill-color': severityColorExpr(),
        'fill-opacity': severityOpacityExpr(0.18),
      },
    });
  }

  if (!hasLayer(map, mapLayerIds.riskZoneOutline)) {
    map.addLayer({
      id: mapLayerIds.riskZoneOutline,
      type: 'line',
      source: 'risk-zones',
      paint: {
        'line-color': severityColorExpr(),
        'line-width': ['match', ['get', 'severity'], 'CRITICAL', 2.5, 'HIGH', 2, 'MODERATE', 1.5, 1] as ExpressionSpecification,
        'line-opacity': 0.8,
        'line-dasharray': [3, 2],
      },
    });
  }
}

// ── Flood / Hazard Areas ──────────────────────────────────────────────────────

export function addFloodAreaLayers(
  map: MLMap,
  data: FeatureCollection<Polygon, GeoJsonProperties>,
): void {
  addOrUpdateSource(map, 'flood-areas', data);

  if (!hasLayer(map, mapLayerIds.hazardEvents)) {
    map.addLayer({
      id: mapLayerIds.hazardEvents,
      type: 'fill',
      source: 'flood-areas',
      paint: {
        'fill-color': severityColorExpr(),
        'fill-opacity': severityOpacityExpr(0.35),
        'fill-antialias': true,
      },
    });
  }

  const outlineId = `${mapLayerIds.hazardEvents}-outline`;
  if (!hasLayer(map, outlineId)) {
    map.addLayer({
      id: outlineId,
      type: 'line',
      source: 'flood-areas',
      paint: {
        'line-color': severityColorExpr(),
        'line-width': 2,
        'line-opacity': 0.9,
      },
    });
  }
}

// ── Shelters ──────────────────────────────────────────────────────────────────

export function addShelterLayers(
  map: MLMap,
  data:FeatureCollection<Point, GeoJsonProperties>,
): void {
  addOrUpdateSource(map, 'shelters', data);

  if (!hasLayer(map, mapLayerIds.shelters)) {
    map.addLayer({
      id: mapLayerIds.shelters,
      type: 'circle',
      source: 'shelters',
      paint: {
        'circle-color': shelterStatusColorExpr(),
        'circle-radius': 9,
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#0E1422',
        'circle-opacity': 0.95,
      },
    });
  }

  const labelId = `${mapLayerIds.shelters}-label`;
  if (!hasLayer(map, labelId)) {
    map.addLayer({
      id: labelId,
      type: 'symbol',
      source: 'shelters',
      layout: {
        'text-field': '⛺',
        'text-size': 12,
        'text-offset': [0, 0],
        'text-allow-overlap': false,
      },
    });
  }
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export function addAlertLayers(
  map: MLMap,
  data: FeatureCollection<Point, GeoJsonProperties>,
): void {
  addOrUpdateSource(map, 'alerts', data);

  // Pulsing halo
  const haloId = `${mapLayerIds.alerts}-halo`;
  if (!hasLayer(map, haloId)) {
    map.addLayer({
      id: haloId,
      type: 'circle',
      source: 'alerts',
      paint: {
        'circle-color': severityColorExpr(),
        'circle-radius': 18,
        'circle-opacity': 0.15,
        'circle-stroke-width': 0,
      },
    });
  }

  if (!hasLayer(map, mapLayerIds.alerts)) {
    map.addLayer({
      id: mapLayerIds.alerts,
      type: 'circle',
      source: 'alerts',
      paint: {
        'circle-color': severityColorExpr(),
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#0E1422',
        'circle-opacity': 1,
      },
    });
  }
}

// ── Infrastructure ────────────────────────────────────────────────────────────

export function addInfrastructureLayers(
  map: MLMap,
  data: FeatureCollection<Point, GeoJsonProperties>,
): void {
  addOrUpdateSource(map, 'infrastructure', data);

  if (!hasLayer(map, mapLayerIds.hospitals)) {
    map.addLayer({
      id: mapLayerIds.hospitals,
      type: 'circle',
      source: 'infrastructure',
      paint: {
        'circle-color': infraColorExpr(),
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#0E1422',
        'circle-opacity': 0.95,
      },
    });
  }
}

// ── Blocked Roads ─────────────────────────────────────────────────────────────

export function addBlockedRoadLayers(
  map: MLMap,
  data: FeatureCollection<LineString, GeoJsonProperties>,
): void {
  addOrUpdateSource(map, 'blocked-roads', data);

  // Casing rendered BELOW the main dashed line
  const casingId = `${mapLayerIds.blockedRoads}-casing`;
  if (!hasLayer(map, casingId)) {
    map.addLayer({
      id: casingId,
      type: 'line',
      source: 'blocked-roads',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#0E1422',
        'line-width': 9,
        'line-opacity': 0.5,
      },
    });
  }

  if (!hasLayer(map, mapLayerIds.blockedRoads)) {
    map.addLayer({
      id: mapLayerIds.blockedRoads,
      type: 'line',
      source: 'blocked-roads',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': blockedRoadColorExpr(),
        'line-width': 5,
        'line-dasharray': [2, 2],
        'line-opacity': 0.9,
      },
    });
  }
}

// ── Cyclone Zones ────────────────────────────────────────────────────────────

export function addCycloneZoneLayers(
  map: MLMap,
  data: FeatureCollection<Polygon, GeoJsonProperties>,
): void {
  addOrUpdateSource(map, 'cyclone-zones', data);

  if (!hasLayer(map, mapLayerIds.cycloneZoneFill)) {
    map.addLayer({
      id: mapLayerIds.cycloneZoneFill,
      type: 'fill',
      source: 'cyclone-zones',
      paint: {
        'fill-color': severityColorExpr(),
        'fill-opacity': severityOpacityExpr(0.22),
      },
    });
  }

  if (!hasLayer(map, mapLayerIds.cycloneZoneOutline)) {
    map.addLayer({
      id: mapLayerIds.cycloneZoneOutline,
      type: 'line',
      source: 'cyclone-zones',
      paint: {
        'line-color': severityColorExpr(),
        'line-width': ['match', ['get', 'severity'], 'CRITICAL', 2.5, 'HIGH', 2, 'MODERATE', 1.5, 1] as ExpressionSpecification,
        'line-opacity': 0.85,
        'line-dasharray': [4, 2],
      },
    });
  }
}

// ── Cyclone Track + Landfall ──────────────────────────────────────────────────

export function addCycloneTrackLayers(
  map: MLMap,
  trackData: FeatureCollection<LineString, GeoJsonProperties>,
  landfallData: FeatureCollection<Point, GeoJsonProperties>,
): void {
  addOrUpdateSource(map, 'cyclone-track', trackData);
  addOrUpdateSource(map, 'cyclone-landfall', landfallData);

  const trackCasingId = `${mapLayerIds.cycloneTrack}-casing`;
  if (!hasLayer(map, trackCasingId)) {
    map.addLayer({
      id: trackCasingId,
      type: 'line',
      source: 'cyclone-track',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#7C3AED',
        'line-width': 7,
        'line-opacity': 0.25,
      },
    });
  }

  if (!hasLayer(map, mapLayerIds.cycloneTrack)) {
    map.addLayer({
      id: mapLayerIds.cycloneTrack,
      type: 'line',
      source: 'cyclone-track',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#A78BFA',
        'line-width': 3,
        'line-dasharray': [2, 1.5],
        'line-opacity': 0.95,
      },
    });
  }

  if (!hasLayer(map, mapLayerIds.cycloneLandfall)) {
    map.addLayer({
      id: mapLayerIds.cycloneLandfall,
      type: 'circle',
      source: 'cyclone-landfall',
      paint: {
        'circle-color': '#EF4444',
        'circle-radius': 10,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#FCA5A5',
        'circle-opacity': 0.95,
      },
    });
  }
}

// ── Historical Events ────────────────────────────────────────────────────────

export function addHistoricalEventLayers(
  map: MLMap,
  data: FeatureCollection<Point, GeoJsonProperties>,
): void {
  addOrUpdateSource(map, 'historical-events', data);

  // Outer ring (severity-coloured outline, transparent fill)
  if (!hasLayer(map, mapLayerIds.historicalEvents)) {
    map.addLayer({
      id: mapLayerIds.historicalEvents,
      type: 'circle',
      source: 'historical-events',
      paint: {
        'circle-color':          '#000000',
        'circle-opacity':        0,
        'circle-radius':         11,
        'circle-stroke-width':   2.5,
        'circle-stroke-color':   severityColorExpr() as ExpressionSpecification,
        'circle-stroke-opacity': 0.85,
      },
    });
  }

  // Inner filled dot
  const dotId = `${mapLayerIds.historicalEvents}-dot`;
  if (!hasLayer(map, dotId)) {
    map.addLayer({
      id: dotId,
      type: 'circle',
      source: 'historical-events',
      paint: {
        'circle-color':        severityColorExpr() as ExpressionSpecification,
        'circle-radius':       4,
        'circle-opacity':      0.65,
        'circle-stroke-width': 0,
      },
    });
  }
}

// ── Citizen Reports ───────────────────────────────────────────────────────────

export function addCitizenReportLayers(
  map: MLMap,
  data: FeatureCollection<Point, GeoJsonProperties>,
): void {
  addOrUpdateSource(map, 'citizen-reports', data);

  if (!hasLayer(map, mapLayerIds.citizenReports)) {
    map.addLayer({
      id: mapLayerIds.citizenReports,
      type: 'circle',
      source: 'citizen-reports',
      paint: {
        'circle-color': reportStatusColorExpr(),
        'circle-radius': 7,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#0E1422',
        'circle-opacity': 0.9,
      },
    });
  }
}
