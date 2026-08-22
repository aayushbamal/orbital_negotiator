# 🛰️ Orbital Negotiator (ONP v4.1)

> **Autonomous Low Earth Orbit (LEO) Space Traffic Management via Game-Theoretic Bidding, Adaptive Escalation & Cryptographic Audit Trails.**

---

## 🌌 Overview

As Low Earth Orbit (LEO) expands toward 60,000+ active satellites by 2030, traditional ground-station conjunction coordination (taking 4 to 8 hours of human telemetry relays) becomes a fatal bottleneck for orbital safety.

**Orbital Negotiator** is a decentralized, on-orbit Space Traffic Management (STM) protocol that enables spacecraft to:
1. **Detect Close Approaches**: Compute spatial proximity and collision probability ($P_c$) in real-time.
2. **Execute Autonomous Game-Theoretic Bidding**: Resolve right-of-way encounters via deterministic Nash equilibrium scoring in **$< 50\text{ms}$**.
3. **Handle Dynamic Aerospace Emergencies**: Mitigate multi-satellite cascade conjunctions, solar storms (CME), and hyper-velocity debris swarms.
4. **Preserve Cryptographic Integrity**: Commit all maneuver agreements to an immutable, tamper-evident SHA-256 / zk-SNARK verification ledger with instant JSON and Word `.doc` report exports.

---

## 🧮 Mathematical Pricing & Right-of-Way Formulation

Right-of-way is evaluated autonomously over peer-to-peer Inter-Satellite Crosslinks (ISL) using a deterministic cost-minimization bidding function:

$$C_\text{bid} = \alpha \cdot \left(\frac{P_c \times 100}{\text{Propellant}}\right) + \beta \cdot \text{MissionPriority} + \gamma \cdot \text{RecoveryTime}$$

### ⚙️ Protocol Parameters:
* **$\alpha = 1.2$ ($\Delta v$ Fuel Scarcity Penalty)**: Prevents fuel-constrained satellites from early mission termination by forcing propellant-rich assets to yield.
* **$\beta = 0.8$ (Mission Criticality Weight)**: Asserts right-of-way for strategic, crewed, or high-value defense missions.
* **$\gamma = 0.5$ (Recovery Downtime Weight)**: Minimizes constellation disruption and payload thermal recovery time.

### ⚖️ The Equilibrium Rule:
* **Winning Spacecraft (Higher $C_\text{bid}$)**: Preserves its nominal trajectory without burning propellant.
* **Yielding Spacecraft (Lower $C_\text{bid}$)**: Executes an orthogonal, fuel-optimal Collision Avoidance Maneuver (CAM).

---

## ⚡ Adaptive Multi-Tier Escalation Architecture

Orbital Negotiator automatically derives sensible safety thresholds based on live telemetry context while keeping them operator-editable:

| Escalation Tier | Trigger Criteria | Autonomous Action Protocol |
| :--- | :--- | :--- |
| **Tier 1: Nominal** | $P_c < 0.35$ &middot; Miss Dist $> 3\text{ km}$ | Passive SGP4 tracking, background ISL sync |
| **Tier 2: Urgent** | $P_c \ge 0.38$ or Fuel $< 18\%$ | Fast-track 1-round bidding with priority weight boost |
| **Tier 3: Emergency** | $P_c \ge 0.65$ or Simultaneous Cluster | Unilateral cross-track burst ($1.8\times$ thrust), $P_c \to 0\%$ |

---

## 🚨 Emergency Collision Scenarios

* **Simultaneous Multi-Satellite Cascade Conjunction**: Resolves 6-satellite convergent cluster collisions via concurrent pairwise auctions without circular yield deadlocks.
* **Solar Radiation Storm (CME)**: Fleet-wide Tier 3 emergency escalation with geomagnetic navigation compensation.
* **Hyper-Velocity Debris Swarm**: Rapid $1.8\times$ cross-track thrust bursts to evacuate orbital shells.
* **Crewed / Strategic Defense Insertion**: Maximum priority asserting right-of-way across all intersecting planes.

---

## 📋 Comprehensive Reporting & Export Formats

* **📄 Microsoft Word (`.doc`) Systematic Audit Report**: Formatted aerospace audit with mathematical formulas, executive summaries, full 20-satellite telemetry tables, and chronological maneuver history.
* **📥 Cryptographic Ledger (`.json`)**: Machine-readable JSON export with SHA-256 state roots, sequence IDs, and verification flags.
* **🚨 Emergency Incident Report (`.json`)**: Instant post-incident reports accessible during and after emergency situations.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite 8, Tailwind CSS
* **3D Visualization**: Three.js (High-performance 60 FPS Earth sphere with vector land glows, atmospheric shader, night city lights, and dynamic orbital path prediction)
* **Orbital Mechanics**: Deterministic SGP4 trajectory propagator with cross-track de-confliction
* **Backend Ready**: Supabase (PostgreSQL, Realtime WebSockets, Storage)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/aayushbamal/orbital_negotiator.git
cd orbital_negotiator
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173/simulator](http://localhost:5173/simulator) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
