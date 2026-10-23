// Browser Web Speech API Voice Co-Pilot helper
class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onStateChange: ((speaking: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribe(callback: (speaking: boolean) => void) {
    this.onStateChange = callback;
  }

  public speak(text: string, onEnd?: () => void): boolean {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser.');
      return false;
    }

    // Cancel existing speech
    this.stop();

    // Clean markdown asterisks and formatting for natural speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s?/g, '')
      .replace(/\[.*?\]/g, '')
      .trim();

    if (!cleanText) return false;

    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance.rate = 1.0;
    this.currentUtterance.pitch = 1.05;

    // Pick pleasant natural voice if available
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        (v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen'))) ||
        v.lang === 'en-IN' ||
        v.lang === 'en-US'
    );
    if (preferredVoice) {
      this.currentUtterance.voice = preferredVoice;
    }

    this.currentUtterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onStateChange) this.onStateChange(true);
    };

    this.currentUtterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.onStateChange) this.onStateChange(false);
      if (onEnd) onEnd();
    };

    this.currentUtterance.onerror = (e) => {
      console.warn('Speech error:', e);
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.onStateChange) this.onStateChange(false);
    };

    this.synth.speak(this.currentUtterance);
    return true;
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.onStateChange) this.onStateChange(false);
    }
  }

  public getSpeakingState(): boolean {
    return this.isSpeaking;
  }
}

export const speechService = new SpeechService();
