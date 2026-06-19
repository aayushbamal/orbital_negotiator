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

const preStyle = {
  background: 'rgba(0,0,0,0.35)',
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  padding: '20px 24px',
  color: CYAN,
  fontFamily: MONO,
  fontSize: '0.8rem',
  lineHeight: 1.7,
  overflowX: 'auto',
  margin: '16px 0 0 0',
};

const LEDGER_ENTRY = `{
  "entry_id": "LEX-00041827",
  "timestamp_utc": "2026-06-16T02:43:58.112Z",
  "sat_id_a": "STARLINK-3821",
  "sat_id_b": "ONEWEB-0447",
  "maneuver_id": "MNV-09234A",
  "proof_hash": "a3f9b2c1d7e04581f9a2b3c4d5e6f7081234567890abcdef1234567890abcdef12",
  "groth16_proof": {
    "pi_a": ["0x1a2b3c4d...", "0x5e6f7a8b...", "0x1"],
    "pi_b": [
      ["0x9c0d1e2f...", "0x3a4b5c6d..."],
      ["0x7e8f9a0b...", "0x1c2d3e4f..."],
      ["0x1", "0x0"]
    ],
    "pi_c": ["0x5f6a7b8c...", "0x9d0e1f2a...", "0x1"]
  },
  "public_signals": [
    "0x0000000000000001",
    "0xa3f9b2c1d7e04581",
    "0x0000000000000000"
  ],
  "verified": true
}`;

const VERIFICATION_ROWS = [
  { field: 'Fuel Reserve',     algo: 'ZKP Groth16', output: 'Pass / Fail' },
  { field: 'Maneuver Delta-V', algo: 'ZKP PLONK',   output: 'Pass / Fail' },
  { field: 'Signature',        algo: 'Ed25519',      output: 'Pass / Fail' },
  { field: 'TLE Freshness',    algo: 'SHA3-256',     output: 'Age < 6 h'   },
];

const RECENT_ENTRIES = [
  { id: 'LEX-00041827', sats: 'STARLINK-3821 / ONEWEB-0447',  tca: '2026-06-16T02:43:11Z', status: 'VERIFIED' },
  { id: 'LEX-00041801', sats: 'COSMOS-2560 / STARLINK-4102',  tca: '2026-06-15T18:09:44Z', status: 'VERIFIED' },
  { id: 'LEX-00041779', sats: 'ONEWEB-0391 / KUIPER-0088',    tca: '2026-06-15T11:32:07Z', status: 'VERIFIED' },
  { id: 'LEX-00041754', sats: 'STARLINK-2918 / SPIRE-0201',   tca: '2026-06-14T23:57:29Z', status: 'VERIFIED' },
  { id: 'LEX-00041720', sats: 'IRIDIUM-177 / GLOBALSTAR-M098',tca: '2026-06-14T14:18:53Z', status: 'VERIFIED' },
];

const REVEALED = [
  'The fact that a maneuver agreement was reached between the two satellite operators',
  'The UTC timestamp of the Time of Closest Approach (TCA)',
  'The NORAD catalog IDs / operator-assigned identifiers for both satellites',
  'The SHA3-256 hash of the Groth16 proof (audit trail only, not the witness)',
  'The boolean outcome of each ZKP verification step (Pass/Fail)',
];

const NOT_REVEALED = [
  'Actual delta-V reserve quantity for either satellite (protected by Groth16 witness)',
  'Propellant mass, fuel consumption rate, or remaining mission lifetime estimates',
  'The specific burn vector components (direction, magnitude) executed by the maneuvering craft',
  'Orbital inclination, RAAN, or any private ephemeris data outside the TLE public signal',
  'Any operator bidding strategy parameters or historical maneuver frequency',
];

