
class AudioService {
  private ambient: HTMLAudioElement | null = null;
  private layers: Map<string, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;
  private baseVolume: number = 0.4;
  private intensity: number = 1.0;
  private currentTrackName: string = "";

  private getFilePath(name: string): string {
    const mapping: Record<string, string> = {
      'nebula': 'nebula.mp3',
      'metallic forge': 'forge.mp3',
      'liquid light': 'liquid.mp3',
      'total darkness': 'darkness.mp3',
      'radiant city': 'city.mp3',
      'fractal labyrinth': 'fractal.mp3',
      'singularity': 'singularity.mp3',
      'click': 'click.mp3',
      'success': 'success.mp3',
      'mote': 'mote.mp3',
      'keyword': 'keyword.mp3',
      'resonance': 'resonance_layer.mp3',
      'glimmer': 'glimmer_layer.mp3'
    };
    return `./${mapping[name.toLowerCase()] || name + '.mp3'}`;
  }

  getCurrentTrack(): string {
    return this.currentTrackName;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ambient) this.ambient.muted = this.isMuted;
    this.layers.forEach(l => l.muted = this.isMuted);
    return this.isMuted;
  }

  private playEffect(name: string) {
    if (this.isMuted) return;
    const effect = new Audio(this.getFilePath(name));
    effect.volume = 0.5 * this.intensity;
    effect.play().catch(() => {});
  }

  playClick() { this.playEffect('click'); }
  playSuccess() { this.playEffect('success'); }
  playMoteCatch() { this.playEffect('mote'); }
  playKeywordLog() { this.playEffect('keyword'); }

  /**
   * Adjusts the intensity of the current ambient audio.
   * Useful for proximity effects or heightened tension.
   * @param level 0.5 (low intensity) to 1.5 (high intensity)
   */
  setIntensity(level: number) {
    this.intensity = Math.max(0.2, Math.min(2.0, level));
    this.updateAllVolumes();
  }

  private updateAllVolumes() {
    if (this.ambient) {
      this.ambient.volume = this.baseVolume * this.intensity;
    }
    this.layers.forEach((audio, name) => {
      const layerBase = name === 'resonance' ? 0.3 : 0.2;
      audio.volume = layerBase * this.baseVolume * this.intensity;
    });
  }

  /**
   * Adds a subtle secondary loop layer to the current mix.
   */
  playLayer(name: string) {
    if (this.layers.has(name) || this.isMuted) return;
    
    const layer = new Audio(this.getFilePath(name));
    layer.loop = true;
    layer.volume = 0;
    layer.muted = this.isMuted;
    
    this.layers.set(name, layer);
    layer.play().then(() => {
      let vol = 0;
      const target = (name === 'resonance' ? 0.3 : 0.2) * this.baseVolume * this.intensity;
      const interval = setInterval(() => {
        vol += 0.01;
        if (vol >= target) {
          layer.volume = target;
          clearInterval(interval);
        } else {
          layer.volume = vol;
        }
      }, 50);
    }).catch(() => {
      this.layers.delete(name);
    });
  }

  /**
   * Removes a specific layer with a smooth fade-out.
   */
  stopLayer(name: string) {
    const layer = this.layers.get(name);
    if (!layer) return;

    let vol = layer.volume;
    const interval = setInterval(() => {
      vol -= 0.02;
      if (vol <= 0) {
        layer.pause();
        layer.src = "";
        clearInterval(interval);
        this.layers.delete(name);
      } else {
        layer.volume = vol;
      }
    }, 50);
  }

  startBiomeAmbient(biome: string) {
    if (this.currentTrackName === biome) return;
    this.stopAmbient();
    this.currentTrackName = biome;
    
    this.ambient = new Audio(this.getFilePath(biome));
    this.ambient.loop = true;
    this.ambient.volume = 0;
    this.ambient.muted = this.isMuted;

    this.ambient.play().then(() => {
      let vol = 0;
      const target = this.baseVolume * this.intensity;
      const interval = setInterval(() => {
        if (!this.ambient) { clearInterval(interval); return; }
        vol += 0.05;
        if (vol >= target) { 
          this.ambient.volume = target; 
          clearInterval(interval); 
        }
        else this.ambient.volume = vol;
      }, 100);
    }).catch(() => {});
  }

  stopAmbient() {
    if (this.ambient) {
      const current = this.ambient;
      let vol = current.volume;
      const interval = setInterval(() => {
        vol -= 0.05;
        if (vol <= 0) { current.pause(); current.src = ""; clearInterval(interval); }
        else current.volume = vol;
      }, 100);
      this.ambient = null;
    }
    // Also stop all layers
    this.layers.forEach((_, name) => this.stopLayer(name));
  }
}

export const audio = new AudioService();
