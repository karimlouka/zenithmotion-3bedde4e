// Audio context and alert sound generation
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const playAlertSound = (muted: boolean): void => {
  if (muted) return;

  try {
    const ctx = getAudioContext();
    
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Create a powerful, attention-getting alarm sound
    const playTone = (startTime: number, freq: number, duration: number) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(freq, startTime);
      oscillator.type = 'square'; // Harsher, more attention-getting sound

      // Loud envelope
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.02);
      gainNode.gain.setValueAtTime(0.5, startTime + duration - 0.02);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // Play a 3-beep alarm pattern (loud and clear)
    const now = ctx.currentTime;
    playTone(now, 1000, 0.15);        // First beep - high
    playTone(now + 0.2, 800, 0.15);   // Second beep - medium
    playTone(now + 0.4, 1000, 0.15);  // Third beep - high
    playTone(now + 0.6, 800, 0.15);   // Fourth beep - medium
    playTone(now + 0.8, 1200, 0.25);  // Final long beep - highest

  } catch (error) {
    console.warn('Audio playback failed:', error);
  }
};
