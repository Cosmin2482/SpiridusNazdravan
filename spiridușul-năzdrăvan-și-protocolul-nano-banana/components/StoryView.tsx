
import React from 'react';
import { motion } from 'framer-motion';
import { MagicLetter } from '../types';
import { Heart, Send, Bookmark, MoreHorizontal, Sparkles, Star } from 'lucide-react';
import Snow from './Snow';

interface StoryViewProps {
  letter: MagicLetter;
  userName: string;
  profilePhoto: string; 
  elfSticker: string;  
  artUrl: string;       
}

const StoryView: React.FC<StoryViewProps> = ({ letter, userName, profilePhoto, elfSticker, artUrl }) => {
  return (
    <div className="relative dvh-screen w-full bg-[#0a0a0a] overflow-hidden flex flex-col">
      <Snow />
      
      {/* Background */}
      <div className="absolute inset-0">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.9 }}
          transition={{ duration: 2 }}
          src={artUrl} 
          className="w-full h-full object-cover" 
          alt="Christmas" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
      </div>

      {/* Profile Bar */}
      <div className="relative z-20 p-5 flex items-center justify-between mt-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 to-red-600">
            <img src={profilePhoto} className="w-full h-full object-cover rounded-full border border-white/20" alt="User" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-sm drop-shadow-md">{userName}</span>
            <span className="text-[9px] text-yellow-400 font-bold tracking-widest uppercase">Verified Elf</span>
          </div>
        </div>
        <MoreHorizontal className="text-white opacity-60" />
      </div>

      {/* Main Sticker */}
      <motion.div 
        animate={{ y: [0, -15, 0], rotate: [-2, 2, -2] }} 
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[18%] left-0 right-0 mx-auto w-64 h-64 z-20"
      >
        <motion.div 
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          className="relative w-full h-full rounded-[3rem] border-8 border-white shadow-2xl overflow-hidden bg-white/10 backdrop-blur-md"
        >
           <img src={elfSticker} className="w-full h-full object-cover" alt="Elf Sticker" />
           <div className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-lg">
             <Star size={16} fill="white" />
           </div>
        </motion.div>
      </motion.div>

      {/* Scrollable Letter Card */}
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, type: "spring", damping: 25 }}
        className="mt-auto relative z-30 glass-card rounded-t-[3rem] p-8 pb-32 h-[60%] flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.8)] border-t border-white/40"
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 shrink-0" />
        
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pr-1">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-christmas text-[#C21807] leading-none">Magic by {userName}</h2>
            <div className="inline-block px-4 py-1.5 bg-red-50 text-red-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
              {letter.meaning_of_name}
            </div>
          </div>

          <div className="space-y-6">
            <p className="font-serif-classic text-lg leading-relaxed text-gray-800 text-justify">
              {letter.personalized_story}
            </p>
            
            <div className="relative p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border-2 border-red-100 overflow-visible">
               <div className="absolute -top-3 -left-2 bg-[#C21807] text-white px-3 py-1 rounded-lg rotate-[-3deg] shadow-lg">
                  <span className="text-[9px] font-black uppercase tracking-tight whitespace-nowrap">Roast-ul Spiridușului</span>
               </div>
               <p className="italic text-[#8B0000] font-black text-xl leading-tight">
                 "{letter.funny_joke}"
               </p>
            </div>

            <div className="text-center pt-6 space-y-4">
               <div className="flex justify-center space-x-2">
                 <Sparkles className="text-yellow-500" size={20} />
                 <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Wishes for you</span>
                 <Sparkles className="text-yellow-500" size={20} />
               </div>
               <p className="text-3xl font-christmas font-black text-[#01796F]">
                 {letter.heartfelt_wish}
               </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute bottom-10 left-0 right-0 px-8 flex justify-between items-center pointer-events-none">
          <div className="flex space-x-6 pointer-events-auto">
            <Heart size={28} className="text-red-500 fill-red-500 cursor-pointer active:scale-75 transition-transform" />
            <Send size={28} className="text-gray-600 cursor-pointer active:scale-75 transition-transform" />
          </div>
          <Bookmark size={28} className="text-gray-600 pointer-events-auto cursor-pointer active:scale-75 transition-transform" />
        </div>
      </motion.div>
    </div>
  );
};

export default StoryView;
