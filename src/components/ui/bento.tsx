"use client";
import React from "react";
import { clsx } from "clsx";
import { motion } from "framer-motion";

const defaultImages = [
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80", // Space Network
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80", // Digital Cyberspace
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80", // Abstract Mesh
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80", // Analytics Telemetry
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80", // Server Tech
];

export default function FUIBentoGridDark() {
  return (
    <div className="pt-20 pb-20 container mx-auto bg-transparent flex flex-col p-10">
      <h1 className="font-mono tracking-tight text-3xl md:text-5xl text-cyan-400">
        System Overview
      </h1>
      <p className="max-w-3xl text-lg md:text-xl font-medium tracking-tight mt-2 text-slate-400">
        Autonomous space traffic management, game-theoretic negotiation engines, and tamper-evident cryptographic audits.
      </p>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
        <BentoCard
          eyebrow="Insight"
          title="3D Trajectory Propagation"
          description="High-fidelity orbital mechanics engines calculate precise conjunction margins and safety envelopes in real-time, preventing collision tracking errors."
          graphic={
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-700" 
              style={{ backgroundImage: `url('${defaultImages[0]}')` }}
            />
          }
          className="max-lg:rounded-t-4xl lg:col-span-3 lg:rounded-tl-4xl"
        />
        <BentoCard
          eyebrow="Security"
          title="Decentralized Auditing Ledger"
          description="Every trajectory agreement and maneuver proposal is hashed and permanently logged to a cryptographic, dispute-proof audit trail."
          graphic={
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-700" 
              style={{ backgroundImage: `url('${defaultImages[1]}')` }}
            />
          }
          className="lg:col-span-3 lg:rounded-tr-4xl"
        />
        <BentoCard
          eyebrow="Speed"
          title="Low-Latency Sweeps"
          description="Optimal collision maneuvers and path adjustments are calculated and cross-negotiated in under 80ms, built for power users."
          graphic={
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-700" 
              style={{ backgroundImage: `url('${defaultImages[2]}')` }}
            />
          }
          className="lg:col-span-2 lg:rounded-bl-4xl"
        />
        <BentoCard
          eyebrow="Source"
          title="Peer-to-Peer Operations"
          description="Resolves proximity conflicts directly between spacecraft crosslinks, bypassing the need for ground-station communication loops."
          graphic={
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-700" 
              style={{ backgroundImage: `url('${defaultImages[3]}')` }}
            />
          }
          className="lg:col-span-2"
        />
        <BentoCard
          eyebrow="Limitless"
          title="Global Bidding Engine"
          description="Autonomous game-theoretic bidding allocates maneuver priority fairly, respecting satellite fuel reserves and target urgency."
          graphic={
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-700" 
              style={{ backgroundImage: `url('${defaultImages[4]}')` }}
            />
          }
          className="max-lg:rounded-b-4xl lg:col-span-2 lg:rounded-br-4xl"
        />
      </div>
    </div>
  );
}

export function BentoCard({
  dark = false,
  className = "",
  eyebrow,
  title,
  description,
  graphic,
  fade = [],
}: {
  dark?: boolean;
  className?: string;
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  graphic?: React.ReactNode;
  fade?: ("top" | "bottom")[];
}) {
  return (
    <motion.div
      initial="idle"
      whileHover="active"
      variants={{ idle: {}, active: {} }}
      data-dark={dark ? "true" : undefined}
      className={clsx(
        className,
        "group relative flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 shadow-2xl backdrop-blur-md transition-all duration-300",
        "data-[dark]:bg-slate-900"
      )}
    >
      <div className="relative h-[22rem] shrink-0 overflow-hidden">
        {graphic}
        {fade.includes("top") && (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-50% opacity-40" />
        )}
        {fade.includes("bottom") && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-50% opacity-40" />
        )}
      </div>
      <div className="relative p-8 z-20 isolate mt-[-100px] h-[14rem] backdrop-blur-md text-white bg-slate-950/60 border-t border-slate-800/50">
        <h3 className="font-mono text-xs font-semibold tracking-wider text-cyan-400 uppercase">{eyebrow}</h3>
        <p className="mt-1 text-xl font-bold tracking-tight text-slate-100">
          {title}
        </p>
        <p className="mt-2 text-xs/5 text-slate-400">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
