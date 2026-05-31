import React from 'react';
import { motion } from 'framer-motion';

const CapCard = ({ title, body, iconPath, tags, variants }) => {
  return (
    <motion.div
      variants={variants}
      className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col justify-between hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group"
    >
      {/* Top Row of Card */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Nested liquid-glass square */}
        <div className="w-11 h-11 rounded-[0.75rem] liquid-glass flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
          <svg
            className="h-6 w-6 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d={iconPath} />
          </svg>
        </div>

        {/* Right: Small tags */}
        <div className="flex flex-wrap justify-end gap-1.5 max-w-[75%]">
          {tags.map((tag, tagIdx) => (
            <span
              key={tagIdx}
              className="liquid-glass rounded-full px-2.5 py-1 text-[10px] md:text-[11px] text-white/90 font-body whitespace-nowrap tracking-wide"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Middle Spacer */}
      <div className="flex-1" />

      {/* Bottom of Card */}
      <div className="mt-6">
        <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none select-none">
          {title}
        </h3>
        <p className="mt-3 text-sm text-white/90 font-body font-light leading-snug max-w-[32ch]">
          {body}
        </p>
      </div>
    </motion.div>
  );
};

export default CapCard;
