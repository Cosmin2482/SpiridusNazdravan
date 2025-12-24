
import React, { useRef, useEffect, useState } from 'react';

interface ScratchUnwrapProps {
  onUnwrapped: () => void;
  onTearStart: () => void;
  onTearEnd: () => void;
}

const ScratchUnwrap: React.FC<ScratchUnwrapProps> = ({ onUnwrapped, onTearStart, onTearEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [percentScratched, setPercentScratched] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Holographic gradient for the "Gen Z" gift wrap
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#ff00ff');
    grad.addColorStop(0.5, '#00f2ff');
    grad.addColorStop(1, '#39ff14');
    
    ctx.fillStyle = grad; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add digital noise
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }

    // Modern ribbon
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(canvas.width / 2 - 10, 0, 20, canvas.height);
    ctx.fillRect(0, canvas.height / 2 - 10, canvas.width, 20);
    
    // Tag
    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px "Space Grotesk"';
    ctx.save();
    ctx.translate(60, 60);
    ctx.rotate(-Math.PI / 8);
    ctx.fillRect(0, 0, 120, 60);
    ctx.fillStyle = '#39ff14';
    ctx.fillText('VIP ONLY', 10, 40);
    ctx.restore();

    ctx.globalCompositeOperation = 'destination-out';
  }, []);

  const getPercent = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    try {
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      let count = 0;
      for (let i = 3; i < pixels.length; i += 32) {
        if (pixels[i] === 0) count++;
      }
      return (count / (pixels.length / 32)) * 100;
    } catch (e) { return 0; }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineWidth = 80;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (Math.random() > 0.85) {
      const p = getPercent(ctx, canvas.width, canvas.height);
      setPercentScratched(p);
      if (p > 50) onUnwrapped();
    }
  };

  return (
    <div className="relative w-80 h-80 md:w-[500px] md:h-[500px] shadow-2xl rounded-3xl overflow-hidden border-4 border-white/20">
      <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center p-8 space-y-4">
         <div className="text-[#39ff14] font-heading font-black text-4xl text-center italic tracking-tighter">NANO BANANA</div>
         <div className="w-full h-1 bg-[#39ff14]/20"></div>
         <div className="text-6xl animate-pulse">🍌</div>
      </div>
      
      <canvas
        ref={canvasRef}
        width={800}
        height={800}
        onMouseDown={(e) => { e.preventDefault(); setIsDrawing(true); onTearStart(); }}
        onMouseUp={() => { setIsDrawing(false); onTearEnd(); }}
        onMouseLeave={() => { setIsDrawing(false); onTearEnd(); }}
        onMouseMove={handleMove}
        onTouchStart={(e) => { e.preventDefault(); setIsDrawing(true); onTearStart(); }}
        onTouchEnd={() => { setIsDrawing(false); onTearEnd(); }}
        onTouchMove={handleMove}
        className="absolute inset-0 w-full h-full z-10 touch-none"
      />

      {percentScratched < 5 && (
         <div className="absolute bottom-6 left-0 w-full text-center text-white font-bold animate-glitch pointer-events-none z-20 text-xs uppercase tracking-[0.2em]">
           Unlock the Hype
         </div>
      )}
    </div>
  );
};

export default ScratchUnwrap;
