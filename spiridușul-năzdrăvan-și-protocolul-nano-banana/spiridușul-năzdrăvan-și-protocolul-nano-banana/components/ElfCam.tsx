
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Zap, Star } from 'lucide-react';

interface ElfCamProps {
  onCapture: (avatar: string) => void;
}

const ElfCam: React.FC<ElfCamProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const start = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        console.error(err);
        alert("Prietene, avem nevoie de cameră să te transformăm! 📸");
      }
    };
    start();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.save();
        ctx.filter = 'contrast(1.1) brightness(1.1)';
        ctx.drawImage(video, 0, 0);
        ctx.restore();
        
        const data = canvas.toDataURL('image/jpeg');
        onCapture(data);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-sm px-4 relative">
      {/* Elf Hands Grabbing the Frame Overlay */}
      <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-30 pointer-events-none opacity-90">
        <svg width="100" height="200" viewBox="0 0 100 200">
           <path d="M90 20 Q10 100 90 180" stroke="#FADCB9" strokeWidth="30" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <div className="absolute -right-12 top-1/2 -translate-y-1/2 z-30 pointer-events-none opacity-90">
        <svg width="100" height="200" viewBox="0 0 100 200">
           <path d="M10 20 Q90 100 10 180" stroke="#FADCB9" strokeWidth="30" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full aspect-[3/4] rounded-[2.5rem] overflow-hidden border-[12px] border-white shadow-[0_25px_60px_rgba(0,0,0,0.8)] z-10"
      >
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        
        {/* Virtual Elf Hat Overlay */}
        <div className="absolute top-0 left-0 w-full h-1/2 flex justify-center pointer-events-none z-20">
          <motion.svg 
            animate={{ rotate: [-2, 2, -2], y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-40 h-40 drop-shadow-2xl" 
            viewBox="0 0 200 200"
          >
            <path d="M40 100 L100 20 L160 100 Z" fill="#C21807" />
            <rect x="35" y="90" width="130" height="15" rx="8" fill="white" />
            <circle cx="100" cy="20" r="10" fill="white" />
            <motion.circle 
              animate={{ scale: [1, 1.2, 1] }} 
              transition={{ repeat: Infinity, duration: 1 }}
              cx="100" cy="20" r="4" fill="gold" 
            />
          </motion.svg>
        </div>

        {/* HUD Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 flex space-x-1">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            <span className="text-[8px] font-mono uppercase text-white/50">REC</span>
          </div>
          
          <div className="m-auto absolute inset-0 w-48 h-48 border border-white/20 rounded-full animate-spin-slow opacity-30" />
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 px-4 py-1 rounded-full backdrop-blur-md">
            <span className="text-[10px] text-white/70 font-black uppercase tracking-widest">Ajustează caciulița!</span>
          </div>
        </div>
      </motion.div>

      <button 
        onClick={capture}
        className="group w-full py-5 bg-gradient-to-r from-red-600 to-red-900 text-white font-black text-xl uppercase rounded-[2rem] shadow-[0_10px_30px_rgba(220,38,38,0.4)] flex items-center justify-center space-x-3 active:scale-95 transition-all z-40 border-b-4 border-black/30"
      >
        <Camera size={24} className="group-hover:rotate-12 transition-transform" />
        <span>SAY CHEESE, BOSS! 🧀</span>
      </button>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ElfCam;
