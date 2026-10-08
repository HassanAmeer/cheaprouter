let thinkingAudioContext: AudioContext | null = null;
let thinkingNoise: AudioBufferSourceNode | null = null;
let thinkingGain: GainNode | null = null;
let waveTimer: ReturnType<typeof setInterval> | null = null;

export function startThinkingWaveSound() {
  try {
    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) return;
    thinkingAudioContext ??= new AudioContextConstructor();
    const ctx = thinkingAudioContext;
    if (ctx.state === "suspended") {
      void ctx.resume().catch(() => undefined);
    }

    // Already playing
    if (thinkingNoise) return;

    // ChatGPT-style soft filtered noise "shhh" with slow breathing amplitude
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 1200;
    bandpass.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);

    noise.start();

    // Wave rhythm: slow swell → 1s steady → fast pulse → slow down → repeat
    const scheduleWave = () => {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0.02, now);
      // 1. slow swelling wave
      gain.gain.linearRampToValueAtTime(0.08, now + 1.2);
      // 2. one second steady
      gain.gain.setValueAtTime(0.08, now + 2.2);
      // 3. fast rise and fall
      gain.gain.linearRampToValueAtTime(0.16, now + 2.5);
      gain.gain.linearRampToValueAtTime(0.03, now + 2.9);
      // 4. slow down to idle
      gain.gain.linearRampToValueAtTime(0.02, now + 4.2);
    };
    scheduleWave();
    waveTimer = setInterval(scheduleWave, 4300);

    thinkingNoise = noise;
    thinkingGain = gain;
  } catch {
    // ignore
  }
}

export function stopThinkingWaveSound() {
  try {
    if (thinkingGain && thinkingAudioContext) {
      thinkingGain.gain.setTargetAtTime(0.0001, thinkingAudioContext.currentTime, 0.08);
    }
    if (thinkingNoise) {
      thinkingNoise.stop(thinkingAudioContext ? thinkingAudioContext.currentTime + 0.3 : 0);
    }
    if (waveTimer) {
      clearInterval(waveTimer);
    }
  } catch {
    // ignore
  } finally {
    thinkingNoise = null;
    thinkingGain = null;
    waveTimer = null;
  }
}
