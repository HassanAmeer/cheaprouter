let responseAudioContext: AudioContext | null = null;

function getResponseAudioContext() {
  const AudioContextConstructor = window.AudioContext;
  if (!AudioContextConstructor) return null;
  responseAudioContext ??= new AudioContextConstructor();
  return responseAudioContext;
}

export function primeResponseCompletionSound() {
  const audioContext = getResponseAudioContext();
  if (audioContext?.state === "suspended") {
    void audioContext.resume().catch((error) => {
      console.warn("Could not prepare response completion sound:", error);
    });
  }
}

export async function playResponseCompletionSound() {
  const audioContext = getResponseAudioContext();
  if (!audioContext) return;
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const now = audioContext.currentTime;

  const playNote = (freq: number, start: number, duration: number, peak: number) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  };

  // Soft professional two-tone chime (E5 → C5)
  playNote(659.25, now, 0.18, 0.5);
  playNote(523.25, now + 0.14, 0.28, 0.45);
}
