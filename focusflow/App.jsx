const App = () => {
  const Navbar = window.Navbar;
  const HeroSection = window.HeroSection;
  const CapabilitiesSection = window.CapabilitiesSection;

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

window.App = App;
