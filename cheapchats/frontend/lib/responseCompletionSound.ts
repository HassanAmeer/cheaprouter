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

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(740, now);
  oscillator.frequency.exponentialRampToValueAtTime(988, now + 0.11);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.045, now + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.23);
}
