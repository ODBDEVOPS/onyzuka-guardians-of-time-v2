
import React, { useState, useEffect } from 'react';

interface WakingSequenceProps {
  onComplete: () => void;
}

const WAKING_LOGS = [
  "COSMOS_KERNEL: Initializing...",
  "FRAGMENT_DETECTION: 7 Anomalies Found.",
  "PROTOCOL_ONYZUKA: Online.",
  "MEMORY_CORE: Segmented (99.8% loss).",
  "PRIMARY_OBJECTIVE: Restore the Codex.",
  "THE_VOID_IS_WATCHING."
];

const WakingSequence: React.FC<WakingSequenceProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < WAKING_LOGS.length) {
      const timer = setTimeout(() => {
        setLogs(prev => [...prev, WAKING_LOGS[index]]);
        setIndex(i => i + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [index, onComplete]);

  return (
    <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-12">
      <div className="w-full max-w-lg">
        <div className="space-y-3 font-mono text-[10px] md:text-xs">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4">
              <span className="text-indigo-800">[{new Date().toLocaleTimeString()}]</span>
              <span className={log.includes('VOID') ? 'text-red-500 animate-pulse' : 'text-indigo-400'}>
                {log}
              </span>
            </div>
          ))}
          {index < WAKING_LOGS.length && (
            <div className="w-1 h-4 bg-indigo-500 animate-pulse mt-2" />
          )}
        </div>
        
        <div className="mt-12 h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500" 
            style={{ width: `${(index / WAKING_LOGS.length) * 100}%` }} 
          />
        </div>
      </div>
    </div>
  );
};

export default WakingSequence;
