'use client';

/**
 * DisasterMap — orchestrates all disaster intelligence map layers.
 *
 * Panel hierarchy on zone click:
 *  1. If a multi-hazard composite exists for the zone → MultiHazardPanel + ImpactPredictionPanel tab
 *  2. Cyclone-only zone                               → CycloneRiskPanel
 *  3. Flood-only zone                                 → FloodRiskPanel
 *  4. Other layers                                    → MapLibre popup
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import { MapContainer } from './MapContainer';
import { LayerControl, type LayerToggle } from './LayerControl';
import { MapLegend } from './MapLegend';
import { FloodRiskPanel } from '@/components/risk/FloodRiskPanel';
import { CycloneRiskPanel } from '@/components/risk/CycloneRiskPanel';
import { MultiHazardPanel } from '@/components/risk/MultiHazardPanel';
import { ImpactPredictionPanel } from '@/components/impact/ImpactPredictionPanel';
import { ShelterRequirementPanel } from '@/components/planning/ShelterRequirementPanel';
import { buildShelterPlanningForZone, type ShelterPlanningResult } from '@/lib/planning/shelter';
import { mapLayerIds, getMapStyleForTheme } from '@/config/map';
import { useTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
  riskZonesToGeoJSON,
  floodAreasToGeoJSON,
  sheltersToGeoJSON,
  alertsToGeoJSON,
  infrastructureToGeoJSON,
  blockedRoadsToGeoJSON,
  citizenReportsToGeoJSON,
  cycloneZonesToGeoJSON,
  cycloneTrackToGeoJSON,
  cycloneLandfallToGeoJSON,
  historicalEventsToGeoJSON,
} from '@/data/geojson';
import {
  addRiskZoneLayers,
  addFloodAreaLayers,
  addShelterLayers,
  addAlertLayers,
  addInfrastructureLayers,
  addBlockedRoadLayers,
  addCitizenReportLayers,
  addCycloneZoneLayers,
  addCycloneTrackLayers,
  addHistoricalEventLayers,
} from './layers/addLayers';
import {
  floodAreaPopupHTML,
  shelterPopupHTML,
  alertPopupHTML,
  infrastructurePopupHTML,
  blockedRoadPopupHTML,
  citizenReportPopupHTML,
  historicalEventPopupHTML,
} from './layers/popups';
import type { DisasterDataset } from '@/data/types';
import type { FloodRiskExplanation } from '@/lib/risk/flood';
import type { CycloneRiskExplanation } from '@/lib/risk/cyclone';
import type { MultiHazardRiskExplanation } from '@/lib/risk/multiHazard';
import type { ImpactResult } from '@/lib/impact';
import { calculateImpact, DEMO_ZONE_EXPOSURE, fallbackExposure } from '@/lib/impact';
import { computedFloodRisks }        from '@/data/demo/computedFloodRisks';
import { computedCycloneRisks }      from '@/data/demo/computedCycloneRisks';
import {
  computedMultiHazardRisks,
  ZONE_TO_MULTI_HAZARD_ID,
} from '@/data/demo/computedMultiHazardRisks';
import { demoCycloneZones, demoCycloneTrack } from '@/data/demo/cycloneZones';
import { demoHistoricalEvents } from '@/data/demo/historicalEvents';
import { cn } from '@/lib/utils';

// ── Layer definitions ─────────────────────────────────────────────────────────

const INITIAL_LAYERS: LayerToggle[] = [
  { id: 'riskZones',     label: 'Risk Zones',     icon: '🔺', color: '#EF4444', enabled: true  },
  { id: 'floodAreas',   label: 'Flood Areas',     icon: '🌊', color: '#3B82F6', enabled: true  },
  { id: 'cycloneZones', label: 'Cyclone Zones',   icon: '🌀', color: '#A78BFA', enabled: true  },
  { id: 'cycloneTrack', label: 'Cyclone Track',   icon: '🎯', color: '#7C3AED', enabled: true  },
  { id: 'shelters',     label: 'Shelters',         icon: '⛺', color: '#10B981', enabled: true  },
  { id: 'alerts',       label: 'Alerts',           icon: '📡', color: '#F59E0B', enabled: true  },
  { id: 'infra',        label: 'Infrastructure',   icon: '🏥', color: '#22D3EE', enabled: true  },
  { id: 'blockedRoads', label: 'Blocked Roads',    icon: '🚫', color: '#F97316', enabled: true  },
  { id: 'reports',      label: 'Citizen Reports',  icon: '📍', color: '#8B5CF6', enabled: false },
  { id: 'historical',   label: 'Historical Events', icon: '🕐', color: '#94A3B8', enabled: false },
];

const LAYER_GROUP_MAP: Record<string, string[]> = {
  riskZones:    [mapLayerIds.riskZoneFill, mapLayerIds.riskZoneOutline],
  floodAreas:   [mapLayerIds.hazardEvents, `${mapLayerIds.hazardEvents}-outline`],
  cycloneZones: [mapLayerIds.cycloneZoneFill, mapLayerIds.cycloneZoneOutline],
  cycloneTrack: [mapLayerIds.cycloneTrack, `${mapLayerIds.cycloneTrack}-casing`, mapLayerIds.cycloneLandfall],
  shelters:     [mapLayerIds.shelters, `${mapLayerIds.shelters}-label`],
  alerts:       [mapLayerIds.alerts, `${mapLayerIds.alerts}-halo`],
  infra:        [mapLayerIds.hospitals],
  blockedRoads: [mapLayerIds.blockedRoads, `${mapLayerIds.blockedRoads}-casing`],
  reports:      [mapLayerIds.citizenReports],
  historical:   [mapLayerIds.historicalEvents, `${mapLayerIds.historicalEvents}-dot`],
};

// ── Popup-only layers ─────────────────────────────────────────────────────────

type PopupBuilder = (props: Record<string, unknown>) => string;

const NON_RISK_CLICKABLE: { layerId: string; builder: PopupBuilder }[] = [
  { layerId: mapLayerIds.hazardEvents,           builder: floodAreaPopupHTML      },
  { layerId: mapLayerIds.shelters,               builder: shelterPopupHTML        },
  { layerId: mapLayerIds.alerts,                 builder: alertPopupHTML          },
  { layerId: `${mapLayerIds.alerts}-halo`,       builder: alertPopupHTML          },
  { layerId: mapLayerIds.hospitals,              builder: infrastructurePopupHTML },
  { layerId: mapLayerIds.blockedRoads,           builder: blockedRoadPopupHTML    },
  { layerId: mapLayerIds.citizenReports,         builder: citizenReportPopupHTML  },
  { layerId: mapLayerIds.historicalEvents,       builder: historicalEventPopupHTML },
  { layerId: `${mapLayerIds.historicalEvents}-dot`, builder: historicalEventPopupHTML },
];

// ── Panel state ───────────────────────────────────────────────────────────────

type HazardPanelState =
  | { type: 'multiHazard'; id: string; name: string; explanation: MultiHazardRiskExplanation }
  | { type: 'flood';       id: string; name: string; explanation: FloodRiskExplanation }
  | { type: 'cyclone';     id: string; name: string; explanation: CycloneRiskExplanation }
  | null;

type ZoneDetailTab = 'risk' | 'impact' | 'shelter';

// ── Impact helper ─────────────────────────────────────────────────────────────

function buildImpact(mhId: string, zoneName: string, expl: MultiHazardRiskExplanation): ImpactResult {
  const { result } = expl;
  const exposure = DEMO_ZONE_EXPOSURE[mhId] ?? fallbackExposure(result.affectedPopulation);
  return calculateImpact(mhId, zoneName, {
    riskScore:      result.score,
    severity:       result.severity,
    dominantHazard: result.dominantHazard,
    exposure,
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

interface DisasterMapProps {
  dataset:    DisasterDataset;
  className?: string;
  center?:    [number, number];
  zoom?:      number;
}

export function DisasterMap({ dataset, className, center, zoom }: DisasterMapProps) {
  const { theme } = useTheme();
  const mapStyle = getMapStyleForTheme(theme);
  const [layers, setLayers]           = useState<LayerToggle[]>(INITIAL_LAYERS);
  const [activePanel, setActivePanel] = useState<HazardPanelState>(null);
  const [activeTab, setActiveTab]     = useState<ZoneDetailTab>('risk');
  const mapRef                        = useRef<MLMap | null>(null);
  const popupRef                      = useRef<import('maplibre-gl').Popup | null>(null);
  const prevLayers                    = useRef<LayerToggle[]>(INITIAL_LAYERS);
  const layersRef                     = useRef<LayerToggle[]>(INITIAL_LAYERS);

  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);

  // ── Layer visibility sync ────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    layers.forEach((layer) => {
      const prev = prevLayers.current.find((l) => l.id === layer.id);
      if (prev?.enabled === layer.enabled) return;
      const vis = layer.enabled ? 'visible' : 'none';
      LAYER_GROUP_MAP[layer.id]?.forEach((mlId) => {
        if (map.getLayer(mlId)) map.setLayoutProperty(mlId, 'visibility', vis);
      });
    });
    prevLayers.current = layers;
  }, [layers]);

  // ── Map ready ────────────────────────────────────────────────────────────
  const handleMapReady = useCallback(async (map: MLMap) => {
    mapRef.current = map;
    const { Popup } = await import('maplibre-gl');

    addRiskZoneLayers(map, riskZonesToGeoJSON(dataset.riskZones));
    addFloodAreaLayers(map, floodAreasToGeoJSON(dataset.floodAreas));
    addShelterLayers(map, sheltersToGeoJSON(dataset.shelters));
    addAlertLayers(map, alertsToGeoJSON(dataset.alerts));
    addInfrastructureLayers(map, infrastructureToGeoJSON(dataset.infrastructure));
    addBlockedRoadLayers(map, blockedRoadsToGeoJSON(dataset.blockedRoads));
    addCitizenReportLayers(map, citizenReportsToGeoJSON(dataset.citizenReports));
    addCycloneZoneLayers(map, cycloneZonesToGeoJSON(demoCycloneZones));
    addCycloneTrackLayers(
      map,
      cycloneTrackToGeoJSON(demoCycloneTrack),
      cycloneLandfallToGeoJSON(demoCycloneTrack),
    );
    addHistoricalEventLayers(map, historicalEventsToGeoJSON(demoHistoricalEvents));

    // Preserve active layer states across initial load & style reloads
    layersRef.current.forEach((layer) => {
      const vis = layer.enabled ? 'visible' : 'none';
      LAYER_GROUP_MAP[layer.id]?.forEach((mlId) => {
        if (map.getLayer(mlId)) map.setLayoutProperty(mlId, 'visibility', vis);
      });
    });

    const riskClickable = [mapLayerIds.riskZoneFill, mapLayerIds.cycloneZoneFill];
    const allClickableIds = [
      ...riskClickable,
      ...NON_RISK_CLICKABLE.map((c) => c.layerId),
    ].filter((id) => map.getLayer(id));

    allClickableIds.forEach((id) => {
      map.on('mouseenter', id, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', id, () => { map.getCanvas().style.cursor = ''; });
    });

    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: allClickableIds });
      if (!features.length) { setActivePanel(null); return; }

      const feature = features[0];
      const props   = (feature.properties ?? {}) as Record<string, unknown>;
      const layerId = feature.layer.id;

      // ── Risk zone clicks (flood or cyclone fill layers) ──
      if (layerId === mapLayerIds.riskZoneFill || layerId === mapLayerIds.cycloneZoneFill) {
        popupRef.current?.remove();
        const zoneId = String(props.id ?? '');
        const zoneName = String(props.name ?? zoneId);

        // 1. Try multi-hazard composite first
        const mhId = ZONE_TO_MULTI_HAZARD_ID[zoneId];
        if (mhId && computedMultiHazardRisks[mhId]) {
          setActiveTab('risk');
          setActivePanel({ type: 'multiHazard', id: mhId, name: zoneName, explanation: computedMultiHazardRisks[mhId] });
          return;
        }

        // 2. Fall back to cyclone-only
        if (layerId === mapLayerIds.cycloneZoneFill) {
          const ex = computedCycloneRisks[zoneId];
          if (ex) {
            setActiveTab('risk');
            setActivePanel({ type: 'cyclone', id: zoneId, name: zoneName, explanation: ex });
          }
          return;
        }

        // 3. Fall back to flood-only
        const ex = computedFloodRisks[zoneId];
        if (ex) {
          setActiveTab('risk');
          setActivePanel({ type: 'flood', id: zoneId, name: zoneName, explanation: ex });
        }
        return;
      }

      // ── Other layers → popup ──
      setActivePanel(null);
      const entry = NON_RISK_CLICKABLE.find((c) => c.layerId === layerId);
      if (!entry) return;

      const html   = entry.builder(props);
      const coords: [number, number] =
        feature.geometry.type === 'Point'
          ? (feature.geometry.coordinates as [number, number])
          : [e.lngLat.lng, e.lngLat.lat];

      popupRef.current?.remove();
      popupRef.current = new Popup({ closeButton: true, closeOnClick: true, maxWidth: '320px', offset: 12 })
        .setLngLat(coords).setHTML(html).addTo(map);
    });
  }, [dataset]);

  const handleToggle     = useCallback((id: string) => {
    setLayers((prev) => prev.map((l) => l.id === id ? { ...l, enabled: !l.enabled } : l));
  }, []);
  const handleClosePanel = useCallback(() => setActivePanel(null), []);

  const activeAlerts  = dataset.alerts.filter((a) => a.isActive);
  const criticalCount = activeAlerts.filter((a) => a.severity === 'CRITICAL').length;

  // Compute impact result when we have a multiHazard panel active
  const impactResult: ImpactResult | null =
    activePanel?.type === 'multiHazard'
      ? buildImpact(activePanel.id, activePanel.name, activePanel.explanation)
      : null;

  // Compute shelter planning result for whichever panel is active
  const shelterPlanning: ShelterPlanningResult | null =
    activePanel
      ? buildShelterPlanningForZone({
          zoneId: activePanel.id,
          zoneName: activePanel.name,
          affectedPopulation: activePanel.explanation.result.affectedPopulation,
          severity: activePanel.explanation.result.severity,
          riskScore: activePanel.explanation.result.score,
          allShelters: dataset.shelters,
          allHistoricalEvents: demoHistoricalEvents,
        })
      : null;

  return (
    <MapContainer
      className={className}
      style={mapStyle}
      viewState={{ center: center ?? [85.8, 20.0], zoom: zoom ?? 7.0 }}
      onMapReady={handleMapReady}
    >
      {/* Demo banner */}
      <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-20 px-4">
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/15 border border-warning/30 text-warning text-[11px] font-medium backdrop-blur-sm whitespace-nowrap map-panel">
          <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse-slow flex-shrink-0" />
          DEMO / SIMULATED DATA — Not real government data
        </div>
      </div>

      {/* Map tools: Layer control + Theme switch */}
      <div className="absolute left-3 top-12 pointer-events-none z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2 pointer-events-auto">
          <LayerControl layers={layers} onToggle={handleToggle} className="mt-1" />
          <ThemeToggle size="sm" showLabel={true} className="mt-1 shadow-lg backdrop-blur-md map-panel font-medium" />
        </div>
      </div>

      {/* Alert badge */}
      {activeAlerts.length > 0 && (
        <div className="absolute top-12 right-3 pointer-events-none z-10 mt-1">
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated/95 border border-white/10 shadow-lg backdrop-blur-sm map-panel">
            <span className="w-2 h-2 rounded-full bg-critical animate-pulse-slow flex-shrink-0" />
            <span className="text-xs font-semibold text-slate-200 whitespace-nowrap">
              {activeAlerts.length} Active Alert{activeAlerts.length !== 1 ? 's' : ''}
            </span>
            {criticalCount > 0 && (
              <span className="text-[10px] font-bold text-critical whitespace-nowrap">
                {criticalCount} CRITICAL
              </span>
            )}
          </div>
        </div>
      )}

      {/* Risk + Impact panel */}
      {activePanel && (
        <div className={cn(
          'absolute z-20 pointer-events-auto',
          'bottom-0 left-0 right-0',
          'md:bottom-auto md:top-12 md:left-auto md:right-3 md:mt-1',
          'overflow-y-auto max-h-[65dvh] md:max-h-[calc(100%-5rem)]',
        )}>
          {activePanel.type === 'multiHazard' ? (
            <div className="flex flex-col rounded-xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-white/10 map-panel">
              {/* Tab bar */}
              <div className="flex bg-slate-100/95 dark:bg-surface-elevated/95 border-b border-slate-200 dark:border-white/10 backdrop-blur-md rounded-t-xl overflow-hidden">
                <button
                  onClick={() => setActiveTab('risk')}
                  className={cn(
                    'flex-1 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors',
                    activeTab === 'risk'
                      ? 'text-slate-900 dark:text-slate-100 bg-white dark:bg-white/10 shadow-sm dark:shadow-none font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5',
                  )}
                >
                  ⚡ Risk
                </button>
                <button
                  onClick={() => setActiveTab('impact')}
                  className={cn(
                    'flex-1 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors',
                    activeTab === 'impact'
                      ? 'text-slate-900 dark:text-slate-100 bg-white dark:bg-white/10 shadow-sm dark:shadow-none font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5',
                  )}
                >
                  🎯 Impact
                </button>
                <button
                  onClick={() => setActiveTab('shelter')}
                  className={cn(
                    'flex-1 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors',
                    activeTab === 'shelter'
                      ? 'text-slate-900 dark:text-slate-100 bg-white dark:bg-white/10 shadow-sm dark:shadow-none font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5',
                  )}
                >
                  ⛺ Shelter
                </button>
              </div>

              {/* Panel content */}
              {activeTab === 'risk' ? (
                <MultiHazardPanel
                  locationName={activePanel.name}
                  explanation={activePanel.explanation}
                  onClose={handleClosePanel}
                  className="rounded-t-none rounded-b-none md:rounded-b-xl border-none shadow-none"
                />
              ) : activeTab === 'impact' && impactResult ? (
                <ImpactPredictionPanel
                  impact={impactResult}
                  onClose={handleClosePanel}
                  className="rounded-t-none rounded-b-none md:rounded-b-xl border-none shadow-none"
                />
              ) : shelterPlanning ? (
                <ShelterRequirementPanel
                  planning={shelterPlanning}
                  onClose={handleClosePanel}
                  className="rounded-t-none rounded-b-none md:rounded-b-xl border-none shadow-none"
                />
              ) : null}
            </div>
          ) : activePanel.type === 'flood' ? (
            <div className="flex flex-col rounded-xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-white/10 map-panel">
              <div className="flex bg-slate-100/95 dark:bg-surface-elevated/95 border-b border-slate-200 dark:border-white/10 backdrop-blur-md rounded-t-xl overflow-hidden">
                <button
                  onClick={() => setActiveTab('risk')}
                  className={cn(
                    'flex-1 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors',
                    activeTab === 'risk'
                      ? 'text-slate-900 dark:text-slate-100 bg-white dark:bg-white/10 shadow-sm dark:shadow-none font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5',
                  )}
                >
                  ⚡ Risk
                </button>
                <button
                  onClick={() => setActiveTab('shelter')}
                  className={cn(
                    'flex-1 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors',
                    activeTab === 'shelter'
                      ? 'text-slate-900 dark:text-slate-100 bg-white dark:bg-white/10 shadow-sm dark:shadow-none font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5',
                  )}
                >
                  ⛺ Shelter
                </button>
              </div>
              {activeTab === 'shelter' && shelterPlanning ? (
                <ShelterRequirementPanel
                  planning={shelterPlanning}
                  onClose={handleClosePanel}
                  className="rounded-t-none rounded-b-none md:rounded-b-xl border-none shadow-none"
                />
              ) : (
                <FloodRiskPanel
                  zoneName={activePanel.name}
                  explanation={activePanel.explanation}
                  onClose={handleClosePanel}
                  className="rounded-t-none rounded-b-none md:rounded-b-xl border-none shadow-none"
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col rounded-xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-white/10 map-panel">
              <div className="flex bg-slate-100/95 dark:bg-surface-elevated/95 border-b border-slate-200 dark:border-white/10 backdrop-blur-md rounded-t-xl overflow-hidden">
                <button
                  onClick={() => setActiveTab('risk')}
                  className={cn(
                    'flex-1 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors',
                    activeTab === 'risk'
                      ? 'text-slate-900 dark:text-slate-100 bg-white dark:bg-white/10 shadow-sm dark:shadow-none font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5',
                  )}
                >
                  ⚡ Risk
                </button>
                <button
                  onClick={() => setActiveTab('shelter')}
                  className={cn(
                    'flex-1 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors',
                    activeTab === 'shelter'
                      ? 'text-slate-900 dark:text-slate-100 bg-white dark:bg-white/10 shadow-sm dark:shadow-none font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5',
                  )}
                >
                  ⛺ Shelter
                </button>
              </div>
              {activeTab === 'shelter' && shelterPlanning ? (
                <ShelterRequirementPanel
                  planning={shelterPlanning}
                  onClose={handleClosePanel}
                  className="rounded-t-none rounded-b-none md:rounded-b-xl border-none shadow-none"
                />
              ) : (
                <CycloneRiskPanel
                  zoneName={activePanel.name}
                  explanation={activePanel.explanation}
                  onClose={handleClosePanel}
                  className="rounded-t-none rounded-b-none md:rounded-b-xl border-none shadow-none"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className={cn(
        'absolute left-3 pointer-events-none z-10',
        activePanel ? 'hidden md:block bottom-8' : 'bottom-8',
      )}>
        <MapLegend />
      </div>
    </MapContainer>
  );
}