export default function ZKPLedger() {
  return (
    <PageLayout
      badge="SYSTEM — LEDGER"
      title="Zero-Knowledge Proof Audit Ledger"
      subtitle="Every maneuver agreement in the Orbital Negotiator network is cryptographically committed to an append-only ZKP ledger. Disputes are resolved without revealing private orbital or fuel data."
    >
      {/* Section 1: How It Works */}
      <section>
        <h2 style={h2Style}>How It Works</h2>
        <p style={bodyText}>
          When two satellites complete the ONP handshake and reach a maneuver agreement, neither party
          transmits its raw delta-V reserve to the ledger. Instead, each operator's onboard proof engine
          generates a <strong style={{ color: TEXT }}>Groth16</strong> zero-knowledge proof asserting, without
          disclosure, that its reserve satisfies the bid formula constraint. The proof is generated over the
          BN128 pairing-friendly elliptic curve and takes approximately 140 ms on radiation-hardened FPGA
          hardware.
        </p>
        <p style={{ ...bodyText, marginTop: 12 }}>
          The resulting proof tuple <code>(π_A, π_B, π_C)</code> and a set of public signals — which encode
          only the boolean outcome and a blinded commitment — are hashed with SHA3-256 and broadcast as an{' '}
          <code>AUDIT_HASH</code> (0x06) message. An independent on-chain verifier smart contract (deployed
          on an orbital constellation's private L2 ledger) verifies the Groth16 pairing equation and appends
          the entry. The verifier never sees the witness, so fuel reserves remain private.
        </p>
        <p style={{ ...bodyText, marginTop: 12 }}>
          For maneuver delta-V commitments specifically, a <strong style={{ color: TEXT }}>PLONK</strong> universal
          SNARK is used instead, as it supports a universal trusted setup that does not require per-circuit
          ceremony repetition. This allows new burn constraint circuits to be deployed without a new powers-of-tau ceremony.
        </p>
      </section>

      {/* Section 2: Ledger Entry Structure */}
      <section style={sectionDivider}>
        <h2 style={h2Style}>Ledger Entry Structure</h2>
        <p style={bodyText}>
          Each appended ledger entry conforms to the following canonical JSON schema. The{' '}
          <code>groth16_proof</code> object stores the raw elliptic curve points as big-endian hex strings.
          The <code>public_signals</code> array contains the verifier's public inputs in field-element encoding.
        </p>
        <pre style={preStyle}>{LEDGER_ENTRY}</pre>
      </section>

      {/* Section 3: Verification */}
      <section style={sectionDivider}>
        <h2 style={h2Style}>Verification Matrix</h2>
        <p style={{ ...bodyText, marginBottom: 16 }}>
          The on-chain verifier runs four independent checks before accepting a ledger entry. All four must
          pass for the entry to receive <code>verified: true</code>.
        </p>
        <div className="doc-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Field</th>
                <th style={thStyle}>Algorithm</th>
                <th style={thStyle}>Output</th>
              </tr>
            </thead>
            <tbody>
              {VERIFICATION_ROWS.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...tdStyle, color: TEXT, fontWeight: 600 }}>{row.field}</td>
                  <td style={{ ...tdStyle, color: '#a78bfa', fontFamily: MONO }}>{row.algo}</td>
                  <td style={{ ...tdStyle, color: CYAN }}>{row.output}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Privacy Guarantees */}
      <section style={sectionDivider}>
        <h2 style={h2Style}>Privacy Guarantees</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="doc-card">
            <p style={{ ...bodyText, color: '#10b981', fontWeight: 600, marginBottom: 10, fontSize: '0.85rem', letterSpacing: '0.04em' }}>
              ✓ REVEALED TO LEDGER
            </p>
            <ul style={{ ...bodyText, paddingLeft: 18, margin: 0 }}>
              {REVEALED.map((item, i) => (
                <li key={i} style={{ marginBottom: 8 }}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="doc-card">
            <p style={{ ...bodyText, color: '#f87171', fontWeight: 600, marginBottom: 10, fontSize: '0.85rem', letterSpacing: '0.04em' }}>
              ✗ NEVER REVEALED
            </p>
            <ul style={{ ...bodyText, paddingLeft: 18, margin: 0 }}>
              {NOT_REVEALED.map((item, i) => (
                <li key={i} style={{ marginBottom: 8 }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Section 5: Recent Entries */}
      <section style={sectionDivider}>
        <h2 style={h2Style}>Recent Ledger Entries</h2>
        <p style={{ ...bodyText, marginBottom: 16 }}>
          Live feed of the most recent five entries appended to the ONP ZKP ledger. All entries shown
          have passed the full four-stage verification pipeline.
        </p>
        <div className="doc-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Entry ID</th>
                <th style={thStyle}>SATs</th>
                <th style={thStyle}>TCA</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ENTRIES.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...tdStyle, color: CYAN, fontFamily: MONO }}>{row.id}</td>
                  <td style={tdStyle}>{row.sats}</td>
                  <td style={{ ...tdStyle, fontFamily: MONO, fontSize: '0.78rem' }}>{row.tca}</td>
                  <td style={tdStyle}>
                    <span style={{
                      color: '#10b981',
                      fontWeight: 700,
                      fontFamily: MONO,
                      fontSize: '0.78rem',
                      letterSpacing: '0.06em',
                    }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageLayout>
  );
}
