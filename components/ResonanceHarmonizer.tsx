
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { audio } from '../services/audioService';

interface ResonanceProps {
  color: string;
  order: number;
  onComplete: (bonus: number) => void;
}

const ResonanceHarmonizer: React.FC<ResonanceProps> = ({ color, order, onComplete }) => {
  const [userPhase, setUserPhase] = useState(0);
  const [userFreq, setUserFreq] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Random target values based on world order (increasing complexity)
  const target = useMemo(() => ({
    phase: Math.random() * Math.PI * 2,
    freq: 1 + Math.random() * (order * 0.5 + 1)
  }), [order]);

  const tolerance = Math.max(0.05, 0.2 - (order * 0.02));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let time = 0;

    const draw = () => {
      time += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const midY = canvas.height / 2;
      const width = canvas.width;

      // Draw Target Wave (Ghostly)
      ctx.beginPath();
      ctx.strokeStyle = color + '44';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      for (let x = 0; x < width; x++) {
        const y = midY + Math.sin(x * 0.05 * target.freq + target.phase + time) * 30;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw User Wave (Solid)
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      for (let x = 0; x < width; x++) {
        const y = midY + Math.sin(x * 0.05 * userFreq + userPhase + time) * 30;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrame);
  }, [userPhase, userFreq, color, target]);

  const handleHarmonize = () => {
    const phaseDiff = Math.abs(userPhase - target.phase) % (Math.PI * 2);
    const freqDiff = Math.abs(userFreq - target.freq);
    
    // Normalize phase diff for circularity
    const normPhaseDiff = Math.min(phaseDiff, Math.PI * 2 - phaseDiff);

    if (normPhaseDiff < tolerance * 5 && freqDiff < tolerance) {
      audio.playSuccess();
      onComplete(120 + (order * 25));
    } else {
      audio.playClick();
      onComplete(15);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 border border-white/10 bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl relative w-80">
      <div className="absolute top-0 right-0 p-2 text-[8px] font-orbitron text-indigo-400 opacity-50 uppercase">
        Age {order} Resonance
      </div>
      <h3 className="font-orbitron text-sm text-indigo-300">Harmonize Frequency</h3>
      
      <canvas 
        ref={canvasRef} 
        width={280} 
        height={100} 
        className="bg-black/40 rounded-lg border border-white/5"
      />

      <div className="w-full space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-orbitron text-gray-500">
            <span>PHASE SHIFT</span>
            <span className="text-indigo-400">{(userPhase / Math.PI).toFixed(1)}π</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max={Math.PI * 2} 
            step="0.01" 
            value={userPhase}
            onChange={(e) => setUserPhase(parseFloat(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-orbitron text-gray-500">
            <span>RESONANCE</span>
            <span className="text-indigo-400">{userFreq.toFixed(1)}Hz</span>
          </div>
          <input 
            type="range" 
            min="0.5" 
            max="5" 
            step="0.1" 
            value={userFreq}
            onChange={(e) => setUserFreq(parseFloat(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>
      </div>

      <button 
        onClick={handleHarmonize}
        className="w-full py-2 bg-indigo-600/20 border border-indigo-500/50 rounded-lg font-orbitron text-[10px] text-indigo-300 hover:bg-indigo-600/40 transition-all uppercase tracking-widest"
      >
        LOCK SIGNAL
      </button>
      
      <p className="text-[9px] text-gray-500 italic text-center">Match your signature to the ghost echo.</p>
    </div>
  );
};

export default ResonanceHarmonizer;
