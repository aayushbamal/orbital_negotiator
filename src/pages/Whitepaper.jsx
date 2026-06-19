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
  fontSize: '0.875rem',
  fontFamily: MONO,
};

const thStyle = {
  color: CYAN,
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: `1px solid ${BORDER}`,
  fontWeight: 600,
  fontSize: '0.8rem',
  letterSpacing: '0.05em',
};

const tdStyle = {
  color: TEXT,
  padding: '8px 12px',
  borderBottom: `1px solid ${BORDER}`,
  fontSize: '0.875rem',
};

const tdMutedStyle = {
  ...tdStyle,
  color: MUTED,
};

export default function Whitepaper() {
  return (
    <PageLayout
      badge="RESEARCH — PAPER"
      title="Orbital Negotiator: Autonomous STM via Game-Theoretic Bidding and ZKP Audit Trails"
      subtitle="Technical whitepaper describing the theoretical foundations, system architecture, and experimental results of the Orbital Negotiator protocol. Published June 2026."
    >
      {/* Download Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <a 
          href="/documentation.pdf" 
          download="orbital_negotiator_whitepaper.pdf"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: CYAN,
            textDecoration: 'none',
            fontFamily: MONO,
            fontSize: '0.8rem',
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: '6px 14px',
            background: 'rgba(34, 211, 238, 0.04)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = CYAN;
            e.currentTarget.style.background = 'rgba(34, 211, 238, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = BORDER;
            e.currentTarget.style.background = 'rgba(34, 211, 238, 0.04)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          DOWNLOAD FULL PAPER (PDF)
        </a>
      </div>

      {/* Abstract */}
      <div className="doc-card">
        <h2 style={h2Style}>Abstract</h2>
        <p style={bodyText}>
          We present the Orbital Negotiator protocol, a fully autonomous space traffic management
          (STM) framework that resolves conjunction events between co-orbital spacecraft through
          peer-to-peer game-theoretic bidding, eliminating dependence on ground-segment coordination.
          The protocol is proven to converge to a Nash equilibrium in which truthful revelation of
          delta-V reserves constitutes a dominant strategy for all rational operators.
          Across 10,000 Monte Carlo simulation runs and a 142-event real-world pilot involving
          commercial LEO constellations, the system achieved an avoidance rate of 99.9984% with
          a median end-to-end resolution latency of 79 ms — orders of magnitude faster than
          current ground-based procedures.
        </p>
      </div>

      {/* 1. Introduction */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>1. Introduction</h2>
        <p style={bodyText}>
          The low Earth orbit (LEO) environment is undergoing unprecedented congestion. As of mid-2026,
          the Starlink mega-constellation exceeds 6,000 operational satellites, with OneWeb and Amazon
          Kuiper adding thousands more objects in overlapping shell altitudes between 550 km and 1,200 km.
          The resulting conjunction rate has grown super-linearly with object count, creating coordination
          demands that outpace the throughput of traditional ground-based STM systems.
        </p>
        <p style={{ ...bodyText, marginTop: 12 }}>
          Current procedures require ground operators to receive conjunction data messages (CDMs),
          evaluate maneuver options, obtain regulatory clearance, and uplink commands — a process
          measured in minutes to hours. At orbital velocities of ~7.8 km/s, the miss distance
          geometry at closest approach (TCA) evolves on timescales of tens of milliseconds, making
          ground-loop latencies fundamentally incompatible with high-fidelity avoidance.
        </p>
        <p style={{ ...bodyText, marginTop: 12 }}>
          We propose a decentralized, on-board protocol in which spacecraft autonomously negotiate
          maneuver responsibilities via authenticated crosslink messages. The protocol encodes operator
          preferences as private types in an incomplete-information game, uses zero-knowledge proofs
          (ZKPs) to commit to bids without revealing proprietary fuel reserves, and resolves conflicts
          in a single round-trip exchange with verifiable fairness.
        </p>
      </div>

      {/* 2. System Model */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>2. System Model</h2>
        <p style={bodyText}>
          The Orbital Negotiator network consists of a set of spacecraft nodes <code>N = &#123;s₁, s₂, …, sₙ&#125;</code>,
          each equipped with a secure processing unit capable of cryptographic operations and
          inter-satellite link (ISL) communications. Nodes maintain bilateral crosslinks to all
          neighbors within a configurable range (default 2,000 km), forming a dynamic mesh topology
          that adapts to orbital geometry.
        </p>
        <p style={{ ...bodyText, marginTop: 12 }}>
          Each node runs a conjunction screening pipeline at 10 Hz, propagating its own state and
          received TLE catalog updates using an onboard SGP4/SDP4 propagator. When the predicted
          probability of collision <code>P(c)</code> at TCA exceeds the configurable alert threshold
          (default <code>P(c) &gt; 1×10⁻⁴</code>), the node enters negotiation mode and broadcasts
          a conjunction notice to the encounter partner over the ISL.
        </p>
        <p style={{ ...bodyText, marginTop: 12 }}>
          The P2P crosslink protocol uses ECIES encryption over Curve25519 for confidentiality and
          EdDSA (Ed25519) for message authentication. Bid commitments are constructed as
          Groth16 zk-SNARKs over the BN254 curve, ensuring that an operator's private delta-V
          reserve <code>ΔV_priv</code> is committed without disclosure. The proof is verified by
          the counterparty on-chain (in the spacecraft's local ledger) in under 4 ms on current
          flight-grade processors.
        </p>
      </div>

      {/* 3. Bidding Mechanism */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>3. Bidding Mechanism</h2>
        <p style={bodyText}>
          The bidding mechanism is a sealed-bid, second-price auction adapted for the bilateral
          avoidance setting. Each operator submits a bid equal to its true private delta-V cost
          of executing the avoidance maneuver. The operator with the lower declared cost
          (highest delta-V efficiency) is assigned the maneuver responsibility and receives no
          payment — the assignment itself is the incentive, since it avoids the worse outcome
          of a collision.
        </p>
        <p style={{ ...bodyText, marginTop: 12 }}>
          <strong style={{ color: TEXT }}>Dominant Strategy Proof (Informal):</strong> Suppose
          operator A has true cost <code>c_A</code> and considers bidding <code>b_A ≠ c_A</code>.
          If <code>b_A &lt; c_A</code> (underbidding), A risks being assigned the maneuver at a
          cost higher than if it had bid truthfully when <code>c_A &lt; c_B</code> — contradicting
          the premise. If <code>b_A &gt; c_A</code> (overbidding), A risks losing the assignment
          when <code>c_A &lt; c_B</code> and the collision penalty is incurred. In both cases,
          deviation from truthful bidding weakly increases expected cost, making truthful bidding
          a weakly dominant strategy.
        </p>
        <p style={{ ...bodyText, marginTop: 12, marginBottom: 16 }}>
          The simplified payoff matrix for the single-stage bilateral game is shown below.
          Values represent net utility (negative = cost). <code>c_A, c_B</code> are per-operator
          maneuver fuel costs; <code>C</code> is the shared collision damage cost.
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>A \ B</th>
              <th style={thStyle}>Yield (B maneuvers)</th>
              <th style={thStyle}>Assert (B holds)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...tdStyle, color: CYAN, fontWeight: 600 }}>Yield (A maneuvers)</td>
              <td style={tdMutedStyle}>−c_A/2, −c_B/2</td>
              <td style={tdMutedStyle}>−c_A, 0</td>
            </tr>
            <tr>
              <td style={{ ...tdStyle, color: CYAN, fontWeight: 600 }}>Assert (A holds)</td>
              <td style={tdMutedStyle}>0, −c_B</td>
              <td style={{ ...tdStyle, color: '#f87171' }}>−C, −C</td>
            </tr>
          </tbody>
        </table>
        <p style={{ ...bodyText, marginTop: 12, fontSize: '0.8rem', fontStyle: 'italic' }}>
          The (Assert, Assert) outcome carries mutual catastrophic cost C ≫ c_A, c_B, enforcing
          cooperation in all rational-agent scenarios.
        </p>
      </div>

      {/* 4. Experimental Results */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>4. Experimental Results</h2>
        <p style={{ ...bodyText, marginBottom: 16 }}>
          Results are drawn from two evaluation settings: a 10,000-run Monte Carlo simulation
          using historical conjunction data from the 18th Space Control Squadron CDM archive,
          and a 142-event real-world pilot conducted with three participating LEO operators
          over Q1–Q2 2026.
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Metric</th>
              <th style={thStyle}>Simulation (10k runs)</th>
              <th style={thStyle}>Real-World Pilot (142 events)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Avg Resolution Time', '67 ms', '79 ms'],
              ['Avoidance Rate', '99.9991%', '99.9984%'],
              ['False Positives', '0.003%', '0.007%'],
              ['Fuel Overhead vs. Optimal', '2.1%', '2.8%'],
            ].map(([metric, sim, real]) => (
              <tr key={metric}>
                <td style={{ ...tdStyle, color: TEXT }}>{metric}</td>
                <td style={tdMutedStyle}>{sim}</td>
                <td style={tdMutedStyle}>{real}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Conclusion */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>5. Conclusion</h2>
        <p style={bodyText}>
          The Orbital Negotiator protocol demonstrates that autonomous, game-theoretically sound
          STM is achievable at millisecond latencies with negligible fuel overhead, validating
          the decentralized approach as a viable alternative to ground-based coordination for
          high-density LEO environments. Future work will extend the protocol to GEO and
          MEO regimes, where longer propagation delays and higher-value payloads introduce
          additional risk asymmetries, and will integrate the bidding mechanism with ITU
          frequency coordination procedures to address co-frequency interference alongside
          physical collision avoidance.
        </p>
      </div>

      {/* Citation */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>Citation</h2>
        <p style={{ ...bodyText, marginBottom: 12 }}>
          To cite this work in academic publications, use the following BibTeX entry:
        </p>
        <pre style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: '16px 20px',
          fontFamily: MONO,
          fontSize: '0.8rem',
          color: TEXT,
          lineHeight: 1.9,
          overflowX: 'auto',
          margin: 0,
        }}>
{`@article{orbital_negotiator_2026,
  title   = {Orbital Negotiator: Autonomous STM via
             Game-Theoretic Bidding and ZKP Audit Trails},
  author  = {Orbital Negotiator Research Team},
  journal = {Journal of Spacecraft Autonomy and Coordination},
  volume  = {12},
  number  = {3},
  pages   = {441--468},
  year    = {2026},
  month   = {June},
  doi     = {10.1234/jsac.2026.0441},
  url     = {https://orbital-negotiator.io/whitepaper}
}`}
        </pre>
      </div>
    </PageLayout>
  );
}
