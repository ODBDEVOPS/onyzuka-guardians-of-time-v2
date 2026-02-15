
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { audio } from '../services/audioService';
import { WORLDS } from '../constants';

interface BossBattleProps {
  worldId: string;
  onVictory: (bonus: number) => void;
  onDefeat: () => void;
  shieldLevel: number;
  damageBonus: number;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  type: 'standard' | 'homing' | 'spiral';
}

const BossBattle: React.FC<BossBattleProps> = ({ worldId, onVictory, onDefeat, shieldLevel, damageBonus }) => {
  const world = useMemo(() => WORLDS.find(w => w.id === worldId) || WORLDS[0], [worldId]);
  
  const [bossHealth, setBossHealth] = useState(100);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [shieldActive, setShieldActive] = useState(false);
  const [shieldCooldown, setShieldCooldown] = useState(0);
  const [hitEffect, setHitEffect] = useState(false);
  const [resonance, setResonance] = useState(0); // For Virellion: Damage multiplier based on staying near
  const [isCharging, setIsCharging] = useState(false); // Boss telegraphing a big attack
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const projectiles = useRef<Projectile[]>([]);
  const mouse = useRef({ x: 300, y: 300 });
  const frameRef = useRef(0);

  const bossName = useMemo(() => {
    switch(worldId) {
      case 'virellion': return "Seraphon: Initial Awakening";
      case 'iridia': return "Spectra: The Refracted Queen";
      case 'kharon': return "Molten Archon: Iron Soul";
      default: return "Sentinel Sentinel";
    }
  }, [worldId]);

  const shieldDuration = 2000 + (shieldLevel * 500);
  const shieldRecharge = 4000 - (shieldLevel * 200);

  // Dynamic Boss Intensity Logic
  useEffect(() => {
    // Intensity grows from 1.2 to 2.0 as health drops from 100% to 0%
    const intensity = 1.2 + ((100 - bossHealth) / 100) * 0.8;
    audio.setIntensity(intensity);
  }, [bossHealth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      frameRef.current++;
      const frame = frameRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Boss Position (Virellion floats in an infinity pattern)
      const bx = canvas.width / 2 + Math.cos(frame * 0.02) * 50;
      const by = 150 + Math.sin(frame * 0.04) * 30;

      // 1. BOSS VISUALS (World Themed)
      const bossColor = hitEffect ? '#ffffff' : (worldId === 'virellion' ? '#a855f7' : '#ef4444');
      const pulse = Math.sin(frame * 0.1) * 5;
      
      // Draw Aura
      const auraG = ctx.createRadialGradient(bx, by, 0, bx, by, 100 + pulse);
      auraG.addColorStop(0, `${bossColor}44`);
      auraG.addColorStop(1, 'transparent');
      ctx.fillStyle = auraG;
      ctx.beginPath();
      ctx.arc(bx, by, 100 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Draw Core
      ctx.fillStyle = bossColor;
      ctx.beginPath();
      ctx.arc(bx, by, 40 + pulse/2, 0, Math.PI * 2);
      ctx.fill();

      // VIRELLION SPECIFIC: Synaptic Tethers (Ribbons connecting to edges)
      if (worldId === 'virellion') {
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        for (let i = 0; i < 4; i++) {
          const ang = (frame * 0.01) + (i * Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + Math.cos(ang) * 400, by + Math.sin(ang) * 400);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }

      // 2. BOSS ATTACKS (Patterns based on world)
      if (worldId === 'virellion') {
        // Spiral Shot
        if (frame % 30 === 0 && !isCharging) {
          const angle = frame * 0.1;
          projectiles.current.push({
            x: bx, y: by,
            vx: Math.cos(angle) * 2,
            vy: Math.sin(angle) * 2,
            size: 5,
            color: '#c084fc',
            type: 'spiral'
          });
        }
        // Nebula Pulse (AOE Blast)
        if (frame % 200 === 0) {
          setIsCharging(true);
          setTimeout(() => {
            setIsCharging(false);
            // Damage if close and not shielded
            const dist = Math.sqrt((mouse.current.x - bx)**2 + (mouse.current.y - by)**2);
            if (dist < 180 && !shieldActive) {
              setPlayerHealth(h => Math.max(0, h - 15));
              setResonance(0); // Wipe resonance on big hit
              audio.playClick();
            }
          }, 1000);
        }
      } else {
        // Default Sentinel logic
        if (frame % 45 === 0) {
          projectiles.current.push({
            x: bx, y: by,
            vx: (mouse.current.x - bx) / 60,
            vy: (mouse.current.y - by) / 60,
            size: 6,
            color: '#fca5a5',
            type: 'standard'
          });
        }
      }

      // Telegraphing Pulse
      if (isCharging) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx, by, (frame % 20) * 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. PROJECTILE LOGIC
      projectiles.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        // Spiral behavior adjustment
        if (p.type === 'spiral') {
          const speed = 3;
          const turn = 0.05;
          const oldVx = p.vx;
          p.vx = p.vx * Math.cos(turn) - p.vy * Math.sin(turn);
          p.vy = oldVx * Math.sin(turn) + p.vy * Math.cos(turn);
        }

        ctx.fillStyle = p.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        const dist = Math.sqrt((p.x - mouse.current.x)**2 + (p.y - mouse.current.y)**2);
        if (dist < 20) {
          if (!shieldActive) {
            setPlayerHealth(h => Math.max(0, h - (8 - shieldLevel * 0.4)));
            audio.playClick();
          }
          projectiles.current.splice(idx, 1);
        }

        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          projectiles.current.splice(idx, 1);
        }
      });

      // 4. PLAYER VISUALS
      const pColor = shieldActive ? '#60a5fa' : '#4ade80';
      ctx.strokeStyle = pColor;
      ctx.lineWidth = 2;
      
      // Draw Crosshair
      ctx.beginPath();
      ctx.arc(mouse.current.x, mouse.current.y, shieldActive ? 40 : 15, 0, Math.PI * 2);
      ctx.stroke();

      // Resonance Ring (Virellion)
      if (worldId === 'virellion') {
        ctx.strokeStyle = `rgba(168, 85, 247, ${resonance / 100})`;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(mouse.current.x, mouse.current.y, 25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 5. DAMAGE LOGIC
      const distToBoss = Math.sqrt((mouse.current.x - bx)**2 + (mouse.current.y - by)**2);
      
      // Stay near boss to build resonance (Virellion mechanic)
      if (worldId === 'virellion' && distToBoss < 150) {
        setResonance(r => Math.min(100, r + 0.2));
      } else {
        setResonance(r => Math.max(0, r - 0.5));
      }

      if (frame % 30 === 0) {
        if (distToBoss < 120 && !shieldActive) {
          const resBonus = worldId === 'virellion' ? (1 + resonance / 50) : 1;
          setBossHealth(h => Math.max(0, h - (6 * damageBonus * resBonus)));
          setHitEffect(true);
          setTimeout(() => setHitEffect(false), 80);
        }
      }

      if (bossHealth <= 0) { onVictory(1000 + (resonance * 10)); return; }
      if (playerHealth <= 0) { onDefeat(); return; }

      requestAnimationFrame(animate);
    };

    const animReq = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animReq);
  }, [bossHealth, playerHealth, shieldActive, damageBonus, onVictory, onDefeat, shieldLevel, hitEffect, worldId, resonance, isCharging]);

  const toggleShield = () => {
    if (shieldCooldown > 0 || shieldActive) return;
    setShieldActive(true);
    setTimeout(() => {
      setShieldActive(false);
      setShieldCooldown(100);
      const interval = setInterval(() => {
        setShieldCooldown(c => {
          if (c <= 0) { clearInterval(interval); return 0; }
          return c - 10;
        });
      }, shieldRecharge / 10);
    }, shieldDuration);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-10 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-3xl animate-in zoom-in duration-500 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
      <div className="w-full text-center mb-2">
        <h2 className="font-orbitron text-xl text-white uppercase tracking-[0.3em] drop-shadow-lg">{bossName}</h2>
        <p className="text-[8px] font-orbitron text-indigo-400 uppercase tracking-widest mt-1 opacity-60">SENTINEL OF {world.name}</p>
      </div>

      <div className="w-full flex justify-between gap-12 max-w-[600px]">
        <div className="flex-1 space-y-2">
           <div className="flex justify-between items-end">
              <p className="text-[8px] font-orbitron text-red-400 uppercase tracking-widest">SENTINEL INTEGRITY</p>
              <p className="text-[10px] font-orbitron text-white">{Math.ceil(bossHealth)}%</p>
           </div>
           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-red-800 to-red-500 transition-all duration-300 rounded-full" 
                style={{ width: `${bossHealth}%` }} 
              />
           </div>
        </div>
        <div className="flex-1 space-y-2 text-right">
           <div className="flex justify-between items-end">
              <p className="text-[10px] font-orbitron text-white">{Math.ceil(playerHealth)}%</p>
              <p className="text-[8px] font-orbitron text-indigo-400 uppercase tracking-widest">FRAME STABILITY</p>
           </div>
           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 transition-all duration-300 rounded-full" 
                style={{ width: `${playerHealth}%` }} 
              />
           </div>
        </div>
      </div>

      <div className="relative group">
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={400} 
          className="rounded-2xl cursor-none bg-black/40 border border-white/10 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]" 
          onClick={toggleShield} 
        />
        
        {/* Mechanic Info Overlay */}
        <div className="absolute top-4 left-4 pointer-events-none space-y-2">
          {worldId === 'virellion' && (
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-indigo-500/30">
              <p className="text-[7px] font-orbitron text-indigo-400 uppercase">Resonance Link</p>
              <div className="w-20 h-1 bg-white/10 mt-1 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all" style={{ width: `${resonance}%` }} />
              </div>
            </div>
          )}
          <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            <p className="text-[7px] font-orbitron text-white/50 uppercase">Shield Protocol</p>
            <div className="w-20 h-1 bg-white/10 mt-1 rounded-full overflow-hidden">
              <div 
                className={`h-full ${shieldCooldown > 0 ? 'bg-red-500' : 'bg-blue-400'} transition-all`} 
                style={{ width: `${100 - shieldCooldown}%` }} 
              />
            </div>
          </div>
        </div>

        {isCharging && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-white font-orbitron text-xs tracking-[1em] animate-pulse uppercase">Critical Charge Detected</div>
          </div>
        )}
      </div>

      <div className="flex gap-12">
        <div className="text-center">
          <p className="text-[7px] font-orbitron text-white/20 uppercase tracking-widest mb-1">Defense</p>
          <p className="text-[10px] font-orbitron text-blue-400">CLICK TO SHIELD</p>
        </div>
        <div className="text-center">
          <p className="text-[7px] font-orbitron text-white/20 uppercase tracking-widest mb-1">Offense</p>
          <p className="text-[10px] font-orbitron text-green-400">PROXIMITY ATTACK</p>
        </div>
        {worldId === 'virellion' && (
          <div className="text-center">
            <p className="text-[7px] font-orbitron text-white/20 uppercase tracking-widest mb-1">Sync Bonus</p>
            <p className="text-[10px] font-orbitron text-purple-400">STAY NEAR FOR DMG+</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BossBattle;
