'use client';

/**
 * Live Intelligence Context & Provider
 *
 * Provides a global real-time event streaming and operational intelligence layer
 * without requiring full page reloads.
 *
 * Source: Simulated Live Feed (Deterministic Emergency Operations Telemetry)
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import type {
  LiveEvent,
  LiveConnectionStatus,
  LiveDataOverrides,
  LiveIntelligenceContextType,
} from '@/lib/realtime/types';
import { DETERMINISTIC_LIVE_EVENTS, applyLiveEventToOverrides } from '@/lib/realtime/events';
import { aggregateCommandCenterData } from '@/lib/commandCenter/aggregator';
import { buildResponseCoordinationData } from '@/lib/response/engine';
import { buildSituationAnalyticsData } from '@/lib/analytics/engine';
import { demoDataset } from '@/data/demo';
import { demoCitizenReports } from '@/data/demo/citizenReports';
import { demoRoadSegments } from '@/data/demo';
import { LiveIntelligenceDrawer } from '@/components/realtime/LiveIntelligenceDrawer';
import { createCitizenReport, saveReport, type CreateReportInput } from '@/lib/reports';
import {
  createIncident,
  saveIncident,
  mapReportTypeToIncidentType,
  mapReportSeverityToIncidentSeverity,
} from '@/lib/incidents';
import { ROLES } from '@/types/roles';

const INITIAL_OVERRIDES: LiveDataOverrides = {
  alerts: demoDataset.alerts,
  reports: demoCitizenReports,
  roads: demoRoadSegments,
  shelters: demoDataset.shelters,
  shelterOccupancies: {},
  resourceStocks: {},
  riverGaugeDeltas: {},
  rainfallDeltas: {},
};

const LiveIntelligenceContext = createContext<LiveIntelligenceContextType | null>(null);

export function LiveIntelligenceProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<LiveConnectionStatus>('connected');
  const [sourceName] = useState<string>('Simulated Live Feed');
  const [lastSyncTime, setLastSyncTime] = useState<Date>(() => new Date());
  const [secondsSinceSync, setSecondsSinceSync] = useState<number>(0);
  const [updateIntervalSeconds, setUpdateIntervalSeconds] = useState<number>(25);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [unreadEventCount, setUnreadEventCount] = useState<number>(0);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  // Initial recent events (seed with the first 3 events for immediate operational context)
  const [recentEvents, setRecentEvents] = useState<LiveEvent[]>(() =>
    DETERMINISTIC_LIVE_EVENTS.slice(0, 3).map((e, idx) => ({
      ...e,
      timeFormatted: `${(idx + 1) * 3}m ago`,
    })),
  );

  // Current event index cursor in the event stream sequence
  const eventCursorRef = useRef<number>(3);

  // Live data overrides applied on top of baseline data
  const [overrides, setOverrides] = useState<LiveDataOverrides>(() => {
    let current = { ...INITIAL_OVERRIDES };
    // Apply seed events so initial state matches seed activity stream
    for (let i = 0; i < 3; i++) {
      current = applyLiveEventToOverrides(current, DETERMINISTIC_LIVE_EVENTS[i]);
    }
    return current;
  });

  // Calculate synchronized operational models
  const commandCenterData = useMemo(() => {
    return aggregateCommandCenterData(overrides);
  }, [overrides]);

  const responseCoordinationData = useMemo(() => {
    return buildResponseCoordinationData(commandCenterData, {
      alerts: overrides.alerts,
      reports: overrides.reports,
      roads: overrides.roads,
      shelters: overrides.shelters,
    });
  }, [commandCenterData, overrides]);

  const situationAnalyticsData = useMemo(() => {
    return buildSituationAnalyticsData(
      commandCenterData,
      overrides.alerts,
      overrides.reports,
      overrides.roads,
    );
  }, [commandCenterData, overrides]);

  // Trigger next deterministic event in the sequence
  const triggerNextEvent = useCallback(() => {
    setStatus('updating');

    const nextEventTemplate =
      DETERMINISTIC_LIVE_EVENTS[eventCursorRef.current % DETERMINISTIC_LIVE_EVENTS.length];
    eventCursorRef.current += 1;

    const eventToApply: LiveEvent = {
      ...nextEventTemplate,
      id: `${nextEventTemplate.id}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: 'Just now',
    };

    setTimeout(() => {
      setOverrides((prev) => applyLiveEventToOverrides(prev, eventToApply));
      setRecentEvents((prev) => [eventToApply, ...prev.slice(0, 19)]);
      setUnreadEventCount((prev) => prev + 1);
      setLastSyncTime(new Date());
      setSecondsSinceSync(0);
      setStatus((s) => (s === 'updating' ? (isPaused ? 'paused' : 'connected') : s));
    }, 180);
  }, [isPaused]);

  // Refresh current data streams now without advancing event cursor
  const refreshNow = useCallback(() => {
    setStatus('updating');
    setTimeout(() => {
      // Re-evaluate command center data
      setOverrides((prev) => ({ ...prev }));
      setLastSyncTime(new Date());
      setSecondsSinceSync(0);
      setStatus(isPaused ? 'paused' : 'connected');
    }, 250);
  }, [isPaused]);

  // Pause live stream
  const pauseFeed = useCallback(() => {
    setIsPaused(true);
    setStatus('paused');
  }, []);

  // Resume live stream
  const resumeFeed = useCallback(() => {
    setIsPaused(false);
    setStatus('connected');
    setLastSyncTime(new Date());
    setSecondsSinceSync(0);
  }, []);

  // Reset to initial baseline state
  const resetToBaseline = useCallback(() => {
    setStatus('updating');
    eventCursorRef.current = 0;
    setTimeout(() => {
      setOverrides({ ...INITIAL_OVERRIDES });
      setRecentEvents([]);
      setUnreadEventCount(0);
      setLastSyncTime(new Date());
      setSecondsSinceSync(0);
      setStatus(isPaused ? 'paused' : 'connected');
    }, 200);
  }, [isPaused]);

  // Simulate temporary connection drop & reconnection
  const simulateConnectionDrop = useCallback(() => {
    setStatus('reconnecting');
    setTimeout(() => {
      setStatus('connected');
      setLastSyncTime(new Date());
      setSecondsSinceSync(0);
    }, 3500);
  }, []);

  // Mark recent events as read
  const markEventsRead = useCallback(() => {
    setUnreadEventCount(0);
  }, []);

  // Submit citizen report via API with local fallback
  const submitCitizenReport = useCallback(async (input: CreateReportInput) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit report');
      }
      const { report, incident } = data;

      saveIncident(incident);

      setOverrides((prev) => ({
        ...prev,
        reports: [report, ...prev.reports.filter((r) => r.id !== report.id)],
      }));

      const newLiveEvent: LiveEvent = {
        id: `ev-report-${report.id}-${Date.now()}`,
        type: 'REPORT_RECEIVED',
        timestamp: new Date().toISOString(),
        timeFormatted: 'Just now',
        locationName: report.address || 'Field Observation',
        district: report.administrativeArea,
        title: `Citizen Report: ${report.title}`,
        summary: report.description.slice(0, 100),
        severity: report.severity,
        category: 'REPORT',
        metadata: { reportId: report.id, incidentId: incident.id },
      };

      setRecentEvents((prev) => [newLiveEvent, ...prev.slice(0, 19)]);
      setUnreadEventCount((prev) => prev + 1);
      setLastSyncTime(new Date());
      setSecondsSinceSync(0);

      return { report, incident };
    } catch {
      // Local fallback
      const report = createCitizenReport(input, demoDataset);
      saveReport(report);
      const incType = mapReportTypeToIncidentType(report.reportType);
      const incSev = mapReportSeverityToIncidentSeverity(report.severity);
      const incident = createIncident({
        title: report.title,
        description: report.description,
        incidentType: incType,
        hazardType: report.hazardType,
        severity: incSev,
        locationName: report.address,
        coordinates: report.coordinates,
        affectedArea: report.administrativeArea,
        source: 'CITIZEN_REPORT',
        sourceReference: report.id,
        dataLabel: 'CITIZEN_REPORT',
        createdBy: report.reporter.name || 'Citizen Reporter',
        createdByRole: ROLES.CITIZEN,
        relatedReportIds: [report.id],
        evidence: report.evidence,
      });
      saveIncident(incident);
      setOverrides((prev) => ({
        ...prev,
        reports: [report, ...prev.reports.filter((r) => r.id !== report.id)],
      }));
      return { report, incident };
    }
  }, []);

  // Freshness second ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceSync((prev) => {
        const nextSec = prev + 1;
        // If no update for a long period and connected, flag as delayed
        if (nextSec > updateIntervalSeconds * 2.5 && status === 'connected' && !isPaused) {
          setStatus('delayed');
        }
        return nextSec;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [updateIntervalSeconds, status, isPaused]);

  // Automatic periodic live event emission
  useEffect(() => {
    if (isPaused || status !== 'connected') {
      return;
    }

    const interval = setInterval(() => {
      triggerNextEvent();
    }, updateIntervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [isPaused, status, updateIntervalSeconds, triggerNextEvent]);

  const value = useMemo<LiveIntelligenceContextType>(() => {
    return {
      status,
      sourceName,
      lastSyncTime,
      secondsSinceSync,
      updateIntervalSeconds,
      isPaused,
      isDrawerOpen,
      recentEvents,
      unreadEventCount,
      overrides,
      commandCenterData,
      responseCoordinationData,
      situationAnalyticsData,
      pauseFeed,
      resumeFeed,
      refreshNow,
      triggerNextEvent,
      resetToBaseline,
      setUpdateInterval: setUpdateIntervalSeconds,
      simulateConnectionDrop,
      markEventsRead,
      openDrawer,
      closeDrawer,
      setIsDrawerOpen,
      submitCitizenReport,
    };
  }, [
    status,
    sourceName,
    lastSyncTime,
    secondsSinceSync,
    updateIntervalSeconds,
    isPaused,
    isDrawerOpen,
    recentEvents,
    unreadEventCount,
    overrides,
    commandCenterData,
    responseCoordinationData,
    situationAnalyticsData,
    pauseFeed,
    resumeFeed,
    refreshNow,
    triggerNextEvent,
    resetToBaseline,
    simulateConnectionDrop,
    markEventsRead,
    openDrawer,
    closeDrawer,
    submitCitizenReport,
  ]);

  return (
    <LiveIntelligenceContext.Provider value={value}>
      {children}
      {isDrawerOpen && <LiveIntelligenceDrawer onClose={closeDrawer} />}
    </LiveIntelligenceContext.Provider>
  );
}

export function useLiveIntelligence(): LiveIntelligenceContextType {
  const context = useContext(LiveIntelligenceContext);
  if (!context) {
    throw new Error('useLiveIntelligence must be used within a LiveIntelligenceProvider');
  }
  return context;
}
