import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Cpu, History, Zap, CheckCircle2 } from "lucide-react";

interface LogEntry {
  id: string;
  time: string;
  type: "INFO" | "SUCCESS" | "WARNING";
  message: string;
}

export default function InteractiveDashboard() {
  // Sandbox State
  const [angle, setAngle] = useState<number>(45);
  const [fuelRatio, setFuelRatio] = useState<number>(50); // 0 = Alpha has all, 100 = Beta has all
  const [proximity, setProximity] = useState<number>(120); // safety threshold in meters
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<"idle" | "scanning" | "resolved">("idle");
  const [alphaManeuverCost, setAlphaManeuverCost] = useState<number>(0);
  const [betaManeuverCost, setBetaManeuverCost] = useState<number>(0);
  const [resolutionTime, setResolutionTime] = useState<number>(0);

  // Telemetry Stats State
  const [operators, setOperators] = useState<number>(1402);
  const [avoidanceRate, setAvoidanceRate] = useState<number>(99.9984);
  const [maneuversHashed, setManeuversHashed] = useState<number>(182492);
  
  // Real-time Audit Trail Log State
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "1", time: "01:36:10 UT", type: "SUCCESS", message: "LEO-4029 <=> BEIDOU-18 | Maneuver Hashed: 0x8a92...2e11" },
    { id: "2", time: "01:36:24 UT", type: "INFO", message: "STARLINK-1293 <=> ONEWEB-04 | Yielded to STARLINK" },
    { id: "3", time: "01:36:40 UT", type: "SUCCESS", message: "ISS-ZARYA <=> METEOR-22 | Delta-V Adjustment complete" },
  ]);

  // Sparkline Chart State
  const [sparklineData, setSparklineData] = useState<number[]>([42, 50, 48, 62, 55, 70, 65, 80, 75, 90, 85, 95]);

  // Auto-ticking telemetry stats & logs
  useEffect(() => {
    const timer = setInterval(() => {
      // Tick maneuvers hashed
      setManeuversHashed(prev => prev + Math.floor(Math.random() * 3) + 1);
      
      // Randomly change operators slightly
      setOperators(prev => prev + (Math.random() > 0.5 ? 1 : -1));
      
      // Randomly fluctuation avoidance rate slightly
      setAvoidanceRate(prev => {
        const delta = (Math.random() - 0.5) * 0.0001;
        return parseFloat((prev + delta).toFixed(4));
      });

      // Update sparkline data
      setSparklineData(prev => {
        const next = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        const change = Math.floor((Math.random() - 0.5) * 15);
        next.push(Math.max(20, Math.min(100, last + change)));
        return next;
      });

      // Append new log entry occasionally
      if (Math.random() > 0.6) {
        const systems = ["STARLINK", "ONEWEB", "GPS-III", "GLONASS", "IRIDIUM", "YAOGAN", "COSMOS"];
        const s1 = systems[Math.floor(Math.random() * systems.length)] + "-" + Math.floor(Math.random() * 2000 + 100);
        const s2 = systems[Math.floor(Math.random() * systems.length)] + "-" + Math.floor(Math.random() * 2000 + 100);
        if (s1 !== s2) {
          const now = new Date();
          const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} UT`;
          const hash = Math.random().toString(16).substring(2, 6) + "..." + Math.random().toString(16).substring(2, 6);
          const newEntry: LogEntry = {
            id: Date.now().toString(),
            time: timeStr,
            type: Math.random() > 0.35 ? "SUCCESS" : "INFO",
            message: `${s1} <=> ${s2} | Maneuver Hashed: 0x${hash}`,
          };
          setLogs(prev => [newEntry, ...prev.slice(0, 9)]);
        }
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleSimulate = () => {
    setIsSimulating(true);
    setSimulationStep("scanning");
    
    // Simulate game-theoretic path calculations
    setTimeout(() => {
      // Calculate costs based on sliders
      const alphaYields = fuelRatio > 50; 
      
      if (alphaYields) {
        setAlphaManeuverCost(parseFloat((0.45 * (fuelRatio / 50)).toFixed(3)));
        setBetaManeuverCost(0);
      } else {
        setBetaManeuverCost(parseFloat((0.45 * ((100 - fuelRatio) / 50)).toFixed(3)));
        setAlphaManeuverCost(0);
      }
      
      setResolutionTime(Math.floor(Math.random() * 25) + 32); // 32ms - 57ms
      setSimulationStep("resolved");
      setIsSimulating(false);

      // Append simulation result to logs
      const now = new Date();
      const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} UT`;
      const avoidanceLog: LogEntry = {
        id: Date.now().toString(),
        time: timeStr,
        type: "SUCCESS",
        message: `SANDBOX RESOLVED: Alpha & Beta safely coordinated. Path shifted in ${resolutionTime}ms.`,
      };
      setLogs(prev => [avoidanceLog, ...prev.slice(0, 9)]);
    }, 1500);
  };

  // SVG parameters calculated dynamically based on sliders and simulation states
  const intersectionPoint = { x: 150, y: 100 };
  
  // Alpha Path starts bottom-left and goes top-right
  // Beta Path starts top-left and goes bottom-right
  const alphaYields = fuelRatio > 50;
  const avoidanceBending = simulationStep === "resolved" ? 35 : 0;

  // Render SVG Sparkline path
  const generateSparklinePath = () => {
    const width = 240;
    const height = 40;
    const step = width / (sparklineData.length - 1);
    return sparklineData
      .map((val, idx) => {
        const x = idx * step;
        const y = height - (val / 100) * height + 2;
        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  return (
    <div className="w-full bg-[#080C12]/50 border-t border-slate-900/60 py-16 px-6 md:px-12 relative overflow-hidden">
      {/* Decorative cyber grid lines */}
      <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        
        {/* ================= LEFT COLUMN: SANDBOX SIMULATOR ================= */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative">
          {/* Corner HUD notches */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500/50" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500/50" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500/50" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500/50" />

          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="font-mono text-xs text-cyan-400 tracking-widest uppercase">CONJUNCTION RESOLUTION SANDBOX</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2 font-mono">
              Live Coordinate Negotiator
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mb-6 leading-relaxed">
              Tweak proximity variables to simulate how autonomous orbit operators negotiate collision path avoidance without ground communication.
            </p>

            {/* Simulation Canvas */}
            <div className="w-full h-64 md:h-72 bg-slate-950 border border-slate-900/60 rounded-xl relative overflow-hidden flex items-center justify-center">
              {/* Radar sweep scanline */}
              <div className="absolute inset-0 pointer-events-none bg-radial-gradient" />
              
              {/* Conjunction alert text overlay */}
              {simulationStep === "scanning" && (
                <div className="absolute inset-0 bg-cyan-500/5 backdrop-blur-[1px] flex flex-col items-center justify-center z-20">
                  <div className="animate-pulse flex flex-col items-center">
                    <Activity className="h-8 w-8 text-cyan-400 animate-spin duration-3000 mb-2" />
                    <span className="font-mono text-xs text-cyan-400 tracking-wider">RUNNING PROTOCOL V4 AUCTION...</span>
                  </div>
                </div>
              )}

              {/* Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

              <svg className="w-full h-full" viewBox="0 0 300 200">
                {/* Orbital Path Alpha (bottom-left to top-right) */}
                <path
                  d={`M 30,170 Q 150,${100 + (alphaYields ? avoidanceBending : 0)} 270,30`}
                  fill="none"
                  stroke={simulationStep === "resolved" && !alphaYields ? "#10b981" : "#475569"}
                  strokeWidth="2"
                  strokeDasharray={simulationStep === "resolved" ? "0" : "4 2"}
                />

                {/* Orbital Path Beta (top-left to bottom-right) */}
                <path
                  d={`M 30,30 Q 150,${100 - (!alphaYields ? avoidanceBending : 0) - (angle - 45)/2} 270,170`}
                  fill="none"
                  stroke={simulationStep === "resolved" && alphaYields ? "#10b981" : "#475569"}
                  strokeWidth="2"
                  strokeDasharray={simulationStep === "resolved" ? "0" : "4 2"}
                />

                {/* Proximity Threshold Safety circle at junction */}
                <circle
                  cx={intersectionPoint.x}
                  cy={intersectionPoint.y}
                  r={proximity / 5}
                  fill="none"
                  stroke={simulationStep === "resolved" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.2)"}
                  strokeWidth="1.5"
                  className={simulationStep !== "resolved" ? "animate-pulse" : ""}
                />

                {/* Collision Node point */}
                {simulationStep !== "resolved" && (
                  <circle
                    cx={intersectionPoint.x}
                    cy={intersectionPoint.y}
                    r="4"
                    fill="#ef4444"
                    className="animate-ping"
                  />
                )}

                {/* Spacecraft Node Alpha (moving along first path) */}
                <motion.circle
                  r="5"
                  fill="#5ba8d0"
                  animate={
                    simulationStep === "scanning" 
                      ? { cx: [30, 150], cy: [170, 100] } 
                      : simulationStep === "resolved" 
                        ? { cx: 270, cy: 30 } 
                        : { cx: 70, cy: 140 }
                  }
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                
                {/* Spacecraft Node Beta (moving along second path) */}
                <motion.circle
                  r="5"
                  fill="#c8d8e8"
                  animate={
                    simulationStep === "scanning" 
                      ? { cx: [30, 150], cy: [30, 100] } 
                      : simulationStep === "resolved" 
                        ? { cx: 270, cy: 170 } 
                        : { cx: 70, cy: 60 }
                  }
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Labels */}
                <text x="25" y="185" fill="#5ba8d0" fontSize="8" fontFamily="monospace">ALPHA (OPS-92)</text>
                <text x="25" y="22" fill="#c8d8e8" fontSize="8" fontFamily="monospace">BETA (OPS-18)</text>
                
                {simulationStep === "resolved" && (
                  <g>
                    <rect x="90" y="10" width="120" height="20" rx="3" fill="#080c12" stroke="#10b981" strokeWidth="1"/>
                    <text x="150" y="22" fill="#10b981" fontSize="8" fontFamily="monospace" textAnchor="middle">
                      COLLISION AVOIDED
                    </text>
                  </g>
                )}
              </svg>

              {/* Status display overlay */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 border border-slate-800 rounded px-3 py-2 flex justify-between items-center text-[10px] font-mono">
                <div>
                  <span className="text-slate-400 font-medium">STATUS: </span>
                  {simulationStep === "idle" && <span className="text-red-400 font-semibold">CONJUNCTION WARNING</span>}
                  {simulationStep === "scanning" && <span className="text-cyan-400 animate-pulse font-semibold">CALCULATING...</span>}
                  {simulationStep === "resolved" && <span className="text-emerald-400 font-semibold">PATH SECURED</span>}
                </div>
                {simulationStep === "resolved" && (
                  <div className="flex gap-3 text-slate-300">
                    <span>Alpha cost: {alphaManeuverCost}kg</span>
                    <span>Beta cost: {betaManeuverCost}kg</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sliders and Simulation trigger */}
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Slider 1: Approach Angle */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Approach Angle</span>
                  <span className="text-cyan-400 font-semibold">{angle}°</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="165"
                  value={angle}
                  disabled={isSimulating}
                  onChange={(e) => {
                    setAngle(parseInt(e.target.value));
                    if (simulationStep === "resolved") setSimulationStep("idle");
                  }}
                  className="w-full h-6 accent-cyan-500 bg-slate-900/50 border border-slate-800/60 rounded px-1 cursor-pointer"
                />
              </div>

              {/* Slider 2: Fuel Balance Ratio */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Alpha Fuel Reserve</span>
                  <span className="text-cyan-400 font-semibold">{100 - fuelRatio}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={fuelRatio}
                  disabled={isSimulating}
                  onChange={(e) => {
                    setFuelRatio(parseInt(e.target.value));
                    if (simulationStep === "resolved") setSimulationStep("idle");
                  }}
                  className="w-full h-6 accent-cyan-500 bg-slate-900/50 border border-slate-800/60 rounded px-1 cursor-pointer"
                />
              </div>

              {/* Slider 3: Safety Margin */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Safety Margin</span>
                  <span className="text-cyan-400 font-semibold">{proximity}m</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="250"
                  value={proximity}
                  disabled={isSimulating}
                  onChange={(e) => {
                    setProximity(parseInt(e.target.value));
                    if (simulationStep === "resolved") setSimulationStep("idle");
                  }}
                  className="w-full h-6 accent-cyan-500 bg-slate-900/50 border border-slate-800/60 rounded px-1 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className={`w-full py-3 px-4 rounded-lg font-mono text-sm tracking-wider font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                isSimulating
                  ? "bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800"
                  : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              }`}
            >
              <Zap className="h-4 w-4 fill-current" />
              {isSimulating ? "COMPUTING SYSTEM RESOLUTION..." : "RUN COLLISION AVOIDANCE SIMULATION"}
            </button>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: METRICS & TRANSACTION LOG ================= */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Real-time counters panel */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative">
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-slate-700" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-slate-700" />
            
            <div className="grid grid-cols-2 gap-4">
              
              {/* Stat 1: Active Operators */}
              <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">ACTIVE OPERATORS</span>
                  <Cpu className="h-3.5 w-3.5 text-cyan-400/80" />
                </div>
                <div className="text-xl font-bold font-mono text-white tracking-tight">
                  {operators.toLocaleString()}
                </div>
                <div className="text-[9px] font-mono text-slate-500 mt-1">
                  CONNECTED ORBITS
                </div>
              </div>

              {/* Stat 2: Avoidance Rate */}
              <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">RESOLVED RATE</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-bold font-mono text-emerald-400 tracking-tight">
                  {avoidanceRate}%
                </div>
                <div className="text-[9px] font-mono text-slate-500 mt-1">
                  ZERO COLLISION TARGET
                </div>
              </div>

              {/* Stat 3: Total Hashed Maneuvers */}
              <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-xl col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">MANEUVERS LOGGED (LEDGER)</span>
                    <div className="text-2xl font-bold font-mono text-white tracking-tight mt-0.5">
                      {maneuversHashed.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">SWEEPS / HR</span>
                    {/* Sparkline Canvas */}
                    <svg className="w-24 h-8 mt-1" viewBox="0 0 240 45">
                      <path
                        d={generateSparklinePath()}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Audit trail ledger feed */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl flex-1 flex flex-col justify-between relative">
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-slate-700" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-slate-700" />

            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-2">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-cyan-400" />
                  <span className="font-mono text-xs text-white tracking-wider uppercase">LEDGER TRANSMISSION FEED</span>
                </div>
                <span className="text-[9px] font-mono text-slate-500">REALTIME AUDITS</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-hidden relative">
                {/* Fade effect at the bottom of the log */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none z-10" />

                <AnimatePresence initial={false}>
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="bg-slate-950/70 border border-slate-900/60 px-3 py-2 rounded flex flex-col gap-0.5 text-[10.5px] font-mono"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-cyan-400/70">{log.time}</span>
                        <span className={`text-[8.5px] px-1 rounded uppercase font-semibold ${
                          log.type === "SUCCESS" ? "bg-emerald-950/40 text-emerald-400" : "bg-cyan-950/40 text-cyan-400"
                        }`}>
                          {log.type}
                        </span>
                      </div>
                      <span className="text-slate-300 leading-normal line-clamp-1">{log.message}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
