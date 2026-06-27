"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Phase = "fire" | "waterfall" | "cooldown" | "done";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  kind: "fire" | "water" | "steam" | "splash";
};

const FIRE_MS = 2800;
const WATER_MS = 2200;
const FADE_MS = 900;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function WeekendWipeoutIntro({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("fire");
  const [contentVisible, setContentVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const phaseRef = useRef<Phase>("fire");
  const fireIntensityRef = useRef(1);
  const startTimeRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const waterfallBurstRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      phaseRef.current = "done";
      setPhase("done");
      setContentVisible(true);
      setOverlayVisible(false);
      return;
    }

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

    const spawnFire = (count: number) => {
      const particles = particlesRef.current;
      const spread = width * 0.85;
      const baseX = width / 2;

      for (let i = 0; i < count; i++) {
        particles.push({
          x: baseX + (Math.random() - 0.5) * spread,
          y: height + Math.random() * 80,
          vx: (Math.random() - 0.5) * 4,
          vy: -(4 + Math.random() * 14),
          life: 1,
          maxLife: 0.6 + Math.random() * 0.9,
          size: 35 + Math.random() * 90,
          hue: 15 + Math.random() * 45,
          kind: "fire",
        });
      }
    };

    const spawnWaterfall = (count: number) => {
      const particles = particlesRef.current;

      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        particles.push({
          x,
          y: -40 - Math.random() * height * 0.4,
          vx: (Math.random() - 0.5) * 6,
          vy: 18 + Math.random() * 34,
          life: 1,
          maxLife: 1.2 + Math.random() * 0.8,
          size: 10 + Math.random() * 36,
          hue: 195 + Math.random() * 25,
          kind: "water",
        });
      }
    };

    const spawnSplash = (x: number, y: number, amount: number) => {
      const particles = particlesRef.current;

      for (let i = 0; i < amount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 10;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 4,
          life: 1,
          maxLife: 0.4 + Math.random() * 0.5,
          size: 4 + Math.random() * 14,
          hue: 200 + Math.random() * 20,
          kind: "splash",
        });
      }
    };

    const spawnSteam = (x: number, y: number, amount: number) => {
      const particles = particlesRef.current;

      for (let i = 0; i < amount; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * 40,
          y: y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2,
          vy: -(1 + Math.random() * 4),
          life: 1,
          maxLife: 0.5 + Math.random() * 0.7,
          size: 16 + Math.random() * 40,
          hue: 210,
          kind: "steam",
        });
      }
    };

    const drawGlow = (
      x: number,
      y: number,
      radius: number,
      color: string,
      alpha: number
    ) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = alpha;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const particles = particlesRef.current;

      if (elapsed >= FIRE_MS && phaseRef.current === "fire") {
        phaseRef.current = "waterfall";
        setPhase("waterfall");
        waterfallBurstRef.current = true;
        spawnWaterfall(2200);
      }

      if (
        elapsed >= FIRE_MS + WATER_MS &&
        phaseRef.current === "waterfall"
      ) {
        phaseRef.current = "cooldown";
        setPhase("cooldown");
        setContentVisible(true);
      }

      if (
        elapsed >= FIRE_MS + WATER_MS + FADE_MS &&
        phaseRef.current === "cooldown"
      ) {
        phaseRef.current = "done";
        setPhase("done");
        setOverlayVisible(false);
        window.removeEventListener("resize", resize);
        return;
      }

      if (particles.length > 5000) {
        particles.splice(0, particles.length - 5000);
      }

      ctx.fillStyle = "#050506";
      ctx.fillRect(0, 0, width, height);

      const intensity = fireIntensityRef.current;
      const fireLine = height * 0.72;

      if (phaseRef.current === "fire" || intensity > 0.02) {
        spawnFire(Math.floor(18 * intensity + 6));

        drawGlow(
          width / 2,
          height * 0.88,
          Math.min(width, height) * 0.72 * intensity,
          "rgba(255, 60, 0, 0.95)",
          0.7 * intensity
        );
        drawGlow(
          width / 2,
          height * 0.76,
          Math.min(width, height) * 0.52 * intensity,
          "rgba(255, 180, 0, 0.9)",
          0.55 * intensity
        );
        drawGlow(
          width / 2,
          height * 0.62,
          Math.min(width, height) * 0.28 * intensity,
          "rgba(255, 255, 120, 0.75)",
          0.35 * intensity
        );
      }

      if (phaseRef.current === "waterfall" || phaseRef.current === "cooldown") {
        if (waterfallBurstRef.current) {
          waterfallBurstRef.current = false;
        } else if (Math.random() < 0.75) {
          spawnWaterfall(36);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= 0.016 / p.maxLife;

        if (p.kind === "fire") {
          p.x += p.vx + Math.sin(now * 0.004 + p.y * 0.02) * 1.2;
          p.y += p.vy;
          p.vy *= 0.985;
          p.vx *= 0.99;
          p.size *= 0.996;

          const alpha = p.life * intensity;
          if (alpha <= 0.01) {
            particles.splice(i, 1);
            continue;
          }

          ctx.globalAlpha = alpha;
          ctx.fillStyle = `hsl(${p.hue}, 100%, ${45 + p.life * 25}%)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else if (p.kind === "water" || p.kind === "splash") {
          p.x += p.vx;
          p.y += p.vy;
          if (p.kind === "water") p.vy += 0.35;
          else {
            p.vy += 0.25;
            p.vx *= 0.98;
          }

          if (p.y > fireLine && p.kind === "water") {
            fireIntensityRef.current = Math.max(
              0,
              fireIntensityRef.current - 0.006
            );
            spawnSplash(p.x, p.y, 6);
            spawnSteam(p.x, p.y, 3);
            particles.splice(i, 1);
            continue;
          }

          if (p.life <= 0 || p.y > height + 60) {
            particles.splice(i, 1);
            continue;
          }

          ctx.globalAlpha = p.life * 0.85;
          ctx.fillStyle = `hsl(${p.hue}, 85%, ${55 + p.life * 20}%)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else if (p.kind === "steam") {
          p.x += p.vx;
          p.y += p.vy;
          p.size *= 1.015;

          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.globalAlpha = p.life * 0.35;
          ctx.fillStyle = "rgba(220, 240, 255, 0.8)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      if (phaseRef.current === "waterfall") {
        drawGlow(
          width / 2,
          -height * 0.05,
          Math.min(width, height) * 0.85,
          "rgba(60, 160, 255, 0.7)",
          0.5
        );
        drawGlow(
          width / 2,
          height * 0.2,
          Math.min(width, height) * 0.55,
          "rgba(180, 230, 255, 0.55)",
          0.4
        );
      }

      if (phaseRef.current === "cooldown") {
        const fade = Math.min(1, (elapsed - FIRE_MS - WATER_MS) / FADE_MS);
        ctx.fillStyle = `rgba(5, 6, 8, ${fade * 0.85})`;
        ctx.fillRect(0, 0, width, height);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      {overlayVisible && (
        <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
          <canvas
            ref={canvasRef}
            className={`h-full w-full transition-opacity duration-700 ${
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
