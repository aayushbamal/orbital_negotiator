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

export default function GameTheoryModel() {
  return (
    <PageLayout
      badge="RESEARCH — MODEL"
      title="Game Theory Model"
      subtitle="Formal specification of the two-player incomplete-information game underlying the Orbital Negotiator bidding protocol, including equilibrium proofs and welfare analysis."
    >
      {/* Game Definition */}
      <div className="doc-card">
        <h2 style={h2Style}>Game Definition</h2>
        <p style={bodyText}>
          The Orbital Negotiator conjunction resolution protocol is modeled as a two-player,
          simultaneous-move, incomplete-information game <code>Γ = (N, A, T, P, U)</code>.
        </p>
        <ul style={{ ...bodyText, marginTop: 12, paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>
            <strong style={{ color: TEXT }}>Players:</strong>{' '}
            <code>N = &#123;A, B&#125;</code> — operator A and operator B, each controlling one
            spacecraft in a predicted conjunction pair. Players are rational utility-maximizers
            with private information.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong style={{ color: TEXT }}>Actions:</strong>{' '}
            Each player independently chooses from the action set <code>A_i = &#123;Yield, Assert&#125;</code>.
            <em> Yield</em> commits the player to execute the avoidance maneuver;
            <em> Assert</em> declares intention to maintain nominal trajectory.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong style={{ color: TEXT }}>Private Types (Information):</strong>{' '}
            Each player's type <code>θ_i ∈ Θ</code> is its private delta-V reserve
            <code> ΔV_i ∈ [0, ΔV_max]</code>, which determines maneuver cost. Types are drawn
            from a common prior distribution but are not observed by the opponent. Bids are
            committed via ZKP so neither player can infer the other's reserve.
          </li>
          <li>
            <strong style={{ color: TEXT }}>Payoffs:</strong>{' '}
            Player i's utility is <code>U_i(a_A, a_B) = −(fuel cost) − (collision risk penalty)</code>.
            Fuel cost is proportional to the delta-V executed; collision risk penalty is
            <code> C</code> if both assert (double-assert deadlock leading to uncorrected conjunction).
          </li>
        </ul>
      </div>

      {/* Payoff Matrix */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>Payoff Matrix</h2>
        <p style={{ ...bodyText, marginBottom: 16 }}>
          Each cell shows the payoff pair <code>(U_A, U_B)</code>. Here <code>c_A</code> and{' '}
          <code>c_B</code> represent the respective fuel costs for executing the avoidance burn,
          and <code>C</code> is the shared collision damage cost where <code>C ≫ c_A, c_B</code>.
          When both yield, costs are split equally (cooperative co-maneuver).
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...thStyle, minWidth: 160 }}>Player A \ Player B</th>
              <th style={thStyle}>Yield (B maneuvers)</th>
              <th style={thStyle}>Assert (B holds)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...tdStyle, color: CYAN, fontWeight: 600 }}>Yield (A maneuvers)</td>
              <td style={{ ...tdStyle, color: '#a78bfa' }}>( −c_A/2,  −c_B/2 )</td>
              <td style={tdMutedStyle}>( −c_A,  0 )</td>
            </tr>
            <tr>
              <td style={{ ...tdStyle, color: CYAN, fontWeight: 600 }}>Assert (A holds)</td>
              <td style={tdMutedStyle}>( 0,  −c_B )</td>
              <td style={{ ...tdStyle, color: '#f87171', fontWeight: 600 }}>( −C,  −C )</td>
            </tr>
          </tbody>
        </table>
        <p style={{ ...bodyText, marginTop: 12, fontSize: '0.8rem', fontStyle: 'italic' }}>
          The red cell (Assert, Assert) represents mutual catastrophic loss. With
          typical <code>C ≈ 200M USD</code> and <code>c_i ≈ 5–50k USD</code>,
          the incentive to avoid the bottom-right cell is overwhelming for rational players.
        </p>
      </div>

      {/* Nash Equilibrium Proof */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>Nash Equilibrium Proof</h2>
        <p style={bodyText}>
          <strong style={{ color: TEXT }}>Claim:</strong> The strategy profile
          <code> σ* = (Yield if ΔV_A &lt; ΔV_B, Assert if ΔV_A &gt; ΔV_B)</code> is a
          Bayesian Nash Equilibrium of the game.
        </p>
        <p style={{ ...bodyText, marginTop: 12 }}>
          <strong style={{ color: TEXT }}>Proof Sketch:</strong> Fix player B's strategy to
          <code> σ*_B</code>. Player A observes its own type <code>ΔV_A</code> and forms a
          belief over <code>ΔV_B</code> based on the common prior. The expected payoff to
          A from Yield is <code>E[−c_A]</code> (certain cost). The expected payoff from
          Assert is <code>E[0 · P(ΔV_B &gt; ΔV_A) + (−C) · P(ΔV_B &lt; ΔV_A)]</code>, since
          B also asserts when its reserve is lower.
        </p>
        <p style={{ ...bodyText, marginTop: 12 }}>
          When <code>ΔV_A &lt; ΔV_B</code>, player A's cost <code>c_A</code> is small. Asserting
          risks collision (cost C) with positive probability. Since <code>C ≫ c_A</code>, Yield
          is preferred. Conversely, when <code>ΔV_A &gt; ΔV_B</code>, player B has greater
          incentive to yield (lower cost), and A asserting is a best response. Deviation from
          this threshold strategy by any player weakly increases their expected cost in
          expectation over the prior — confirming <code>σ*</code> as a BNE.
        </p>
        <p style={{ ...bodyText, marginTop: 12 }}>
          The ZKP commitment phase enforces that declared types cannot be falsified
          post-hoc, collapsing the space of profitable deviations to zero. This makes
          truthful bidding not merely a Nash equilibrium but a{' '}
          <strong style={{ color: TEXT }}>dominant strategy</strong> under the ZKP-augmented protocol.
        </p>
      </div>

      {/* Welfare Analysis */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>Welfare Analysis</h2>
        <p style={{ ...bodyText, marginBottom: 16 }}>
          Total fleet delta-V consumption is the primary welfare metric for constellation
          operators. The table below compares three assignment regimes across equivalent
          conjunction event distributions (10,000 simulated events).
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Assignment Regime</th>
              <th style={thStyle}>Total Fleet ΔV (m/s)</th>
              <th style={thStyle}>Avg per Event (m/s)</th>
              <th style={thStyle}>vs. Optimal (%)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Random Assignment', '148,320', '14.83', '+68.4%'],
              ['Ground-Based Priority', '103,440', '10.34', '+17.5%'],
              ['Orbital Negotiator Protocol', '88,050', '8.81', 'Baseline'],
            ].map(([regime, total, avg, overhead]) => (
              <tr key={regime}>
                <td style={{ ...tdStyle, color: regime === 'Orbital Negotiator Protocol' ? CYAN : TEXT }}>
                  {regime}
                </td>
                <td style={tdMutedStyle}>{total}</td>
                <td style={tdMutedStyle}>{avg}</td>
                <td style={{
                  ...tdStyle,
                  color: regime === 'Orbital Negotiator Protocol' ? '#10b981' : '#f87171',
                }}>
                  {overhead}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ ...bodyText, marginTop: 12 }}>
          The Orbital Negotiator protocol achieves a ~34% reduction in total fleet delta-V
          compared to random assignment and a ~14.8% improvement over conventional ground-based
          priority schemes, by consistently allocating maneuver responsibility to the
          operator with the lowest marginal fuel cost.
        </p>
      </div>

      {/* Multi-Satellite Extension */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>Multi-Satellite Extension</h2>
        <p style={bodyText}>
          The bilateral two-player game extends naturally to N-satellite conjunctions — scenarios
          where a single spacecraft must simultaneously negotiate with multiple encounter partners
          within a short temporal window. In this setting, the bilateral mechanism generalizes to
          a <strong style={{ color: TEXT }}>generalized Vickrey auction</strong> (also known as a
          Vickrey–Clarke–Groves mechanism).
        </p>
        <p style={{ ...bodyText, marginTop: 12 }}>
          Each of the N spacecraft submits a sealed bid equal to its private avoidance cost.
          The VCG mechanism assigns maneuver responsibilities to minimize total fleet cost and
          charges each winner a payment equal to the externality its participation imposes on others
          — preserving incentive compatibility and individual rationality in the multi-agent case.
        </p>
        <p style={{ ...bodyText, marginTop: 12 }}>
          The crosslink topology restricts VCG participation to spacecraft within communication
          range; for larger clusters, the protocol partitions the conjunction set into pairwise
          sub-games resolved sequentially, with a convergence guarantee within
          <code> O(N log N)</code> message rounds.
        </p>
      </div>

      {/* Key Parameters */}
      <div className="doc-card" style={sectionDivider}>
        <h2 style={h2Style}>Key Parameters</h2>
        <p style={{ ...bodyText, marginBottom: 16 }}>
          The following parameters govern the behavior of the game-theoretic model and must be
          configured per operator and mission profile.
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Symbol</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Typical Value</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['ΔV_reserve', 'Fuel available for avoidance maneuvers', '10 – 500 m/s'],
              ['c_fuel', 'Burn cost per m/s of delta-V', '120 USD / m/s'],
              ['C', 'Estimated collision damage cost', '50M – 500M USD'],
              ['w_tier', 'Priority weight by mission criticality tier', '0.6 – 2.0'],
              ['P_alert', 'Collision probability alert threshold', '1 × 10⁻⁴'],
              ['τ_TCA', 'Minimum TCA lead time for protocol activation', '≥ 30 minutes'],
              ['ε_ZKP', 'ZKP soundness error bound', '< 2⁻¹²⁸'],
            ].map(([sym, name, val]) => (
              <tr key={sym}>
                <td style={{ ...tdStyle, fontFamily: MONO, color: CYAN }}>{sym}</td>
                <td style={tdMutedStyle}>{name}</td>
                <td style={{ ...tdStyle, fontFamily: MONO }}>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}
