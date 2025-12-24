
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ElfProps {
  state: 'approaching' | 'scanning' | 'scribbling' | 'handing' | 'annoyed' | 'idle';
  speech?: string;
}

const Elf: React.FC<ElfProps> = ({ state, speech }) => {
  return (
    <div className="relative flex flex-col items-center z-20">
      <AnimatePresence>
        {speech && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute -top-36 w-64 glass-card p-5 rounded-[2.5rem] shadow-2xl font-bold text-center border-2 border-[#C21807] z-50 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-white"
          >
            <span className="text-sm uppercase tracking-tight font-sans text-red-700">{speech}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={
          state === 'approaching' ? { 
            scale: [0.3, 1], 
            y: [200, 0],
            rotate: [0, -5, 5, -5, 0] 
          } :
          state === 'scanning' ? { 
            scale: 1.25, 
            y: [0, -20, 0],
            rotate: [0, 3, -3, 3, 0],
          } :
          state === 'scribbling' ? { 
            rotate: [0, 8, -8, 8, 0],
            x: [0, -2, 2, -2, 0]
          } :
          state === 'handing' ? { 
            scale: [1, 2, 5],
            y: [0, -100, -200],
            opacity: [1, 1, 0]
          } :
          state === 'annoyed' ? {
            x: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 1]
          } : {
            y: [0, -10, 0]
          }
        }
        transition={{ 
          duration: state === 'handing' ? 1.5 : 0.6,
          repeat: (state === 'approaching' || state === 'handing') ? 0 : Infinity,
          ease: "easeInOut"
        }}
        className="relative w-80 h-96 elf-glow"
      >
        <svg viewBox="0 0 200 260" className="w-full h-full overflow-visible">
          {/* Shadow */}
          <ellipse cx="100" cy="250" rx="75" ry="14" fill="rgba(0,0,0,0.3)" />
          
          {/* Elf Body */}
          <path d="M50 160 L150 160 L165 230 L35 230 Z" fill="#01796F" />
          <rect x="50" y="200" width="100" height="18" fill="#1a1a1a" />
          <rect x="85" y="195" width="30" height="28" fill="#FFD700" rx="4" />
          
          {/* Head & Face */}
          <path d="M40 120 Q10 100 45 80 Z" fill="#FADCB9" />
          <path d="M160 120 Q190 100 155 80 Z" fill="#FADCB9" />
          <circle cx="100" cy="110" r="60" fill="#FADCB9" />
          
          {/* Eyes & Mouth */}
          <circle cx="80" cy="105" r="6" fill="#1a1a1a" />
          <circle cx="120" cy="105" r="6" fill="#1a1a1a" />
          <path d="M80 140 Q100 155 120 140" stroke="#C21807" strokeWidth="4" fill="none" strokeLinecap="round" />
          
          {/* Hat */}
          <path d="M40 80 L100 -20 L190 30 L160 85 Z" fill="#C21807" />
          <circle cx="190" cy="30" r="14" fill="white" />
          <rect x="35" y="75" width="130" height="20" rx="10" fill="white" />

          {/* ACCESSORIES BY STATE */}
          {state === 'scanning' && (
            <g transform="translate(60, 150)">
              {/* Magic Camera being held by hands */}
              <rect x="0" y="0" width="85" height="65" rx="10" fill="#333" stroke="#555" strokeWidth="2" />
              <circle cx="42" cy="32" r="22" fill="#222" stroke="silver" strokeWidth="4" />
              <rect x="10" y="-12" width="22" height="12" fill="#C21807" />
              <circle cx="70" cy="10" r="6" fill="#FFD700" className="animate-pulse" />
              {/* Hands on camera */}
              <circle cx="-5" cy="32" r="12" fill="#FADCB9" />
              <circle cx="90" cy="32" r="12" fill="#FADCB9" />
            </g>
          )}

          {state === 'scribbling' && (
            <g transform="translate(140, 180)">
               <motion.path 
                d="M0 0 L45 -45" 
                stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round"
                animate={{ rotate: [0, 25, 0] }}
                transition={{ repeat: Infinity, duration: 0.12 }}
               />
               <circle cx="0" cy="0" r="12" fill="#FADCB9" />
            </g>
          )}

          {state === 'handing' && (
             <g transform="translate(60, 140)">
               <rect x="0" y="0" width="80" height="70" fill="#FFD700" rx="8" />
               <path d="M0 35 L80 35" stroke="#C21807" strokeWidth="10" />
               <path d="M40 0 L40 70" stroke="#C21807" strokeWidth="10" />
               <circle cx="-10" cy="35" r="12" fill="#FADCB9" />
               <circle cx="90" cy="35" r="12" fill="#FADCB9" />
             </g>
          )}

          {state === 'idle' && (
            <g>
               <circle cx="40" cy="180" r="14" fill="#FADCB9" />
               <circle cx="160" cy="180" r="14" fill="#FADCB9" />
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  );
};

export default Elf;
