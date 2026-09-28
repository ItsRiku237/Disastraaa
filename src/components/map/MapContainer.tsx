'use client';

/**
 * MapContainer — reusable MapLibre GL JS wrapper.
 *
 * Design principles:
 *  - MapLibre is dynamically imported inside useEffect so it never
 *    runs in the SSR environment.
 *  - The CSS is imported statically at the top of this file; Next.js
 *    extracts it into the global stylesheet at build time.
 *  - All disaster-specific layer logic lives OUTSIDE this component.
 *    This component only handles: init, controls, cleanup, and a slot
 *    for UI overlay children.
 *  - Sources, layers, and GeoJSON are added by parent components via
 *    the onMapReady callback.
 */

import 'maplibre-gl/dist/maplibre-gl.css';

import { useEffect, useRef } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import { mapConfig } from '@/config/map';
import { cn } from '@/lib/utils';
import type { MapContainerProps } from './types';

export function MapContainer({
  viewState,
  style,
  className,
  onMapReady,
  onMapClick,
  children,
  interactive = true,
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<MLMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let canceled = false;

    const init = async () => {
      const {
        Map,
        NavigationControl,
        ScaleControl,
        AttributionControl,
      } = await import('maplibre-gl');

      if (canceled || !containerRef.current) return;

      const map = new Map({
        container:        containerRef.current,
        style:            style ?? mapConfig.defaultStyle,
        center:           viewState?.center  ?? mapConfig.defaultCenter,
        zoom:             viewState?.zoom    ?? mapConfig.defaultZoom,
        bearing:          viewState?.bearing ?? 0,
        pitch:            viewState?.pitch   ?? 0,
        minZoom:          mapConfig.minZoom,
        maxZoom:          mapConfig.maxZoom,
        attributionControl: false,
        interactive,
      });

      // Controls
      if (mapConfig.controls.attribution) {
        map.addControl(new AttributionControl({ compact: true }), 'bottom-right');
      }
      if (mapConfig.controls.navigation && interactive) {
        map.addControl(new NavigationControl({ showCompass: true }), 'bottom-right');
      }
      if (mapConfig.controls.scale) {
        map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');
      }

      // Click handler
      if (onMapClick) {
        map.on('click', (e) => {
          onMapClick([e.lngLat.lng, e.lngLat.lat]);
        });
      }

      // Notify parent when style is fully loaded
      map.on('load', () => {
        if (!canceled) onMapReady?.(map);
      });

      if (canceled) {
        map.remove();
      } else {
        mapRef.current = map;
      }
    };

    init().catch(console.error);

    return () => {
      canceled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Intentionally runs once on mount. viewState/style changes would
  // require flyTo/setStyle calls rather than re-initialising the map.

  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      {/* MapLibre renders into this div */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* UI overlay slot — individual children control pointer-events */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {children}
      </div>
    </div>
  );
}
