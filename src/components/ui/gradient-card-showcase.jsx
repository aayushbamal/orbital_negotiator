import React from 'react';

const cards = [
  {
    title: 'STM Protocol v4',
    desc: 'Decentralized peer-to-peer collision avoidance. Autonomous satellite negotiation and safety resolution sweeps in real-time.',
    gradientFrom: '#ffbc00',
    gradientTo: '#ff0058',
    btnText: 'Access Protocol',
  },
  {
    title: 'Cryptographic Ledger',
    desc: 'Tamper-evident, zero-knowledge audit trail. Secure, immutable logging of all satellite orbital trajectory changes.',
    gradientFrom: '#03a9f4',
    gradientTo: '#ff0058',
    btnText: 'View Ledger',
  },
  {
    title: 'Bidding Economics',
    desc: 'Game-theoretic delta-V bidding engine. Computes optimal, fair maneuver trade-offs based on fuel cost, delay, and safety.',
    gradientFrom: '#4dff03',
    gradientTo: '#00d0ff',
    btnText: 'Run Bidding',
  },
];

export default function SkewCards({ onAction }) {
  return (
    <>
      <div className="flex justify-center items-center flex-wrap py-10 bg-transparent min-h-[500px]">
        {cards.map(({ title, desc, gradientFrom, gradientTo, btnText }, idx) => (
          <div
            key={idx}
            className="group relative w-[320px] h-[420px] m-[40px_30px] transition-all duration-500"
          >
            {/* Skewed gradient panels */}
            <span
              className="absolute top-0 left-[50px] w-1/2 h-full rounded-lg transform skew-x-[15deg] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[20px] group-hover:w-[calc(100%-90px)]"
              style={{
                background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
              }}
            />
            <span
              className="absolute top-0 left-[50px] w-1/2 h-full rounded-lg transform skew-x-[15deg] blur-[30px] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[20px] group-hover:w-[calc(100%-90px)]"
              style={{
                background: `linear-gradient(315deg, ${gradientFrom}, ${gradientTo})`,
              }}
            />

            {/* Animated blurs */}
            <span className="pointer-events-none absolute inset-0 z-10">
              <span className="absolute top-0 left-0 w-0 h-0 rounded-lg opacity-0 bg-[rgba(255,255,255,0.1)] backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.08)] transition-all duration-100 animate-blob group-hover:top-[-50px] group-hover:left-[50px] group-hover:w-[100px] group-hover:h-[100px] group-hover:opacity-100" />
              <span className="absolute bottom-0 right-0 w-0 h-0 rounded-lg opacity-0 bg-[rgba(255,255,255,0.1)] backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.08)] transition-all duration-500 animate-blob animation-delay-1000 group-hover:bottom-[-50px] group-hover:right-[50px] group-hover:w-[100px] group-hover:h-[100px] group-hover:opacity-100" />
            </span>

            {/* Content */}
            <div className="relative z-20 left-0 p-[20px_40px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-[10px] shadow-lg rounded-lg text-white transition-all duration-500 group-hover:left-[-25px] group-hover:p-[60px_40px] h-[340px] flex flex-col justify-between">
              <div>
                <h2 className="text-2xl mb-3 font-bold tracking-tight text-white">{title}</h2>
                <p className="text-sm leading-relaxed mb-4 text-slate-200">{desc}</p>
              </div>
              <div>
                <button
                  onClick={onAction}
                  className="inline-block text-sm font-bold text-black bg-white px-4 py-2 rounded hover:bg-[#ffcf4d] hover:border hover:border-[rgba(255,0,88,0.4)] hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  {btnText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tailwind custom utilities for animation and shadows */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translateY(10px); }
          50% { transform: translate(-10px); }
        }
        .animate-blob { animation: blob 2s ease-in-out infinite; }
        .animation-delay-1000 { animation-delay: -1s; }
      `}</style>
    </>
  );
}
