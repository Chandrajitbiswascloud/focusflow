import React from 'react';
import { motion } from 'framer-motion';

const Partners = () => {
  const animProps = (delay) => ({
    initial: { filter: "blur(10px)", opacity: 0, y: 20 },
    animate: { filter: "blur(0px)", opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: "easeOut" }
  });

  return (
    <motion.div
      {...animProps(1.4)}
      className="relative z-10 flex flex-col items-center gap-4 pb-12 px-4"
    >
      <div className="liquid-glass rounded-full px-4 py-1.5 text-xs font-medium text-white/95 font-body">
        Collaborating with top aerospace pioneers globally
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-12 md:gap-x-16 gap-y-4 font-heading italic text-white text-2xl md:text-3xl tracking-tight mt-2 opacity-85 select-none">
        <span>Aeon</span>
        <span className="text-white/20 text-xl hidden xs:inline">•</span>
        <span>Vela</span>
        <span className="text-white/20 text-xl hidden xs:inline">•</span>
        <span>Apex</span>
        <span className="text-white/20 text-xl hidden xs:inline">•</span>
        <span>Orbit</span>
        <span className="text-white/20 text-xl hidden xs:inline">•</span>
        <span>Zeno</span>
      </div>
    </motion.div>
  );
};

export default Partners;
