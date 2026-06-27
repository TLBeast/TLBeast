"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  coolDownSound,
  fadeOutSoundscape,
  startWipeoutSoundscape,
  stopSoundscape,
  triggerWaterfallSound,
  type SoundNodes,
} from "@/lib/weekend-wipeout-sounds";

type Phase = "fire" | "waterfall" | "cooldown" | "done";

type MistParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
};

const FIRE_MS = 3000;
const WATER_MS = 2600;
const FADE_MS = 1000;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function drawFlameTongue(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  height: number,
  baseWidth: number,
  time: number,
  seed: number,
  intensity: number
) {
  const steps = 28;
  ctx.beginPath();
  ctx.moveTo(x - baseWidth, baseY);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = baseY - t * height;
    const wobble =
      Math.sin(time * 0.009 + seed * 3.7 + t * 14) * baseWidth * (1 - t) * 1.4 +
      Math.sin(time * 0.014 + seed * 2.1 + t * 22) * baseWidth * (1 - t) * 0.6;
    const halfW = baseWidth * (1 - t * 0.92) + wobble;
    ctx.lineTo(x - halfW, y);
  }

  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const y = baseY - t * height;
    const wobble =
      Math.sin(time * 0.011 + seed * 4.3 + t * 16 + 1.2) *
        baseWidth *
        (1 - t) *
        1.3 +
      Math.cos(time * 0.013 + seed * 1.8 + t * 19) *
        baseWidth *
        (1 - t) *
        0.55;
    const halfW = baseWidth * (1 - t * 0.92) + wobble;
    ctx.lineTo(x + halfW, y);
  }

  ctx.closePath();

  const gradient = ctx.createLinearGradient(x, baseY, x, baseY - height);
  gradient.addColorStop(0, `rgba(180, 20, 0, ${0.95 * intensity})`);
  gradient.addColorStop(0.25, `rgba(255, 70, 0, ${0.9 * intensity})`);
  gradient.addColorStop(0.5, `rgba(255, 150, 0, ${0.75 * intensity})`);
  gradient.addColorStop(0.72, `rgba(255, 230, 80, ${0.45 * intensity})`);
  gradient.addColorStop(0.88, `rgba(255, 255, 200, ${0.15 * intensity})`);
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.fill();
}

function drawBlazingFire(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  intensity: number
) {
  const baseY = height * 0.94;
  const spread = width * 0.78;
  const center = width / 2;
  const scale = Math.min(width, height);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const emberGlow = ctx.createRadialGradient(
    center,
    baseY - scale * 0.08,
    0,
    center,
    baseY - scale * 0.08,
    scale * 0.55 * intensity
  );
  emberGlow.addColorStop(0, `rgba(255, 120, 0, ${0.55 * intensity})`);
  emberGlow.addColorStop(0.45, `rgba(255, 40, 0, ${0.25 * intensity})`);
  emberGlow.addColorStop(1, "rgba(120, 0, 0, 0)");
  ctx.fillStyle = emberGlow;
  ctx.fillRect(0, 0, width, height);

  const tongueCount = Math.floor(18 + intensity * 10);
  for (let i = 0; i < tongueCount; i++) {
    const slot = i / tongueCount;
    const x =
      center +
      (slot - 0.5) * spread +
      Math.sin(time * 0.004 + i * 1.7) * width * 0.03;
    const flameH = scale * (0.42 + Math.sin(time * 0.005 + i) * 0.08) * intensity;
    const flameW = width * (0.028 + (i % 5) * 0.006) * (0.85 + intensity * 0.15);
    drawFlameTongue(ctx, x, baseY, flameH, flameW, time, i * 0.73, intensity);
  }

  for (let i = 0; i < 6; i++) {
    const x = center + (Math.sin(time * 0.003 + i * 2.1) * spread) / 2.2;
    const flameH = scale * (0.55 + i * 0.04) * intensity;
    const flameW = width * 0.045;
    drawFlameTongue(
      ctx,
      x,
      baseY,
      flameH,
      flameW,
      time + i * 200,
      i * 1.9 + 3,
      intensity * 0.85
    );
  }

  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}

function drawOceanWaveLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  yBase: number,
  amplitude: number,
  wavelength: number,
  speed: number,
  time: number,
  fill: CanvasGradient | string,
  alpha: number
) {
  ctx.beginPath();
  ctx.moveTo(0, height);

  for (let x = 0; x <= width + 8; x += 6) {
    const wave1 = Math.sin(x / wavelength + time * speed) * amplitude;
    const wave2 =
      Math.sin(x / (wavelength * 0.55) - time * speed * 1.35) *
      amplitude *
      0.45;
    const wave3 =
      Math.cos(x / (wavelength * 1.8) + time * speed * 0.7) *
      amplitude *
      0.25;
    const y = yBase + wave1 + wave2 + wave3;
    ctx.lineTo(x, y);
  }

  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawRagingWater(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  progress: number,
  intensity: number
) {
  const floodTop = -height * 0.15 + progress * height * 1.15;
  const scale = Math.min(width, height);

  ctx.save();
  ctx.globalCompositeOperation = "source-over";

  const skyWash = ctx.createLinearGradient(0, 0, 0, height);
  skyWash.addColorStop(0, "rgba(8, 40, 90, 0.95)");
  skyWash.addColorStop(0.35, "rgba(12, 80, 160, 0.75)");
  skyWash.addColorStop(1, "rgba(4, 20, 45, 0.6)");
  ctx.fillStyle = skyWash;
  ctx.fillRect(0, 0, width, floodTop + scale * 0.2);

  const layers = [
    { offset: 0, amp: scale * 0.09, wave: 280, speed: 0.006, alpha: 0.92 },
    { offset: scale * 0.08, amp: scale * 0.07, wave: 210, speed: 0.008, alpha: 0.88 },
    { offset: scale * 0.16, amp: scale * 0.11, wave: 160, speed: 0.011, alpha: 0.82 },
    { offset: scale * 0.28, amp: scale * 0.08, wave: 120, speed: 0.014, alpha: 0.78 },
    { offset: scale * 0.4, amp: scale * 0.13, wave: 95, speed: 0.017, alpha: 0.74 },
  ];

  layers.forEach((layer, index) => {
    const yBase = floodTop + layer.offset + Math.sin(time * 0.002 + index) * 12;
    const grad = ctx.createLinearGradient(0, yBase - layer.amp * 2, 0, height);
    grad.addColorStop(0, `rgba(160, 220, 255, ${0.55 * intensity})`);
    grad.addColorStop(0.2, `rgba(40, 130, 230, ${0.85 * intensity})`);
    grad.addColorStop(0.55, `rgba(8, 60, 160, ${0.95 * intensity})`);
    grad.addColorStop(1, "rgba(2, 25, 70, 1)");
    drawOceanWaveLayer(
      ctx,
      width,
      height,
      yBase,
      layer.amp * intensity,
      layer.wave,
      layer.speed,
      time,
      grad,
      layer.alpha * intensity
    );
  });

  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 5; i++) {
    const crestY = floodTop + i * scale * 0.07;
    const crestGrad = ctx.createLinearGradient(0, crestY - 40, 0, crestY + 80);
    crestGrad.addColorStop(0, "rgba(220, 245, 255, 0)");
    crestGrad.addColorStop(0.35, `rgba(200, 235, 255, ${0.35 * intensity})`);
    crestGrad.addColorStop(1, "rgba(80, 160, 255, 0)");
    drawOceanWaveLayer(
      ctx,
      width,
      height,
      crestY,
      scale * 0.05,
      70 + i * 30,
      0.02 + i * 0.003,
      time + i * 500,
      crestGrad,
      0.5
    );
  }
  ctx.globalCompositeOperation = "source-over";

  const curtainCount = 14;
  for (let i = 0; i < curtainCount; i++) {
    const x = (width / (curtainCount + 1)) * (i + 1);
    const curtainTop = -height * 0.3 + progress * height * 1.05;
    const curtainBottom = height * 0.55 + Math.sin(time * 0.004 + i) * 40;
    const sway = Math.sin(time * 0.007 + i * 1.4) * 35;

    const curtain = ctx.createLinearGradient(x, curtainTop, x + sway, curtainBottom);
    curtain.addColorStop(0, "rgba(210, 240, 255, 0.15)");
    curtain.addColorStop(0.15, "rgba(90, 180, 255, 0.55)");
    curtain.addColorStop(0.55, "rgba(20, 90, 200, 0.75)");
    curtain.addColorStop(1, "rgba(5, 35, 100, 0.35)");

    ctx.beginPath();
    ctx.moveTo(x - 28, curtainTop);
    ctx.quadraticCurveTo(
      x + sway,
      (curtainTop + curtainBottom) / 2,
      x + sway * 0.6,
      curtainBottom
    );
    ctx.lineTo(x + 28, curtainBottom);
    ctx.quadraticCurveTo(
      x - sway * 0.4,
      (curtainTop + curtainBottom) / 2,
      x + 28,
      curtainTop
    );
    ctx.closePath();
    ctx.fillStyle = curtain;
    ctx.fill();
  }

  ctx.restore();
}

