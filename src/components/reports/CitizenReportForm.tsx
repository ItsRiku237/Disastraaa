'use client';
/* eslint-disable @next/next/no-img-element */

/**
 * CitizenReportForm
 *
 * Allows citizens and field volunteers to submit ground disaster observations.
 * ⚠️  PROTOTYPE / DEMO SYSTEM
 *
 * Features:
 * - Disaster / Report Type picker
 * - Conditional Blocked Road / Infrastructure fields
 * - Hotspot / GPS / Manual Coordinate location picker
 * - Observed conditions description
 * - Severity level selection with visual indicators
 * - Local image/video evidence metadata preview (no fake uploads)
 * - Anonymous or identified reporter options
 * - Immediate deterministic preliminary automated triage feedback
 */

import { useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  FileText,
  MapPin,
  Send,
  ShieldAlert,
  User,
  X,
} from 'lucide-react';
import type { Severity } from '@/types';
import type { LngLat } from '@/data/types';
import { cn } from '@/lib/utils';
import { EvidencePreview } from './EvidencePreview';
import {
  BLOCKAGE_CONFIG,
  REPORT_TYPE_CONFIG,
  REPORT_TYPES,
  EVIDENCE_LIMITS,
  validateEvidenceFile,
  type BlockageType,
  type CreateReportInput,
  type ReportEvidence,
  type ReportType,
} from '@/lib/reports';

// ── Demo Hotspot Presets for Quick Selection ─────────────────────────────────

const DEMO_LOCATION_PRESETS: {
  name: string;
  admin: string;
  coords: LngLat;
}[] = [
  { name: 'Cuttack North, Mahanadi River Bank', admin: 'Cuttack District, Odisha',   coords: [85.8900, 20.4600] },
  { name: 'Grand Road, Puri Town',             admin: 'Puri District, Odisha',      coords: [85.8320, 19.8100] },
  { name: 'Kendrapara Lowland Marsh',          admin: 'Kendrapara District, Odisha', coords: [86.4300, 20.4900] },
  { name: 'Araku Valley Ghat Road, Km 42',     admin: 'Visakhapatnam District, AP',  coords: [83.2300, 18.2200] },
  { name: 'Port Area Underpass, Vizag',        admin: 'Visakhapatnam District, AP',  coords: [83.3100, 17.7100] },
  { name: 'Balasore Town Hall Shelter',        admin: 'Balasore District, Odisha',   coords: [86.9300, 21.4900] },
  { name: 'Rushikulya Basin, Jagannathpur',    admin: 'Ganjam District, Odisha',     coords: [85.0400, 19.3800] },
  { name: 'Salandi Canal Crossing, Bhadrak',   admin: 'Bhadrak District, Odisha',    coords: [86.5100, 21.0400] },
];

interface CitizenReportFormProps {
  onSubmitReport: (input: CreateReportInput) => void;
  onCancel?: () => void;
  initialCoords?: LngLat;
  initialAddress?: string;
  className?: string;
}

