/**
 * Orbital Negotiator — Escalation Design & Adaptive Defaults Engine
 * 
 * Manages the multi-tiered escalation lifecycle:
 * - Tier 1: NOMINAL (Standard orbital monitoring & passive crosslink)
 * - Tier 2: URGENT (Early warning, fast-track bidding, tightened collision margin)
 * - Tier 3: EMERGENCY (Unilateral delta-v evasion, fail-safe override)
 * 
 * Derives context-aware sensible defaults from live telemetry while keeping
 * every parameter fully operator-editable.
 */

export const STRATEGY_OPTIONS = [
  { id: "OPTIMAL_COOPERATIVE", label: "Optimal Cooperative (Standard Δv)", desc: "Balanced peer-to-peer bidding based on collective fleet efficiency." },
  { id: "MIN_FUEL_DEFLECTION", label: "Min-Fuel Deflection (Radial Burn)", desc: "Energy-saving low-thrust burn for fuel-constrained assets." },
  { id: "RAPID_CROSS_TRACK", label: "Rapid Cross-Track (Out-of-Plane)", desc: "Decisive out-of-plane shift to clear heavily congested corridors quickly." },
  { id: "PRIORITY_ORBIT_HOLD", label: "Priority Orbit Hold (High Resistance)", desc: "Aggressive bid resistance for critical payloads and defense nodes." }
];

export const ESCALATION_MODES = [
  { id: "AUTONOMOUS_P2P", label: "Autonomous P2P (Standard)", desc: "Sub-100ms crosslink negotiation directly between flight computers." },
  { id: "FAST_TRACK_BID", label: "Fast-Track Single Round", desc: "Shortened 1-round emergency bidding window for rapid-approach encounters." },
  { id: "UNILATERAL_EVASION", label: "Unilateral Emergency Evasion", desc: "Automated burn triggered without waiting for handshake response." }
];

/**
 * Calculates sensible default parameters based on recorded satellite context.
 * @param {Object} sat - The satellite object with telemetry
 * @param {Array} encounterHistory - Past close approach events for this satellite
 * @returns {Object} Sensible default escalation configuration
 */
export function deriveSensibleDefaults(sat, encounterHistory = []) {
  if (!sat) {
    return {
      triggerPc: 0.38,
      emergencyPc: 0.65,
      strategy: "OPTIMAL_COOPERATIVE",
      thrustFactor: 1.2,
      escalationMode: "AUTONOMOUS_P2P",
      contextRationale: "Nominal Fleet Baseline: Standard cooperative P2P negotiation protocol applied."
    };
  }

  const fuel = sat.propellant ?? 0.5;
  const priority = sat.missionPriority ?? 5;
  const pastEncounters = Array.isArray(encounterHistory) ? encounterHistory.length : 0;

  const isCriticalFuel = fuel < 0.20;
  const isLowFuel = fuel < 0.35;
  const isHighPriority = priority >= 7.5;
  const isFrequentEncounter = pastEncounters >= 2;

  // 1. Urgency Escalation Trigger (Pc threshold where state moves from Normal to Urgent)
  let triggerPc = 0.38;
  if (isCriticalFuel) {
    triggerPc = 0.25; // Trigger earlier to avoid late, fuel-expensive emergency maneuvers
  } else if (isLowFuel) {
    triggerPc = 0.30;
  } else if (isFrequentEncounter) {
    triggerPc = 0.32;
  } else if (isHighPriority) {
    triggerPc = 0.42; // High-priority assets tolerate standard separation before escalating
  }

  // 2. Emergency Evasion Trigger (Pc threshold for unilateral evasion burst)
  let emergencyPc = 0.65;
  if (isCriticalFuel) {
    emergencyPc = 0.55;
  } else if (isFrequentEncounter) {
    emergencyPc = 0.60;
  }

  // 3. Maneuver Strategy Profile
  let strategy = "OPTIMAL_COOPERATIVE";
  if (isCriticalFuel) {
    strategy = "MIN_FUEL_DEFLECTION";
  } else if (isHighPriority) {
    strategy = "PRIORITY_ORBIT_HOLD";
  } else if (isFrequentEncounter) {
    strategy = "RAPID_CROSS_TRACK";
  }

  // 4. Delta-V Thrust Intensity Multiplier
  let thrustFactor = 1.2;
  if (isCriticalFuel) {
    thrustFactor = 0.9;
  } else if (isHighPriority) {
    thrustFactor = 1.5;
  } else if (isFrequentEncounter) {
    thrustFactor = 1.8;
  }

  // 5. Escalation Mode
  let escalationMode = "AUTONOMOUS_P2P";
  if (isCriticalFuel) {
    escalationMode = "FAST_TRACK_BID";
  } else if (isFrequentEncounter) {
    escalationMode = "UNILATERAL_EVASION";
  }

  // 6. Formulate Context Rationale
  let reasons = [];
  if (isCriticalFuel) reasons.push(`Critical Fuel (${(fuel * 100).toFixed(0)}%)`);
  else if (isLowFuel) reasons.push(`Low Fuel (${(fuel * 100).toFixed(0)}%)`);
  if (isHighPriority) reasons.push(`High Mission Priority (${priority.toFixed(1)}/10)`);
  if (isFrequentEncounter) reasons.push(`Repeated Encounters (${pastEncounters} events)`);

  let contextRationale = reasons.length > 0
    ? `Adaptive Defaults Applied: ${reasons.join(", ")}. Escalation threshold adjusted to Pc = ${triggerPc.toFixed(2)} with '${strategy.replace(/_/g, " ")}' profile.`
    : "Nominal State: Standard cooperative P2P negotiation profile applied.";

  return {
    triggerPc,
    emergencyPc,
    strategy,
    thrustFactor,
    escalationMode,
    contextRationale
  };
}

/**
 * Evaluates the current active escalation tier for a satellite.
 * @param {Object} sat - The satellite telemetry
 * @param {Object} config - The active escalation config for this satellite
 * @returns {Object} Tier status with label and color
 */
export function evaluateEscalationTier(sat, config = {}) {
  const currentPc = sat?.pc ?? 0;
  const triggerPc = config.triggerPc ?? 0.38;
  const emergencyPc = config.emergencyPc ?? 0.65;

  if (currentPc >= emergencyPc) {
    return {
      tier: 3,
      label: "EMERGENCY",
      color: "#f43f5e",
      badge: "T3 (CRITICAL)",
      action: "Unilateral Emergency Evasion Burst"
    };
  }

  if (currentPc >= triggerPc || (sat?.propellant ?? 1) < 0.15) {
    return {
      tier: 2,
      label: "URGENT",
      color: "#fbbf24",
      badge: "T2 (URGENT)",
      action: "Fast-Track Autonomous Negotiation"
    };
  }

  return {
    tier: 1,
    label: "NOMINAL",
    color: "#38bdf8",
    badge: "T1 (NOMINAL)",
    action: "Standard P2P Crosslink Monitoring"
  };
}
