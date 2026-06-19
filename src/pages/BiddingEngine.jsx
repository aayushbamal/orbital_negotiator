import React from 'react';
import PageLayout, { CYAN, MUTED, MONO, SANS, SURFACE, BORDER, TEXT } from './PageLayout';

const sectionDivider = {
  borderTop: `1px solid ${BORDER}`,
  paddingTop: 32,
  marginTop: 32,
};

const h2Style = {
  color: '#f0f4f8',
  fontSize: '1.2rem',
  marginBottom: 12,
  fontFamily: SANS,
  fontWeight: 600,
};

const bodyText = {
  color: MUTED,
  fontSize: '0.9rem',
  lineHeight: 1.8,
  fontFamily: SANS,
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: MONO,
  fontSize: '0.82rem',
};

const thStyle = {
  textAlign: 'left',
  padding: '10px 14px',
  color: CYAN,
  borderBottom: `1px solid ${BORDER}`,
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  fontSize: '0.75rem',
};

const tdStyle = {
  padding: '10px 14px',
  color: MUTED,
  borderBottom: `1px solid rgba(74,96,128,0.15)`,
  lineHeight: 1.6,
};

const TIERS = [
  { tier: '1', label: 'CRITICAL', w: '2.0', desc: 'Crewed vehicles (ISS, Crew Dragon, Shenzhou), life-safety priority' },
  { tier: '2', label: 'HIGH',     w: '1.5', desc: 'Active science or commercial mission with operational payload' },
  { tier: '3', label: 'MEDIUM',   w: '1.0', desc: 'Standard operational satellite in nominal mission phase' },
  { tier: '4', label: 'LOW',      w: '0.6', desc: 'Decommissioned or passivated spacecraft with residual propellant' },
];

const EDGE_CASES = [
  {
    code: 'E-001',
    name: 'TIE',
    trigger: 'Both operators produce identical bid values B_i = B_j',
    resolution: 'Orbital altitude tie-break: the satellite at higher mean altitude yields (lower ΔV cost to raise perigee). If altitudes are within 2 km, spacecraft with lower NORAD catalog ID maneuvers.',
  },
  {
    code: 'E-002',
    name: 'NO_BID',
    trigger: 'Bid timeout — no BID_SEALED received within 200 ms window',
    resolution: 'Ground fallback path activated. Both operators receive an ERROR_REJECT E002 frame. Conjunction is escalated to the operator\'s Mission Control via the CCSDS housekeeping channel.',
  },
  {
    code: 'E-003',
    name: 'INVALID_BID',
    trigger: 'Malformed BID_OPEN pre-image; commitment hash does not match',
    resolution: 'Peer immediately rejects the bid and broadcasts ERROR_REJECT E003. A 50 ms retry window opens for the offending party to re-submit a valid sealed bid. After one retry, ground fallback is triggered.',
  },
];

const PHASES = [
  {
    n: '01',
    name: 'Sealed Bid Broadcast',
    detail: 'Each operator\'s engine computes its bid score B_i using current telemetry, hashes it with a 256-bit nonce (H = SHA3-256(B_i ∥ nonce)), and transmits the commitment hash in a BID_SEALED (0x02) message. Neither party can observe the other\'s raw bid at this stage.',
  },
  {
    n: '02',
    name: 'Bid Opening',
    detail: 'After both sealed bids are received (or after the 200 ms timeout), each party broadcasts a BID_OPEN (0x03) message containing the raw bid value and the nonce. Peers independently verify H = SHA3-256(B_i ∥ nonce) to confirm bid integrity.',
  },
  {
    n: '03',
    name: 'Nash Resolution',
    detail: 'The resolver compares revealed bids. The operator with the higher B_i score is designated the yield bidder (i.e., they have more reserve capacity, so it is optimal for them to maneuver). The opponent retains its orbit. This assignment constitutes the unique Nash equilibrium of the auction.',
  },
  {
    n: '04',
    name: 'Maneuver Assignment',
    detail: 'The yield bidder computes the optimal avoidance burn using the onboard maneuver planner (SGP4 + J2 perturbations). It transmits MANEUVER_AGREE (0x04) followed by MANEUVER_SIGN (0x05) with an Ed25519 signature over the burn epoch, delta-V vector, and session ID. The ledger audit hash is broadcast on confirmation.',
  },
];

