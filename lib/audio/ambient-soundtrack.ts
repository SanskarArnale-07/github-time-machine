"use client";

/**
 * Nostalgic Cinematic Soundtrack Engine (Web Audio API)
 *
 * Generates an inspiring, warm, reflective documentary soundtrack:
 * - Gentle soft piano tones & warm ambient synth chords in C Major / G Major / F Major
 * - Warm low-pass acoustic filtering, smooth volume swells (20-25% default)
 * - Milestone chimes for chapter transitions and key breakthroughs
 * - Zero eerie/creepy drone frequencies; pure reflective optimism
 * - Supports mixing audio into MediaStream for video export!
 */

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private intervalTimer: any = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;

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
   * Returns a MediaStream destination for embedding audio into video exports.
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
   * Plays a single warm, soft acoustic piano-like note with gentle harmonic decay.
   */
  private playSoftNote(freq: number, duration: number = 2.5, velocity: number = 0.08) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    // Warm pure sine + triangle for gentle acoustic keyboard warmth
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 2, now); // soft 2nd harmonic

    // Low-pass filter for smooth round tone
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(350, now + duration);

    // Piano-style envelope: instant attack, gentle exponential decay
    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.linearRampToValueAtTime(velocity, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + duration);
    osc2.stop(now + duration);
  }

  /**
   * Starts the warm, reflective documentary chord progression.
   */
  public async start() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    if (this.isPlaying) return;
    this.isPlaying = true;

    const now = this.ctx.currentTime;
    // Set smooth gentle master volume (22% volume)
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.gain.linearRampToValueAtTime(0.22, now + 2.0);

    // Warm, inspiring C Major / G Major / F Major / A Minor arpeggios (in Hz)
    const chordProgressions = [
      [261.63, 329.63, 392.0, 523.25], // C Major (C4, E4, G4, C5)
      [220.0, 261.63, 329.63, 440.0],  // A Minor (A3, C4, E4, A4)
      [174.61, 261.63, 349.23, 440.0], // F Major (F3, C4, F4, A4)
      [196.0, 246.94, 293.66, 392.0],  // G Major (G3, B3, D4, G4)
    ];

    let chordStep = 0;

    const playChordArpeggio = () => {
      if (!this.isPlaying || !this.ctx) return;
      const chord = chordProgressions[chordStep % chordProgressions.length];

      // Play soft arpeggiated piano notes
      chord.forEach((freq, noteIdx) => {
        setTimeout(() => {
          if (this.isPlaying) {
            this.playSoftNote(freq, 3.2, 0.06);
          }
        }, noteIdx * 450);
      });

      chordStep++;
    };

    // Play initial chord immediately
    playChordArpeggio();
    this.intervalTimer = setInterval(playChordArpeggio, 2800);
  }

  /**
   * Stops the soundtrack with a smooth fade-out.
   */
  public stop() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + 1.2);

    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }

    setTimeout(() => {
      this.isPlaying = false;
    }, 1300);
  }

  /**
   * Plays an inspiring, crystalline chime on milestone events and chapter transitions.
   */
  public triggerChime(pitch: number = 880) {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.25, now + 0.8);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.6);
    } catch {}
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const ambientSoundtrack = new AmbientSoundEngine();