function drawMist(
  ctx: CanvasRenderingContext2D,
  particles: MistParticle[],
  intensity: number
) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= 0.018;
    p.x += p.vx;
    p.y += p.vy;
    p.size *= 1.012;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.globalAlpha = p.life * 0.28 * intensity;
    ctx.fillStyle = "rgba(220, 240, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export function WeekendWipeoutIntro({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("fire");
  const [contentVisible, setContentVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const phaseRef = useRef<Phase>("fire");
  const fireIntensityRef = useRef(1);
  const waterIntensityRef = useRef(0);
  const startTimeRef = useRef(0);
  const mistRef = useRef<MistParticle[]>([]);
  const rafRef = useRef(0);
  const soundRef = useRef<SoundNodes | null>(null);
  const audioStartedRef = useRef(false);

  const ensureAudio = async () => {
    if (audioStartedRef.current) return;
    audioStartedRef.current = true;
    try {
      soundRef.current = await startWipeoutSoundscape();
    } catch {
      audioStartedRef.current = false;
    }
  };

  useEffect(() => {
    if (prefersReducedMotion()) {
      phaseRef.current = "done";
      setPhase("done");
      setContentVisible(true);
      setOverlayVisible(false);
      return;
    }

    void ensureAudio();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);

    startTimeRef.current = performance.now();

    const spawnMist = (count: number, y: number) => {
      for (let i = 0; i < count; i++) {
        mistRef.current.push({
          x: Math.random() * width,
          y: y + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 3,
          vy: -(1 + Math.random() * 3),
          life: 0.6 + Math.random() * 0.5,
          size: 20 + Math.random() * 50,
        });
      }
    };

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;

      if (elapsed >= FIRE_MS && phaseRef.current === "fire") {
        phaseRef.current = "waterfall";
        setPhase("waterfall");
        waterIntensityRef.current = 0;
        if (soundRef.current) triggerWaterfallSound(soundRef.current);
      }

      if (
        elapsed >= FIRE_MS + WATER_MS &&
        phaseRef.current === "waterfall"
      ) {
        phaseRef.current = "cooldown";
        setPhase("cooldown");
        setContentVisible(true);
        if (soundRef.current) coolDownSound(soundRef.current);
      }

      if (
        elapsed >= FIRE_MS + WATER_MS + FADE_MS &&
        phaseRef.current === "cooldown"
      ) {
        phaseRef.current = "done";
        setPhase("done");
        setOverlayVisible(false);
        if (soundRef.current) fadeOutSoundscape(soundRef.current);
        window.removeEventListener("resize", resize);
        return;
      }

      ctx.fillStyle = "#030304";
      ctx.fillRect(0, 0, width, height);

      const fireIntensity = fireIntensityRef.current;

      if (phaseRef.current === "fire" || fireIntensity > 0.03) {
        drawBlazingFire(ctx, width, height, now, fireIntensity);
      }

      if (phaseRef.current === "waterfall" || phaseRef.current === "cooldown") {
        const waterElapsed = Math.max(0, elapsed - FIRE_MS);
        waterIntensityRef.current = Math.min(
          1,
          waterIntensityRef.current + 0.018
        );
        const progress = Math.min(1, waterElapsed / (WATER_MS * 0.85));

        drawRagingWater(
          ctx,
          width,
          height,
          now,
          progress,
          waterIntensityRef.current
        );

        if (Math.random() < 0.45) {
          fireIntensityRef.current = Math.max(
            0,
            fireIntensityRef.current - 0.012
          );
          spawnMist(3, height * 0.68);
        }

        if (fireIntensityRef.current > 0.03) {
          drawBlazingFire(
            ctx,
            width,
            height,
            now,
            fireIntensityRef.current * 0.65
          );
        }
      }

      drawMist(ctx, mistRef.current, 1);

      if (phaseRef.current === "cooldown") {
        const fade = Math.min(1, (elapsed - FIRE_MS - WATER_MS) / FADE_MS);
        ctx.fillStyle = `rgba(3, 4, 6, ${fade * 0.88})`;
        ctx.fillRect(0, 0, width, height);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      if (soundRef.current) stopSoundscape(soundRef.current);
    };
  }, []);

  return (
    <>
      {overlayVisible && (
        <div
          className="fixed inset-0 z-[100] overflow-hidden"
          onPointerDown={() => void ensureAudio()}
          role="presentation"
        >
          <canvas
            ref={canvasRef}
            className={`pointer-events-none h-full w-full transition-opacity duration-700 ${
              phase === "cooldown" ? "opacity-0" : "opacity-100"
            }`}
          />
        </div>
      )}

      <div
        className={`transition-opacity duration-1000 ${
          contentVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </div>
    </>
  );
}
