import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CapabilitiesSection from './components/CapabilitiesSection';

const App = () => {
  return (
    <div className="bg-black text-white min-h-screen relative font-body selection:bg-white/20 selection:text-white">
      {/* Shared Navbar */}
      <Navbar />

      {/* Main content sections */}
      <main>
        {/* Section 1: Hero */}
        <HeroSection />

        {/* Section 2: Capabilities */}
        <CapabilitiesSection />
      </main>
    </div>
  );
};

export default App;
