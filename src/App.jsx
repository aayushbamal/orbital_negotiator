import React, { useState } from 'react';
import ProductLanding from './ProductLanding';
import OrbitalNegotiator from './OrbitalNegotiator';

function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'simulator'

  if (view === 'simulator') {
    return <OrbitalNegotiator onBack={() => setView('landing')} />;
  }

  return <ProductLanding onLaunch={() => setView('simulator')} />;
}

export default App;
