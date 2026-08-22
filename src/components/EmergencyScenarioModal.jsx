import React, { useState } from "react";

export const SCENARIOS = [
  {
    id: "MULTI_SATELLITE_CASCADE_CONJUNCTION",
    title: "⚡ SIMULTANEOUS MULTI-SATELLITE CASCADE CONJUNCTION",
    severity: "CLUSTER CRISIS",
    color: "#f43f5e",
    summary: "Simulates simultaneous convergent collision threats across 6+ intersecting satellites at the exact same orbital intersection node.",
    mathExplanation: "In a multi-spacecraft rush, uncoordinated avoidance leads to chaos or secondary collisions. Our protocol executes concurrent Nash equilibrium auctions across all intersecting pairs: each satellite computes its deterministic bid C_bid = α·(Pc·100/Fuel) + β·Priority + γ·T_rec. A global Pareto right-of-way ranking is established in < 50ms. High-value / low-propellant assets retain their nominal track, while yielding satellites execute orthogonal, de-conflicted cross-track burns with zero human delay.",
    effects: [
      "Triggers simultaneous high-Pc conjunctions across 6+ satellite pairs",
      "Concurrent decentralized Nash bidding executed across all crossing nodes",
      "Deterministically ranks right-of-way without circular deadlocks",
      "Low-bid assets execute coordinated orthogonal avoidance burns",
      "Cryptographic receipts sequentially logged to SHA-256 audit ledger"
    ],
    badgeText: "MULTI-SAT CLUSTER"
  },
  {
    id: "SOLAR_STORM_CME",
    title: "☀️ CORONAL MASS EJECTION / SOLAR RADIATION STORM",
    severity: "FLEET EMERGENCY",
    color: "#fbbf24",
    summary: "Simulates extreme geomagnetic storm and atmospheric expansion increasing collision risk (Pc > 0.65).",
    mathExplanation: "Elevated solar flux distorts GPS tracking and widens positional covariance ellipses. Pc jumps past the critical threshold (Pc ≥ 0.65), triggering the autonomous Tier 3 Emergency Protocol across crossing orbital planes without waiting for multi-round ground station relays.",
    effects: [
      "Pc elevated to 0.68+ across multiple orbital planes",
      "Fleet-wide transition to TIER 3 (EMERGENCY)",
      "Unilateral fast-track evasion maneuvers executed",
      "Full cryptographic SHA-256 receipts logged to ledger"
    ],
    badgeText: "TIER 3 ESCALATION"
  },
  {
    id: "DEBRIS_SWARM",
    title: "💥 HYPER-VELOCITY ORBITAL DEBRIS SWARM",
    severity: "URGENT",
    color: "#e8a020",
    summary: "Simulates sudden proximity to a dense anti-satellite / breakup fragmentation field.",
    mathExplanation: "With multiple close-proximity debris vectors, normal nominal separation is insufficient. The engine activates RAPID_CROSS_TRACK deflection with a 1.8× thrust multiplier to execute a steep out-of-plane inclination shift and clear the crowded altitude shell.",
    effects: [
      "Escalates to RAPID_CROSS_TRACK evasion mode",
      "Thrust intensity multiplied by 1.8×",
      "Cross-track delta-v burst clears congested shell",
      "Post-maneuver trajectory recorded in audit trail"
    ],
    badgeText: "CROSS-TRACK EVASION"
  },
  {
    id: "CREWED_DEFENSE_PRIORITY",
    title: "🛡️ CREWED / STRATEGIC DEFENSE INSERTION",
    severity: "HIGH PRIORITY",
    color: "#38bdf8",
    summary: "Simulates high-value space asset insertion (Crewed Station / Early Warning Node).",
    mathExplanation: "The asset's Mission Priority is set to maximum (10.0 / 10.0). In the bid formula, β·Priority contributes the maximum score weight (8.0+), guaranteeing the strategic asset maintains its designated orbit slot while commercial nodes give way.",
    effects: [
      "Mission priority set to 10.0 / 10.0",
      "Activates PRIORITY_ORBIT_HOLD profile",
      "Maximum bid resistance asserted against all cross-traffic",
      "Audit trail documents priority right-of-way compliance"
    ],
    badgeText: "ORBIT RETENTION HOLD"
  }
];

