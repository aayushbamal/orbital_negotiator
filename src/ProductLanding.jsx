import React from 'react';
import Hero from './Hero';

const T = {
  bg: "#080C12",
  surface: "#0E1520",
  surfaceRaised: "#131D2C",
  border: "#1A2A3E",
  borderActive: "#254060",
  inkPrimary: "#C8D8E8",
  inkSecondary: "#4A6080",
  inkMuted: "#1E2D42",
  data: "#5BA8D0",
  alert: "#E8A020",
  ok: "#4CAF7D",
  critical: "#C84040",
};

const F = {
  mono: "'IBM Plex Mono',monospace",
  cond: "'IBM Plex Sans Condensed',sans-serif",
};

// Notched Panel container matching the visualizer HUD style
function LandingPanel({ children, style, outlineColor }) {
  const col = outlineColor || "rgba(91, 168, 208, 0.35)";
  return (
    <div style={{
      position: "relative",
      background: "rgba(14, 21, 32, 0.65)",
      backdropFilter: "blur(12px)",
      border: `1px solid rgba(26, 42, 62, 0.35)`,
      boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.35)",
      padding: "24px",
      transition: "border-color 0.22s ease",
      ...style
    }}>
      {/* Corner notches */}
      <div style={{ position: "absolute", width: 6, height: 6, pointerEvents: "none", top: -1, left: -1, borderLeft: `2px solid ${col}`, borderTop: `2px solid ${col}` }} />
      <div style={{ position: "absolute", width: 6, height: 6, pointerEvents: "none", top: -1, right: -1, borderRight: `2px solid ${col}`, borderTop: `2px solid ${col}` }} />
      <div style={{ position: "absolute", width: 6, height: 6, pointerEvents: "none", bottom: -1, left: -1, borderLeft: `2px solid ${col}`, borderBottom: `2px solid ${col}` }} />
      <div style={{ position: "absolute", width: 6, height: 6, pointerEvents: "none", bottom: -1, right: -1, borderRight: `2px solid ${col}`, borderBottom: `2px solid ${col}` }} />
      {children}
    </div>
  );
}

