"use client"

import React, { useState, useEffect, useCallback, useRef } from "react";

export const CONFIG = {
  // Visuals - Theme matching Orbital Negotiator (Ice Blue & Glowing Cyan)
  primaryColor: "91, 168, 208",   // RGB for Ice Blue
  secondaryColor: "0, 240, 255",  // RGB for Neon Cyan

  // Animation Speed
  sphereRotationDuration: "240s",
  gridPanDuration: "180s",
  coreGlowDuration: "25s",

  // Intensity & Depth
  wireframeOpacity: 0.25,          // Muted so it sits nicely in background
  wireframeShadowIntensity: 40,
  coreBlur: 200,
  parallaxDepth: 30,
  lerpFactor: 0.08,
  sphereDensity: 16,              // Slightly denser for a detailed orbital look
};

const lerp = (a, b, t) => a + (b - a) * t;

export default function BackgroundSphere() {
  const [targetMousePos, setTargetMousePos] = useState({ x: 0, y: 0 });
  const currentMousePos = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef();

  const animateLerp = useCallback(() => {
    currentMousePos.current.x = lerp(
      currentMousePos.current.x,
      targetMousePos.x,
      CONFIG.lerpFactor
    );
    currentMousePos.current.y = lerp(
      currentMousePos.current.y,
      targetMousePos.y,
      CONFIG.lerpFactor
    );

    // Trigger state update for smooth rendering
    setTargetMousePos((p) => ({
      x: currentMousePos.current.x,
      y: currentMousePos.current.y,
    }));

    animationFrameRef.current = requestAnimationFrame(animateLerp);
  }, [targetMousePos.x, targetMousePos.y]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animateLerp);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [animateLerp]);

  const handleMouseMove = useCallback((e) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const x = (clientX - centerX) / centerX;
    const y = (clientY - centerY) / centerY;
    setTargetMousePos({ x, y });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const { x: smoothX, y: smoothY } = currentMousePos.current;

  const parallaxDepth = CONFIG.parallaxDepth;
  const rotationStrength = 4;

  const baseTranslate = `translate3d(${smoothX * parallaxDepth}px, ${smoothY * parallaxDepth}px, 0)`;
  const gridTranslate = `translate3d(${-smoothX * (parallaxDepth / 2)}px, ${-smoothY * (parallaxDepth / 2)}px, 0)`;
  const hazeTranslate = `translate3d(${smoothX * (parallaxDepth / 2)}px, ${smoothY * (parallaxDepth / 2)}px, 0)`;

  const tiltRotateX = smoothY * rotationStrength;
  const tiltRotateY = -smoothX * rotationStrength;
  const tiltTranslate = `rotateX(${tiltRotateX}deg) rotateY(${tiltRotateY}deg)`;

  const sphereRings = Array.from({ length: CONFIG.sphereDensity }, (_, i) => {
    const step = 180 / CONFIG.sphereDensity;
    const angle = i * step;
    return (
      <div
        key={`ring-${i}`}
        className="wireframe-line"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: `1px solid rgba(${CONFIG.primaryColor}, ${CONFIG.wireframeOpacity})`,
          borderRadius: "50%",
          boxShadow: `0 0 ${CONFIG.wireframeShadowIntensity}px rgba(${CONFIG.secondaryColor}, 0.05)`,
          transform: i % 2 === 0 ? `rotateY(${angle}deg)` : `rotateX(${angle}deg)`,
          pointerEvents: "none"
        }}
        aria-hidden="true"
      />
    );
  });

  const coreLightStyle = {
    width: "450px",
    height: "450px",
    backgroundImage: `radial-gradient(circle, rgba(${CONFIG.secondaryColor}, 0.25) 0%, transparent 70%)`,
    filter: `blur(${CONFIG.coreBlur}px)`,
    boxShadow: `0 0 ${CONFIG.coreBlur / 2}px 30px rgba(${CONFIG.secondaryColor}, 0.1), 0 0 ${CONFIG.coreBlur}px 50px rgba(${CONFIG.primaryColor}, 0.08)`,
  };

  const panningGridStyle = {
    transform: gridTranslate,
    backgroundImage: `
      linear-gradient(to right, rgba(${CONFIG.primaryColor}, 0.05) 1px, transparent 1px), 
      linear-gradient(to bottom, rgba(${CONFIG.primaryColor}, 0.05) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
    opacity: 0.6,
  };

  const hazeStyle = {
    transform: hazeTranslate,
    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(${CONFIG.primaryColor}, 0.1) 0%, transparent 60%)`,
    filter: "blur(120px)",
    opacity: 0.5,
    mixBlendMode: "screen",
  };

  const deepBaseStyle = {
    transform: baseTranslate,
    backgroundImage: `radial-gradient(at 50% 50%, rgba(${CONFIG.primaryColor}, 0.05) 0%, #080C12 90%)`,
  };

  const bloomStyle = {
    transform: baseTranslate,
    backgroundImage: `
      radial-gradient(circle at 50% 50%, rgba(${CONFIG.primaryColor}, 0.15) 0%, transparent 50%), 
      radial-gradient(circle at 10% 10%, rgba(${CONFIG.secondaryColor}, 0.1) 0%, transparent 30%)
    `,
    mixBlendMode: "screen",
    filter: "blur(100px)",
    opacity: 0.8,
  };

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ 
        zIndex: 0,
        minHeight: "100%",
        width: "100%",
        background: "#080C12"
      }}
    >
      <style>{`
        @keyframes sphere-rot {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
        }
        .sphere-rotation-anim {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: sphere-rot ${CONFIG.sphereRotationDuration} linear infinite;
        }
        @keyframes grid-pan {
          0% { background-position: 0 0; }
          100% { background-position: 1000px 1000px; }
        }
        .panning-grid-anim {
          animation: grid-pan ${CONFIG.gridPanDuration} linear infinite;
        }
      `}</style>

      {/* Layer 0: Panning Grid Layer */}
      <div 
        className="absolute inset-0 panning-grid-anim" 
        style={{
          ...panningGridStyle,
          position: "absolute"
        }} 
      />

      {/* Layer 1: Volumetric Haze */}
      <div className="absolute inset-0" style={hazeStyle} />

      {/* Layer 2: Deep Base Background & Core Glow */}
      <div className="absolute inset-0" style={deepBaseStyle}>
        <div 
          className="core-light absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" 
          style={coreLightStyle} 
        />
      </div>

      {/* Layer 3: Geometric Glow Sphere */}
      <div 
        className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "600px",
          height: "600px",
          perspective: "1200px"
        }}
      >
        <div
          className="sphere-rotation-anim"
          style={{
            transform: tiltTranslate,
            transformOrigin: "center center",
          }}
        >
          {sphereRings}
        </div>
      </div>

      {/* Layer 4: Soft Radial Bloom */}
      <div className="absolute inset-0" style={bloomStyle} />

      {/* Layer 5: Noise Layer (For Film Grain Texture) */}
      <div
        className="absolute inset-0 opacity-5 mix-blend-overlay"
        style={{
          backgroundImage: 'url("https://framerusercontent.com/images/g0QcWrxr87K0ufOxIUFBakwYA8.png")',
          backgroundSize: "200px",
        }}
      />

      {/* Final Vignette overlay */}
      <div 
        className="absolute inset-0" 
        style={{
          background: "radial-gradient(circle, transparent 50%, rgba(8, 12, 18, 0.7) 100%)"
        }}
      />
    </div>
  );
}
