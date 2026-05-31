// Suppress benign Framer Motion console warnings
const originalError = console.error;
console.error = (...args) => {
  if (
    args[0] &&
    typeof args[0] === "string" &&
    (args[0].includes("Framer Motion") || args[0].includes("FramerMotion"))
  ) {
    return;
  }
  originalError(...args);
};

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

// Mount the React Application
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<App />);
