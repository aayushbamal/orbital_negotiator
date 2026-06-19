import React from 'react';
import PageLayout, { CYAN, MUTED, MONO, SANS, SURFACE, BORDER, TEXT } from './PageLayout';

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

const ALERT_PAYLOAD = `{
  "version": 4,
  "opcode": "0x01",
  "timestamp_utc": "2026-06-16T09:15:00.000Z",
  "sat_id_a": "STARLINK-3821",
  "sat_id_b": "ONEWEB-0447",
  "tca_utc": "2026-06-17T02:43:11.820Z",
  "poc": 0.00342,
  "miss_distance_m": 412.7,
  "ephemeris_a": {
    "tle_epoch": "2026-06-16T08:00:00Z",
    "x_km": 6731.442,
    "y_km": -892.117,
    "z_km": 1204.335,
    "vx_km_s": 1.2341,
    "vy_km_s": 7.4892,
    "vz_km_s": -0.8821
  },
  "ephemeris_b": {
    "tle_epoch": "2026-06-16T07:45:00Z",
    "x_km": 6731.001,
    "y_km": -891.885,
    "z_km": 1204.619,
    "vx_km_s": -1.1092,
    "vy_km_s": 7.4901,
    "vz_km_s": 0.9013
  }
}`;

const MESSAGE_TYPES = [
  { name: 'CONJUNCTION_ALERT', opcode: '0x01', dir: 'Broadcast',  desc: 'Announces a predicted conjunction event to all peers' },
  { name: 'BID_SEALED',        opcode: '0x02', dir: 'P2P',        desc: 'Sends a hash-committed sealed bid to the counterpart' },
  { name: 'BID_OPEN',          opcode: '0x03', dir: 'P2P',        desc: 'Reveals the pre-image of the sealed bid for verification' },
  { name: 'MANEUVER_AGREE',    opcode: '0x04', dir: 'P2P',        desc: 'Counterpart acknowledges the resolved maneuver assignment' },
  { name: 'MANEUVER_SIGN',     opcode: '0x05', dir: 'P2P',        desc: 'Ed25519-signed commitment to execute the agreed maneuver' },
  { name: 'AUDIT_HASH',        opcode: '0x06', dir: 'Broadcast',  desc: 'Publishes SHA3-256 audit hash to the ZKP ledger' },
  { name: 'HEARTBEAT',         opcode: '0x07', dir: 'Broadcast',  desc: 'Liveness signal with current TLE epoch for peer freshness check' },
  { name: 'ERROR_REJECT',      opcode: '0x08', dir: 'P2P',        desc: 'Signals a protocol error code; triggers retry or fallback path' },
];

const ERROR_CODES = [
  { code: 'E001', name: 'STALE_TLE',          desc: 'Ephemeris data is older than the 6-hour freshness window' },
  { code: 'E002', name: 'BID_TIMEOUT',        desc: 'No valid bid received from peer within the 200 ms auction window' },
  { code: 'E003', name: 'DELTA_V_MISMATCH',   desc: 'Self-reported delta-V reserves do not match the ZKP commitment' },
  { code: 'E004', name: 'SIGNATURE_INVALID',  desc: 'Ed25519 cryptographic signature verification failed for MANEUVER_SIGN' },
  { code: 'E005', name: 'CONSENSUS_FAIL',     desc: 'Both operators submitted equal bids; tie-break algorithm triggered' },
];

const HANDSHAKE_STEPS = [
  'Satellite A\'s onboard SSA module detects a conjunction with PoC > 1 × 10⁻⁴ via SGP4 propagation.',
  'Satellite A broadcasts a <code>CONJUNCTION_ALERT</code> (0x01) containing the ephemeris snapshot, TCA, PoC, and miss distance.',
  'Both satellites independently hash their delta-V reserve and broadcast a <code>BID_SEALED</code> (0x02) commitment within 200 ms.',
  'After both sealed bids are received, each satellite reveals its pre-image via <code>BID_OPEN</code> (0x03); the Nash resolver determines the maneuvering party.',
  'The assigned satellite sends <code>MANEUVER_AGREE</code> (0x04) and then <code>MANEUVER_SIGN</code> (0x05) with an Ed25519 signature over the burn parameters.',
  'Both parties broadcast an <code>AUDIT_HASH</code> (0x06) to the ZKP ledger, finalising the agreement without ground-station involvement.',
];

