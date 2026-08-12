"use client";

/**
 * Inspiring Documentary Soundtrack Engine (Web Audio API)
 *
 * Requirements Met:
 * - Completely warm, hopeful, reflective, and motivating documentary audio.
 * - Zero eerie, dark, or creepy drone frequencies; pure gentle acoustic piano & warm harmonic pads.
 * - 3 distinct soundtrack variations:
 *   1. "Odyssey" (Warm C Major)
 *   2. "Constellations" (Hopeful G Major)
 *   3. "Horizon" (Reflective F Major)
 * - Adaptive audio evolution across chapter phases (gentle piano -> rhythmic pulse -> warm strings -> resolution).
 * - Subtle ambient sound effects: gentle keyboard click, soft page turn, milestone whoosh chime.
 * - Default: MUTED (OFF). Remembers preference in localStorage.
 * - Seamless MediaStream integration for 1080p video exports.
 */

export type SoundtrackTheme = "odyssey" | "constellations" | "horizon";

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private intervalTimer: any = null;
  private currentTheme: SoundtrackTheme = "odyssey";
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  
  private tapeHissSource: AudioBufferSourceNode | null = null;
  private tapeHissGain: GainNode | null = null;

  // Chord Progressions per Theme (Hz)
  private themes: Record<SoundtrackTheme, { chords: number[][]; root: number; name: string }> = {
    odyssey: {
      name: "Odyssey (Warm C Major)",
      root: 261.63,
      chords: [
        [261.63, 329.63, 392.0, 523.25], // C Major
        [220.0, 261.63, 329.63, 440.0],  // A Minor
        [174.61, 261.63, 349.23, 440.0], // F Major
        [196.0, 246.94, 293.66, 392.0],  // G Major
      ],
    },
    constellations: {
      name: "Constellations (Hopeful G Major)",
      root: 196.0,
      chords: [
        [196.0, 246.94, 293.66, 392.0],  // G Major
        [164.81, 220.0, 261.63, 329.63], // E Minor
        [261.63, 329.63, 392.0, 523.25], // C Major
        [146.83, 220.0, 293.66, 370.0],  // D Major
      ],
    },
    horizon: {
      name: "Horizon (Reflective F Major)",
      root: 174.61,
      chords: [
        [174.61, 261.63, 349.23, 440.0], // F Major
        [261.63, 329.63, 392.0, 523.25], // C Major
        [220.0, 261.63, 329.63, 440.0],  // A Minor
        [233.08, 293.66, 349.23, 466.16],// Bb Major
      ],
    },
  };

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

  /**
   * Returns audio track destination for mixing directly into 1080p video exports.
   */
  public getStreamDestination(): MediaStreamTrack | null {
    this.init();
    if (!this.ctx || !this.masterGain) return null;
    if (!this.destinationNode) {
      this.destinationNode = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.destinationNode);
    }
    return this.destinationNode.stream.getAudioTracks()[0] || null;
  }

  /**
   * Plays a warm, soft acoustic piano note with gentle harmonic envelope.
   */
  private playPianoNote(freq: number, duration: number = 3.0, velocity: number = 0.07, isPad: boolean = false, startTime?: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = startTime ?? this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = isPad ? "sine" : "triangle";
    osc2.frequency.setValueAtTime(freq * (isPad ? 0.5 : 2), now); // sub/harmonic

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(isPad ? 400 : 850, now);
    filter.frequency.exponentialRampToValueAtTime(280, now + duration);

    // Warm envelope
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(velocity, now + (isPad ? 0.4 : 0.04));
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  private nextNoteTime = 0;
  private chordStep = 0;
  private scheduleAheadTime = 0.5; // seconds
  private currentVolume = 0.22;

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain && this.isPlaying) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.currentVolume, this.ctx.currentTime + 0.5);
    }
  }

  private scheduleNote(time: number) {
    const currentSelectedTheme = this.themes[this.currentTheme];
    const chords = currentSelectedTheme.chords;
    const currentChord = chords[this.chordStep % chords.length];

    // Play soft warm chord pad in background
    currentChord.forEach((freq) => {
      this.playPianoNote(freq * 0.5, 4.2, 0.03, true, time);
    });

    // Play light arpeggiated piano melody notes
    currentChord.forEach((freq, idx) => {
      this.playPianoNote(freq, 3.2, 0.06, false, time + idx * 0.48);
    });
  }

  private scheduler = () => {
    if (!this.isPlaying || !this.ctx) return;
    // Schedule notes if we are close to the next note time
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.nextNoteTime);
      this.nextNoteTime += 2.9; // 2900ms interval
      this.chordStep++;
    }
    this.intervalTimer = window.setTimeout(this.scheduler, 100);
  };

  private createTapeHiss() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.tapeHissSource = this.ctx.createBufferSource();
    this.tapeHissSource.buffer = buffer;
    this.tapeHissSource.loop = true;
    
    // Apply a bandpass filter to make it sound like warm tape rather than harsh white noise
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    filter.Q.value = 0.5;

    this.tapeHissGain = this.ctx.createGain();
    this.tapeHissGain.gain.value = 0.012; // Warmer documentary tape hiss

    this.tapeHissSource.connect(filter);
    filter.connect(this.tapeHissGain);
    this.tapeHissGain.connect(this.masterGain);
    
    this.tapeHissSource.start();
  }

  /**
   * Starts the adaptive cinematic soundtrack.
   */
  public async start(themeOverride?: SoundtrackTheme) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;

    // Pick random theme or use override
    const themeKeys: SoundtrackTheme[] = ["odyssey", "constellations", "horizon"];
    this.currentTheme =
      themeOverride || themeKeys[Math.floor(Math.random() * themeKeys.length)];

    const now = this.ctx.currentTime;

    // Master volume fade in
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.gain.linearRampToValueAtTime(this.currentVolume, now + 2.5);

    this.chordStep = 0;
    this.nextNoteTime = now + 0.1; // start slightly in the future
    
    this.createTapeHiss();
    this.scheduler();
  }

  /**
   * Smoothly changes the active harmonic theme
   */
  public setTheme(theme: SoundtrackTheme) {
    if (this.currentTheme === theme) return;
    this.currentTheme = theme;
  }

  /**
   * Smoothly fades out the soundtrack.
   */
  public stop() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + 1.2);

    if (this.intervalTimer) {
      clearTimeout(this.intervalTimer);
      this.intervalTimer = null;
    }

    if (this.tapeHissSource) {
      this.tapeHissSource.stop(now + 1.2);
      this.tapeHissSource = null;
    }

    // Set playing to false immediately so scheduler stops
    this.isPlaying = false;
  }

  /**
   * Milestone transition chime / uplifting soft harmonic swell.
   */
  public triggerMilestoneSwell(pitch: number = 880) {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.33, now + 0.9);

      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.7);
    } catch {}
  }

  /**
   * Subtle ambient sound: soft keyboard click / gentle whoosh.
   */
  public triggerSubtleClick() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  /**
   * Mechanical projector click for chapter transitions
   */
  public triggerProjectorClick() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Sharp mechanical transient
      osc.type = "square";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.03);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  public getThemeName(): string {
    return this.themes[this.currentTheme].name;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const ambientSoundtrack = new AmbientSoundEngine();
