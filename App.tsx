
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, GameProgress, World, CodexTab, LocationCategory, RibbonMode, Ally, Faction } from './types';
import { WORLDS, FACTIONS, ARTEFACTS, CREATURES, ALLIES, QUESTS, NARRATIVE_ARCS } from './constants';
import CosmicScene from './components/CosmicScene';
import TemporalMiniGame from './components/TemporalMiniGame';
import ResonanceHarmonizer from './components/ResonanceHarmonizer';
import PatternSynchronizer from './components/PatternSynchronizer';
import BossBattle from './components/BossBattle';
import WakingSequence from './components/WakingSequence';
import DialogueBox from './components/DialogueBox';
import { getEchoMessage } from './services/geminiService';
import { audio } from './services/audioService';

const SAVE_KEY = 'onyzuka_chrono_save';

interface MoteGain {
  id: number;
  amount: number;
  x: number;
  y: number;
  loreSnippet?: string;
}

const TEMPORAL_LAWS = [
  { id: 'L01', title: 'The Law of Conservation', description: 'Chronomatter cannot be created or destroyed, only redirected from the maw of Entropy.' },
  { id: 'L02', title: 'The Ribbon Directive', description: 'The metal ribbons are not tools, but extensions of the Guardian\'s soul. Respect their weight.' },
  { id: 'L03', title: 'The Singularity Clause', description: 'When two timelines collide, only the one with the strongest resonance shall endure.' },
  { id: 'L04', title: 'The Echo Protocol', description: 'A fallen Guardian is never truly gone. Their memories persist as vibrations in the Aether.' },
  { id: 'L05', title: 'The First Axiom', description: 'Silence is the precursor to the Void. Keep the universe singing.' }
];

