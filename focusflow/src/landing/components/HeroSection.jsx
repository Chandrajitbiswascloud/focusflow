import React from 'react';
import { motion } from 'framer-motion';
import FadingVideo from './FadingVideo';
import BlurText from './BlurText';
import Partners from './Partners';
import { ArrowUpRight, PlayIcon } from './Icons';

const HeroSection = () => {
  const animProps = (delay) => ({
    initial: { filter: "blur(10px)", opacity: 0, y: 20 },
    animate: { filter: "blur(0px)", opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: "easeOut" }
  });

  return (
    <section id="home" className="relative w-full min-h-screen bg-black overflow-hidden flex flex-col justify-between z-10">
      {/* Background Video */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0 select-none pointer-events-none"
        style={{ width: "120%", height: "120%" }}
      />

      {/* Hero content container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center pt-32 pb-16 px-4 max-w-5xl mx-auto w-full">
        {/* Badge */}
        <motion.div
          {...animProps(0.4)}
          className="inline-flex items-center gap-2 p-1.5 rounded-full liquid-glass text-white mb-6 select-none"
        >
          <span className="bg-white text-black px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider font-body">
            New
          </span>
          <span className="text-xs md:text-sm font-medium pr-3 font-body text-white/95">
            Maiden Crewed Voyage to Mars Arrives 2026
          </span>
        </motion.div>

        {/* Headline */}
        <div className="w-full max-w-4xl select-none mb-6">
          <BlurText
            text="Venture Past Our Sky Across the Universe"
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.85] tracking-[-4px]"
          />
        </div>

        {/* Subheading */}
        <motion.p
          {...animProps(0.8)}
          className="text-sm md:text-base text-white/80 max-w-2xl font-body font-light leading-relaxed mt-2"
        >
          Discover the universe in ways once unimaginable. Our pioneering vessels and breakthrough engineering bring deep-space exploration within reach—secure and extraordinary.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...animProps(1.1)}
          className="flex flex-wrap items-center justify-center gap-6 mt-8"
        >
          {/* Primary CTA */}
          <button className="liquid-glass-strong rounded-full px-6 py-3 text-sm font-medium text-white flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform duration-300">
            <span>Start Your Voyage</span>
            <ArrowUpRight className="h-5 w-5" />
          </button>

          {/* Secondary CTA */}
          <a
            href="#voyages"
            className="group flex items-center gap-2 text-white font-medium font-body text-sm hover:text-white/85 transition-colors"
          >
            <span>View Liftoff</span>
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 group-hover:bg-white/20 group-hover:scale-105 transition-all">
              <PlayIcon className="h-3.5 w-3.5 text-white" />
            </span>
          </a>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          {...animProps(1.3)}
          className="flex flex-wrap justify-center items-stretch gap-6 mt-12 w-full"
        >
          {/* Stat Card 1 */}
          <div className="liquid-glass p-6 w-[220px] rounded-[1.25rem] flex flex-col justify-between items-start text-left">
            {/* Outline Clock Icon */}
            <div className="text-white mb-6">
              <svg
                className="w-7 h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div className="font-heading italic text-white text-4xl tracking-[-1px] leading-none">
                34.5 Min
              </div>
              <div className="text-xs text-white/70 font-body font-light mt-2">
                Average Videos Watch Time
              </div>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="liquid-glass p-6 w-[220px] rounded-[1.25rem] flex flex-col justify-between items-start text-left">
            {/* Outline Globe Icon */}
            <div className="text-white mb-6">
              <svg
                className="w-7 h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div>
              <div className="font-heading italic text-white text-4xl tracking-[-1px] leading-none">
                2.8B+
              </div>
              <div className="text-xs text-white/70 font-body font-light mt-2">
                Users Across the Globe
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Partners Row */}
      <Partners />
    </section>
  );
};

export default HeroSection;
