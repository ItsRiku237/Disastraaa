/**
 * Citizen Report Store
 *
 * In-memory persistence layer for Citizen Disaster Reports.
 * Provides unified access across server API routes and client hydration.
 *
 * Seeded with realistic demo citizen ground observations.
 */

import { demoCitizenReports } from '@/data/demo/citizenReports';
import type { CitizenReportItem } from './types';

// Global singleton across server runtime
let _reportsStore: CitizenReportItem[] = [...demoCitizenReports];

export function getAllReports(): CitizenReportItem[] {
  return _reportsStore;
}

export function getReportById(id: string): CitizenReportItem | undefined {
  return _reportsStore.find((r) => r.id === id);
}

export function saveReport(report: CitizenReportItem): void {
  const idx = _reportsStore.findIndex((r) => r.id === report.id);
  if (idx >= 0) {
    _reportsStore = [
      ..._reportsStore.slice(0, idx),
      report,
      ..._reportsStore.slice(idx + 1),
    ];
  } else {
    _reportsStore = [report, ..._reportsStore];
  }
}

export function getReportCounts() {
  const total = _reportsStore.length;
  const verified = _reportsStore.filter((r) => r.status === 'VERIFIED').length;
  const underReview = _reportsStore.filter(
    (r) => r.status === 'UNDER_REVIEW' || r.status === 'PENDING',
  ).length;
  const communityConfirmed = _reportsStore.filter(
    (r) => r.status === 'COMMUNITY_CONFIRMED',
  ).length;
  const escalated = _reportsStore.filter((r) => r.status === 'ESCALATED').length;
  const withEvidence = _reportsStore.filter(
    (r) => r.evidence && r.evidence.length > 0,
  ).length;

  return {
    total,
    verified,
    underReview,
    communityConfirmed,
    escalated,
    withEvidence,
  };
}