const App: React.FC = () => {
  const [progress, setProgress] = useState<GameProgress>(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      state: GameState.TITLE,
      currentWorldId: null,
      clearedWorlds: [],
      chronomatter: 250,
      integrity: 100,
      ribbonLevel: 1,
      ribbonMode: 'SHIELD' as RibbonMode,
      discoveredLore: [],
      unlockedLoreSnippets: [],
      unlockedLaws: ['L01', 'L02'],
      discoveredFactions: ['guardians'],
      discoveredArtefacts: ['blades'], 
      discoveredCreatures: [],
      metAllies: ['elyia'], 
      activeArcStage: 0,
      upgrades: {
        armorIntegrity: 1,
        chronomatterChanneling: 1,
        resonanceAdaptation: 1
      }
    };
  });

  const [echoText, setEchoText] = useState<string>('');
  const [archivalLog, setArchivalLog] = useState<string | null>(null);
  const [showMiniGame, setShowMiniGame] = useState<boolean>(false);
  const [miniGameType, setMiniGameType] = useState<'TEMPORAL' | 'RESONANCE' | 'PATTERN'>('TEMPORAL');
  const [activeCodexTab, setActiveCodexTab] = useState<CodexTab>(CodexTab.ARCHIVES);
  const [currentDialogue, setCurrentDialogue] = useState<{allyId: string, message: string} | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [moteGains, setMoteGains] = useState<MoteGain[]>([]);

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
  }, [progress]);

  // Audio Intensity Control based on Game State
  useEffect(() => {
    if (progress.state === GameState.BOSS) {
      audio.setIntensity(1.6);
      audio.playLayer('resonance');
    } else if (isScanning) {
      audio.setIntensity(1.4);
      audio.playLayer('resonance');
    } else {
      audio.setIntensity(1.0);
      audio.stopLayer('resonance');
    }
  }, [progress.state, isScanning]);

  const handleAction = (cb: () => void) => {
    audio.playClick();
    cb();
  };

  const handleMoteCaught = useCallback((bonus: number, x: number, y: number) => {
    const channelingMultiplier = 1 + (progress.upgrades.chronomatterChanneling * 0.1);
    const modeBonus = progress.ribbonMode === 'CAPTURE' ? 1.5 : 1.0;
    const finalBonus = Math.round(bonus * channelingMultiplier * modeBonus);
    
    let loreSnippet: string | undefined;
    if (Math.random() < 0.15) {
      const allLore = [...CREATURES, ...FACTIONS, ...ARTEFACTS];
      const randomLore = allLore[Math.floor(Math.random() * allLore.length)];
      if (randomLore) {
        loreSnippet = `Synaptic Echo: ${randomLore.name} - ${randomLore.lore.substring(0, 60)}...`;
        setProgress(prev => ({
          ...prev,
          unlockedLoreSnippets: Array.from(new Set([...prev.unlockedLoreSnippets, randomLore.id]))
        }));
      }
    }

    setProgress(prev => ({ ...prev, chronomatter: prev.chronomatter + finalBonus }));
    const id = Date.now() + Math.random();
    setMoteGains(prev => [...prev, { id, amount: finalBonus, x, y, loreSnippet }]);
    setTimeout(() => {
      setMoteGains(prev => prev.filter(g => g.id !== id));
    }, 1500);
  }, [progress.upgrades.chronomatterChanneling, progress.ribbonMode]);

  const enterWorld = async (world: World) => {
    handleAction(async () => {
      audio.startBiomeAmbient(world.biome);
      setArchivalLog(null);
      const rng = Math.random();
      if (rng < 0.33) setMiniGameType('TEMPORAL');
      else if (rng < 0.66) setMiniGameType('RESONANCE');
      else setMiniGameType('PATTERN');
      
      setProgress(prev => ({ 
        ...prev, 
        state: GameState.WORLD, 
        currentWorldId: world.id, 
        discoveredLore: Array.from(new Set([...prev.discoveredLore, world.id])),
      }));

      if (world.id === 'virellion' && progress.clearedWorlds.length === 0) {
        setCurrentDialogue({ allyId: 'elyia', message: "Onyzuka... your awakening ripples through the Ring. The first fragment is near, but Seraphon's shadows are already stirring." });
      }

      setEchoText('Connecting...');
      const message = await getEchoMessage(world.name, world.fragmentName);
      setEchoText(message);
      setShowMiniGame(true);
    });
  };

  const performScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    audio.playKeywordLog();
    const world = WORLDS.find(w => w.id === progress.currentWorldId);
    if (world) {
        const localCreature = CREATURES.find(c => c.worldId === world.id);
        if (localCreature && Math.random() > 0.4) {
          setArchivalLog(`DATABASE_MATCH: ${localCreature.name.toUpperCase()} - ${localCreature.lore}`);
          setProgress(prev => ({
            ...prev,
            unlockedLoreSnippets: Array.from(new Set([...prev.unlockedLoreSnippets, localCreature.id]))
          }));
        } else {
          const scanMsg = await getEchoMessage(world.name, "Environmental Data");
          setEchoText(`[SCAN]: ${scanMsg}`);
        }
    }
    setTimeout(() => setIsScanning(false), 2000);
  };

  const handleBossVictory = (bonus: number) => {
    if (progress.currentWorldId) {
      const isNewClear = !progress.clearedWorlds.includes(progress.currentWorldId);
      setProgress(prev => ({
        ...prev,
        state: GameState.MAP,
        clearedWorlds: Array.from(new Set([...prev.clearedWorlds, progress.currentWorldId!])),
        chronomatter: prev.chronomatter + bonus,
        ribbonLevel: prev.ribbonLevel + (isNewClear ? 1 : 0),
        activeArcStage: prev.activeArcStage + 1
      }));
      audio.playSuccess();
      audio.startBiomeAmbient('nebula');
      setShowMiniGame(false);
    }
  };

  const buyUpgrade = (key: keyof typeof progress.upgrades) => {
    const val = progress.upgrades[key];
    const cost = val * 500;
    if (progress.chronomatter >= cost) {
      setProgress(prev => ({
        ...prev,
        chronomatter: prev.chronomatter - cost,
        upgrades: { ...prev.upgrades, [key]: val + 1 }
      }));
      audio.playSuccess();
    }
  };

  const currentWorld = useMemo(() => WORLDS.find(w => w.id === progress.currentWorldId) || WORLDS[0], [progress.currentWorldId]);
  const currentAlly = useMemo(() => ALLIES.find(a => a.id === currentDialogue?.allyId), [currentDialogue]);

  const renderFactionRelations = (faction: Faction) => {
    const relationData = [
      { id: 'guardians', label: 'Guardians', icon: '◯' },
      { id: 'entropy_children', label: 'Entropy', icon: '⚡' },
      { id: 'temporal_echoes', label: 'Echoes', icon: '🌫️' },
      { id: 'stellar_architects', label: 'Architects', icon: '⬢' }
    ].filter(r => r.id !== faction.id);

    return (
      <div className="mt-4 pt-4 border-t border-white/5">
        <p className="text-[7px] font-orbitron text-indigo-400 uppercase tracking-widest mb-3">Diplomatic Standing</p>
        <div className="flex flex-wrap gap-2">
          {relationData.map(rel => {
            let status = 'Neutral';
            let color = 'text-gray-400 border-gray-400/20 bg-gray-400/5';
            
            if (faction.id === 'guardians') {
              if (rel.id === 'entropy_children') { status = 'Hostile'; color = 'text-red-400 border-red-400/30 bg-red-400/5'; }
              if (rel.id === 'stellar_architects') { status = 'Allied'; color = 'text-green-400 border-green-400/30 bg-green-400/5'; }
              if (rel.id === 'temporal_echoes') { status = 'Wary'; color = 'text-amber-400 border-amber-400/30 bg-amber-400/5'; }
            } else if (faction.id === 'entropy_children') {
              status = 'Hostile'; color = 'text-red-400 border-red-400/30 bg-red-400/5';
            } else if (faction.id === 'stellar_architects') {
              if (rel.id === 'guardians') { status = 'Allied'; color = 'text-green-400 border-green-400/30 bg-green-400/5'; }
              if (rel.id === 'entropy_children') { status = 'Hostile'; color = 'text-red-400 border-red-400/30 bg-red-400/5'; }
            } else if (faction.id === 'temporal_echoes') {
              status = 'Variable'; color = 'text-indigo-300 border-indigo-400/20 bg-indigo-400/5';
            }

            return (
              <div key={rel.id} className={`flex items-center gap-1.5 px-2 py-1 rounded border ${color} transition-all hover:scale-105`}>
                <span className="text-[8px]">{rel.icon}</span>
                <div className="flex flex-col leading-none">
                  <span className="text-[6px] opacity-60 uppercase">{rel.label}</span>
                  <span className="text-[7px] font-bold uppercase tracking-tighter">{status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen bg-[#020202] overflow-hidden font-inter select-none">
      <CosmicScene 
        palette={currentWorld.palette} 
        category={currentWorld.category}
        biome={currentWorld.biome}
        onMoteCaught={handleMoteCaught} 
      />

      <div className="fixed inset-0 z-[100] pointer-events-none">
        {moteGains.map(gain => (
          <div key={gain.id} className="absolute animate-float-up-fade flex flex-col items-center" style={{ left: gain.x, top: gain.y }}>
             <span className="font-orbitron text-[10px] text-amber-300 font-bold whitespace-nowrap drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">+{gain.amount} CM</span>
             {gain.loreSnippet && (
               <span className="font-orbitron text-[7px] text-indigo-300 uppercase tracking-tighter bg-black/40 px-2 py-0.5 rounded mt-1 border border-indigo-500/20 animate-glitch">{gain.loreSnippet}</span>
             )}
             <div className="w-1 h-1 bg-amber-400 rounded-full shadow-[0_0_5px_white]" />
          </div>
        ))}
      </div>

      {currentDialogue && currentAlly && (
        <DialogueBox ally={currentAlly} message={currentDialogue.message} onNext={() => setCurrentDialogue(null)} />
      )}

      {progress.state !== GameState.TITLE && progress.state !== GameState.WAKING && progress.state !== GameState.CODEX && (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-3 animate-in slide-in-from-top duration-500">
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-3 shadow-2xl transition-all hover:border-indigo-500/30 group">
             <div className="w-6 h-6 rounded-full border border-indigo-500/30 flex items-center justify-center font-orbitron text-[8px] text-white">
               {progress.clearedWorlds.length}/{WORLDS.length}
             </div>
             <div className="flex flex-col">
                <p className="text-[6px] font-orbitron text-indigo-400 uppercase tracking-widest leading-none mb-0.5 opacity-60">ARC PROGRESS</p>
                <p className="text-[9px] font-orbitron text-white uppercase tracking-tighter leading-none">
                  {NARRATIVE_ARCS[0].stages[Math.min(progress.clearedWorlds.length, NARRATIVE_ARCS[0].stages.length - 1)]}
                </p>
             </div>
          </div>
          <button onClick={() => handleAction(() => setProgress(p => ({...p, state: GameState.CODEX})))} className="btn-interact bg-indigo-600/10 backdrop-blur-xl border border-indigo-500/20 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg hover:bg-indigo-600/20 hover:border-indigo-400/50 transition-all">
             <span className="text-xs">📜</span>
             <span className="text-[9px] font-orbitron text-indigo-100 uppercase tracking-[0.2em]">Archives</span>
          </button>
          <div className="bg-amber-500/5 backdrop-blur-xl border border-amber-500/20 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg transition-all">
             <div className="w-1 h-1 bg-amber-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
             <span className="text-[9px] font-orbitron text-amber-400 uppercase tracking-wider font-bold">{progress.chronomatter} CM</span>
          </div>
        </div>
      )}

      {progress.state === GameState.TITLE && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-700">
          <div className="relative mb-10 text-center">
             <div className="absolute inset-0 bg-indigo-500 blur-[100px] opacity-10" />
             <h1 className="relative text-6xl md:text-8xl font-orbitron font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-white to-amber-500 uppercase transition-all duration-700 hover:scale-105">Onyzuka</h1>
             <p className="mt-2 font-orbitron text-[8px] text-indigo-400 uppercase tracking-[0.8em] opacity-40">Guardians of Time</p>
          </div>
          <button onClick={() => handleAction(() => setProgress(p => ({...p, state: GameState.WAKING})))} className="btn-interact px-16 py-4 bg-white/5 border border-indigo-500/40 rounded-full text-white font-orbitron tracking-[0.4em] hover:bg-indigo-500/20 hover:shadow-[0_0_30px_rgba(79,70,229,0.2)] transition-all uppercase text-[10px] animate-cosmic-pulse">Awaken</button>
        </div>
      )}

      {progress.state === GameState.WAKING && (
        <WakingSequence onComplete={() => setProgress(p => ({...p, state: GameState.MAP}))} />
      )}

      {progress.state === GameState.MAP && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
          <div className="relative w-[85vw] h-[85vw] max-w-[800px] max-h-[800px]">
            <div className="absolute inset-0 rounded-full border border-indigo-500/5 animate-[spin_300s_linear_infinite]" />
            <div className="absolute inset-[-60px] rounded-full border border-white/5 animate-pulse opacity-10" />
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
              <defs><filter id="trailGlow"><feGaussianBlur stdDeviation="0.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
              {WORLDS.slice(0, -1).map((w, i) => {
                const angle1 = (i / WORLDS.length) * Math.PI * 2 - (Math.PI / 2);
                const angle2 = ((i + 1) / WORLDS.length) * Math.PI * 2 - (Math.PI / 2);
                const radius = 40;
                const x1 = 50 + Math.cos(angle1) * radius; const y1 = 50 + Math.sin(angle1) * radius;
                const x2 = 50 + Math.cos(angle2) * radius; const y2 = 50 + Math.sin(angle2) * radius;
                const isCleared = progress.clearedWorlds.includes(w.id);
                const isUpcoming = i === progress.clearedWorlds.length;
                return (
                  <g key={`trail-${w.id}`}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isCleared ? "#22c55e" : isUpcoming ? "#4f46e5" : "rgba(255,255,255,0.015)"} strokeWidth={isUpcoming ? 1.2 : 0.3} strokeOpacity={isUpcoming ? 0.4 : 0.1} className={isUpcoming ? "animate-glow-line" : ""} filter="url(#trailGlow)" />
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isCleared ? "#4ade80" : isUpcoming ? "#818cf8" : "rgba(255,255,255,0.03)"} strokeWidth={isUpcoming ? 0.6 : 0.1} strokeOpacity={isUpcoming ? 0.9 : 0.1} className={isUpcoming ? "animate-trail" : ""} />
                  </g>
                );
              })}
            </svg>
            {WORLDS.map((w, i) => {
              const unlocked = i === 0 || progress.clearedWorlds.includes(WORLDS[i-1].id);
              const cleared = progress.clearedWorlds.includes(w.id);
              const angle = (i / WORLDS.length) * Math.PI * 2 - (Math.PI / 2);
              const radius = 40; 
              const left = 50 + Math.cos(angle) * radius;
              const top = 50 + Math.sin(angle) * radius;
              const isCurrent = unlocked && !cleared;
              return (
                <div key={w.id} style={{ left: `${left}%`, top: `${top}%` }} onClick={() => unlocked && !cleared && enterWorld(w)} className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-all duration-300 ${unlocked ? 'cursor-pointer' : 'pointer-events-none'}`}>
                  <div className={`relative w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-500 ${cleared ? 'bg-green-600/20 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : unlocked ? 'bg-indigo-900/40 border-indigo-400/50 hover:bg-indigo-500/20 hover:scale-125' : 'bg-black/50 border-white/5 opacity-5'} ${isCurrent ? 'animate-node-pulse' : ''}`}>
                    <span className="text-[10px] transition-transform group-hover:rotate-12">{cleared ? '✅' : unlocked ? '🌀' : '🔒'}</span>
                  </div>
                  <div className={`mt-2 px-1.5 py-0.5 bg-black/80 backdrop-blur-md border border-white/5 rounded-full transition-all duration-500 shadow-xl pointer-events-none scale-75 group-hover:scale-100 ${unlocked ? 'opacity-100' : 'opacity-0'}`}>
                    <p className={`font-orbitron text-[6px] uppercase tracking-[0.1em] whitespace-nowrap ${isCurrent ? 'text-indigo-300' : 'text-gray-500'}`}>{w.name}</p>
                  </div>
                </div>
              );
            })}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <div className="relative opacity-30">
                 <h2 className="text-xl font-orbitron text-white uppercase tracking-[0.8em] drop-shadow-2xl">THE RING OF AGES</h2>
                 <p className="text-center font-orbitron text-[5px] text-indigo-500 uppercase tracking-[0.4em] mt-1">Multi-cycle synchronization active</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {progress.state === GameState.WORLD && (
        <div className="absolute inset-0 z-40 flex flex-col p-8 animate-in fade-in duration-500">
           <header className="flex justify-between items-center">
            <button onClick={() => handleAction(() => setProgress(p => ({...p, state: GameState.MAP})))} className="btn-interact group flex items-center gap-3 bg-black/60 p-1.5 pr-4 rounded-full border border-white/10 hover:border-indigo-500/50 shadow-xl">
               <div className="w-8 h-8 rounded-full border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all text-indigo-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></div>
               <span className="text-[8px] font-orbitron text-indigo-400 uppercase tracking-widest">Return</span>
            </button>
            <div className="text-right">
              <h2 className="text-4xl font-orbitron uppercase text-white tracking-tighter drop-shadow-2xl">{currentWorld.name}</h2>
              <div className="flex justify-end gap-2 mt-2">
                 <span className="text-[8px] font-orbitron text-indigo-300 uppercase px-3 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">{currentWorld.biome}</span>
                 <span className="text-[8px] font-orbitron text-amber-300 uppercase px-3 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full">{currentWorld.variant}</span>
              </div>
            </div>
           </header>
           <div className="flex-1 flex flex-col items-center justify-center gap-8">
             <div className="glass-panel p-10 rounded-3xl text-center max-w-3xl shadow-2xl relative overflow-hidden">
                {isScanning && <div className="absolute inset-0 pointer-events-none"><div className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_15px_#4f46e5] animate-[scan_2s_linear_infinite]" /></div>}
                <div className="mb-8 min-h-[4rem] flex flex-col items-center justify-center gap-2">
                   <p className="text-2xl font-light italic text-indigo-100 opacity-90 leading-snug px-4">"{echoText}"</p>
                   {archivalLog && <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-xl animate-in slide-in-from-top duration-500"><p className="text-[9px] font-orbitron text-indigo-400 text-left leading-relaxed"><span className="animate-glitch inline-block mr-2">█</span>{archivalLog}</p></div>}
                </div>
                <div className="grid grid-cols-3 gap-4 mb-10">
                   {currentWorld.keyPoints.map((kp, idx) => (
                     <div 
                      key={kp} 
                      className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all group/kp cursor-help"
                      onMouseEnter={() => audio.playLayer('glimmer')}
                      onMouseLeave={() => audio.stopLayer('glimmer')}
                     >
                        <p className="text-[7px] font-orbitron text-indigo-500 uppercase tracking-widest mb-1 opacity-60">Resonance Pt.{idx+1}</p>
                        <p className="text-[10px] text-white uppercase font-bold tracking-tight leading-tight">{kp}</p>
                     </div>
                   ))}
                </div>
                <div className="flex gap-4 items-center justify-center">
                    <button onClick={performScan} disabled={isScanning} className={`btn-interact px-8 py-4 border rounded-full font-orbitron text-[9px] uppercase tracking-widest transition-all ${isScanning ? 'border-indigo-500 text-indigo-500 bg-indigo-500/10' : 'border-white/10 text-white/40 hover:border-white hover:text-white'}`}>{isScanning ? 'Syncing...' : 'Scan Domain'}</button>
                    {showMiniGame ? (
                        <div className="animate-in zoom-in duration-300">
                            {miniGameType === 'TEMPORAL' ? <TemporalMiniGame color={currentWorld.palette[1] || currentWorld.palette[0]} order={currentWorld.order - (progress.upgrades.resonanceAdaptation * 0.4)} onComplete={() => setShowMiniGame(false)} /> :
                            miniGameType === 'RESONANCE' ? <ResonanceHarmonizer color={currentWorld.palette[1] || currentWorld.palette[0]} order={currentWorld.order} onComplete={() => setShowMiniGame(false)} /> :
                            <PatternSynchronizer color={currentWorld.palette[1] || currentWorld.palette[0]} order={currentWorld.order} onComplete={() => setShowMiniGame(false)} />}
                        </div>
                    ) : (
                        <button onClick={() => handleAction(() => setProgress(p => ({...p, state: GameState.BOSS})))} className="btn-interact group relative px-20 py-5 overflow-hidden rounded-full shadow-2xl animate-cosmic-pulse"><div className="absolute inset-0 bg-gradient-to-r from-red-800 to-red-600 group-hover:from-red-600 group-hover:to-red-400 transition-all duration-500" /><span className="relative font-orbitron text-white uppercase tracking-[0.5em] text-[11px] font-bold">Confront Sentinel</span></button>
                    )}
                </div>
             </div>
           </div>
        </div>
      )}

      {progress.state === GameState.BOSS && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95">
          <BossBattle worldId={progress.currentWorldId!} shieldLevel={progress.upgrades.armorIntegrity + (progress.ribbonMode === 'SHIELD' ? 2 : 0)} damageBonus={progress.ribbonMode === 'BLADE' ? 1.5 : 1.0} onVictory={handleBossVictory} onDefeat={() => setProgress(p => ({...p, state: GameState.MAP}))} />
        </div>
      )}

      {progress.state === GameState.CODEX && (
        <div className="absolute inset-0 z-50 p-8 bg-black/95 backdrop-blur-3xl flex flex-col animate-in slide-in-from-bottom duration-500">
           <header className="flex flex-col gap-8 mb-10 px-4">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-orbitron text-white uppercase tracking-[0.3em]">The Great Codex</h2>
                <button onClick={() => setProgress(p => ({...p, state: GameState.MAP}))} className="btn-interact px-8 py-2.5 border border-white/20 hover:border-white rounded-full font-orbitron text-[9px] uppercase tracking-widest transition-all">Close</button>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {Object.values(CodexTab).map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveCodexTab(tab)} 
                    className={`btn-interact relative whitespace-nowrap px-6 py-3 rounded-xl font-orbitron text-[9px] tracking-widest uppercase transition-all ${
                      activeCodexTab === tab 
                        ? 'text-white bg-indigo-600/20 shadow-[0_0_20px_rgba(79,70,229,0.2)]' 
                        : 'text-indigo-400/60 hover:text-indigo-300'
                    }`}
                  >
                    {tab}
                    {activeCodexTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-full shadow-[0_0_10px_#4f46e5]" />
                    )}
                  </button>
                ))}
              </div>
           </header>

           <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-12">
              {activeCodexTab === CodexTab.ARCHIVES && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                   <div className="glass-panel p-8 rounded-3xl col-span-1 md:col-span-2">
                      <h3 className="text-xl font-orbitron text-white uppercase mb-6">Service Record: Onyzuka</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                         <div className="space-y-1">
                            <p className="text-[8px] font-orbitron text-indigo-400 uppercase">Worlds Cleared</p>
                            <p className="text-2xl font-orbitron text-white">{progress.clearedWorlds.length}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[8px] font-orbitron text-indigo-400 uppercase">Chronomatter</p>
                            <p className="text-2xl font-orbitron text-white">{progress.chronomatter}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[8px] font-orbitron text-indigo-400 uppercase">Ribbon Level</p>
                            <p className="text-2xl font-orbitron text-white">{progress.ribbonLevel}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[8px] font-orbitron text-indigo-400 uppercase">Synaptic Echoes</p>
                            <p className="text-2xl font-orbitron text-white">{progress.unlockedLoreSnippets.length}</p>
                         </div>
                      </div>
                      <div className="mt-10 pt-6 border-t border-white/5">
                         <p className="text-[10px] text-indigo-200/50 italic leading-relaxed">"The Archives store only what the Guardian chooses to preserve. Every world restored is a line of logic returned to the Great System."</p>
                      </div>
                   </div>
                   <div className="glass-panel p-8 rounded-3xl">
                      <h3 className="text-xl font-orbitron text-white uppercase mb-4">World Status</h3>
                      <div className="space-y-3">
                         {WORLDS.slice(0, 10).map(w => (
                           <div key={w.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                              <span className="text-[10px] font-orbitron text-indigo-100">{w.name}</span>
                              <span className={`text-[8px] font-orbitron uppercase ${progress.clearedWorlds.includes(w.id) ? 'text-green-400' : 'text-gray-600'}`}>
                                 {progress.clearedWorlds.includes(w.id) ? 'RESTORED' : 'FRACTURED'}
                              </span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {activeCodexTab === CodexTab.LAWS && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                   {TEMPORAL_LAWS.map(law => {
                     const isUnlocked = progress.unlockedLaws.includes(law.id);
                     return (
                       <div key={law.id} className={`glass-panel p-6 rounded-2xl border-l-4 ${isUnlocked ? 'border-l-indigo-500' : 'border-l-transparent opacity-30 grayscale'}`}>
                          <div className="flex items-center gap-3 mb-2">
                             <span className="text-lg font-orbitron text-indigo-500">{law.id}</span>
                             <h3 className="text-sm font-orbitron text-white uppercase">{isUnlocked ? law.title : 'Data Redacted'}</h3>
                          </div>
                          <p className="text-xs text-indigo-100/60 leading-relaxed italic">
                            {isUnlocked ? `"${law.description}"` : 'Unlock more fragments to reveal this Temporal Directive.'}
                          </p>
                       </div>
                     );
                   })}
                </div>
              )}

              {activeCodexTab === CodexTab.FACTIONS && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                  {FACTIONS.map(f => (
                    <div key={f.id} className="glass-panel p-6 rounded-2xl flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-orbitron text-white uppercase tracking-tighter">{f.name}</h3>
                          <p className="text-[7px] font-orbitron text-indigo-400 uppercase tracking-widest">{f.nature}</p>
                        </div>
                        <div className="flex gap-1">
                          {f.symbols.map(s => <span key={s} className="text-lg opacity-40">{s}</span>)}
                        </div>
                      </div>
                      <div className="space-y-3 text-[11px] text-indigo-50/70 flex-1">
                        <div><p className="text-[7px] font-orbitron text-indigo-400 uppercase tracking-widest mb-0.5">Ideology</p><p>{f.ideology}</p></div>
                        <div><p className="text-[7px] font-orbitron text-indigo-400 uppercase tracking-widest mb-0.5">Summary</p><p className="italic">{f.lore}</p></div>
                        {renderFactionRelations(f)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeCodexTab === CodexTab.ARTEFACTS && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                   {ARTEFACTS.map(a => {
                     const isUnlocked = progress.discoveredArtefacts.includes(a.id) || progress.discoveredArtefacts.includes(a.id + 's');
                     return (
                       <div key={a.id} className={`glass-panel p-5 rounded-2xl text-center flex flex-col items-center gap-2 ${isUnlocked ? 'opacity-100 hover:scale-105 shadow-[0_0_20px_rgba(79,70,229,0.1)]' : 'opacity-20 grayscale'}`}>
                          <div className="text-3xl mb-1">{isUnlocked ? a.icon : '❓'}</div>
                          <h4 className="font-orbitron text-[8px] uppercase tracking-widest text-white">{isUnlocked ? a.name : 'Unknown'}</h4>
                       </div>
                     );
                   })}
                </div>
              )}

              {activeCodexTab === CodexTab.UPGRADES && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(progress.upgrades).map(([key, val]) => (
                    <div key={key} className="glass-panel p-8 rounded-2xl flex flex-col items-center gap-4 group">
                      <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-white/5 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">{key === 'armorIntegrity' ? '🛡️' : key === 'chronomatterChanneling' ? '💎' : '⏳'}</div>
                      <h4 className="font-orbitron text-[9px] text-indigo-300 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</h4>
                      <p className="text-[9px] text-gray-500 uppercase">Lv. {val}/10</p>
                      <button onClick={() => buyUpgrade(key as any)} disabled={progress.chronomatter < val * 500} className="btn-interact w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 rounded-full font-orbitron text-[9px] uppercase tracking-widest transition-all">{val >= 10 ? 'MAX' : `Evolve (${val * 500} CM)`}</button>
                    </div>
                  ))}
                </div>
              )}

              {activeCodexTab === CodexTab.ARSENAL && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="glass-panel p-8 rounded-2xl">
                      <h3 className="text-lg font-orbitron text-white uppercase mb-6">Onyzuka's Frame</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5"><p className="text-[7px] font-orbitron text-indigo-400 uppercase">Integrity</p><p className="text-lg font-orbitron text-white">{(progress.upgrades.armorIntegrity * 10) + 100}%</p></div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5"><p className="text-[7px] font-orbitron text-indigo-400 uppercase">Resonance</p><p className="text-lg font-orbitron text-white">{progress.upgrades.resonanceAdaptation * 10}%</p></div>
                      </div>
                   </div>
                   <div className="glass-panel p-8 rounded-2xl">
                      <h3 className="text-lg font-orbitron text-white uppercase mb-4">Protocols</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {['SHIELD', 'BLADE', 'CAPTURE', 'ANALYSIS'].map(mode => (
                          <button key={mode} onClick={() => handleAction(() => setProgress(prev => ({ ...prev, ribbonMode: mode as RibbonMode })))} className={`btn-interact p-3 rounded-xl border text-[9px] font-orbitron uppercase tracking-widest transition-all ${progress.ribbonMode === mode ? 'bg-indigo-600 border-indigo-400 shadow-lg' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>{mode}</button>
                        ))}
                      </div>
                   </div>
                </div>
              )}

              {activeCodexTab === CodexTab.QUESTS && (
                <div className="glass-panel p-8 rounded-2xl">
                    <h3 className="text-lg font-orbitron text-indigo-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Narrative Arc</h3>
                    <div className="flex gap-2 flex-wrap">{NARRATIVE_ARCS[0].stages.map((stage, i) => (<div key={stage} className={`px-4 py-1.5 rounded-full text-[8px] font-orbitron uppercase border ${i <= progress.activeArcStage ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-white/10 text-white/20'}`}>{stage}</div>))}</div>
                </div>
              )}

              {activeCodexTab === CodexTab.CREATURES && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CREATURES.map(c => {
                    const isUnlocked = progress.unlockedLoreSnippets.includes(c.id);
                    return (
                      <div key={c.id} className={`glass-panel p-6 rounded-2xl transition-all ${isUnlocked ? 'opacity-100 border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.05)]' : 'opacity-20 grayscale'}`}>
                        <div className="flex items-center gap-4 mb-4">
                           <div className="text-4xl">{isUnlocked ? c.icon : '❓'}</div>
                           <div><h3 className="text-lg font-orbitron text-white uppercase tracking-tighter">{isUnlocked ? c.name : 'Classified'}</h3><p className="text-[7px] font-orbitron text-indigo-400 uppercase tracking-widest">{isUnlocked ? c.nature : 'Unknown Nature'}</p></div>
                        </div>
                        {isUnlocked && <p className="text-[11px] text-indigo-50/70 leading-relaxed italic">"{c.lore}"</p>}
                      </div>
                    );
                  })}
                </div>
              )}
           </div>
        </div>
      )}

      {progress.state !== GameState.TITLE && progress.state !== GameState.WAKING && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-4 bg-black/80 backdrop-blur-xl border border-white/10 p-2.5 rounded-full shadow-2xl transition-all group/ribbon">
           <div className="flex gap-1.5">
              {[
                { id: 'SHIELD', icon: '🛡️', color: 'bg-blue-600' },
                { id: 'BLADE', icon: '🗡️', color: 'bg-red-600' },
                { id: 'CAPTURE', icon: '🧲', color: 'bg-amber-600' },
                { id: 'ANALYSIS', icon: '🔍', color: 'bg-teal-600' }
              ].map((m) => (
                <button key={m.id} onClick={() => handleAction(() => setProgress(prev => ({ ...prev, ribbonMode: m.id as RibbonMode })))} className={`btn-interact w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-300 relative ${progress.ribbonMode === m.id ? m.color + ' text-white shadow-xl scale-110' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                  {m.icon}
                  {progress.ribbonMode === m.id && <span className="absolute inset-0 rounded-full animate-ping bg-white opacity-20" />}
                </button>
              ))}
           </div>
           <div className="pr-4 hidden md:block"><p className="text-[6px] font-orbitron text-indigo-400 uppercase tracking-widest leading-none mb-0.5 opacity-60">MODE</p><p className="text-[10px] font-orbitron text-white uppercase tracking-widest leading-none font-bold">{progress.ribbonMode}</p></div>
        </div>
      )}
    </div>
  );
};

export default App;