export default function BiddingEngine() {
  return (
    <PageLayout
      badge="SYSTEM — ENGINE"
      title="Game-Theoretic Bidding Engine"
      subtitle="The Orbital Negotiator bidding engine resolves collision avoidance priority using a sealed-bid Nash equilibrium auction weighted by delta-V reserve, orbital priority tier, and fuel cost."
    >
      {/* Section 1: Economic Model */}
      <section>
        <h2 style={h2Style}>Economic Model</h2>
        <p style={bodyText}>
          The bidding engine is grounded in non-cooperative game theory. Each satellite operator is modelled
          as a rational agent seeking to minimise its own fuel expenditure while guaranteeing collision
          avoidance. The auction is a <strong style={{ color: TEXT }}>sealed-bid, second-price variant</strong> adapted
          for the dual-player conjunction scenario.
        </p>
        <p style={{ ...bodyText, marginTop: 12 }}>
          The key insight driving the Nash equilibrium strategy is: the operator with a larger delta-V
          reserve relative to total available delta-V incurs a proportionally lower marginal fuel cost for
          the avoidance burn. That operator is therefore the yield bidder — they execute the maneuver because
          doing so is their dominant strategy. The opposing operator, by holding its orbit, contributes to
          the globally optimal outcome: <strong style={{ color: TEXT }}>minimum total fleet fuel expenditure</strong> per
          conjunction event.
        </p>
        <p style={{ ...bodyText, marginTop: 12 }}>
          Formal proof of the Nash equilibrium property follows from the standard Vickrey auction theorem
          extended to continuous bid spaces. Bidding one's true capacity score B_i is a weakly dominant
          strategy — no operator can improve its expected fuel savings by misreporting its reserve, given
          that the ZKP verifier will reject bids that are inconsistent with the on-chain commitment.
        </p>
      </section>

      {/* Section 2: Bid Formula */}
      <section style={sectionDivider}>
        <h2 style={h2Style}>Bid Formula</h2>
        <div style={{
          background: 'rgba(0,0,0,0.35)',
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: '24px 28px',
          marginBottom: 20,
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: MONO,
            fontSize: '1.05rem',
            color: CYAN,
            letterSpacing: '0.03em',
            margin: 0,
          }}>
            B<sub>i</sub> = (ΔV<sub>reserve,i</sub> / ΔV<sub>total</sub>) × w<sub>tier</sub> × (1 − c<sub>fuel,i</sub> / c<sub>budget,i</sub>)
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { sym: 'ΔV_reserve,i', def: 'Remaining onboard delta-V capacity for satellite i, in m/s, as committed by the ZKP prover.' },
            { sym: 'ΔV_total',     def: 'Sum of ΔV_reserve for both satellites in the conjunction pair; normalises the bid to [0, 1].' },
            { sym: 'w_tier',       def: 'Priority tier weight (see table). Crewed vehicles carry w=2.0; decommissioned craft carry w=0.6.' },
            { sym: 'c_fuel,i',     def: 'Estimated fuel cost (in USD equivalent or mission-defined units) of the avoidance maneuver.' },
            { sym: 'c_budget,i',   def: 'Operator\'s total remaining fuel budget for the current mission phase.' },
            { sym: 'B_i',          def: 'Final scalar bid score in [0, 2.0]. Higher score → yield bidder (executes maneuver).' },
          ].map((term, i) => (
            <div key={i} className="doc-card" style={{ padding: '14px 16px' }}>
              <p style={{ fontFamily: MONO, color: CYAN, fontSize: '0.85rem', marginBottom: 6, fontWeight: 700 }}>
                {term.sym}
              </p>
              <p style={{ ...bodyText, fontSize: '0.82rem', margin: 0 }}>{term.def}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Priority Tiers */}
      <section style={sectionDivider}>
        <h2 style={h2Style}>Priority Tiers</h2>
        <p style={{ ...bodyText, marginBottom: 16 }}>
          Tier classification is assigned at operator registration time and stored in the ONP peer registry.
          Tier upgrades require a signed attestation from the relevant licensing authority (FCC, ITU, or
          equivalent). The <code>w_tier</code> multiplier directly scales the bid, giving safety-critical
          missions a structural advantage in yield assignment.
        </p>
        <div className="doc-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Tier</th>
                <th style={thStyle}>Label</th>
                <th style={thStyle}>w_tier</th>
                <th style={thStyle}>Description</th>
              </tr>
            </thead>
            <tbody>
              {TIERS.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...tdStyle, color: CYAN, fontWeight: 700, fontSize: '1rem' }}>{row.tier}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    <span className="tag">{row.label}</span>
                  </td>
                  <td style={{ ...tdStyle, color: '#a78bfa', fontFamily: MONO, fontWeight: 700 }}>{row.w}</td>
                  <td style={tdStyle}>{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Auction Phases */}
      <section style={sectionDivider}>
        <h2 style={h2Style}>Auction Phases</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {PHASES.map((phase, i) => (
            <div key={i} className="doc-card" style={{ display: 'flex', gap: 20, alignItems: 'flex-start', padding: '18px 20px' }}>
              <div style={{
                flexShrink: 0,
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: `2px solid ${CYAN}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: MONO,
                fontSize: '0.75rem',
                color: CYAN,
                fontWeight: 700,
                background: 'rgba(6,182,212,0.07)',
              }}>
                {phase.n}
              </div>
              <div>
                <p style={{ color: TEXT, fontWeight: 600, fontFamily: SANS, fontSize: '0.95rem', marginBottom: 6 }}>
                  {phase.name}
                </p>
                <p style={{ ...bodyText, margin: 0, fontSize: '0.85rem' }}>{phase.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: Edge Cases */}
      <section style={sectionDivider}>
        <h2 style={h2Style}>Edge Cases</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {EDGE_CASES.map((ec, i) => (
            <div key={i} className="doc-card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{
                  fontFamily: MONO,
                  color: '#f87171',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  background: 'rgba(248,113,113,0.1)',
                  border: '1px solid rgba(248,113,113,0.25)',
                  borderRadius: 4,
                  padding: '2px 8px',
                }}>
                  {ec.code}
                </span>
                <span style={{ color: TEXT, fontWeight: 600, fontFamily: SANS, fontSize: '0.9rem' }}>
                  {ec.name}
                </span>
              </div>
              <p style={{ ...bodyText, fontSize: '0.84rem', marginBottom: 6 }}>
                <strong style={{ color: MUTED, opacity: 0.7 }}>Trigger: </strong>{ec.trigger}
              </p>
              <p style={{ ...bodyText, fontSize: '0.84rem', margin: 0 }}>
                <strong style={{ color: MUTED, opacity: 0.7 }}>Resolution: </strong>{ec.resolution}
              </p>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
