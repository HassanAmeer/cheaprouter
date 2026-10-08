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
    bandpass.type = "lowpass";
    bandpass.frequency.value = 400;
    bandpass.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);

    noise.start();

    // Ocean-wave style: slow swell in (whoosh), crest shimmer, slow fade out, pause, repeat
    const scheduleWave = () => {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      bandpass.frequency.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0.0001, now);
      bandpass.frequency.setValueAtTime(300, now);
      // wave slowly builds
      gain.gain.linearRampToValueAtTime(0.14, now + 1.6);
      bandpass.frequency.linearRampToValueAtTime(900, now + 1.6);
      // crest
      gain.gain.linearRampToValueAtTime(0.10, now + 2.2);
      // wave washes out
      gain.gain.linearRampToValueAtTime(0.0001, now + 3.4);
      bandpass.frequency.linearRampToValueAtTime(250, now + 3.4);
    };
    scheduleWave();
    waveTimer = setInterval(scheduleWave, 4600);

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
