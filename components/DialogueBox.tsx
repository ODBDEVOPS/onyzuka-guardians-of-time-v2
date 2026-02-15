
import React from 'react';
import { Ally } from '../types';

interface DialogueBoxProps {
  ally: Ally | { name: string; icon: string; role: string };
  message: string;
  onNext: () => void;
}

const DialogueBox: React.FC<DialogueBoxProps> = ({ ally, message, onNext }) => {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] w-full max-w-xl px-4 animate-in slide-in-from-bottom duration-400">
      <div className="bg-black/85 backdrop-blur-2xl border border-indigo-500/20 rounded-3xl p-6 flex gap-6 items-center shadow-[0_0_50px_rgba(79,70,229,0.2)] relative overflow-hidden">
        {/* Holographic scanning effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
           <div className="absolute left-0 right-0 h-[1px] bg-indigo-500 animate-[scan_3s_linear_infinite]" />
           <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(79,70,229,0.1)_3px)]" />
        </div>

        <div className="absolute -top-10 left-6 flex items-center gap-3">
           <div className="w-14 h-14 rounded-2xl bg-indigo-700/80 border border-indigo-400/30 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(79,70,229,0.5)] animate-cosmic-pulse">
             {ally.icon}
           </div>
           <div className="bg-black/90 px-3 py-1 rounded-full border border-indigo-500/30 shadow-lg">
              <span className="text-[9px] font-orbitron text-indigo-100 uppercase tracking-widest font-bold">TRANSMISSION: {ally.name}</span>
           </div>
        </div>
        
        <div className="flex-1 pl-16 pt-2 z-10">
           <p className="text-sm text-indigo-50 leading-relaxed font-light italic">
             <span className="text-indigo-500 font-bold mr-1 animate-pulse">|</span>
             {message}
           </p>
        </div>

        <button 
          onClick={onNext}
          className="btn-interact relative z-10 px-6 py-2.5 bg-indigo-600/10 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-full text-[9px] font-orbitron text-white uppercase tracking-widest transition-all shadow-xl"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};

export default DialogueBox;
