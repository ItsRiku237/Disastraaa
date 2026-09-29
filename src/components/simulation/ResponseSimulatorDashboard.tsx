'use client';

import { useState, useMemo, useCallback } from 'react';
import { isAuthorizedForOperations } from '@/lib/auth/roles';
import { AuthorityAccessGate } from '@/components/auth/AuthorityAccessGate';
import { SimulatorHeader } from './SimulatorHeader';
import { ScenarioSetupPanel } from './ScenarioSetupPanel';
import { ScenarioSummaryBanner } from './ScenarioSummaryBanner';
import { BeforeAfterComparisonGrid } from './BeforeAfterComparisonGrid';
import { RiskImpactSimulationPanel } from './RiskImpactSimulationPanel';
import { ShelterResourceSimulationPanel } from './ShelterResourceSimulationPanel';
import { RoadAlertSimulationPanel } from './RoadAlertSimulationPanel';
import { ResponseRequirementsCard } from './ResponseRequirementsCard';
import { SimulationTimelineStepper } from './SimulationTimelineStepper';
import { SimulationMapSection } from './SimulationMapSection';
import { ScenarioComparisonModal } from './ScenarioComparisonModal';
import { DEFAULT_SCENARIO_CONFIG } from '@/lib/simulation/presets';
import { runSimulation } from '@/lib/simulation/engine';
import { aggregateCommandCenterData } from '@/lib/commandCenter/aggregator';
import type {
  ScenarioConfiguration,
  SimulationResult,
  ScenarioPreset,
} from '@/lib/simulation/types';
import { ROLES, type Role } from '@/types/roles';

interface ResponseSimulatorDashboardProps {
  initialRole?: Role;
}

export function ResponseSimulatorDashboard({
  initialRole = ROLES.STATE_AUTHORITY,
}: ResponseSimulatorDashboardProps) {
  const [role, setRole] = useState<Role>(initialRole);
  const [config, setConfig] = useState<ScenarioConfiguration>(DEFAULT_SCENARIO_CONFIG);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Available Regions from Command Center priority locations
  const availableRegions = useMemo(() => {
    const ccData = aggregateCommandCenterData();
    return ccData.priorityLocations.map((l) => ({
      id: l.id,
      name: `${l.name} (${l.district})`,
    }));
  }, []);

  // Primary active simulation result
  const [result, setResult] = useState<SimulationResult>(() => runSimulation(DEFAULT_SCENARIO_CONFIG));

  // Immediate recalculation when configuration changes so all controls respond in real time
  const handleConfigChange = useCallback((newConfig: ScenarioConfiguration) => {
    setConfig(newConfig);
    setResult(runSimulation(newConfig));
  }, []);

  // Run simulation handler (with visual calculation pulse)
  const handleRunSimulation = useCallback(() => {
    setIsCalculating(true);
    setTimeout(() => {
      setResult(runSimulation(config));
      setIsCalculating(false);
    }, 150);
  }, [config]);

  // Reset scenario handler
  const handleResetScenario = useCallback(() => {
    setConfig(DEFAULT_SCENARIO_CONFIG);
    setResult(runSimulation(DEFAULT_SCENARIO_CONFIG));
  }, []);

  // Preset selection handler
  const handleSelectPreset = useCallback((preset: ScenarioPreset) => {
    const newConfig: ScenarioConfiguration = {
      id: preset.id,
      name: preset.name,
      hazard: preset.hazard,
      intensity: preset.intensity,
      duration: preset.duration,
      targetRegionId: preset.targetRegionId,
      populationExposureMultiplier: 1.0,
      advanced: preset.advanced,
    };
    setConfig(newConfig);
    setResult(runSimulation(newConfig));
  }, []);

  // Authority Access Gate
  if (!isAuthorizedForOperations(role)) {
    return (
      <div className="p-4 sm:p-6 space-y-6 animate-fade-in max-w-[1600px] mx-auto">
        <AuthorityAccessGate
          currentRole={role}
          onClearanceGranted={(newRole: Role) => setRole(newRole)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      {/* 1. Header */}
      <SimulatorHeader
        role={role}
        onRunSimulation={handleRunSimulation}
        onResetScenario={handleResetScenario}
        onSelectPreset={handleSelectPreset}
        onOpenComparison={() => setIsComparing(true)}
        isRunning={isCalculating}
      />

      {/* 2. Scenario Setup Panel */}
      <ScenarioSetupPanel
        config={config}
        onChange={handleConfigChange}
        availableRegions={availableRegions}
      />

      {/* 3. Scenario Summary Banner */}
      <ScenarioSummaryBanner result={result} />

      {/* 4. Before / After Comparison Grid */}
      <BeforeAfterComparisonGrid result={result} />

      {/* 5. Risk & Impact Simulation Panel */}
      <RiskImpactSimulationPanel result={result} />

      {/* 6. Shelter & Resource Readiness Simulation */}
      <ShelterResourceSimulationPanel result={result} />

      {/* 7. Road Conditions & Scenario Alert Conditions */}
      <RoadAlertSimulationPanel result={result} />

      {/* 8. Actionable Response Requirements Card */}
      <ResponseRequirementsCard requirements={result.responseRequirements} />

      {/* 9. Timeline Progression (T+0 to T+72h) */}
      <SimulationTimelineStepper timeline={result.timeline} />

      {/* 10. Geospatial Simulation Map */}
      <SimulationMapSection result={result} />

      {/* 11. Dual Scenario Comparison Modal */}
      {isComparing && (
        <ScenarioComparisonModal
          currentResult={result}
          onClose={() => setIsComparing(false)}
        />
      )}
    </div>
  );
}
