
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { audio } from '../services/audioService';

interface MiniGameProps {
  color: string;
  order: number;
  onComplete: (bonus: number) => void;
}

const TemporalMiniGame: React.FC<MiniGameProps> = ({ color, order, onComplete }) => {
  const [scale, setScale] = useState(2);
  const [isActive, setIsActive] = useState(true);
  // Fix: Provided 0 as initialValue to satisfy the useRef overload for <number>
  const requestRef = useRef<number>(0);

  // Difficulty scaling: order now factors in cleared worlds to be more dynamic
  const difficultyConfig = useMemo(() => {
    const baseTolerance = 0.18;
    const baseSpeed = 0.012;
    // Stricter scaling
    return {
      tolerance: Math.max(0.02, baseTolerance - (order * 0.025)),
      speed: baseSpeed + (order * 0.005),
      targetScale: 1.0
    };
  }, [order]);

  const handleClick = () => {
    if (!isActive) return;
    const diff = Math.abs(scale - difficultyConfig.targetScale);
    if (diff <= difficultyConfig.tolerance) {
      audio.playSuccess();
      onComplete(100 + (order * 25));
    } else {
      audio.playClick();
      onComplete(10);
    }
    setIsActive(false);
  };

  useEffect(() => {
    const animate = () => {
      setScale(s => {
        const next = s - difficultyConfig.speed;
        if (next <= 0.4) return 2.0;
        return next;
      });
      requestRef.current = requestAnimationFrame(animate);
    };
    if (isActive) requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isActive, difficultyConfig.speed]);

  return (
    <div className="flex flex-col items-center gap-6 p-6 border border-white/10 bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 text-[8px] font-orbitron text-indigo-400 opacity-50 uppercase">
        Protocol Level {order}
      </div>
      <h3 className="font-orbitron text-sm text-indigo-300">Stabilize Temporal Link</h3>
      <div 
        className="relative w-40 h-40 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer group"
        style={{ borderColor: color + '44' }}
        onClick={handleClick}
      >
        {/* Static Target */}
        <div 
          className="absolute w-12 h-12 rounded-full border-2 border-white/20"
          style={{ transform: `scale(${difficultyConfig.targetScale})` }}
        />
        {/* Pulsing Core */}
        <div 
          className="absolute w-12 h-12 rounded-full border-4 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          style={{ borderColor: color, transform: `scale(${scale})`, opacity: 1 - Math.abs(scale - difficultyConfig.targetScale) }}
        />
        <div className="text-[10px] font-orbitron text-white group-hover:scale-110 transition-transform">ALIGN</div>
      </div>
      <div className="w-full flex justify-between px-2 text-[9px] font-orbitron text-gray-500 uppercase tracking-widest">
        <span>Entropy: High</span>
        <span>Precision: {((1 - difficultyConfig.tolerance) * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};

export default TemporalMiniGame;
