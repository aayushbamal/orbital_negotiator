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

const codeBlockStyle = {
  background: SURFACE,
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  padding: '16px 20px',
  fontFamily: MONO,
  fontSize: '0.8rem',
  color: TEXT,
  lineHeight: 2,
  overflowX: 'auto',
  margin: 0,
};

export default function SGP4Reference() {
  return (
    <PageLayout
      badge="RESEARCH — REFERENCE"
      title="SGP4 Propagation Reference"
      subtitle="Complete reference for the Simplified General Perturbations 4 model used for orbital propagation in the Orbital Negotiator conjunction screening pipeline."
    >
      {/* Overview */}
      <div className="doc-card">
        <h2 style={h2Style}>Overview</h2>
        <p style={bodyText}>
          SGP4 (Simplified General Perturbations 4) is the analytical orbital propagation model
          standardized by NORAD and the 18th Space Control Squadron for tracking Earth-orbiting
          objects. It operates on Two-Line Element sets (TLEs) — compact ASCII representations
          of mean orbital elements — and produces Earth-Centered Inertial (ECI) state vectors
          (position and velocity) at arbitrary future times without numerical integration.
        </p>
        <p style={{ ...bodyText, marginTop: 12 }}>
          The model accounts for the dominant perturbative forces in LEO: atmospheric drag
          (via the <code>B*</code> ballistic coefficient term), Earth's oblateness through the
          <code> J2</code> zonal harmonic, and first-order resonance effects. For objects in
          deep space orbits (period &gt; 225 minutes), the companion SDP4 variant adds lunar
          and solar gravity perturbations.
        </p>
        <p style={{ ...bodyText, marginTop: 12 }}>
          In the Orbital Negotiator pipeline, each spacecraft runs an onboard SGP4 instance
          updated from fresh TLE feeds every 2 hours. Position accuracy is maintained at better
          than <strong style={{ color: TEXT }}>~1 km over 24 hours</strong> for well-tracked
          LEO objects, sufficient for the conjunction screening phase. The final close-approach
          geometry is refined with a higher-fidelity numerical propagator once a conjunction
          alert is triggered.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          {['NORAD Standard', 'Analytical Model', 'TLE Input', 'ECI Output', 'LEO + SDP4 Deep-Space'].map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>

      {/* TLE Format */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>TLE Format</h2>
        <p style={{ ...bodyText, marginBottom: 16 }}>
          A Two-Line Element set consists of three lines: a name line and two data lines,
          each exactly 69 characters wide, terminated by a checksum digit. The sample below
          represents a fictional Orbital Negotiator relay satellite at 550 km altitude in a
          53° inclination shell.
        </p>
        <pre style={codeBlockStyle}>
{`Line 0: ORBNEG-7 RELAY A
        ├─ Satellite common name (up to 24 chars)

Line 1: 1 60001U 26031A   26167.62500000  .00001832  00000-0  14271-3 0  9994
        │ │     │ │       │               │           │         │         │  └─ Checksum
        │ │     │ │       │               │           │         └─────────── B* drag term (0.00014271)
        │ │     │ │       │               │           └───────────────────── Second derivative of mean motion
        │ │     │ │       │               └───────────────────────────────── First derivative of mean motion (rev/day²)
        │ │     │ │       └───────────────────────────────────────────────── Epoch (day 167.625 of 2026)
        │ │     │ └───────────────────────────────────────────────────────── International designator (2026-031A)
        │ │     └─────────────────────────────────────────────────────────── Classification (U = unclassified)
        │ └───────────────────────────────────────────────────────────────── Catalog number (60001)
        └─────────────────────────────────────────────────────────────────── Line number

Line 2: 2 60001  53.0541  72.3819 0001420  89.4312 270.7012 15.05683274 48291
        │ │      │        │       │         │        │        │           └─ Revolution number at epoch
        │ │      │        │       │         │        │        └──────────── Mean motion (rev/day)
        │ │      │        │       │         │        └───────────────────── Mean anomaly (deg)
        │ │      │        │       │         └────────────────────────────── Argument of perigee (deg)
        │ │      │        │       └──────────────────────────────────────── Eccentricity (0.0001420)
        │ │      │        └──────────────────────────────────────────────── RAAN (deg)
        │ │      └───────────────────────────────────────────────────────── Inclination (deg)
        │ └──────────────────────────────────────────────────────────────── Catalog number
        └────────────────────────────────────────────────────────────────── Line number`}
        </pre>
      </div>

      {/* Key Elements */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>Key Orbital Elements</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Element</th>
              <th style={thStyle}>Symbol</th>
              <th style={thStyle}>Units</th>
              <th style={thStyle}>Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Epoch', 't₀', 'YYDDD.DDDDDDDD', 'Reference time for all mean elements; UTC'],
              ['Inclination', 'i', 'deg', 'Angle between orbital plane and equatorial plane; determines ground track latitude range'],
              ['Right Ascension of Ascending Node', 'Ω', 'deg', 'Longitude of ascending node measured from vernal equinox; rotates due to J2 perturbation'],
              ['Eccentricity', 'e', '(unitless)', 'Shape of the orbit ellipse; 0 = circular, <1 = elliptical; LEO typically < 0.01'],
              ['Argument of Perigee', 'ω', 'deg', 'Angle from ascending node to perigee point within the orbital plane'],
              ['Mean Anomaly', 'M', 'deg', 'Position in orbit at epoch, measured from perigee in mean (uniform) motion sense'],
              ['Mean Motion', 'n', 'rev/day', 'Average angular velocity; determines orbital period: T = 1440 / n minutes'],
              ['BSTAR Drag Term', 'B*', '1/earth radii', 'Ballistic coefficient proxy for atmospheric drag; updated with each new TLE fit'],
            ].map(([elem, sym, units, desc]) => (
              <tr key={sym}>
                <td style={{ ...tdStyle, color: TEXT }}>{elem}</td>
                <td style={{ ...tdStyle, fontFamily: MONO, color: CYAN }}>{sym}</td>
                <td style={{ ...tdStyle, fontFamily: MONO, color: '#a78bfa' }}>{units}</td>
                <td style={tdMutedStyle}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Propagation Pipeline */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>Propagation Pipeline</h2>
        <p style={{ ...bodyText, marginBottom: 16 }}>
          The SGP4 algorithm proceeds through the following stages to convert a TLE epoch state
          to an ECI state vector at a target epoch <code>t</code>:
        </p>
        <ol style={{ ...bodyText, paddingLeft: 20 }}>
          {[
            ['Parse TLE', 'Decode ASCII fields into floating-point mean elements: i, Ω, e, ω, M, n, B* at epoch t₀.'],
            ['Initialize Constants', 'Compute derived quantities — semi-major axis a, perigee/apogee heights, recovery constants (k₂, k₄, A₃₀) from WGS-72 Earth model.'],
            ['Secular Variations', 'Advance mean elements from t₀ to t using secular rates for M, ω, Ω driven by J2 and drag. Apply mean motion decay due to atmospheric drag using B*.'],
            ['Periodic Corrections', 'Apply long-period and short-period periodic corrections to the mean elements. These account for higher-order harmonics and produce osculating elements at time t.'],
            ['Solve Kepler\'s Equation', 'Iteratively solve M + e·sin(E) = E for the eccentric anomaly E (Newton–Raphson, typically converges in 3 iterations to 10⁻¹² rad accuracy).'],
            ['Compute ECI Vector', 'Transform osculating elements → ECI position (x, y, z km) and velocity (vx, vy, vz km/s) using the perifocal-to-ECI rotation matrix R(Ω, i, ω).'],
          ].map(([title, desc], i) => (
            <li key={title} style={{ marginBottom: 12 }}>
              <strong style={{ color: TEXT }}>Step {i + 1}: {title} —</strong>{' '}
              {desc}
            </li>
          ))}
        </ol>
        <pre style={{ ...codeBlockStyle, marginTop: 16 }}>
{`// Output ECI State Vector
{
  position: { x: -3271.42, y: 5824.17, z: 2104.88 },  // km
  velocity: { vx: -4.8821, vy: -2.1044, vz:  5.9312 }, // km/s
  epoch:    "2026-06-16T09:00:00.000Z"
}`}
        </pre>
      </div>

      {/* Accuracy Limits */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>Accuracy Limits</h2>
        <p style={{ ...bodyText, marginBottom: 16 }}>
          SGP4 accuracy degrades with propagation time due to unmodeled perturbations and TLE
          fit errors. The following bounds apply to well-tracked LEO objects with fresh TLEs
          (age &lt; 2 hours). Accuracy degrades further for high area-to-mass-ratio objects
          (debris, solar sails) or during geomagnetic storms.
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Time Horizon</th>
              <th style={thStyle}>Position Error (1σ)</th>
              <th style={thStyle}>Velocity Error (1σ)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['0 – 2 h', '< 100 m', '< 0.01 m/s'],
              ['2 – 12 h', '< 500 m', '< 0.05 m/s'],
              ['12 – 24 h', '< 1 km', '< 0.1 m/s'],
              ['24 – 72 h', '< 5 km', '< 0.5 m/s'],
            ].map(([horizon, pos, vel]) => (
              <tr key={horizon}>
                <td style={{ ...tdStyle, fontFamily: MONO }}>{horizon}</td>
                <td style={{ ...tdStyle, color: '#10b981' }}>{pos}</td>
                <td style={tdMutedStyle}>{vel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* J2 Perturbation Correction */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>J2 Perturbation Correction</h2>
        <p style={bodyText}>
          Earth's oblateness — quantified by the second zonal harmonic coefficient
          <code> J2 = 1.08263 × 10⁻³</code> — induces secular drifts in both the right
          ascension of the ascending node (Ω) and the argument of perigee (ω). SGP4 includes
          J2 in its secular variation model through the recovery constants <code>k₂</code> and
          <code> k₄</code>, derived from the WGS-72 gravitational model.
        </p>
        <p style={{ ...bodyText, marginTop: 12 }}>
          The nodal regression rate due to J2 is:
        </p>
        <pre style={{ ...codeBlockStyle, marginTop: 8 }}>
{`dΩ/dt = −(3/2) · n · J2 · (R_E / p)² · cos(i)   [rad/s]

where:
  n    = mean motion (rad/s)
  R_E  = 6378.135 km  (Earth equatorial radius, WGS-72)
  p    = a(1 − e²)    (semi-latus rectum, km)
  i    = inclination  (rad)`}
        </pre>
        <p style={{ ...bodyText, marginTop: 12 }}>
          In the Orbital Negotiator pipeline, an enhanced J2 correction layer is applied on top
          of the base SGP4 output to improve accuracy for the short-arc conjunction geometry
          window (typically T−60 min to T+5 min relative to TCA). This correction evaluates
          the osculating J2 gradient at each propagation step and applies a semi-analytic
          update, reducing along-track errors by approximately <strong style={{ color: TEXT }}>35–60%</strong> compared
          to vanilla SGP4 in the 2–12 h horizon — the operationally critical window for
          conjunction alert processing.
        </p>
      </div>
    </PageLayout>
  );
}
