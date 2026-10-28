// Web Audio API Sound Effects & Melody Synthesizer

class AudioManager {
  constructor() {
    this.ctx = null;
    this.melodyInterval = null;
    this.isPlayingMelody = false;
    this.customAudio = null;
    this.volume = 0.8;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Realistic paper tearing sound effect (frequency modulated noise)
  playPaperTearSound() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const bufferSize = ctx.sampleRate * 0.45;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate brown/pink noise burst
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        // Introduce intermittent rips
        const rip = (Math.sin(i * 0.05) > 0.4 ? 1.5 : 0.6) * (Math.random() > 0.3 ? 1 : 0.2);
        data[i] = (lastOut * 3.5 + (Math.random() * 0.4 - 0.2)) * rip;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3200, ctx.currentTime + 0.25);
      filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.45);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.7 * this.volume, ctx.currentTime + 0.04);
      gain.gain.linearRampToValueAtTime(0.4 * this.volume, ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (e) {
      console.warn('Audio playPaperTear error:', e);
    }
  }

  // Wax seal cracking sound
  playWaxSealSound() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const ctx = this.ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.6 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch (e) {
      console.warn('Audio playWaxSeal error:', e);
    }
  }

  // Gift pop sound with magic sparkle chime
  playGiftPopSound() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const ctx = this.ctx;

      // Pop sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.8 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.19);

      // Sparkle chime chord
      const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      chords.forEach((freq, idx) => {
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
        chimeGain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.04);
        chimeGain.gain.linearRampToValueAtTime(0.25 * this.volume, ctx.currentTime + idx * 0.04 + 0.02);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.8);
        chimeOsc.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        chimeOsc.start(ctx.currentTime + idx * 0.04);
        chimeOsc.stop(ctx.currentTime + idx * 0.04 + 0.85);
      });
    } catch (e) {
      console.warn('Audio playGiftPop error:', e);
    }
  }

  // Candle blowing out sound (air whoosh)
  playCandleBlowSound() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const bufferSize = ctx.sampleRate * 0.6;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.55);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.8 * this.volume, ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.58);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (e) {
      console.warn('Audio playCandleBlow error:', e);
    }
  }

  // Balloon popping sound
  playBalloonPopSound() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.7 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn('Audio playBalloonPop error:', e);
    }
  }

  // Cheerful chime
  playCelebrationCheer() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.3 * this.volume, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.72);
        }, i * 70);
      });
    } catch (e) {
      console.warn('Audio playCelebrationCheer error:', e);
    }
  }

  // Plays a beautiful Music Box / Marimba rendition of "Happy Birthday to You"
  // Notes in Hz for Happy Birthday:
  // C4, C4, D4, C4, F4, E4
  // C4, C4, D4, C4, G4, F4
  // C4, C4, C5, A4, F4, E4, D4
  // Bb4, Bb4, A4, F4, G4, F4
  startSynthesizedHappyBirthday(onNotePlay) {
    this.initContext();
    if (!this.ctx) return;
    this.stopMusic();
    this.isPlayingMelody = true;

    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, Bb4 = 466.16, C5 = 523.25;
    
    // Notes and durations (in beats)
    const melody = [
      { note: C4, d: 0.75 }, { note: C4, d: 0.25 }, { note: D4, d: 1.0 }, { note: C4, d: 1.0 }, { note: F4, d: 1.0 }, { note: E4, d: 2.0 },
      { note: C4, d: 0.75 }, { note: C4, d: 0.25 }, { note: D4, d: 1.0 }, { note: C4, d: 1.0 }, { note: G4, d: 1.0 }, { note: F4, d: 2.0 },
      { note: C4, d: 0.75 }, { note: C4, d: 0.25 }, { note: C5, d: 1.0 }, { note: A4, d: 1.0 }, { note: F4, d: 1.0 }, { note: E4, d: 1.0 }, { note: D4, d: 2.0 },
      { note: Bb4, d: 0.75 }, { note: Bb4, d: 0.25 }, { note: A4, d: 1.0 }, { note: F4, d: 1.0 }, { note: G4, d: 1.0 }, { note: F4, d: 2.5 }
    ];

    const beatDuration = 0.42; // seconds per beat
    let currentStep = 0;

    const playNext = () => {
      if (!this.isPlayingMelody || !this.ctx) return;
      
      const item = melody[currentStep];
      const durationSeconds = item.d * beatDuration;

      // Play celestial chime / music box bell
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      
      osc1.frequency.setValueAtTime(item.note, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(item.note * 2, this.ctx.currentTime); // 1 octave overtone

      const vol = 0.28 * this.volume;
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + durationSeconds * 1.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + durationSeconds * 1.7);
      osc2.stop(this.ctx.currentTime + durationSeconds * 1.7);

      if (onNotePlay) onNotePlay(item.note);

      currentStep = (currentStep + 1) % melody.length;
      
      // Delay before next note (with extra pause between loops)
      const nextDelay = (currentStep === 0 ? durationSeconds + 1.2 : durationSeconds) * 1000;
      this.melodyInterval = setTimeout(playNext, nextDelay);
    };

    playNext();
  }

  // Play custom audio (e.g. user uploaded song or preset audio URL)
  playAudioTrack(audioUrl, onEnd) {
    this.stopMusic();
    try {
      this.customAudio = new Audio(audioUrl);
      this.customAudio.volume = this.volume;
      this.customAudio.loop = true;
      const playPromise = this.customAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Autoplay prevented or audio load issue:', err);
          // Fallback to synthesized melody
          this.startSynthesizedHappyBirthday();
        });
      }
      this.isPlayingMelody = true;
      if (onEnd) {
        this.customAudio.onended = onEnd;
      }
    } catch (err) {
      console.warn('Failed to load custom audio, falling back to synthesizer:', err);
      this.startSynthesizedHappyBirthday();
    }
  }

  // Master start music handler: if track is custom/preset URL, play it; else synthesize
  playBirthdayMusic(musicData, onNotePlay) {
    if (!musicData) {
      this.startSynthesizedHappyBirthday(onNotePlay);
      return;
    }

    if (typeof musicData === 'string' && (musicData.startsWith('data:audio') || musicData.startsWith('http') || musicData.startsWith('/'))) {
      this.playAudioTrack(musicData);
    } else if (musicData.type === 'custom' && musicData.url) {
      this.playAudioTrack(musicData.url);
    } else {
      // Synthesized mode (e.g. 'musicbox', 'acoustic', etc.)
      this.startSynthesizedHappyBirthday(onNotePlay);
    }
  }

  stopMusic() {
    this.isPlayingMelody = false;
    if (this.melodyInterval) {
      clearTimeout(this.melodyInterval);
      this.melodyInterval = null;
    }
    if (this.customAudio) {
      try {
        this.customAudio.pause();
        this.customAudio.currentTime = 0;
      } catch (e) {
        // ignore
      }
      this.customAudio = null;
    }
  }

  setVolume(newVol) {
    this.volume = Math.max(0, Math.min(1, newVol));
    if (this.customAudio) {
      this.customAudio.volume = this.volume;
    }
  }

  togglePlayPause(musicData) {
    if (this.isPlayingMelody) {
      this.stopMusic();
      return false;
    } else {
      this.playBirthdayMusic(musicData);
      return true;
    }
  }
}

export const soundManager = new AudioManager();