export default function EmergencyScenarioModal({
  isOpen,
  onClose,
  satellites = [],
  onInjectScenario
}) {
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0].id);
  const [targetSatId, setTargetSatId] = useState(0);

  if (!isOpen) return null;

  const currentScenario = SCENARIOS.find(s => s.id === selectedScenario) || SCENARIOS[0];

  const handleLaunch = () => {
    onInjectScenario(currentScenario.id, targetSatId);
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🚨</span>
            <div>
              <div style={styles.title}>EMERGENCY SCENARIO INJECTOR & RUSH SIMULATOR</div>
              <div style={styles.subtitle}>TEST GAME-THEORETIC RESILIENCE UNDER SUDDEN ORBITAL CRISES</div>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* Scenario Selector Tabs */}
          <div style={styles.scenarioTabs}>
            {SCENARIOS.map(sc => {
              const isSel = sc.id === selectedScenario;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc.id)}
                  style={{
                    ...styles.tabBtn,
                    borderColor: isSel ? sc.color : "rgba(255,255,255,0.1)",
                    background: isSel ? `${sc.color}22` : "rgba(0,0,0,0.3)",
                    color: isSel ? "#f8fafc" : "#94a3b8"
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 700 }}>{sc.title.split(" / ")[0]}</span>
                  <span style={{ fontSize: 8, color: sc.color, fontWeight: 600 }}>{sc.badgeText}</span>
                </button>
              );
            })}
          </div>

          {/* Scenario Detail Card */}
          <div style={{ ...styles.detailCard, borderColor: currentScenario.color }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: currentScenario.color, fontFamily: "monospace" }}>
                {currentScenario.title}
              </div>
              <span style={{ ...styles.severityBadge, color: currentScenario.color, borderColor: currentScenario.color }}>
                {currentScenario.severity}
              </span>
            </div>

            <div style={{ fontSize: 9.5, color: "#e2e8f0", lineHeight: 1.4, fontFamily: "monospace" }}>
              {currentScenario.summary}
            </div>

            {/* Target Satellite Selector (for satellite-specific emergencies) */}
            {currentScenario.id !== "SOLAR_STORM_CME" && currentScenario.id !== "MULTI_SATELLITE_CASCADE_CONJUNCTION" && (
              <div style={styles.targetRow}>
                <span style={{ fontSize: 8.5, color: "#94a3b8", fontFamily: "monospace", fontWeight: 600 }}>
                  TARGET PRIMARY SPACECRAFT:
                </span>
                <select
                  value={targetSatId}
                  onChange={(e) => setTargetSatId(parseInt(e.target.value))}
                  style={styles.select}
                >
                  {satellites.map((s, idx) => (
                    <option key={s.id || idx} value={idx}>
                      {s.designation} (Fuel: {((s.propellant || 0.5) * 100).toFixed(0)}%, Pri: {(s.missionPriority || 5).toFixed(1)})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {currentScenario.id === "MULTI_SATELLITE_CASCADE_CONJUNCTION" && (
              <div style={styles.targetRow}>
                <span style={{ fontSize: 8.5, color: "#f43f5e", fontFamily: "monospace", fontWeight: 700 }}>
                  💥 CONVERGENT CLUSTER NODES:
                </span>
                <span style={{ fontSize: 8.5, color: "#e2e8f0", fontFamily: "monospace" }}>
                  ASTRA-1, SOLARIS-3, NEXUS-7, STARLINK-42, COSMOS-88, SENTINEL-2 (6 SPACECRAFT)
                </span>
              </div>
            )}

            {/* Mathematical Formula Rationale */}
            <div style={styles.mathBox}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#38bdf8", marginBottom: 4 }}>
                📐 HOW OUR GAME-THEORY FORMULA RESOLVES THIS RUSH:
              </div>
              <div style={{ fontSize: 8.5, color: "#cbd5e1", lineHeight: 1.45 }}>
                {currentScenario.mathExplanation}
              </div>
            </div>

            {/* Simulated Effects List */}
            <div style={styles.effectsBox}>
              <div style={{ fontSize: 8.5, fontWeight: 700, color: "#94a3b8", marginBottom: 4 }}>
                ⚡ SIMULATION ACTIONS EXECUTED:
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {currentScenario.effects.map((eff, i) => (
                  <div key={i} style={{ fontSize: 8, color: "#a5f3fc", display: "flex", alignItems: "center", gap: 5 }}>
                    <span>▶</span>
                    <span>{eff}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelBtn}>
            CANCEL
          </button>
          <button onClick={handleLaunch} style={{ ...styles.launchBtn, backgroundColor: currentScenario.color, color: "#06090e" }}>
            🚨 INJECT &amp; SIMULATE EMERGENCY NOW
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1100,
    padding: 16
  },
  modal: {
    width: "100%",
    maxWidth: 740,
    backgroundColor: "#06090e",
    border: "1px solid #1e293b",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 25px rgba(244, 63, 94, 0.2)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 20px",
    backgroundColor: "#0d1522",
    borderBottom: "1px solid #1e293b"
  },
  title: {
    fontSize: 12.5,
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "#f8fafc",
    fontFamily: "monospace"
  },
  subtitle: {
    fontSize: 8,
    color: "#64748b",
    letterSpacing: "0.08em",
    marginTop: 2,
    fontFamily: "monospace"
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: 16,
    cursor: "pointer",
    padding: "4px 8px"
  },
  body: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxHeight: "68vh",
    overflowY: "auto"
  },
  scenarioTabs: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 6
  },
  tabBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    padding: "8px 6px",
    border: "1px solid",
    cursor: "pointer",
    borderRadius: 2,
    fontFamily: "monospace",
    textAlign: "center"
  },
  detailCard: {
    backgroundColor: "#0d1522",
    border: "1px solid",
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  severityBadge: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: "0.08em",
    padding: "2px 8px",
    border: "1px solid",
    fontFamily: "monospace"
  },
  targetRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#06090e",
    padding: "6px 10px",
    border: "1px solid rgba(255,255,255,0.08)"
  },
  select: {
    backgroundColor: "#0d1522",
    border: "1px solid #334155",
    color: "#f8fafc",
    padding: "4px 8px",
    fontSize: 9,
    fontFamily: "monospace",
    cursor: "pointer",
    flex: 1
  },
  mathBox: {
    backgroundColor: "rgba(56, 189, 248, 0.06)",
    borderLeft: "3px solid #38bdf8",
    padding: "8px 12px",
    fontFamily: "monospace"
  },
  effectsBox: {
    backgroundColor: "#06090e",
    border: "1px solid rgba(255,255,255,0.06)",
    padding: "8px 12px",
    fontFamily: "monospace"
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#0d1522",
    borderTop: "1px solid #1e293b"
  },
  cancelBtn: {
    backgroundColor: "transparent",
    border: "1px solid #334155",
    color: "#94a3b8",
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: "0.06em",
    padding: "6px 14px",
    cursor: "pointer",
    fontFamily: "monospace"
  },
  launchBtn: {
    border: "none",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.08em",
    padding: "8px 18px",
    cursor: "pointer",
    fontFamily: "monospace"
  }
};
