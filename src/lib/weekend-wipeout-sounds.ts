export type SoundNodes = {
  ctx: AudioContext;
  master: GainNode;
  fireGain: GainNode;
  waterGain: GainNode;
  fireSource: AudioBufferSourceNode;
  waterSource: AudioBufferSourceNode;
  crackleInterval: ReturnType<typeof setInterval>;
};

function createNoiseBuffer(
  ctx: AudioContext,
  seconds: number,
  type: "white" | "brown" | "pink"
) {
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let brown = 0;

  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;

    if (type === "white") {
      data[i] = white;
    } else if (type === "brown") {
      brown = (brown + white * 0.05) / 1.05;
      data[i] = brown * 3.5;
    } else {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
    }
  }

  return buffer;
}

function connectFilteredNoise(
  ctx: AudioContext,
  buffer: AudioBuffer,
  destination: AudioNode,
  options: {
    type?: BiquadFilterType;
    frequency: number;
    q?: number;
    gain: number;
  }
) {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = options.type ?? "bandpass";
  filter.frequency.value = options.frequency;
  filter.Q.value = options.q ?? 0.8;

  const gain = ctx.createGain();
  gain.gain.value = options.gain;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  source.start();
  return source;
}

export async function startWipeoutSoundscape(): Promise<SoundNodes | null> {
  if (typeof window === "undefined") return null;

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;

  const ctx = new AudioCtx();
  await ctx.resume();

  const master = ctx.createGain();
  master.gain.value = 0.85;
  master.connect(ctx.destination);

  const fireGain = ctx.createGain();
  fireGain.gain.value = 0;
  fireGain.connect(master);

  const waterGain = ctx.createGain();
  waterGain.gain.value = 0;
  waterGain.connect(master);

  const fireNoise = createNoiseBuffer(ctx, 2, "brown");
  const fireSource = connectFilteredNoise(ctx, fireNoise, fireGain, {
    type: "lowpass",
    frequency: 680,
    gain: 0.55,
  });

  const rumble = ctx.createOscillator();
  rumble.type = "sawtooth";
  rumble.frequency.value = 42;
  const rumbleGain = ctx.createGain();
  rumbleGain.gain.value = 0.08;
  rumble.connect(rumbleGain);
  rumbleGain.connect(fireGain);
  rumble.start();

  fireGain.gain.setTargetAtTime(0.7, ctx.currentTime, 0.4);

  const crackleInterval = setInterval(() => {
    if (ctx.state !== "running") return;

    const pop = ctx.createBufferSource();
    pop.buffer = createNoiseBuffer(ctx, 0.04, "white");
    const popFilter = ctx.createBiquadFilter();
    popFilter.type = "highpass";
    popFilter.frequency.value = 1200 + Math.random() * 2500;
    const popGain = ctx.createGain();
    popGain.gain.value = 0.08 + Math.random() * 0.14;
    pop.connect(popFilter);
    popFilter.connect(popGain);
    popGain.connect(fireGain);
    pop.start();
    pop.stop(ctx.currentTime + 0.05);
  }, 90 + Math.random() * 140);

  const waterNoise = createNoiseBuffer(ctx, 2, "pink");
  const waterSource = connectFilteredNoise(ctx, waterNoise, waterGain, {
    type: "bandpass",
    frequency: 320,
    q: 0.5,
    gain: 0.35,
  });

  return {
    ctx,
    master,
    fireGain,
    waterGain,
    fireSource,
    waterSource,
    crackleInterval,
  };
}

export function triggerWaterfallSound(nodes: SoundNodes) {
  const { ctx, fireGain, waterGain } = nodes;
  const now = ctx.currentTime;

  waterGain.gain.cancelScheduledValues(now);
  waterGain.gain.setValueAtTime(0.05, now);
  waterGain.gain.exponentialRampToValueAtTime(1.1, now + 0.35);
  waterGain.gain.setTargetAtTime(0.85, now + 0.35, 0.25);

  const boom = ctx.createOscillator();
  boom.type = "sine";
  boom.frequency.setValueAtTime(110, now);
  boom.frequency.exponentialRampToValueAtTime(38, now + 1.2);
  const boomGain = ctx.createGain();
  boomGain.gain.setValueAtTime(0.001, now);
  boomGain.gain.exponentialRampToValueAtTime(0.35, now + 0.08);
  boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
  boom.connect(boomGain);
  boomGain.connect(waterGain);
  boom.start(now);
  boom.stop(now + 1.5);
}

export function coolDownSound(nodes: SoundNodes) {
  const { ctx, fireGain, waterGain } = nodes;
  const now = ctx.currentTime;

  fireGain.gain.setTargetAtTime(0, now, 0.35);
  waterGain.gain.setTargetAtTime(0.25, now, 0.5);

  const hiss = ctx.createBufferSource();
  hiss.buffer = createNoiseBuffer(ctx, 0.6, "pink");
  const hissFilter = ctx.createBiquadFilter();
  hissFilter.type = "highpass";
  hissFilter.frequency.value = 2400;
  const hissGain = ctx.createGain();
  hissGain.gain.setValueAtTime(0.001, now);
  hissGain.gain.exponentialRampToValueAtTime(0.12, now + 0.1);
  hissGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
  hiss.connect(hissFilter);
  hissFilter.connect(hissGain);
  hissGain.connect(nodes.master);
  hiss.start(now);
  hiss.stop(now + 1.3);
}

export function fadeOutSoundscape(nodes: SoundNodes) {
  const now = nodes.ctx.currentTime;
  nodes.master.gain.setTargetAtTime(0.001, now, 0.35);
  setTimeout(() => stopSoundscape(nodes), 1200);
}

export function stopSoundscape(nodes: SoundNodes) {
  clearInterval(nodes.crackleInterval);
  try {
    nodes.fireSource.stop();
    nodes.waterSource.stop();
    nodes.ctx.close();
  } catch {
    // already stopped
  }
}
