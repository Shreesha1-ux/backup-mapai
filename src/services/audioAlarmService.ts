// Web Audio API emergency siren and warning tone generator
class AudioAlarmService {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isAlarmRunning = false;
  private intervalId: any = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startSiren(): boolean {
    try {
      this.initContext();
      if (!this.ctx) return false;
      if (this.isAlarmRunning) return true;

      this.oscillator = this.ctx.createOscillator();
      this.gainNode = this.ctx.createGain();

      this.oscillator.type = 'sawtooth';
      this.oscillator.frequency.setValueAtTime(600, this.ctx.currentTime);

      this.gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.oscillator.start();
      this.isAlarmRunning = true;

      // Modulate frequency between 600Hz and 1100Hz (police/ambulance siren style)
      let high = false;
      this.intervalId = setInterval(() => {
        if (!this.ctx || !this.oscillator) return;
        high = !high;
        const targetFreq = high ? 1050 : 650;
        this.oscillator.frequency.exponentialRampToValueAtTime(
          targetFreq,
          this.ctx.currentTime + 0.35
        );
      }, 400);

      return true;
    } catch (err) {
      console.warn('Audio alarm playback not allowed yet:', err);
      return false;
    }
  }

  public stopSiren() {
    try {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
      this.isAlarmRunning = false;
    } catch (e) {
      // ignore
    }
  }

  public playBeep(freq = 880, duration = 0.15) {
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // ignore
    }
  }

  public isRunning(): boolean {
    return this.isAlarmRunning;
  }
}

export const audioAlarmService = new AudioAlarmService();
