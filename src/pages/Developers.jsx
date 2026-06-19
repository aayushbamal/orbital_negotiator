import React from 'react';
import PageLayout, { CYAN, MUTED, MONO, SANS, SURFACE, BORDER, TEXT } from './PageLayout';

const GOLD = '#f59e0b';

const developers = [
  {
    name: 'Aayush Bamal',
    role: 'Lead Systems Architect & Game Theorist',
    bio: 'Designed the Nash equilibrium bidding engine, orbital consensus protocol, and peer-to-peer collision negotiation logic.',
    img: '/astronaut_a.jpg',
    color: CYAN,
    glow: 'rgba(34, 211, 238, 0.15)',
    linkedin: 'https://www.linkedin.com/in/aayush-bamal-72764a265',
    instagram: 'https://www.instagram.com/aayush.bamal/',
    email: 'mailto:aayushbamal36@gmail.com',
  },
  {
    name: 'Devansh Saraswat',
    role: 'Cryptographic Engineer & Telemetry Lead',
    bio: 'Led the implementation of the Zero-Knowledge Proof (ZKP) audit ledger circuits, telemetry pipelines, and SGP4 propagation modeling.',
    img: '/astronaut_d.jpg',
    color: GOLD,
    glow: 'rgba(245, 158, 11, 0.15)',
    linkedin: 'https://www.linkedin.com/in/devansh-saraswat-2500a63a2/',
    instagram: 'https://www.instagram.com/saraswat_devansh_/',
    email: 'mailto:saraswatdevansh2006@gmail.com',
  },
];

export default function Developers() {
  return (
    <PageLayout
      badge="SYSTEM — TEAM"
      title="Core Protocol Developers"
      subtitle="Meet the core engineers and researchers pioneering autonomous space traffic management systems."
    >
      {/* CSS flip card styles */}
      <style>{`
        .flip-card {
          background-color: transparent;
          perspective: 1000px;
          height: 480px;
          width: 100%;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        .flip-card:hover .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 24px;
          background: ${SURFACE};
          border: 1px solid ${BORDER};
          box-sizing: border-box;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
        .social-link-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          font-family: ${MONO};
          font-size: 12px;
          padding: 10px 16px;
          border-radius: 8px;
          width: 100%;
          max-width: 240px;
          margin-bottom: 12px;
          box-sizing: border-box;
          transition: all 0.25s ease;
        }
      `}</style>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 32,
        marginTop: 24
      }}>
        {developers.map(dev => (
          <div key={dev.name} className="flip-card">
            <div className="flip-card-inner">
              
              {/* Front Side */}
              <div 
                className="flip-card-front" 
                style={{ 
                  transition: 'border-color 0.25s, box-shadow 0.25s' 
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = dev.color;
                  e.currentTarget.style.boxShadow = `0 0 30px ${dev.glow}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {/* Astronaut Avatar Frame */}
                <div style={{
                  width: 180,
                  height: 180,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `2px solid ${dev.color}`,
                  boxShadow: `0 0 20px ${dev.glow}`,
                  marginBottom: 24,
                  background: '#060a10',
                }}>
                  <img
                    src={dev.img}
                    alt={dev.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>

                <span className="tag" style={{
                  color: dev.color,
                  borderColor: `${dev.color}55`,
                  background: `${dev.color}0a`,
                  marginBottom: 12
                }}>
                  DEVELOPER
                </span>

                <h3 style={{
                  fontFamily: SANS,
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: '#f0f4f8',
                  margin: '0 0 6px'
                }}>
                  {dev.name}
                </h3>

                <p style={{
                  fontFamily: MONO,
                  fontSize: '0.8rem',
                  color: dev.color,
                  letterSpacing: '0.05em',
                  margin: '0 0 16px',
                  textTransform: 'uppercase'
                }}>
                  {dev.role}
                </p>

                <p style={{
                  fontFamily: SANS,
                  fontSize: '0.9rem',
                  color: MUTED,
                  lineHeight: 1.7,
                  margin: 0
                }}>
                  {dev.bio}
                </p>
              </div>

              {/* Back Side */}
              <div 
                className="flip-card-back"
                style={{ 
                  transition: 'border-color 0.25s, box-shadow 0.25s' 
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = dev.color;
                  e.currentTarget.style.boxShadow = `0 0 30px ${dev.glow}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {/* Mini Astronaut Avatar Frame */}
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `2px solid ${dev.color}`,
                  boxShadow: `0 0 12px ${dev.glow}`,
                  marginBottom: 16,
                  background: '#060a10',
                }}>
                  <img
                    src={dev.img}
                    alt={dev.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>

                <h3 style={{
                  fontFamily: SANS,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#f0f4f8',
                  margin: '0 0 4px'
                }}>
                  {dev.name}
                </h3>

                <p style={{
                  fontFamily: MONO,
                  fontSize: '0.75rem',
                  color: MUTED,
                  letterSpacing: '0.05em',
                  margin: '0 0 32px',
                  textTransform: 'uppercase'
                }}>
                  Connect with Developer
                </p>

                {/* Social Links List */}
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                  
                  {/* LinkedIn */}
                  <a 
                    href={dev.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link-btn"
                    style={{
                      color: TEXT,
                      border: `1px solid ${BORDER}`,
                      background: 'rgba(255, 255, 255, 0.01)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = dev.color;
                      e.currentTarget.style.borderColor = dev.color;
                      e.currentTarget.style.background = `${dev.color}0a`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = TEXT;
                      e.currentTarget.style.borderColor = BORDER;
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                    LinkedIn Profile
                  </a>

                  {/* Instagram */}
                  <a 
                    href={dev.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link-btn"
                    style={{
                      color: TEXT,
                      border: `1px solid ${BORDER}`,
                      background: 'rgba(255, 255, 255, 0.01)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = dev.color;
                      e.currentTarget.style.borderColor = dev.color;
                      e.currentTarget.style.background = `${dev.color}0a`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = TEXT;
                      e.currentTarget.style.borderColor = BORDER;
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                    Instagram Profile
                  </a>

                  {/* Email */}
                  <a 
                    href={dev.email} 
                    className="social-link-btn"
                    style={{
                      color: TEXT,
                      border: `1px solid ${BORDER}`,
                      background: 'rgba(255, 255, 255, 0.01)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = dev.color;
                      e.currentTarget.style.borderColor = dev.color;
                      e.currentTarget.style.background = `${dev.color}0a`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = TEXT;
                      e.currentTarget.style.borderColor = BORDER;
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Direct Email
                  </a>

                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
