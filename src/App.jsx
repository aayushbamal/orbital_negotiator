import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ProductLanding from './ProductLanding';
import OrbitalNegotiator from './OrbitalNegotiator';

// Import subpages
import ProtocolDocs from './pages/ProtocolDocs';
import TrajectoryAPI from './pages/TrajectoryAPI';
import ZKPLedger from './pages/ZKPLedger';
import AuditReports from './pages/AuditReports';
import BiddingEngine from './pages/BiddingEngine';
import GameTheoryModel from './pages/GameTheoryModel';
import SGP4Reference from './pages/SGP4Reference';
import Whitepaper from './pages/Whitepaper';
import Developers from './pages/Developers';

function AppContent() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<ProductLanding onLaunch={() => navigate('/simulator')} />} />
      <Route path="/simulator" element={<OrbitalNegotiator onBack={() => navigate('/')} />} />
      
      {/* Docs routes */}
      <Route path="/docs/protocol" element={<ProtocolDocs />} />
      <Route path="/docs/trajectory-api" element={<TrajectoryAPI />} />
      <Route path="/docs/zkp-ledger" element={<ZKPLedger />} />
      <Route path="/research/audit-reports" element={<AuditReports />} />
      <Route path="/docs/bidding-engine" element={<BiddingEngine />} />
      <Route path="/research/game-theory" element={<GameTheoryModel />} />
      <Route path="/research/sgp4" element={<SGP4Reference />} />
      <Route path="/research/whitepaper" element={<Whitepaper />} />
      <Route path="/developers" element={<Developers />} />
      
      {/* Fallback to landing */}
      <Route path="*" element={<ProductLanding onLaunch={() => navigate('/simulator')} />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
