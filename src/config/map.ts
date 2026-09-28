/**
 * MapLibre GL JS configuration.
 *
 * All map defaults and layer IDs are centralised here so that
 * components never contain magic strings or hard-coded coordinates.
 */

/** Resolve the correct map tile style URL based on color-scheme preference. */
function resolveMapStyle(): string {
  const dark =
    (process.env.NEXT_PUBLIC_MAP_STYLE_URL as string | undefined) ??
    'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
  const light =
    (process.env.NEXT_PUBLIC_MAP_STYLE_LIGHT_URL as string | undefined) ??
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

  if (typeof window === 'undefined') return dark;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? light : dark;
}

export const mapConfig = {
  /**
   * Dark tile style URL (CARTO Dark Matter — no API key required).
   * Override via NEXT_PUBLIC_MAP_STYLE_URL.
   */
  darkStyle:
    (process.env.NEXT_PUBLIC_MAP_STYLE_URL as string | undefined) ??
    'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',

  /**
   * Light tile style URL (CARTO Positron — no API key required).
   * Override via NEXT_PUBLIC_MAP_STYLE_LIGHT_URL.
   */
  lightStyle:
    (process.env.NEXT_PUBLIC_MAP_STYLE_LIGHT_URL as string | undefined) ??
    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',

  /**
   * Resolved at call-time based on OS colour-scheme preference.
   * Must only be called in a browser context (i.e. inside useEffect).
   */
  get defaultStyle(): string {
    return resolveMapStyle();
  },

  /** Default map centre — geographic centre of India [lng, lat] */
  defaultCenter: [82.8, 22.5] as [number, number],

  /** Default zoom level to show all of India */
  defaultZoom: 4.5,

  /** Zoom range */
  minZoom: 3,
  maxZoom: 18,

  /** Built-in control visibility */
  controls: {
    navigation: true,
    scale: true,
    fullscreen: false,
    attribution: true,
  },
};

/**
 * Canonical layer IDs used across the application.
 *
 * Reference these constants instead of inline strings so that
 * renaming a layer requires a single change here.
 */
export const mapLayerIds = {
  // Risk
  riskZoneFill:    'risk-zone-fill',
  riskZoneOutline: 'risk-zone-outline',

  // Infrastructure
  shelters:     'shelters-points',
  hospitals:    'hospitals-points',
  roads:        'roads-line',
  blockedRoads: 'blocked-roads-line',

  // Events & reports
  hazardEvents:   'hazard-events-fill',
  citizenReports: 'citizen-reports-points',
  alerts:         'alerts-points',

  // Cyclone
  cycloneZoneFill:    'cyclone-zone-fill',
  cycloneZoneOutline: 'cyclone-zone-outline',
  cycloneTrack:       'cyclone-track-line',
  cycloneLandfall:    'cyclone-landfall-point',

  // Historical events
  historicalEvents: 'historical-events-points',
} as const;

export type MapLayerId = (typeof mapLayerIds)[keyof typeof mapLayerIds];