export default function ProtocolDocs() {
  return (
    <PageLayout
      badge="SYSTEM — DOCS"
      title="Protocol Specification v4"
      subtitle="Complete technical reference for the Orbital Negotiator peer-to-peer collision avoidance protocol. Covers message formats, handshake sequences, consensus rules, and error handling."
    >
      {/* Section 1: Overview */}
      <section>
        <h2 style={h2Style}>Overview</h2>
        <p style={bodyText}>
          The Orbital Negotiator Protocol (ONP v4) is a fully autonomous, peer-to-peer collision avoidance
          protocol designed to operate entirely aboard participating spacecraft. Unlike legacy conjunction
          management workflows that route decisions through a ground station — introducing latency of minutes
          to hours — ONP executes a complete negotiation and signed maneuver agreement in under 500 ms of
          round-trip radio time.
        </p>
        <p style={{ ...bodyText, marginTop: 12 }}>
          The architecture is purely decentralised: each satellite runs an onboard Space Situational Awareness
          (SSA) module, a cryptographic auction engine, and a ZKP proof generator. No ground station
          dependency exists in the nominal path. Ground fallback is triggered only on <code>ERROR_REJECT</code> with
          code <code>E002 BID_TIMEOUT</code> or operator-defined override.
        </p>
      </section>

      {/* Section 2: Message Types */}
      <section style={sectionDivider}>
        <h2 style={h2Style}>Message Types</h2>
        <p style={{ ...bodyText, marginBottom: 16 }}>
          All ONP frames are encoded as CBOR over CCSDS proximity-1 or IP-over-LaSER links. The opcode
          occupies byte 1 of the frame header; the remaining fields are protocol-version dependent.
        </p>
        <div className="doc-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>OpCode</th>
                <th style={thStyle}>Direction</th>
                <th style={thStyle}>Description</th>
              </tr>
            </thead>
            <tbody>
              {MESSAGE_TYPES.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...tdStyle, color: CYAN, fontWeight: 600 }}>{row.name}</td>
                  <td style={{ ...tdStyle, color: '#a78bfa' }}>{row.opcode}</td>
                  <td style={tdStyle}>
                    <span className="tag">{row.dir}</span>
                  </td>
                  <td style={tdStyle}>{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3: Handshake Sequence */}
      <section style={sectionDivider}>
        <h2 style={h2Style}>Handshake Sequence</h2>
        <p style={{ ...bodyText, marginBottom: 16 }}>
          The six-step handshake completes a full collision avoidance negotiation from raw conjunction detection
          through to a cryptographically signed and ledger-committed maneuver agreement.
        </p>
        <ol style={{ ...bodyText, paddingLeft: 20, margin: 0 }}>
          {HANDSHAKE_STEPS.map((step, i) => (
            <li
              key={i}
              style={{ marginBottom: 10 }}
              dangerouslySetInnerHTML={{ __html: step }}
            />
          ))}
        </ol>
      </section>

      {/* Section 4: Sample Payload */}
      <section style={sectionDivider}>
        <h2 style={h2Style}>Sample CONJUNCTION_ALERT Payload</h2>
        <p style={bodyText}>
          The following is a canonical example of a <code>CONJUNCTION_ALERT</code> (opcode <code>0x01</code>) frame
          payload as transmitted over the inter-satellite link. Timestamps are ISO 8601 UTC. Positional
          state vectors are in the Earth-Centered Inertial (ECI) J2000 frame.
        </p>
        <pre style={preStyle}>{ALERT_PAYLOAD}</pre>
      </section>

      {/* Section 5: Error Codes */}
      <section style={sectionDivider}>
        <h2 style={h2Style}>Error Codes</h2>
        <p style={{ ...bodyText, marginBottom: 16 }}>
          Error codes are transmitted in the <code>ERROR_REJECT</code> (0x08) message body. Each code maps
          to a defined fallback behaviour in the protocol state machine.
        </p>
        <div className="doc-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Description</th>
              </tr>
            </thead>
            <tbody>
              {ERROR_CODES.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...tdStyle, color: '#f87171', fontWeight: 600 }}>{row.code}</td>
                  <td style={{ ...tdStyle, color: CYAN, fontFamily: MONO }}>{row.name}</td>
                  <td style={tdStyle}>{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageLayout>
  );
}
