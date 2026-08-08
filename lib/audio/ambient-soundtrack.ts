"use client";

/**
 * Ambient Soundtrack Engine (Web Audio API)
 *
 * Generates an ambient cinematic drone and chord textures
 * with warm harmonic low-pass filters and milestone chimes.
 * Requires zero external audio files.
 */

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private oscillators: OscillatorNode[] = [];
  private lfo: OscillatorNode | null = null;

  private init() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
  }

  public async start() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;

    const now = this.ctx.currentTime;

    // Cinematic chord frequencies based on warm harmonic tuning (F# minor / A major drone)
    const baseFreqs = [108, 162, 216, 324, 432];

    // Filter for warm analog feel
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, now);
    filter.Q.setValueAtTime(2.5, now);
    filter.connect(this.masterGain);

    // Subtle LFO for breathing movement
    this.lfo = this.ctx.createOscillator();
    this.lfo.frequency.setValueAtTime(0.12, now); // Very slow 8-second breath
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(80, now);
    this.lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    this.lfo.start();

    // Create warm synth drone layers
    this.oscillators = baseFreqs.map((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const oscGain = this.ctx!.createGain();

      osc.type = idx % 2 === 0 ? "sawtooth" : "sine";
      osc.frequency.setValueAtTime(freq, now);

      // Subtle detune for shimmer
      osc.detune.setValueAtTime((idx - 2) * 4, now);

      const layerGain = 0.08 / (idx + 1);
      oscGain.gain.setValueAtTime(layerGain, now);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      return osc;
    });

    // Smooth fade in
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.gain.linearRampToValueAtTime(0.28, now + 3.0);
  }

  public stop() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + 1.2);

    setTimeout(() => {
      this.oscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
      this.oscillators = [];

      if (this.lfo) {
        try {
          this.lfo.stop();
          this.lfo.disconnect();
        } catch {}
        this.lfo = null;
      }
      this.isPlaying = false;
    }, 1300);
  }

  public triggerChime(pitch: number = 864) {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, now + 0.6);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.3);
    } catch {}
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const ambientSoundtrack = new AmbientSoundEngine();
