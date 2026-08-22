import React, { useState, useEffect } from "react";
import { STRATEGY_OPTIONS, ESCALATION_MODES, deriveSensibleDefaults, evaluateEscalationTier } from "../lib/escalation";

export default function EscalationMatrix({
  isOpen,
  onClose,
  satellites = [],
  selectedSatId = 0,
  escalationConfigs = {},
  onUpdateConfig,
  onApplyToAll,
  onSimulateUrgentEscalation
}) {
  const [activeSatId, setActiveSatId] = useState(selectedSatId || 0);

  useEffect(() => {
    if (selectedSatId !== null && selectedSatId !== undefined && selectedSatId >= 0) {
      setActiveSatId(selectedSatId);
    }
  }, [selectedSatId]);

  if (!isOpen) return null;

  const currentSat = satellites[activeSatId] || satellites[0] || {};
  const currentConfig = escalationConfigs[activeSatId] || deriveSensibleDefaults(currentSat);
  const contextDefaults = deriveSensibleDefaults(currentSat);
  const currentTier = evaluateEscalationTier(currentSat, currentConfig);

  const handleSliderChange = (field, value) => {
    onUpdateConfig(activeSatId, {
      ...currentConfig,
      [field]: parseFloat(value)
    });
  };

  const handleSelectChange = (field, value) => {
    onUpdateConfig(activeSatId, {
      ...currentConfig,
      [field]: value
    });
  };

  const handleResetToDefaults = () => {
    onUpdateConfig(activeSatId, {
      ...contextDefaults
    });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <div>
              <div style={styles.title}>ESCALATION PROTOCOL & ADAPTIVE DEFAULTS</div>
              <div style={styles.subtitle}>CONTEXT-AWARE TRANSITION ENGINE · REAL-TIME OPERATOR CONTROLS</div>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Sat Selector Ribbon */}
        <div style={styles.satRibbon}>
          {satellites.slice(0, 10).map((s, idx) => {
            const isSelected = idx === activeSatId;
            const tier = evaluateEscalationTier(s, escalationConfigs[idx]);
            return (
              <button
                key={s.id || idx}
                onClick={() => setActiveSatId(idx)}
                style={{
                  ...styles.satChip,
                  borderColor: isSelected ? "#38bdf8" : "rgba(255,255,255,0.1)",
                  background: isSelected ? "rgba(56, 189, 248, 0.15)" : "rgba(0,0,0,0.3)",
                  color: isSelected ? "#f8fafc" : "#94a3b8"
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 700 }}>{s.designation || `SAT-${idx+1}`}</span>
                <span style={{ fontSize: 7.5, color: tier.color, fontWeight: 700 }}>{tier.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div style={styles.body}>
          {/* Top Info Banner: Recorded Context */}
          <div style={styles.contextCard}>
            <div style={styles.contextHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#38bdf8", fontSize: 11, fontWeight: 700 }}>✦ RECORDED CONTEXT TELEMETRY:</span>
                <span style={{ color: "#f8fafc", fontSize: 11, fontWeight: 600 }}>{currentSat.designation}</span>
              </div>
              <div style={{ ...styles.tierBadge, background: `${currentTier.color}22`, borderColor: currentTier.color, color: currentTier.color }}>
                {currentTier.badge}
              </div>
            </div>

            <div style={styles.contextMetrics}>
              <div style={styles.metricItem}>
                <span style={styles.metricLabel}>FUEL RESERVE</span>
                <span style={{ ...styles.metricVal, color: (currentSat.propellant ?? 1) < 0.25 ? "#f43f5e" : "#38bdf8" }}>
                  {((currentSat.propellant ?? 0.5) * 100).toFixed(0)}%
                </span>
              </div>
              <div style={styles.metricItem}>
                <span style={styles.metricLabel}>MISSION PRIORITY</span>
                <span style={styles.metricVal}>{(currentSat.missionPriority ?? 5).toFixed(1)} / 10</span>
              </div>
              <div style={styles.metricItem}>
                <span style={styles.metricLabel}>ACTIVE COLLISION Pc</span>
                <span style={{ ...styles.metricVal, color: (currentSat.pc ?? 0) > 0.3 ? "#f43f5e" : "#4ade80" }}>
                  {((currentSat.pc ?? 0) * 100).toFixed(0)}%
                </span>
              </div>
              <div style={styles.metricItem}>
                <span style={styles.metricLabel}>CURRENT RECOVERY</span>
                <span style={styles.metricVal}>{(currentSat.recoveryTime ?? 3.5).toFixed(1)} hrs</span>
              </div>
            </div>

            <div style={styles.rationaleBox}>
              <span style={{ color: "#38bdf8", fontWeight: 700 }}>Context Engine Rationale: </span>
              <span style={{ color: "#cbd5e1" }}>{contextDefaults.contextRationale}</span>
            </div>
          </div>

          {/* Editable Parameters Grid */}
          <div style={styles.grid}>
            {/* Urgency Trigger Slider */}
            <div style={styles.controlBox}>
              <div style={styles.ctrlHeader}>
                <label style={styles.ctrlLabel}>URGENT ESCALATION TRIGGER (Pc)</label>
                <span style={styles.ctrlValue}>{(currentConfig.triggerPc ?? 0.38).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.70"
                step="0.01"
                value={currentConfig.triggerPc ?? 0.38}
                onChange={(e) => handleSliderChange("triggerPc", e.target.value)}
                style={styles.slider}
              />
              <div style={styles.ctrlHelp}>
                Threshold where autonomous protocol accelerates to single-round urgent bidding.
              </div>
            </div>

            {/* Emergency Evasion Threshold Slider */}
            <div style={styles.controlBox}>
              <div style={styles.ctrlHeader}>
                <label style={styles.ctrlLabel}>EMERGENCY EVASION TRIGGER (Pc)</label>
                <span style={{ ...styles.ctrlValue, color: "#f43f5e" }}>{(currentConfig.emergencyPc ?? 0.65).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.40"
                max="0.90"
                step="0.01"
                value={currentConfig.emergencyPc ?? 0.65}
                onChange={(e) => handleSliderChange("emergencyPc", e.target.value)}
                style={styles.slider}
              />
              <div style={styles.ctrlHelp}>
                Point of no return: initiates unilateral evasion thruster burst immediately.
              </div>
            </div>

            {/* Delta-V Thrust Intensity Factor */}
            <div style={styles.controlBox}>
              <div style={styles.ctrlHeader}>
                <label style={styles.ctrlLabel}>THRUST INTENSITY MULTIPLIER</label>
                <span style={{ ...styles.ctrlValue, color: "#fbbf24" }}>{(currentConfig.thrustFactor ?? 1.2).toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={currentConfig.thrustFactor ?? 1.2}
                onChange={(e) => handleSliderChange("thrustFactor", e.target.value)}
                style={styles.slider}
              />
              <div style={styles.ctrlHelp}>
                Scaled burn impulse magnitude for evasive deflection maneuvers.
              </div>
            </div>

            {/* Strategy Profile Selection */}
            <div style={styles.controlBox}>
              <div style={styles.ctrlHeader}>
                <label style={styles.ctrlLabel}>AVOIDANCE MANEUVER STRATEGY</label>
              </div>
              <select
                value={currentConfig.strategy || "OPTIMAL_COOPERATIVE"}
                onChange={(e) => handleSelectChange("strategy", e.target.value)}
                style={styles.select}
              >
                {STRATEGY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div style={styles.ctrlHelp}>
                {STRATEGY_OPTIONS.find(o => o.id === currentConfig.strategy)?.desc || "Configured burn profile."}
              </div>
            </div>

            {/* Escalation Mode Selection */}
            <div style={styles.controlBox}>
              <div style={styles.ctrlHeader}>
                <label style={styles.ctrlLabel}>ESCALATION PROTOCOL MODE</label>
              </div>
              <select
                value={currentConfig.escalationMode || "AUTONOMOUS_P2P"}
                onChange={(e) => handleSelectChange("escalationMode", e.target.value)}
                style={styles.select}
              >
                {ESCALATION_MODES.map((mode) => (
                  <option key={mode.id} value={mode.id}>
                    {mode.label}
                  </option>
                ))}
              </select>
              <div style={styles.ctrlHelp}>
                {ESCALATION_MODES.find(m => m.id === currentConfig.escalationMode)?.desc || "Handshake protocol configuration."}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div style={styles.footer}>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleResetToDefaults} style={styles.actionBtnSecondary}>
              ↺ RESET TO CONTEXT DEFAULTS
            </button>
            <button onClick={() => onApplyToAll(currentConfig)} style={styles.actionBtnSecondary}>
              ⚡ APPLY TO ALL 20 SATELLITES
            </button>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => {
                if (onSimulateUrgentEscalation) onSimulateUrgentEscalation(activeSatId);
                onClose();
              }}
              style={styles.actionBtnPrimary}
            >
              ⚡ SIMULATE URGENT ESCALATION NOW
            </button>
            <button onClick={onClose} style={styles.actionBtnDone}>
              DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16
  },
  modal: {
    width: "100%",
    maxWidth: 780,
    backgroundColor: "#080c14",
    border: "1px solid #1e293b",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 20px rgba(56, 189, 248, 0.15)",
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
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "#f8fafc",
    fontFamily: "monospace"
  },
  subtitle: {
    fontSize: 8.5,
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
  satRibbon: {
    display: "flex",
    gap: 6,
    padding: "8px 16px",
    backgroundColor: "#06090e",
    borderBottom: "1px solid #1e293b",
    overflowX: "auto"
  },
  satChip: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    padding: "4px 10px",
    border: "1px solid",
    cursor: "pointer",
    borderRadius: 2,
    fontFamily: "monospace",
    whiteSpace: "nowrap"
  },
  body: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    maxHeight: "65vh",
    overflowY: "auto"
  },
  contextCard: {
    backgroundColor: "#0d1522",
    border: "1px solid #1e293b",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  contextHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  tierBadge: {
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: "0.08em",
    padding: "2px 8px",
    border: "1px solid",
    fontFamily: "monospace"
  },
  contextMetrics: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
    backgroundColor: "#06090e",
    padding: 10,
    border: "1px solid rgba(255,255,255,0.05)"
  },
  metricItem: {
    display: "flex",
    flexDirection: "column",
    gap: 2
  },
  metricLabel: {
    fontSize: 7.5,
    color: "#64748b",
    fontFamily: "monospace",
    letterSpacing: "0.08em"
  },
  metricVal: {
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "monospace",
    color: "#f8fafc"
  },
  rationaleBox: {
    fontSize: 9,
    lineHeight: 1.4,
    fontFamily: "monospace",
    backgroundColor: "rgba(56, 189, 248, 0.05)",
    borderLeft: "2px solid #38bdf8",
    padding: "6px 10px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12
  },
  controlBox: {
    backgroundColor: "#0d1522",
    border: "1px solid #1e293b",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6
  },
  ctrlHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  ctrlLabel: {
    fontSize: 8.5,
    fontWeight: 700,
    color: "#94a3b8",
    letterSpacing: "0.08em",
    fontFamily: "monospace"
  },
  ctrlValue: {
    fontSize: 12,
    fontWeight: 700,
    color: "#38bdf8",
    fontFamily: "monospace"
  },
  slider: {
    width: "100%",
    accentColor: "#38bdf8",
    cursor: "pointer",
    margin: "4px 0"
  },
  ctrlHelp: {
    fontSize: 8,
    color: "#64748b",
    lineHeight: 1.3,
    fontFamily: "monospace"
  },
  select: {
    backgroundColor: "#06090e",
    border: "1px solid #1e293b",
    color: "#f8fafc",
    padding: "6px 8px",
    fontSize: 9.5,
    fontFamily: "monospace",
    cursor: "pointer",
    outline: "none"
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#0d1522",
    borderTop: "1px solid #1e293b",
    flexWrap: "wrap",
    gap: 10
  },
  actionBtnSecondary: {
    backgroundColor: "transparent",
    border: "1px solid #334155",
    color: "#94a3b8",
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: "0.06em",
    padding: "6px 12px",
    cursor: "pointer",
    fontFamily: "monospace",
    transition: "all 0.15s"
  },
  actionBtnPrimary: {
    backgroundColor: "rgba(232, 160, 32, 0.15)",
    border: "1px solid #e8a020",
    color: "#e8a020",
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: "0.06em",
    padding: "6px 14px",
    cursor: "pointer",
    fontFamily: "monospace"
  },
  actionBtnDone: {
    backgroundColor: "#38bdf8",
    border: "1px solid #38bdf8",
    color: "#06090e",
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: "0.06em",
    padding: "6px 16px",
    cursor: "pointer",
    fontFamily: "monospace"
  }
};
