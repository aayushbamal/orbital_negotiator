import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const CYAN = '#22d3ee';
const BG = '#050810';
const SURFACE = '#0a101d';
const BORDER = 'rgba(34, 211, 238, 0.1)';
const BORDER_ACTIVE = 'rgba(34, 211, 238, 0.4)';
const TEXT = '#c8d8e8';
const MUTED = '#516f9a';
const MONO = "'IBM Plex Mono', monospace";
const SANS = "'IBM Plex Sans Condensed', sans-serif";

export { CYAN, BG, SURFACE, BORDER, TEXT, MUTED, MONO, SANS };

const menuGroups = [
  {
    title: 'Core Protocol',
    items: [
      { label: 'Protocol Specification', path: '/docs/protocol' },
      { label: 'Trajectory & Propagation API', path: '/docs/trajectory-api' }
    ]
  },
  {
    title: 'Cryptographic Ledger',
    items: [
      { label: 'ZKP Audit Ledger', path: '/docs/zkp-ledger' },
      { label: 'Audit & Compliance Reports', path: '/research/audit-reports' }
    ]
  },
  {
    title: 'Game Theory Engine',
    items: [
      { label: 'Game-Theoretic Bidding', path: '/docs/bidding-engine' },
      { label: 'Formal Game Theory Model', path: '/research/game-theory' }
    ]
  },
  {
    title: 'Orbital Mechanics',
    items: [
      { label: 'SGP4 Propagation Reference', path: '/research/sgp4' },
      { label: 'Technical Whitepaper', path: '/research/whitepaper' }
    ]
  },
  {
    title: 'Project Info',
    items: [
      { label: 'Developers', path: '/developers' }
    ]
  }
];