export default function ProductLanding({ onLaunch }) {
  return (
    <div style={{ background: T.bg, color: T.inkPrimary, fontFamily: F.cond, minHeight: "100vh", overflowX: "hidden" }}>
      {/* Glowing tech grid overlay */}
      <style>{`
        .bg-grid {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(26, 42, 62, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(26, 42, 62, 0.15) 1px, transparent 1px);
        }
        .text-glow {
          text-shadow: 0 0 10px rgba(91, 168, 208, 0.4);
        }
        .header-btn {
          background: transparent;
          border: 1px solid ${T.border};
          color: ${T.inkPrimary};
          font-family: ${F.mono};
          font-size: 11px;
          padding: 8px 18px;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.05em;
        }
        .header-btn:hover {
          background: rgba(91, 168, 208, 0.08);
          border-color: ${T.data};
          box-shadow: 0 0 12px rgba(91, 168, 208, 0.2);
        }
        .feature-card:hover {
          border-color: ${T.data} !important;
        }
      `}</style>

      {/* Top Header Bar */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 24px",
        height: 60,
        borderBottom: `1px solid ${T.border}`,
        background: "rgba(14, 21, 32, 0.85)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontFamily: F.cond, fontWeight: 800, fontSize: '15px', letterSpacing: '0.12em', color: T.inkPrimary }}>
            ORBITAL <span style={{ color: T.data }}>NEGOTIATOR</span>
          </span>
          <span style={{ fontFamily: F.mono, fontSize: '8px', color: T.inkSecondary, letterSpacing: '0.08em' }}>
            DECENTRALIZED SPACE TRAFFIC MANAGEMENT
          </span>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ fontFamily: F.mono, fontSize: '9px', color: T.ok, display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "6px", height: "6px", backgroundColor: T.ok, borderRadius: "50%", display: "inline-block", boxShadow: `0 0 8px ${T.ok}` }} />
            SYSTEM NOMINAL
          </span>
          <button className="header-btn" onClick={onLaunch}>LAUNCH CONTROL ROOM</button>
        </div>
      </header>

      {/* Hero Shader Section */}
      <Hero
        trustBadge={{
          text: "ACTIVE DECENTRALIZED TRAFFIC MANAGEMENT PROTOCOL · v4.0",
          icons: ["✦", "✦", "✦"]
        }}
        headline={{
          line1: "AUTONOMOUS SPACE TRAFFIC COORDINATION",
          line2: "AND ORBITAL COLLISION NEGOTIATION"
        }}
        subtitle="A deterministic, decentralized orbital coordination engine designed to safeguard low-Earth orbit. Utilizing game-theoretic auction bids, spacecraft directly negotiate crossing paths, log tamper-evident agreements, and execute automated evasive maneuvers in real-time."
        buttons={{
          primary: {
            text: "LAUNCH SIMULATOR CONTROL ROOM",
            onClick: onLaunch
          },
          secondary: {
            text: "EXPLORE SYSTEM ARCHITECTURE",
            onClick: () => {
              const element = document.getElementById("architecture");
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }}
      />

      {/* Main product showcase */}
      <main className="bg-grid" style={{ padding: "80px 24px", maxWidth: "1200px", marginLeft: "auto", marginRight: "auto" }}>
        
        {/* Core Stats Section */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "80px" }}>
          <LandingPanel outlineColor={T.border}>
            <div style={{ fontFamily: F.mono, fontSize: "9px", color: T.inkSecondary }}>CORE OPERATIONS</div>
            <div style={{ fontFamily: F.cond, fontSize: "32px", fontWeight: 800, color: T.data, marginTop: "6px" }} className="text-glow">20 Sats</div>
            <div style={{ fontFamily: F.mono, fontSize: "10px", color: T.inkPrimary, marginTop: "4px" }}>Simulated Real-Time Physics Mesh</div>
          </LandingPanel>
          <LandingPanel outlineColor={T.border}>
            <div style={{ fontFamily: F.mono, fontSize: "9px", color: T.inkSecondary }}>SAFETY ENVELOPE</div>
            <div style={{ fontFamily: F.cond, fontSize: "32px", fontWeight: 800, color: T.ok, marginTop: "6px" }} className="text-glow">100%</div>
            <div style={{ fontFamily: F.mono, fontSize: "10px", color: T.inkPrimary, marginTop: "4px" }}>Collision Avoidance Success Rate</div>
          </LandingPanel>
          <LandingPanel outlineColor={T.border}>
            <div style={{ fontFamily: F.mono, fontSize: "9px", color: T.inkSecondary }}>REACTION LATENCY</div>
            <div style={{ fontFamily: F.cond, fontSize: "32px", fontWeight: 800, color: T.alert, marginTop: "6px" }} className="text-glow">&lt; 80ms</div>
            <div style={{ fontFamily: F.mono, fontSize: "10px", color: T.inkPrimary, marginTop: "4px" }}>Deterministic Resolve Latency</div>
          </LandingPanel>
          <LandingPanel outlineColor={T.border}>
            <div style={{ fontFamily: F.mono, fontSize: "9px", color: T.inkSecondary }}>AUDIT PROTOCOL</div>
            <div style={{ fontFamily: F.cond, fontSize: "32px", fontWeight: 800, color: T.inkPrimary, marginTop: "6px" }}>SHA-256</div>
            <div style={{ fontFamily: F.mono, fontSize: "10px", color: T.inkPrimary, marginTop: "4px" }}>Tamper-Evident Cryptographic Logs</div>
          </LandingPanel>
        </section>

        {/* Features Grid Section */}
        <section id="architecture" style={{ marginBottom: "80px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={{ fontFamily: F.mono, fontSize: "10px", color: T.data, letterSpacing: "0.15em" }}>SYSTEM PROTOCOLS</span>
            <h2 style={{ fontSize: "32px", fontWeight: 800, margin: "8px 0 0", letterSpacing: "-0.01em" }}>DECENTRALIZED COORDINATION DESIGN</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
            
            <LandingPanel className="feature-card" outlineColor={T.border}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "20px", color: T.data }}>🛡️</span>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px" }}>Deterministic Bidding Engine</h3>
                  <p style={{ margin: 0, fontSize: "12px", color: T.inkSecondary, lineHeight: 1.6 }}>
                    Sats evaluate dynamic fuel capacities, mission priorities, and recovery margins in real-time to compute collision bids. The satellite with the higher bid retains its path, while the lower bid initiates automated plane corrections.
                  </p>
                </div>
              </div>
            </LandingPanel>

            <LandingPanel className="feature-card" outlineColor={T.border}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "20px", color: T.ok }}>🔗</span>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px" }}>SHA-256 Crytographic Logs</h3>
                  <p style={{ margin: 0, fontSize: "12px", color: T.inkSecondary, lineHeight: 1.6 }}>
                    Every transaction and evasive maneuver agreement is signed and committed to a cryptographic ledger. The ledger hashes the state transitions, creating a tamper-evident audit trail for insurers and regulators.
                  </p>
                </div>
              </div>
            </LandingPanel>

            <LandingPanel className="feature-card" outlineColor={T.border}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "20px", color: T.alert }}>📡</span>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px" }}>Tactical 3D Radar sweeps</h3>
                  <p style={{ margin: 0, fontSize: "12px", color: T.inkSecondary, lineHeight: 1.6 }}>
                    Launch the control room to preview orbital paths in full 3D interactive graphics. Replay resolved events on a tactical radar visualizer detailing velocity vectors, range markers, and safety zones.
                  </p>
                </div>
              </div>
            </LandingPanel>

            <LandingPanel className="feature-card" outlineColor={T.border}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "20px", color: T.critical }}>🛸</span>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px" }}>Zero-Station Dependency</h3>
                  <p style={{ margin: 0, fontSize: "12px", color: T.inkSecondary, lineHeight: 1.6 }}>
                    Avoid ground-link coordination lag. Spacecraft calculate avoidance paths autonomously using localized crosslink communication, resolving high-risk conjunctions even under ground station outages.
                  </p>
                </div>
              </div>
            </LandingPanel>

          </div>
        </section>

        {/* Math & Economics section */}
        <section style={{ display: "flex", flexDirection: "column", gap: "32px", alignItems: "stretch", marginBottom: "40px" }}>
          <LandingPanel outlineColor={T.borderActive} style={{ padding: "40px" }}>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <span style={{ fontFamily: F.mono, fontSize: "10px", color: T.data }}>GAME-THEORETIC MECHANICS</span>
              <h2 style={{ fontSize: "28px", fontWeight: 800, margin: "6px 0 0" }}>Bidding Cost Economics</h2>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <p style={{ margin: "0 0 16px", fontSize: "13px", lineHeight: 1.6, color: T.inkSecondary }}>
                  The STM Protocol relies on a deterministic auction model to distribute delta-v fuel costs fairly. Each satellite coordinates its maneuver bids directly using local parameters:
                </p>
                <ul style={{ paddingLeft: "20px", fontSize: "12px", color: T.inkSecondary, display: "flex", flexDirection: "column", gap: "8px", margin: 0 }}>
                  <li><strong>α (1.2):</strong> Weight coefficient for proportional fuel usage relative to propellant reserve.</li>
                  <li><strong>β (0.8):</strong> Weight coefficient for orbital mission priority.</li>
                  <li><strong>γ (0.5):</strong> Weight coefficient for recovery timeframe.</li>
                </ul>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", background: "rgba(0,0,0,0.25)", border: `1px solid ${T.border}`, padding: "20px" }}>
                <div style={{ fontFamily: F.mono, fontSize: "18px", color: T.data }}>C_bid = α·(Δv / M_prop) + β·P_miss + γ·T_rec</div>
                <div style={{ fontFamily: F.mono, fontSize: "9px", color: T.inkSecondary }}>DETERMINISTIC BID FORMULA LOGIC</div>
              </div>
            </div>
          </LandingPanel>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${T.border}`, background: T.surface, padding: "32px 24px", textAlign: "center", fontSize: "11px", color: T.inkSecondary }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span>ORBITAL NEGOTIATOR PROTOCOL · PROTOTYPE v4.0</span>
          <span>© 2026 DECENTRALIZED SPACE TRAFFIC PROTOCOLS. ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
    </div>
  );
}
