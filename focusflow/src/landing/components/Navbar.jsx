import React from 'react';
import { ArrowUpRight } from './Icons';

const Navbar = () => {
  return (
    <nav className="fixed top-4 left-0 right-0 px-8 lg:px-16 z-50 flex items-center justify-between pointer-events-none">
      {/* Left: 48x48 liquid-glass circle with lowercase "a" */}
      <div className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center pointer-events-auto select-none cursor-pointer hover:scale-105 transition-transform">
        <span className="font-heading italic text-2xl text-white lowercase">a</span>
      </div>

      {/* Center: liquid-glass pill with 5 links and CTA button (desktop only) */}
      <div className="hidden md:flex items-center gap-1.5 liquid-glass rounded-full px-1.5 py-1.5 pointer-events-auto">
        {["Home", "Voyages", "Worlds", "Innovation", "Plan Launch"].map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
            className="px-3 py-2 text-sm font-medium text-white/90 font-body hover:text-white transition-colors"
          >
            {link}
          </a>
        ))}
        
        {/* CTA Button in the Navbar */}
        <button className="bg-white text-black rounded-full px-4 py-2 text-sm font-medium font-body flex items-center gap-1.5 whitespace-nowrap hover:bg-white/90 hover:scale-102 active:scale-98 transition-all">
          Claim a Spot
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      {/* Right: 48x48 invisible spacer to balance the layout */}
      <div className="w-12 h-12 pointer-events-none" />
    </nav>
  );
};

export default Navbar;
