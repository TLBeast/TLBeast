"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Phase = "explosion" | "fade" | "done";

type BurstParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
};

type Shockwave = {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  hue: number;
  width: number;
};

const EXPLOSION_MS = 2000;
const FADE_MS = 800;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function playExplosionSound() {
  if (typeof window === "undefined") return;

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  void ctx.resume().then(() => {
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);

    const boom = ctx.createOscillator();
    boom.type = "sine";
    boom.frequency.setValueAtTime(180, now);
    boom.frequency.exponentialRampToValueAtTime(28, now + 0.5);

    const boomGain = ctx.createGain();
    boomGain.gain.setValueAtTime(0.001, now);
    boomGain.gain.exponentialRampToValueAtTime(0.7, now + 0.02);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    boom.connect(boomGain);
    boomGain.connect(master);
    boom.start(now);
    boom.stop(now + 0.7);

    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 900;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.35, now + 0.01);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(now);

    setTimeout(() => void ctx.close(), 900);
  });
}

function spawnExplosion(
  width: number,
  height: number,
  particles: BurstParticle[],
  waves: Shockwave[]
) {
  const cx = width / 2;
  const cy = height / 2;
  const scale = Math.min(width, height);

  for (let i = 0; i < 900; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 22;
    particles.push({
      x: cx + (Math.random() - 0.5) * scale * 0.08,
      y: cy + (Math.random() - 0.5) * scale * 0.08,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 0.5 + Math.random() * 0.8,
      size: 4 + Math.random() * 18,
      hue: Math.random() * 360,
    });
  }

  const hues = [0, 35, 55, 120, 190, 260, 310, 330];
  hues.forEach((hue, i) => {
    waves.push({
      x: cx,
      y: cy,
      radius: 0,
      maxRadius: scale * (0.55 + i * 0.12),
      life: 1,
      hue,
      width: 8 + i * 3,
    });
  });
}

export function WeekendWipeoutIntro({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("explosion");
  const [contentVisible, setContentVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const phaseRef = useRef<Phase>("explosion");
  const startTimeRef = useRef(0);
  const particlesRef = useRef<BurstParticle[]>([]);
  const wavesRef = useRef<Shockwave[]>([]);
  const rafRef = useRef(0);
  const bootRafRef = useRef(0);
  const spawnedRef = useRef(false);
  const soundPlayedRef = useRef(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      finishedRef.current = true;
      phaseRef.current = "done";
      setPhase("done");
      setContentVisible(true);
      setOverlayVisible(false);
      return;
    }

    let cancelled = false;
    let resizeHandler: (() => void) | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const finishIntro = () => {
      if (cancelled || finishedRef.current) return;
      finishedRef.current = true;
      phaseRef.current = "done";
      setPhase("done");
      setContentVisible(true);
      setOverlayVisible(false);
      if (resizeHandler) {
        window.removeEventListener("resize", resizeHandler);
      }
    };

    const startAnimation = () => {
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return false;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        finishIntro();
        return true;
      }

      spawnedRef.current = false;
      particlesRef.current = [];
      wavesRef.current = [];
      phaseRef.current = "explosion";
      finishedRef.current = false;
      setPhase("explosion");
      setContentVisible(false);
      setOverlayVisible(true);

      let width = window.innerWidth;
      let height = window.innerHeight;

      resizeHandler = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
      };
      resizeHandler();
      window.addEventListener("resize", resizeHandler);

      startTimeRef.current = performance.now();

      fallbackTimer = setTimeout(
        finishIntro,
        EXPLOSION_MS + FADE_MS + 1200
      );

      const tick = (now: number) => {
        if (cancelled || finishedRef.current) return;

        const elapsed = now - startTimeRef.current;

        if (!spawnedRef.current) {
          spawnedRef.current = true;
          spawnExplosion(width, height, particlesRef.current, wavesRef.current);
          if (!soundPlayedRef.current) {
            soundPlayedRef.current = true;
            playExplosionSound();
          }
        }

        if (elapsed >= EXPLOSION_MS && phaseRef.current === "explosion") {
          phaseRef.current = "fade";
          setPhase("fade");
          setContentVisible(true);
        }

        if (elapsed >= EXPLOSION_MS + FADE_MS && phaseRef.current === "fade") {
          finishIntro();
          return;
        }

        const burst = Math.min(1, elapsed / 350);
        const fade =
          phaseRef.current === "fade"
            ? Math.min(1, (elapsed - EXPLOSION_MS) / FADE_MS)
            : 0;

        ctx.fillStyle = "#030304";
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;
        const scale = Math.min(width, height);

        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * burst);
        flash.addColorStop(0, `rgba(255, 255, 255, ${0.85 * (1 - fade) * burst})`);
        flash.addColorStop(0.2, `rgba(255, 120, 220, ${0.55 * (1 - fade) * burst})`);
        flash.addColorStop(0.45, `rgba(80, 200, 255, ${0.4 * (1 - fade) * burst})`);
        flash.addColorStop(0.7, `rgba(255, 200, 40, ${0.25 * (1 - fade) * burst})`);
        flash.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = flash;
        ctx.fillRect(0, 0, width, height);

        for (let i = wavesRef.current.length - 1; i >= 0; i--) {
          const w = wavesRef.current[i];
          w.life -= 0.012;
          w.radius += (w.maxRadius - w.radius) * 0.08;

          if (w.life <= 0) {
            wavesRef.current.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${w.hue}, 100%, 62%, ${w.life * 0.55 * (1 - fade)})`;
          ctx.lineWidth = w.width * w.life;
          ctx.stroke();
        }

        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life -= 0.014 / p.maxLife;
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.size *= 0.992;

          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }

          const alpha = p.life * (1 - fade);
          const gradient = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.size * 2.5
          );
          gradient.addColorStop(0, `hsla(${p.hue}, 100%, 72%, ${alpha})`);
          gradient.addColorStop(
            0.5,
            `hsla(${(p.hue + 40) % 360}, 100%, 55%, ${alpha * 0.6})`
          );
          gradient.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        if (fade > 0) {
          ctx.fillStyle = `rgba(3, 4, 6, ${fade * 0.92})`;
          ctx.fillRect(0, 0, width, height);
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
      return true;
    };

    const boot = () => {
      if (cancelled) return;

      const canvas = canvasRef.current;
      if (!canvas) {
        bootRafRef.current = requestAnimationFrame(boot);
        return;
      }

      if (!startAnimation()) {
        bootRafRef.current = requestAnimationFrame(boot);
      }
    };

    bootRafRef.current = requestAnimationFrame(boot);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(bootRafRef.current);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (resizeHandler) {
        window.removeEventListener("resize", resizeHandler);
      }
      spawnedRef.current = false;
      particlesRef.current = [];
      wavesRef.current = [];
    };
  }, []);

  return (
    <>
      <div
        className={`fixed inset-0 z-[100] overflow-hidden transition-opacity duration-500 ${
          overlayVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onPointerDown={() => {
          if (!soundPlayedRef.current) {
            soundPlayedRef.current = true;
            playExplosionSound();
          }
        }}
        aria-hidden={!overlayVisible}
        role="presentation"
      >
        <canvas
          ref={canvasRef}
          className={`h-full w-full ${
            phase === "fade" ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>

      <div
        className={`transition-opacity duration-700 ${
          contentVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </div>
    </>
  );
}
