
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { audio } from '../services/audioService';

interface PatternProps {
  color: string;
  order: number;
  onComplete: (bonus: number) => void;
}

const SYMBOLS = ['◯', '⬢', '△', '✧'];

const PatternSynchronizer: React.FC<PatternProps> = ({ color, order, onComplete }) => {
  const sequenceLength = useMemo(() => Math.min(8, 3 + Math.floor(order / 5)), [order]);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isPlayingSequence, setIsPlayingSequence] = useState(true);
  const [activeSymbol, setActiveSymbol] = useState<number | null>(null);
  const [message, setMessage] = useState('Observe Pattern');

  const startNewGame = useCallback(() => {
    const newSeq = Array.from({ length: sequenceLength }, () => Math.floor(Math.random() * 4));
    setSequence(newSeq);
    setUserSequence([]);
    setIsPlayingSequence(true);
    setMessage('Observe Pattern');
  }, [sequenceLength]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  useEffect(() => {
    if (isPlayingSequence && sequence.length > 0) {
      let i = 0;
      const interval = setInterval(() => {
        setActiveSymbol(sequence[i]);
        audio.playClick();
        setTimeout(() => setActiveSymbol(null), 400);
        i++;
        if (i >= sequence.length) {
          clearInterval(interval);
          setTimeout(() => {
            setIsPlayingSequence(false);
            setMessage('Repeat Pattern');
          }, 600);
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isPlayingSequence, sequence]);

  const handleSymbolClick = (idx: number) => {
    if (isPlayingSequence) return;
    
    setActiveSymbol(idx);
    audio.playClick();
    setTimeout(() => setActiveSymbol(null), 200);

    const newUserSeq = [...userSequence, idx];
    setUserSequence(newUserSeq);

    if (idx !== sequence[newUserSeq.length - 1]) {
      setMessage('Desynchronized');
      audio.playClick();
      setTimeout(() => onComplete(20), 1000);
      return;
    }

    if (newUserSeq.length === sequence.length) {
      setMessage('Synchronized');
      audio.playSuccess();
      setTimeout(() => onComplete(150 + (order * 30)), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 border border-white/10 bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl relative w-80 animate-in zoom-in duration-300">
      <div className="absolute top-0 right-0 p-2 text-[8px] font-orbitron text-indigo-400 opacity-50 uppercase">
        Neural Sync Level {order}
      </div>
      <h3 className="font-orbitron text-sm text-indigo-300 uppercase tracking-widest">{message}</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {SYMBOLS.map((sym, i) => (
          <button
            key={i}
            disabled={isPlayingSequence}
            onClick={() => handleSymbolClick(i)}
            className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl transition-all duration-200 ${
              activeSymbol === i 
                ? 'scale-110 border-white shadow-[0_0_30px_rgba(255,255,255,0.5)] bg-white/20' 
                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30'
            }`}
            style={{ color: activeSymbol === i ? 'white' : color }}
          >
            {sym}
          </button>
        ))}
      </div>

      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all duration-300" 
          style={{ width: `${(userSequence.length / sequence.length) * 100}%` }}
        />
      </div>

      <p className="text-[9px] text-gray-500 italic text-center uppercase tracking-tighter">
        Trace the synaptic pathways of the ancestors.
      </p>
    </div>
  );
};

export default PatternSynchronizer;
