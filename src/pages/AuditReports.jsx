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
  fontSize: '0.85rem',
  fontFamily: MONO,
};

const thStyle = {
  color: CYAN,
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: `1px solid ${BORDER}`,
  fontWeight: 600,
  fontSize: '0.78rem',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  color: TEXT,
  padding: '8px 12px',
  borderBottom: `1px solid ${BORDER}`,
  fontSize: '0.82rem',
  whiteSpace: 'nowrap',
};

const tdMutedStyle = {
  ...tdStyle,
  color: MUTED,
};

const VERIFIED_COLOR = '#10b981';
const PENDING_COLOR = '#f59e0b';

const auditLog = [
  { id: 'AE-182441', ts: '2026-06-16 08:14:22', satA: 'SL-6421', satB: 'OW-0892', tca: '2026-06-16 09:02:07', dv: '0.47', status: 'VERIFIED' },
  { id: 'AE-182440', ts: '2026-06-16 07:58:11', satA: 'KP-1104', satB: 'SL-5803', tca: '2026-06-16 08:44:33', dv: '0.83', status: 'VERIFIED' },
  { id: 'AE-182439', ts: '2026-06-16 06:31:05', satA: 'OW-0311', satB: 'KP-2250', tca: '2026-06-16 07:19:51', dv: '1.12', status: 'VERIFIED' },
  { id: 'AE-182438', ts: '2026-06-16 05:47:39', satA: 'SL-7002', satB: 'SL-6917', tca: '2026-06-16 06:33:14', dv: '0.29', status: 'VERIFIED' },
  { id: 'AE-182437', ts: '2026-06-16 04:22:17', satA: 'KP-0801', satB: 'OW-1544', tca: '2026-06-16 05:09:02', dv: '0.61', status: 'PENDING' },
  { id: 'AE-182436', ts: '2026-06-15 23:11:44', satA: 'OW-0099', satB: 'SL-4188', tca: '2026-06-16 00:02:55', dv: '2.04', status: 'VERIFIED' },
  { id: 'AE-182435', ts: '2026-06-15 21:08:30', satA: 'SL-5512', satB: 'KP-1901', tca: '2026-06-15 21:57:41', dv: '0.78', status: 'VERIFIED' },
  { id: 'AE-182434', ts: '2026-06-15 19:54:02', satA: 'KP-3301', satB: 'OW-0720', tca: '2026-06-15 20:41:18', dv: '1.35', status: 'VERIFIED' },
];

const anomalyReports = [
  {
    id: 'AR-001',
    date: '2026-03-14',
    type: 'STALE_TLE',
    desc: 'TLE age exceeded 6h threshold for SL-5512 during active screening window.',
    resolution: 'Auto-rejected; fresh TLE requested from catalog before re-screening.',
  },
  {
    id: 'AR-002',
    date: '2026-04-22',
    type: 'BID_TIMEOUT',
    desc: 'Operator B (KP-1104) crosslink lost during bid commitment phase; no ZKP received within 800 ms window.',
    resolution: 'Ground fallback activated; CDM forwarded to operator ground segment for manual review.',
  },
  {
    id: 'AR-003',
    date: '2026-05-30',
    type: 'ZKP_MISMATCH',
    desc: 'Groth16 proof submitted by OW-0311 failed on-orbit verification against committed public inputs.',
    resolution: 'Maneuver agreement flagged as unverified; event quarantined for manual cryptographic audit.',
  },
];

const complianceFrameworks = [
  {
    name: 'ITU Radio Regulations',
    detail: 'All inter-satellite link frequencies coordinated under RR Appendix 4 filing procedures.',
  },
  {
    name: 'FCC Part 25',
    detail: 'U.S.-licensed spacecraft comply with Part 25 orbital debris mitigation and deorbit requirements.',
  },
  {
    name: 'ESA Space Debris Mitigation Guidelines (ECSS-U-AS-010C)',
    detail: 'Protocol maneuver logs satisfy ESA debris mitigation reporting and conjunction screening standards.',
  },
  {
    name: 'IADC Space Debris Mitigation Guidelines (Rev. 2)',
    detail: 'Post-mission disposal plans are verified and logged in the audit trail for all participating operators.',
  },
];

const downloadCards = [
  {
    title: 'Protocol Specification & Whitepaper',
    format: 'PDF',
    size: '220 KB',
    desc: 'Complete technical reference, SGP4 orbital mechanics propagation, and game-theoretic Nash equilibrium whitepaper.',
    icon: '📚',
  },
  {
    title: 'Q1 2026 Full Report',
    format: 'PDF',
    size: '4.2 MB',
    desc: 'Complete audit log, anomaly analyses, and statistical summary for January – March 2026.',
    icon: '📄',
  },
  {
    title: 'Protocol v4 Compliance Summary',
    format: 'PDF',
    size: '1.1 MB',
    desc: 'Third-party verification of protocol v4.0.0 compliance with all listed regulatory frameworks.',
    icon: '✅',
  },
  {
    title: 'ZKP Circuit Audit (Third Party)',
    format: 'PDF',
    size: '2.7 MB',
    desc: 'Independent Groth16 circuit audit performed by Trail of Bits — circuit soundness and completeness verified.',
    icon: '🔐',
  },
];

