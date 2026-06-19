import React, { useEffect, useMemo, useRef, useState } from 'react';
import RotatingEarth from './components/ui/rotating-earth';

const T = {
  bg: '#050910',
  surface: '#0b1420',
  surfaceRaised: '#101d2c',
  border: 'rgba(91, 168, 208, 0.28)',
  inkPrimary: '#d8e9f8',
  inkSecondary: '#8ba5bd',
  inkMuted: '#4f6578',
  data: '#5ba8d0',
  alert: '#e8a020',
  ok: '#4caf7d',
};

const F = {
  mono: "'IBM Plex Mono', monospace",
  cond: "'IBM Plex Sans Condensed', sans-serif",
};

const PHASES = {
  interiorEnd: 1 / 19,
  flyEnd: 3 / 19,
  overviewEnd: 4 / 19,
  lock1Start: 4 / 19,
  lock5End: 16.5 / 19,
  returnStart: 16.5 / 19,
};

const ORBIT_OBJECTS = [
  {
    id: 'SAT-01',
    title: 'Autonomous Negotiation Protocol',
    kicker: 'PROTOCOL V4',
    icon: 'ANP',
    color: '#5ba8d0',
    radius: 178,
    speed: 0.42,
    offset: 0.15,
    phase: [4 / 19, 6.5 / 19],
    side: 'right',
    description:
      'Spacecraft evaluate crossing risk locally, negotiate priority, and execute deterministic avoidance maneuvers without waiting for ground-station arbitration.',
    specs: ['Crosslink first consensus', 'Mission priority aware', 'Autonomous delta-v dispatch'],
  },
  {
    id: 'SAT-02',
    title: 'Zero-Knowledge Proof Ledger',
    kicker: 'ZKP AUDIT',
    icon: 'ZKP',
    color: '#4caf7d',
    radius: 234,
    speed: -0.29,
    offset: 1.45,
    phase: [6.5 / 19, 9 / 19],
    side: 'left',
    description:
      'Every agreement is committed to a tamper-evident ledger with succinct proofs, making maneuver accountability verifiable without leaking sensitive mission telemetry.',
    specs: ['SHA-256 state hashes', 'Privacy-preserving proof trail', 'Regulator-ready audit export'],
  },
  {
    id: 'SAT-03',
    title: 'Game-Theoretic Bidding Engine',
    kicker: 'DELTA-V ECONOMICS',
    icon: 'BID',
    color: '#e8a020',
    radius: 292,
    speed: 0.23,
    offset: 2.55,
    phase: [9 / 19, 11.5 / 19],
    side: 'right',
    description:
      'Fuel reserves, recovery time, and mission priority become deterministic bids, letting satellites resolve who preserves trajectory and who maneuvers.',
    specs: ['Cost-weighted path retention', 'Propellant reserve modeling', 'Repeatable auction outcomes'],
  },
  {
    id: 'SAT-04',
    title: 'Stats and Resolution Protocol',
    kicker: 'SAFETY LOOP',
    icon: 'STM',
    color: '#ff6b6b',
    radius: 350,
    speed: -0.2,
    offset: 3.7,
    phase: [11.5 / 19, 14 / 19],
    side: 'left',
    description:
      'A four-step resolution flow detects conjunctions, scores bids, signs the maneuver, and revalidates orbital separation in real time.',
    specs: ['20 active simulated sats', 'Under 80 ms resolve latency', '100% avoidance in demo envelope'],
  },
  {
    id: 'SAT-05',
    title: 'Navigation and Launch Links',
    kicker: 'MISSION ROUTES',
    icon: 'NAV',
    color: '#b891ff',
    radius: 410,
    speed: 0.17,
    offset: 4.8,
    phase: [14 / 19, 16.5 / 19],
    side: 'right',
    description:
      'Jump into protocol docs, the ZKP ledger, bidding engine notes, trajectory APIs, research references, or the live control room.',
    specs: ['Protocol docs', 'Trajectory API', 'Research papers'],
    links: ['Protocol Docs', 'ZKP Ledger', 'Bidding Engine', 'Trajectory API'],
  },
];

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function easeInOut(value) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function range(progress, start, end) {
  return clamp((progress - start) / (end - start));
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function useScrollProgress() {
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const frameRef = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const measure = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetRef.current = clamp(window.scrollY / maxScroll);
    };

    const tick = () => {
      const next = currentRef.current + (targetRef.current - currentRef.current) * 0.08;
      currentRef.current = Math.abs(next - targetRef.current) < 0.0005 ? targetRef.current : next;
      setProgress(currentRef.current);
      frameRef.current = requestAnimationFrame(tick);
    };

    measure();
    frameRef.current = requestAnimationFrame(tick);
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);

    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return progress;
}