export function CitizenReportForm({
  onSubmitReport,
  onCancel,
  initialCoords,
  initialAddress,
  className,
}: CitizenReportFormProps) {
  // Form State
  const [reportType, setReportType]     = useState<ReportType>('FLOOD');
  const [title, setTitle]               = useState('');
  const [description, setDescription]   = useState('');
  const [severity, setSeverity]         = useState<Severity>('HIGH');
  const [address, setAddress]           = useState(initialAddress ?? '');
  const [adminArea, setAdminArea]       = useState('');
  const [coords, setCoords]             = useState<LngLat>(initialCoords ?? [85.8320, 19.8100]);
  const [isManualCoords, setIsManualCoords] = useState(false);
  const [manualLng, setManualLng]       = useState(String(coords[0]));
  const [manualLat, setManualLat]       = useState(String(coords[1]));

  // Blocked Road details (conditional)
  const [roadName, setRoadName]         = useState('');
  const [blockageType, setBlockageType] = useState<BlockageType>('FLOODING');
  const [roadSeverity, setRoadSeverity] = useState<'FULL' | 'PARTIAL'>('FULL');

  // Evidence attachments (local metadata)
  const [evidenceList, setEvidenceList] = useState<ReportEvidence[]>([]);
  const [isAnonymous, setIsAnonymous]   = useState(false);
  const [reporterName, setReporterName] = useState('');

  // Status message
  const [isSubmitted, setIsSubmitted]   = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isRoadReport = reportType === 'BLOCKED_ROAD' || reportType === 'DAMAGED_ROAD';

  // Handle Preset Location selection
  const handleSelectPreset = (preset: typeof DEMO_LOCATION_PRESETS[0]) => {
    setAddress(preset.name);
    setAdminArea(preset.admin);
    setCoords(preset.coords);
    setManualLng(String(preset.coords[0]));
    setManualLat(String(preset.coords[1]));
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    if (evidenceList.length + files.length > EVIDENCE_LIMITS.MAX_FILES) {
      setErrorMessage(`Maximum ${EVIDENCE_LIMITS.MAX_FILES} attachments allowed per report.`);
      return;
    }

    const newEvidence: ReportEvidence[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateEvidenceFile(file);
      if (!validation.valid) {
        setErrorMessage(validation.error ?? 'Invalid file selected.');
        continue;
      }

      const isVideo = file.type.startsWith('video');
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

      newEvidence.push({
        id: `ev-local-${Date.now()}-${i}`,
        type: isVideo ? 'VIDEO' : 'PHOTO',
        fileName: file.name,
        mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        fileSizeBytes: file.size,
        fileSize: `${sizeMb} MB`,
        timestamp: new Date().toISOString(),
        source: 'FILE_UPLOAD',
        status: 'AVAILABLE',
        caption: `Observed at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setEvidenceList((prev) => [...prev, ...newEvidence]);
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceList((prev) => prev.filter((ev) => ev.id !== id));
  };

  // Submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim() || title.trim().length < 5) {
      setErrorMessage('Please provide a descriptive title (at least 5 characters).');
      return;
    }

    if (!description.trim() || description.trim().length < 15) {
      setErrorMessage('Please describe the observed conditions in more detail (at least 15 characters).');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('Please specify the location or landmark.');
      return;
    }

    let finalCoords: LngLat = coords;
    if (isManualCoords) {
      const lng = parseFloat(manualLng);
      const lat = parseFloat(manualLat);
      if (isNaN(lng) || isNaN(lat) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setErrorMessage('Please enter valid geographic coordinates (Latitude -90 to 90, Longitude -180 to 180).');
        return;
      }
      finalCoords = [lng, lat];
    }

    const payload: CreateReportInput = {
      reportType,
      title: title.trim(),
      description: description.trim(),
      address: address.trim(),
      administrativeArea: adminArea.trim() || 'Coastal Disaster Zone',
      coordinates: finalCoords,
      severity,
      evidence: evidenceList,
      blockedRoadInfo: isRoadReport
        ? {
            roadName: roadName.trim() || address.trim(),
            blockageType,
            severity: roadSeverity,
            description: `${roadSeverity === 'FULL' ? 'Completely impassable' : 'Partially passable'}. ${description}`,
          }
        : undefined,
      reporterName: isAnonymous ? 'Anonymous Citizen' : (reporterName.trim() || 'Local Citizen'),
      isAnonymous,
    };

    onSubmitReport(payload);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="p-6 text-center space-y-4 rounded-xl bg-white dark:bg-surface-card border border-slate-200 dark:border-white/10 shadow-xl max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Report Submitted Successfully
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-md mx-auto">
            Your ground observation has entered the triage pipeline. It is currently under preliminary automated review and is visible to nearby citizens for community corroboration.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-left text-xs space-y-1 font-mono">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-sans">
            Triage Status
          </div>
          <div className="text-slate-700 dark:text-slate-300">
            Status: <span className="text-sky-500 font-bold">UNDER REVIEW</span>
          </div>
          <div className="text-slate-700 dark:text-slate-300">
            Verification: <span className="text-amber-500">Awaiting Authority Action</span>
          </div>
          <div className="text-[10px] text-slate-400 font-sans mt-2 pt-1 border-t border-slate-200 dark:border-white/10">
            ⚠️ Citizen observations require official authority review before becoming verified warnings.
          </div>
        </div>

        <div className="pt-2 flex justify-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-accent text-slate-950 hover:bg-accent/90 transition-colors"
            >
              Done / Return to Map
            </button>
          )}
          <button
            onClick={() => {
              setIsSubmitted(false);
              setTitle('');
              setDescription('');
              setEvidenceList([]);
            }}
            className="px-4 py-2 rounded-lg text-xs font-medium border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl bg-white dark:bg-surface-card border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden font-sans transition-colors',
        className,
      )}
      role="region"
      aria-label="Citizen Disaster Report Form"
    >
      {/* ── Form Header ── */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📢</span>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Submit Citizen Disaster Report
            </h2>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono">
              PROTOTYPE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Share observed ground conditions to assist community response and official disaster triage.
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
            aria-label="Close report form"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Form Body ── */}
      <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Incident Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Disaster / Hazard Category <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(REPORT_TYPES).map(([key, val]) => {
              const cfg = REPORT_TYPE_CONFIG[val];
              const isSelected = reportType === val;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => {
                    setReportType(val);
                    setSeverity(cfg.defaultSeverity);
                  }}
                  className={cn(
                    'p-2 rounded-lg border text-left flex items-start gap-2 transition-all',
                    isSelected
                      ? 'border-accent bg-accent/10 text-slate-900 dark:text-slate-100 ring-1 ring-accent'
                      : 'border-slate-200 dark:border-white/10 hover:bg-slate-100/60 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400',
                  )}
                >
                  <span className="text-base">{cfg.icon}</span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold truncate">{cfg.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Blocked Road Specific Fields */}
        {isRoadReport && (
          <div className="p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <span>🚧</span>
              <span>Road Blockage Intelligence Details</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Road / Highway Name
                </label>
                <input
                  type="text"
                  value={roadName}
                  onChange={(e) => setRoadName(e.target.value)}
                  placeholder="e.g. NH-16 / Grand Road"
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-surface-base border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-accent text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Blockage Cause
                </label>
                <select
                  value={blockageType}
                  onChange={(e) => setBlockageType(e.target.value as BlockageType)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-surface-base border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-accent text-slate-900 dark:text-slate-100"
                >
                  {Object.entries(BLOCKAGE_CONFIG).map(([k, cfg]) => (
                    <option key={k} value={k}>
                      {cfg.icon} {cfg.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Passability Extent
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRoadSeverity('FULL')}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-semibold rounded border transition-colors',
                    roadSeverity === 'FULL'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40'
                      : 'border-slate-200 dark:border-white/10 text-slate-500',
                  )}
                >
                  ⛔ Completely Impassable (Full Block)
                </button>
                <button
                  type="button"
                  onClick={() => setRoadSeverity('PARTIAL')}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-semibold rounded border transition-colors',
                    roadSeverity === 'PARTIAL'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40'
                      : 'border-slate-200 dark:border-white/10 text-slate-500',
                  )}
                >
                  ⚠️ Partially Blocked (One-way / 4x4 only)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Title & Description */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Headline / Summary <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Water 1m deep near hospital entrance / fallen transformer"
              maxLength={120}
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-surface-base border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-accent text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Observed Conditions & Details <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {description.length}/500 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe depth of water, number of people affected, urgent rescue requirements, electrical risks, structural damage..."
              maxLength={500}
              className="w-full text-xs p-3 rounded-lg bg-slate-50 dark:bg-surface-base border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-accent text-slate-900 dark:text-slate-100 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* 4. Location Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              <span>Location / Landmark</span> <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsManualCoords((v) => !v)}
              className="text-[10px] text-accent hover:underline"
            >
              {isManualCoords ? 'Use Presets' : 'Specify Lat/Lng'}
            </button>
          </div>

          {/* Quick presets */}
          {!isManualCoords && (
            <div>
              <div className="text-[10px] text-slate-400 mb-1">Quick Select Demo Disaster Hotspots:</div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 dark:bg-white/[0.02] rounded border border-slate-200/60 dark:border-white/5">
                {DEMO_LOCATION_PRESETS.map((p) => (
                  <button
                    type="button"
                    key={p.name}
                    onClick={() => handleSelectPreset(p)}
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded border transition-colors truncate max-w-[200px]',
                      address === p.name
                        ? 'bg-accent/15 border-accent text-cyan-800 dark:text-accent font-semibold'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5',
                    )}
                  >
                    {p.name.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Specific street, landmark, or village"
              className="text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-surface-base border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-accent text-slate-900 dark:text-slate-100"
            />
            <input
              type="text"
              value={adminArea}
              onChange={(e) => setAdminArea(e.target.value)}
              placeholder="District / State (e.g. Puri District, Odisha)"
              className="text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-surface-base border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-accent text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Coordinate manual input */}
          {isManualCoords && (
            <div className="grid grid-cols-2 gap-2 p-2 rounded bg-slate-100/70 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Longitude</label>
                <input
                  type="text"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  className="w-full text-xs px-2 py-1 rounded bg-white dark:bg-surface-base border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Latitude</label>
                <input
                  type="text"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  className="w-full text-xs px-2 py-1 rounded bg-white dark:bg-surface-base border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* 5. Severity Level */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Estimated Severity Level
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { level: 'LOW',      label: 'Low',      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
              { level: 'MODERATE', label: 'Moderate', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
              { level: 'HIGH',     label: 'High',     color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30' },
              { level: 'CRITICAL', label: 'Critical', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40' },
            ].map((s) => (
              <button
                type="button"
                key={s.level}
                onClick={() => setSeverity(s.level as Severity)}
                className={cn(
                  'py-2 rounded-lg text-xs font-bold border transition-all text-center',
                  severity === s.level
                    ? `${s.color} ring-2 ring-offset-1 ring-current`
                    : 'border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Evidence Attachments */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-accent" />
              <span>Evidence Attachments (Photos / Videos)</span>
            </label>
            <span className="text-[10px] text-slate-400">Optional · Local preview</span>
          </div>

          <div className="space-y-2">
            <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-accent/50 rounded-lg cursor-pointer bg-slate-50 dark:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <Camera className="w-4 h-4 text-accent" />
                <span className="font-semibold">Select files from device</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Supports JPG, PNG, MP4. Client-side local preview.
              </p>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Evidence previews */}
            {evidenceList.length > 0 && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {evidenceList.map((ev) => (
                    <EvidencePreview
                      key={ev.id}
                      evidence={ev}
                      size="sm"
                      onRemove={() => handleRemoveEvidence(ev.id)}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  Attached for prototype review. Ready for secure cloud object storage in production.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 7. Reporter Identity */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Reporter Identity</span>
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-slate-300 text-accent focus:ring-accent"
              />
              <span>Submit Anonymously</span>
            </label>
          </div>

          {!isAnonymous && (
            <input
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="Your full name or callsign (e.g. Anand Sahu, Local Ward Volunteer)"
              className="w-full text-xs px-3 py-1.5 rounded bg-white dark:bg-surface-base border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-accent text-slate-900 dark:text-slate-100"
            />
          )}
        </div>

        {/* Prototype Transparency Notice */}
        <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-white/5 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Decision Support Safety:</strong> Submitted reports undergo deterministic preliminary scoring and community confirmation. Only authorized emergency management officials can transition a report to <strong>VERIFIED</strong> status.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-white/10">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2 rounded-lg text-xs font-bold bg-accent text-slate-950 hover:bg-accent/90 transition-all flex items-center gap-1.5 shadow-md shadow-accent/10 active:scale-98"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Ground Report</span>
          </button>
        </div>
      </form>
    </div>
  );
}