export default function AuditReports() {
  return (
    <PageLayout
      badge="RESEARCH — AUDIT"
      title="Audit Reports"
      subtitle="Historical record of all verified maneuver agreements, ZKP audit results, system anomalies, and protocol compliance reports. All entries are immutable once committed to the ledger."
    >
      {/* Summary Stats */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Entries', value: '182,441', color: CYAN },
          { label: 'Verified', value: '182,439', color: VERIFIED_COLOR },
          { label: 'Failed Verification', value: '2', color: '#f87171' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="doc-card"
            style={{
              flex: '1 1 200px',
              textAlign: 'center',
              padding: '24px 16px',
            }}
          >
            <div style={{
              fontSize: '2rem',
              fontWeight: 700,
              fontFamily: MONO,
              color,
              letterSpacing: '-0.02em',
            }}>
              {value}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: MUTED,
              fontFamily: SANS,
              marginTop: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Audit Log */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>Recent Audit Log</h2>
        <p style={{ ...bodyText, marginBottom: 16 }}>
          The 8 most recent entries from the immutable ledger. Each entry records the participating
          satellites, time of closest approach (TCA), delta-V consumed by the maneuvering party,
          and ZKP verification status.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Entry ID</th>
                <th style={thStyle}>Timestamp UTC</th>
                <th style={thStyle}>SAT A</th>
                <th style={thStyle}>SAT B</th>
                <th style={thStyle}>TCA</th>
                <th style={thStyle}>ΔV Used (m/s)</th>
                <th style={thStyle}>ZKP Status</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map(row => (
                <tr key={row.id} style={{ transition: 'background 0.15s' }}>
                  <td style={{ ...tdStyle, color: CYAN }}>{row.id}</td>
                  <td style={tdMutedStyle}>{row.ts}</td>
                  <td style={tdStyle}>{row.satA}</td>
                  <td style={tdStyle}>{row.satB}</td>
                  <td style={tdMutedStyle}>{row.tca}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', paddingRight: 24 }}>{row.dv}</td>
                  <td style={{ ...tdStyle }}>
                    <span className="tag" style={{
                      color: row.status === 'VERIFIED' ? VERIFIED_COLOR : PENDING_COLOR,
                      borderColor: row.status === 'VERIFIED' ? VERIFIED_COLOR : PENDING_COLOR,
                      background: row.status === 'VERIFIED'
                        ? 'rgba(16,185,129,0.08)'
                        : 'rgba(245,158,11,0.1)',
                    }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Anomaly Reports */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>Anomaly Reports</h2>
        <p style={{ ...bodyText, marginBottom: 16 }}>
          Anomaly reports are generated automatically when the protocol detects constraint
          violations — stale TLEs, crosslink timeouts, or cryptographic proof failures.
          All anomalies are publicly disclosed and logged with their resolution outcomes.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Report ID</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Type</th>
                <th style={{ ...thStyle, minWidth: 240 }}>Description</th>
                <th style={{ ...thStyle, minWidth: 220 }}>Resolution</th>
              </tr>
            </thead>
            <tbody>
              {anomalyReports.map(row => (
                <tr key={row.id}>
                  <td style={{ ...tdStyle, color: '#f59e0b' }}>{row.id}</td>
                  <td style={tdMutedStyle}>{row.date}</td>
                  <td style={{ ...tdStyle }}>
                    <span className="tag" style={{
                      color: '#f59e0b',
                      borderColor: '#f59e0b',
                      background: 'rgba(245,158,11,0.08)',
                    }}>
                      {row.type}
                    </span>
                  </td>
                  <td style={{ ...tdMutedStyle, whiteSpace: 'normal', lineHeight: 1.6 }}>{row.desc}</td>
                  <td style={{ ...tdStyle, whiteSpace: 'normal', lineHeight: 1.6, color: MUTED }}>{row.resolution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>Regulatory Compliance</h2>
        <p style={{ ...bodyText, marginBottom: 16 }}>
          The Orbital Negotiator protocol is designed to comply with all applicable space
          traffic management, spectrum coordination, and debris mitigation regulatory frameworks.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {complianceFrameworks.map(({ name, detail }) => (
            <li key={name} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              paddingTop: 12,
              paddingBottom: 12,
              borderBottom: `1px solid ${BORDER}`,
            }}>
              <span style={{ color: VERIFIED_COLOR, fontSize: '1rem', flexShrink: 0, marginTop: 2 }}>✓</span>
              <div>
                <div style={{ color: TEXT, fontFamily: SANS, fontSize: '0.9rem', fontWeight: 600 }}>{name}</div>
                <div style={{ ...bodyText, marginTop: 2 }}>{detail}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Download Section */}
      <div style={sectionDivider}>
        <h2 style={{ ...h2Style, marginBottom: 16 }}>Download Reports</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {downloadCards.map(({ title, format, size, desc, icon }) => (
            <a
              key={title}
              href="/documentation.pdf"
              download="orbital_negotiator_documentation.pdf"
              style={{ textDecoration: 'none', flex: '1 1 260px', display: 'flex' }}
            >
              <div
                className="doc-card"
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = CYAN}
                onMouseLeave={e => e.currentTarget.style.borderColor = ''}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                    <div>
                      <div style={{ color: TEXT, fontFamily: SANS, fontWeight: 600, fontSize: '0.9rem' }}>{title}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <span className="tag">{format}</span>
                        <span className="tag">{size}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ ...bodyText, margin: 0 }}>{desc}</p>
                </div>
                <div style={{
                  marginTop: 14,
                  color: CYAN,
                  fontFamily: MONO,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  ↓ Download
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