export default function PageLayout({ title, subtitle, badge, children }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic injection of absolute-positioned COPY buttons to all `<pre>` tags
  useEffect(() => {
    const preBlocks = document.querySelectorAll('pre');
    preBlocks.forEach(pre => {
      if (pre.querySelector('.copy-btn')) return;

      pre.style.position = 'relative';
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.innerText = 'COPY';
      btn.style.position = 'absolute';
      btn.style.top = '12px';
      btn.style.right = '12px';
      btn.style.background = 'rgba(34, 211, 238, 0.06)';
      btn.style.border = '1px solid rgba(34, 211, 238, 0.2)';
      btn.style.color = CYAN;
      btn.style.fontFamily = MONO;
      btn.style.fontSize = '9px';
      btn.style.fontWeight = '500';
      btn.style.padding = '3px 8px';
      btn.style.borderRadius = '4px';
      btn.style.cursor = 'pointer';
      btn.style.transition = 'all 0.2s ease';
      btn.style.letterSpacing = '0.05em';

      btn.onmouseenter = () => {
        btn.style.background = 'rgba(34, 211, 238, 0.15)';
        btn.style.borderColor = CYAN;
      };
      btn.onmouseleave = () => {
        btn.style.background = 'rgba(34, 211, 238, 0.06)';
        btn.style.borderColor = 'rgba(34, 211, 238, 0.2)';
      };

      btn.onclick = async () => {
        const textToCopy = pre.innerText.replace(/COPY|COPIED!/g, '').trim();
        await navigator.clipboard.writeText(textToCopy);
        btn.innerText = 'COPIED!';
        btn.style.color = '#10b981';
        btn.style.borderColor = '#10b981';
        btn.style.background = 'rgba(16, 185, 129, 0.1)';

        setTimeout(() => {
          btn.innerText = 'COPY';
          btn.style.color = CYAN;
          btn.style.borderColor = 'rgba(34, 211, 238, 0.2)';
          btn.style.background = 'rgba(34, 211, 238, 0.06)';
        }, 2000);
      };

      pre.appendChild(btn);
    });
  }, [children]);

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', padding: '32px 24px' }}>
      <div>
        {/* Core title link */}
        <div style={{ marginBottom: 40 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              background: CYAN,
              borderRadius: '50%',
              boxShadow: `0 0 10px ${CYAN}`
            }}/>
            <span style={{
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 600,
              color: '#fff',
              letterSpacing: '0.12em'
            }}>ORBITAL NEGOTIATOR</span>
          </Link>
          <div style={{ fontFamily: SANS, fontSize: 11, color: MUTED, marginTop: 4, letterSpacing: '0.05em' }}>
            LOCAL REPORT & DOCS
          </div>
        </div>

        {/* Menu groups */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {menuGroups.map(group => (
            <div key={group.title}>
              <div style={{
                fontFamily: MONO,
                fontSize: 10,
                color: MUTED,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: 10
              }}>
                {group.title}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.items.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path} style={{ position: 'relative' }}>
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                          display: 'block',
                          fontFamily: SANS,
                          fontSize: '0.9rem',
                          color: isActive ? '#fff' : TEXT,
                          textDecoration: 'none',
                          padding: '6px 12px',
                          borderRadius: 6,
                          background: isActive ? 'rgba(34, 211, 238, 0.06)' : 'transparent',
                          border: `1px solid ${isActive ? BORDER_ACTIVE : 'transparent'}`,
                          transition: 'all 0.2s ease',
                          fontWeight: isActive ? 600 : 400
                        }}
                        onMouseEnter={e => {
                          if (!isActive) {
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isActive) {
                            e.currentTarget.style.color = TEXT;
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        {item.label}
                      </Link>
                      {isActive && (
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: '25%',
                          width: 3,
                          height: '50%',
                          background: CYAN,
                          borderRadius: '0 2px 2px 0'
                        }}/>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer block in sidebar */}
      <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 20, marginTop: 40 }}>
        <a
          href="/documentation.pdf"
          download="orbital_negotiator_documentation.pdf"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            background: 'rgba(34, 211, 238, 0.08)',
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: '10px 14px',
            color: CYAN,
            fontFamily: MONO,
            fontSize: '0.8rem',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            fontWeight: 500
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(34, 211, 238, 0.16)';
            e.currentTarget.style.borderColor = CYAN;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(34, 211, 238, 0.08)';
            e.currentTarget.style.borderColor = BORDER;
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          DOWNLOAD PDF REPORT
        </a>
        <div style={{ textAlign: 'center', fontSize: 10, color: MUTED, fontFamily: MONO, marginTop: 12, letterSpacing: '0.05em' }}>
          LOCAL SYSTEM // SECURE v4.1
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: BG, color: TEXT, fontFamily: SANS, minHeight: '100vh', display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans+Condensed:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .page-grid { display: grid; background-image: linear-gradient(rgba(34,211,238,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.02) 1px, transparent 1px); background-size: 60px 60px; }
        .doc-card { background: ${SURFACE}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 24px; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .doc-card:hover { border-color: ${BORDER_ACTIVE}; box-shadow: 0 4px 20px rgba(8,12,18,0.4); }
        .tag { display: inline-block; border: 1px solid rgba(34,211,238,0.25); border-radius: 4px; padding: 2px 8px; font-family: ${MONO}; font-size: 10px; color: ${CYAN}; letter-spacing: 0.1em; background: rgba(34,211,238,0.03); }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid ${BORDER}; font-size: 13px; }
        th { font-family: ${MONO}; font-size: 10px; color: ${MUTED}; letter-spacing: 0.12em; text-transform: uppercase; }
        td { color: ${TEXT}; }
        tr:hover td { color: #fff; background: rgba(34, 211, 238, 0.01); }
        code { font-family: ${MONO}; font-size: 12px; background: rgba(34,211,238,0.06); border: 1px solid rgba(34,211,238,0.12); border-radius: 4px; padding: 2px 6px; color: ${CYAN}; }
        pre { background: #03060c; border: 1px solid ${BORDER}; border-radius: 8px; padding: 20px; overflow-x: auto; font-family: ${MONO}; font-size: 12px; color: #8eb4d4; line-height: 1.7; position: relative; }
        
        /* Layout Scrollbars */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(34, 211, 238, 0.1); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(34, 211, 238, 0.25); }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .desktop-sidebar { display: none !important; }
          .mobile-header { display: flex !important; }
          .main-container { padding-left: 0 !important; }
        }
      `}</style>

      {/* Desktop Left Sidebar */}
      <aside
        className="desktop-sidebar"
        style={{
          width: 280,
          background: 'linear-gradient(180deg, #070c16 0%, #03060c 100%)',
          borderRight: `1px solid ${BORDER}`,
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 90,
          overflowY: 'auto'
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Navigation Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 8, 16, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 140
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 280,
              background: '#070c16',
              height: '100%',
              borderRight: `1px solid ${BORDER}`,
              overflowY: 'auto'
            }}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className="main-container"
        style={{
          flex: 1,
          paddingLeft: 280,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0
        }}
      >
        {/* Mobile Header (Hidden on Desktop) */}
        <header
          className="mobile-header"
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            background: 'rgba(5, 8, 16, 0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${BORDER}`,
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}
        >
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: TEXT,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link to="/" style={{ textDecoration: 'none', fontFamily: MONO, fontSize: 11, fontWeight: 600, color: '#fff', letterSpacing: '0.1em' }}>
            ORBITAL NEGOTIATOR
          </Link>
          <span style={{ fontFamily: MONO, fontSize: 10, color: MUTED }}>{badge}</span>
        </header>

        {/* Page Header (Bento/Matrix grid backdrop) */}
        <div className="page-grid" style={{ padding: '64px 40px 48px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>
            <span className="tag" style={{ marginBottom: 16 }}>{badge}</span>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 4.5vw, 2.6rem)',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.2,
              marginBottom: 16,
              letterSpacing: '-0.02em'
            }}>{title}</h1>
            <p style={{ fontSize: '1rem', color: MUTED, lineHeight: 1.7, maxWidth: 720 }}>{subtitle}</p>
          </div>
        </div>

        {/* Content Body wrapper */}
        <main style={{ flex: 1, width: '100%', maxWidth: 840, margin: '0 auto', padding: '40px 24px 80px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