function useViewport() {
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === 'undefined' ? 1440 : window.innerWidth,
    height: typeof window === 'undefined' ? 900 : window.innerHeight,
  }));

  useEffect(() => {
    const resize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return viewport;
}

function computeObjectPosition(item, time, width, height) {
  const scale = Math.min(width, height) / 900;
  const angle = time * item.speed + item.offset;
  const cx = width / 2;
  const cy = height / 2 + Math.min(56, height * 0.06);
  const x = cx + Math.cos(angle) * item.radius * scale;
  const y = cy + Math.sin(angle) * item.radius * 0.58 * scale;
  return { x, y, angle, centerY: cy, radiusX: item.radius * scale, radiusY: item.radius * 0.58 * scale };
}

function findActiveIndex(progress) {
  return ORBIT_OBJECTS.findIndex((item) => progress >= item.phase[0] && progress < item.phase[1]);
}

function useSceneLayout(progress, viewport) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let frame = 0;
    let start = performance.now();
    const tick = (now) => {
      setTime((now - start) / 1000);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return useMemo(() => {
    const fly = easeInOut(range(progress, PHASES.interiorEnd, PHASES.flyEnd));
    const ret = easeInOut(range(progress, PHASES.returnStart, 1));
    const spaceReveal = clamp(fly - ret);
    const activeIndex = findActiveIndex(progress);
    const active = activeIndex >= 0 ? ORBIT_OBJECTS[activeIndex] : null;
    const objectPositions = ORBIT_OBJECTS.map((item) =>
      computeObjectPosition(item, time, viewport.width, viewport.height),
    );

    const minSide = Math.min(viewport.width, viewport.height);
    const closedRadius = Math.max(150, Math.min(310, viewport.width * 0.2));
    const openRadius = Math.max(viewport.width, viewport.height) * 1.65;
    const radius = mix(closedRadius, openRadius, spaceReveal);

    let orbitScale = mix(0.72, 1, spaceReveal);
    let orbitX = 0;
    let orbitY = mix(32, 0, spaceReveal);

    if (active) {
      const activePosition = objectPositions[activeIndex];
      const lockProgress = easeInOut(range(progress, active.phase[0], active.phase[1]));
      const lockEase = Math.sin(lockProgress * Math.PI);
      const targetX = active.side === 'left' ? viewport.width * 0.33 : viewport.width * 0.67;
      const targetY = viewport.height * 0.48;
      orbitScale = mix(1, 1.62, lockEase);
      orbitX = (targetX - activePosition.x) * lockEase;
      orbitY = (targetY - activePosition.y) * lockEase;
    }

    const earthScale = active ? mix(0.8, 0.95, Math.sin(range(progress, active.phase[0], active.phase[1]) * Math.PI)) : mix(0.25, 0.8, spaceReveal);
    const titleOpacity = 1 - easeInOut(range(progress, 0.02, PHASES.flyEnd));
    const cockpitOpacity = 1 - spaceReveal + ret * 0.88;
    const finalOpacity = easeInOut(range(progress, 17.5 / 19, 1));

    return {
      activeIndex,
      active,
      cockpitOpacity,
      earthScale,
      finalOpacity,
      objectPositions,
      orbitTransform: `translate3d(${orbitX}px, ${orbitY}px, 0) scale(${orbitScale})`,
      portholeRadius: radius,
      spaceReveal,
      starDrift: time * 4,
      titleOpacity,
      minSide,
    };
  }, [progress, time, viewport]);
}

function OrbitMarker({ item, index, position, activeIndex }) {
  const isActive = activeIndex === index;
  const isDim = activeIndex >= 0 && !isActive;
  const size = isActive ? 22 : 12;

  return (
    <div
      className="orbit-marker"
      style={{
        left: position.x,
        top: position.y,
        color: item.color,
        opacity: isDim ? 0.22 : 1,
        transform: `translate(-50%, -50%) scale(${isActive ? 1.25 : 1})`,
      }}
    >
      <span
        className="orbit-core"
        style={{
          width: size,
          height: size,
          background: item.color,
          boxShadow: `0 0 ${isActive ? 34 : 18}px ${item.color}`,
        }}
      />
      <span className="orbit-label">{item.id}</span>
    </div>
  );
}

function OrbitTrail({ item, position }) {
  return (
    <div
      className="orbit-trail"
      style={{
        width: position.radiusX * 2,
        height: position.radiusY * 2,
        left: '50%',
        top: position.centerY,
        borderColor: item.color,
      }}
    />
  );
}

function ContentPanel({ item, active, progress, onLaunch }) {
  if (!item) return null;

  const phaseProgress = easeInOut(range(progress, item.phase[0] + 0.012, item.phase[1] - 0.012));
  const exitFade = 1 - easeInOut(range(progress, item.phase[1] - 0.025, item.phase[1]));
  const opacity = active ? phaseProgress * exitFade : 0;
  const from = item.side === 'left' ? -32 : 32;

  return (
    <aside
      className={`content-panel ${item.side === 'left' ? 'is-left' : 'is-right'}`}
      style={{
        borderColor: item.color,
        boxShadow: `0 24px 70px rgba(0, 0, 0, 0.42), 0 0 40px ${item.color}22`,
        opacity,
        transform: `translate3d(${mix(from, 0, phaseProgress)}px, ${mix(18, 0, phaseProgress)}px, 0)`,
        pointerEvents: opacity > 0.75 ? 'auto' : 'none',
      }}
    >
      <div className="panel-kicker" style={{ color: item.color }}>
        {item.kicker}
      </div>
      <div className="panel-title-row">
        <span className="panel-icon" style={{ borderColor: item.color, color: item.color }}>
          {item.icon}
        </span>
        <h2>{item.title}</h2>
      </div>
      <p>{item.description}</p>
      <div className="spec-list">
        {item.specs.map((spec) => (
          <span key={spec}>{spec}</span>
        ))}
      </div>
      {item.links && (
        <div className="link-grid">
          {item.links.map((link) => (
            <button type="button" key={link}>
              {link}
            </button>
          ))}
        </div>
      )}
      {item.links && (
        <button type="button" className="launch-panel-btn" onClick={onLaunch}>
          LAUNCH CONTROL ROOM
        </button>
      )}
    </aside>
  );
}

function CockpitHud({ opacity }) {
  return (
    <div className="cockpit-hud" style={{ opacity }}>
      <div className="hud-line top-left" />
      <div className="hud-line top-right" />
      <div className="hud-line bottom-left" />
      <div className="hud-line bottom-right" />
      <div className="hud-readout left">WINDOW SEAL 100%</div>
      <div className="hud-readout right">ORBITAL LOCK READY</div>
      <div className="rivet r1" />
      <div className="rivet r2" />
      <div className="rivet r3" />
      <div className="rivet r4" />
    </div>
  );
}

function PortholeMask({ radius, cockpitOpacity }) {
  const ringOpacity = clamp(cockpitOpacity + 0.08);
  return (
    <svg className="porthole-mask" aria-hidden="true">
      <defs>
        <mask id="porthole-cutout">
          <rect width="100%" height="100%" fill="white" />
          <circle cx="50%" cy="50%" r={radius} fill="black" />
        </mask>
        <radialGradient id="porthole-metal" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(150, 198, 225, 0.28)" />
          <stop offset="65%" stopColor="rgba(28, 42, 55, 0.22)" />
          <stop offset="100%" stopColor="rgba(4, 8, 14, 0.78)" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="rgba(2, 6, 12, 0.93)" mask="url(#porthole-cutout)" opacity={ringOpacity} />
      <circle
        cx="50%"
        cy="50%"
        r={radius}
        fill="none"
        stroke="url(#porthole-metal)"
        strokeWidth={Math.max(8, radius * 0.055)}
        opacity={ringOpacity}
      />
      <circle cx="50%" cy="50%" r={radius * 0.93} fill="none" stroke="rgba(91, 168, 208, 0.26)" strokeWidth="1.5" opacity={ringOpacity} />
    </svg>
  );
}

export default function ProductLanding({ onLaunch }) {
  const progress = useScrollProgress();
  const viewport = useViewport();
  const scene = useSceneLayout(progress, viewport);

  return (
    <div className="parallax-landing" style={{ fontFamily: F.cond }}>
      <style>{`
        .parallax-landing {
          min-height: 1900vh;
          color: ${T.inkPrimary};
          background:
            radial-gradient(circle at 50% 34%, rgba(43, 90, 120, 0.18), transparent 34%),
            linear-gradient(180deg, ${T.bg} 0%, #02050a 100%);
          overflow-x: hidden;
        }
        .landing-viewport {
          position: sticky;
          top: 0;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #02050a;
          isolation: isolate;
        }
        .starfield,
        .starfield::before,
        .starfield::after {
          position: absolute;
          inset: -10%;
          content: "";
          background-repeat: repeat;
          pointer-events: none;
        }
        .starfield {
          z-index: 0;
          background-image:
            radial-gradient(circle, rgba(255,255,255,0.72) 0 1px, transparent 1.5px),
            radial-gradient(circle, rgba(91,168,208,0.52) 0 1px, transparent 1.6px);
          background-size: 130px 130px, 210px 210px;
          background-position: 0 var(--star-drift), 42px calc(var(--star-drift) * -0.6);
          opacity: 0.58;
        }
        .starfield::before {
          background-image: radial-gradient(circle, rgba(255,255,255,0.9) 0 1px, transparent 1.4px);
          background-size: 320px 320px;
          opacity: 0.5;
          transform: translateY(calc(var(--star-drift) * 0.4));
        }
        .space-vignette {
          position: absolute;
          inset: 0;
          z-index: 2;
          background:
            radial-gradient(circle at 50% 54%, transparent 0 34%, rgba(2, 6, 13, 0.18) 58%, rgba(0,0,0,0.76) 100%),
            linear-gradient(180deg, rgba(2,6,12,0.06), rgba(2,6,12,0.44));
          pointer-events: none;
        }
        .floating-header {
          position: absolute;
          z-index: 100;
          top: 18px;
          left: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 16px;
          border: 1px solid rgba(91,168,208,0.16);
          background: rgba(5, 11, 18, 0.38);
          backdrop-filter: blur(12px);
        }
        .brand {
          display: flex;
          flex-direction: column;
          gap: 2px;
          letter-spacing: 0.12em;
        }
        .brand strong {
          font-size: 15px;
          font-weight: 800;
        }
        .brand span {
          color: ${T.inkSecondary};
          font-family: ${F.mono};
          font-size: 8px;
        }
        .status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${T.ok};
          font-family: ${F.mono};
          font-size: 9px;
        }
        .status::before {
          width: 7px;
          height: 7px;
          content: "";
          border-radius: 50%;
          background: ${T.ok};
          box-shadow: 0 0 12px ${T.ok};
        }
        .header-btn,
        .launch-panel-btn,
        .final-cta,
        .link-grid button {
          border: 1px solid rgba(91,168,208,0.42);
          background: rgba(91,168,208,0.08);
          color: ${T.inkPrimary};
          cursor: pointer;
          font-family: ${F.mono};
          letter-spacing: 0.08em;
          transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
        }
        .header-btn {
          padding: 9px 15px;
          font-size: 10px;
        }
        .header-btn:hover,
        .launch-panel-btn:hover,
        .final-cta:hover,
        .link-grid button:hover {
          transform: translateY(-1px);
          border-color: ${T.data};
          background: rgba(91,168,208,0.18);
        }
        .earth-layer {
          position: absolute;
          inset: 0;
          z-index: 1;
          opacity: var(--earth-opacity);
        }
        .orbit-layer {
          position: absolute;
          inset: 0;
          z-index: 3;
          transform-origin: center center;
          transition: opacity 0.2s ease;
        }
        .orbit-trail {
          position: absolute;
          transform: translate(-50%, -50%);
          border: 1px dashed;
          border-radius: 50%;
          opacity: 0.18;
        }
        .orbit-marker {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: opacity 0.25s ease, transform 0.25s ease;
          will-change: transform, opacity;
        }
        .orbit-core {
          display: block;
          border-radius: 50%;
        }
        .orbit-label {
          padding: 4px 7px;
          border: 1px solid currentColor;
          background: rgba(4, 10, 17, 0.74);
          color: currentColor;
          font-family: ${F.mono};
          font-size: 9px;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }
        .hero-title {
          position: absolute;
          z-index: 6;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          pointer-events: none;
        }
        .hero-title h1 {
          max-width: min(980px, 86vw);
          margin: 0;
          color: #eef8ff;
          font-size: clamp(44px, 7.8vw, 108px);
          font-weight: 800;
          letter-spacing: 0.04em;
          line-height: 0.88;
          text-shadow: 0 0 34px rgba(91,168,208,0.34);
        }
        .hero-title span {
          margin-bottom: 16px;
          color: ${T.data};
          font-family: ${F.mono};
          font-size: 10px;
          letter-spacing: 0.24em;
        }
        .scroll-hint {
          margin-top: 22px;
          color: ${T.inkSecondary};
          font-family: ${F.mono};
          font-size: 10px;
          letter-spacing: 0.12em;
        }
        .content-panel {
          position: absolute;
          z-index: 4;
          top: 50%;
          width: min(420px, calc(100vw - 40px));
          padding: 26px;
          border: 1px solid;
          background: linear-gradient(135deg, rgba(13, 23, 35, 0.82), rgba(5, 10, 18, 0.58));
          backdrop-filter: blur(18px);
          will-change: transform, opacity;
        }
        .content-panel.is-left {
          left: clamp(20px, 7vw, 96px);
        }
        .content-panel.is-right {
          right: clamp(20px, 7vw, 96px);
        }
        .panel-kicker {
          font-family: ${F.mono};
          font-size: 10px;
          letter-spacing: 0.18em;
        }
        .panel-title-row {
          display: flex;
          gap: 14px;
          align-items: center;
          margin: 14px 0 14px;
        }
        .panel-title-row h2 {
          margin: 0;
          font-size: 30px;
          line-height: 1.02;
          letter-spacing: 0.03em;
        }
        .panel-icon {
          display: grid;
          place-items: center;
          width: 52px;
          height: 52px;
          flex: 0 0 auto;
          border: 1px solid;
          font-family: ${F.mono};
          font-size: 12px;
        }
        .content-panel p {
          margin: 0 0 20px;
          color: ${T.inkSecondary};
          font-size: 15px;
          line-height: 1.6;
        }
        .spec-list {
          display: grid;
          gap: 8px;
        }
        .spec-list span {
          padding: 9px 10px;
          border: 1px solid rgba(216,233,248,0.1);
          background: rgba(255,255,255,0.035);
          color: ${T.inkPrimary};
          font-family: ${F.mono};
          font-size: 10px;
        }
        .link-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-top: 16px;
        }
        .link-grid button {
          padding: 10px;
          font-size: 9px;
        }
        .launch-panel-btn {
          width: 100%;
          margin-top: 14px;
          padding: 12px;
          font-size: 10px;
        }
        .porthole-mask {
          position: absolute;
          inset: 0;
          z-index: 5;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .cockpit-hud {
          position: absolute;
          inset: 0;
          z-index: 6;
          pointer-events: none;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.03), transparent 18%, transparent 82%, rgba(255,255,255,0.03)),
            radial-gradient(circle at 50% 50%, transparent 0 31%, rgba(9,16,25,0.14) 35%, transparent 43%);
        }
        .hud-line {
          position: absolute;
          width: min(18vw, 190px);
          height: min(18vw, 190px);
          border-color: rgba(91,168,208,0.46);
        }
        .top-left {
          top: 106px;
          left: 56px;
          border-top: 1px solid;
          border-left: 1px solid;
        }
        .top-right {
          top: 106px;
          right: 56px;
          border-top: 1px solid;
          border-right: 1px solid;
        }
        .bottom-left {
          bottom: 56px;
          left: 56px;
          border-bottom: 1px solid;
          border-left: 1px solid;
        }
        .bottom-right {
          right: 56px;
          bottom: 56px;
          border-right: 1px solid;
          border-bottom: 1px solid;
        }
        .hud-readout {
          position: absolute;
          color: rgba(139,165,189,0.86);
          font-family: ${F.mono};
          font-size: 9px;
          letter-spacing: 0.15em;
        }
        .hud-readout.left {
          left: 64px;
          bottom: 34px;
        }
        .hud-readout.right {
          right: 64px;
          bottom: 34px;
        }
        .rivet {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #172436;
          box-shadow: inset 0 1px 2px rgba(255,255,255,0.2), 0 0 14px rgba(0,0,0,0.7);
        }
        .r1 { left: 18%; top: 22%; }
        .r2 { right: 18%; top: 22%; }
        .r3 { left: 18%; bottom: 18%; }
        .r4 { right: 18%; bottom: 18%; }
        .final-lock {
          position: absolute;
          z-index: 7;
          inset: 0;
          display: grid;
          place-items: center;
          text-align: center;
          pointer-events: none;
        }
        .final-lock-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          max-width: 420px;
          padding: 24px;
        }
        .final-lock span {
          color: ${T.data};
          font-family: ${F.mono};
          font-size: 10px;
          letter-spacing: 0.22em;
        }
        .final-lock h2 {
          margin: 0;
          font-size: clamp(28px, 4.8vw, 58px);
          line-height: 0.98;
          letter-spacing: 0.06em;
        }
        .final-cta {
          padding: 13px 18px;
          font-size: 11px;
          pointer-events: auto;
        }
        @media (max-width: 760px) {
          .floating-header {
            left: 12px;
            right: 12px;
            top: 12px;
          }
          .status {
            display: none;
          }
          .header-btn {
            padding: 8px 10px;
          }
          .hero-title h1 {
            font-size: clamp(38px, 15vw, 74px);
          }
          .content-panel {
            top: auto;
            left: 16px !important;
            right: 16px !important;
            bottom: 28px;
            width: auto;
            padding: 20px;
          }
          .panel-title-row h2 {
            font-size: 24px;
          }
          .orbit-label {
            display: none;
          }
          .hud-readout,
          .rivet {
            display: none;
          }
          .hud-line {
            width: 110px;
            height: 110px;
          }
          .top-left,
          .bottom-left {
            left: 18px;
          }
          .top-right,
          .bottom-right {
            right: 18px;
          }
        }
      `}</style>

      <section
        className="landing-viewport"
        style={{
          '--space-reveal': scene.spaceReveal,
          '--earth-opacity': 0.56 + scene.spaceReveal * 0.44,
          '--star-drift': `${scene.starDrift}px`,
        }}
      >
        <div className="starfield" />
        <div className="earth-layer">
          <RotatingEarth scrollProgress={progress} scale={scene.earthScale} />
        </div>
        <div className="space-vignette" />

        <div className="orbit-layer" style={{ transform: scene.orbitTransform, opacity: scene.spaceReveal }}>
          {ORBIT_OBJECTS.map((item, index) => (
            <OrbitTrail key={`${item.id}-trail`} item={item} position={scene.objectPositions[index]} />
          ))}
          {ORBIT_OBJECTS.map((item, index) => (
            <OrbitMarker
              key={item.id}
              item={item}
              index={index}
              position={scene.objectPositions[index]}
              activeIndex={scene.activeIndex}
            />
          ))}
        </div>

        <ContentPanel item={scene.active} active={Boolean(scene.active)} progress={progress} onLaunch={onLaunch} />

        <div className="hero-title" style={{ opacity: scene.titleOpacity }}>
          <span>SATELLITE WINDOW ACCESS</span>
          <h1>ORBITAL NEGOTIATOR</h1>
          <div className="scroll-hint">SCROLL TO BEGIN APPROACH VECTOR</div>
        </div>

        <PortholeMask radius={scene.portholeRadius} cockpitOpacity={scene.cockpitOpacity} />
        <CockpitHud opacity={scene.cockpitOpacity} />

        <header className="floating-header">
          <div className="brand">
            <strong>
              ORBITAL <span style={{ color: T.data }}>NEGOTIATOR</span>
            </strong>
            <span>DECENTRALIZED SPACE TRAFFIC MANAGEMENT</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="status">SYSTEM NOMINAL</div>
            <button className="header-btn" type="button" onClick={onLaunch}>
              LAUNCH CONTROL
            </button>
          </div>
        </header>

        <div className="final-lock" style={{ opacity: scene.finalOpacity }}>
          <div className="final-lock-inner">
            <span>RETURN VECTOR COMPLETE</span>
            <h2>CONTROL ROOM READY</h2>
            <button className="final-cta" type="button" onClick={onLaunch}>
              LAUNCH CONTROL ROOM
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
