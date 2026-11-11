"use client";

import { useEffect, useRef } from "react";

interface ConfettiProps {
  particleCount?: number;
  duration?: number;
  onDone?: () => void;
}

/** Canvas confetti burst (PRD §4.2: confetti on workout completion). */
export function Confetti({ particleCount = 120, duration = 2400, onDone }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.scale(dpr, dpr);

    const colors = ["#C9A227", "#E5E5E5", "#9CA3AF"];
    const pieces = Array.from({ length: particleCount }, () => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height - rect.height,
      w: 4 + Math.random() * 6,
      h: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vX: (Math.random() - 0.5) * 2,
      rot: Math.random() * Math.PI,
      vRot: (Math.random() - 0.5) * 0.2,
    }));

    const start = performance.now();
    const frame = (now: number) => {
      const t = now - start;
      const progress = Math.min(t / duration, 1);
      ctx.clearRect(0, 0, rect.width, rect.height);
      const ease = 1 - Math.pow(1 - progress, 3);
      for (const p of pieces) {
        const y = p.y + ease * rect.height;
        ctx.save();
        ctx.translate(p.x + p.vX * (t / 1000), y);
        ctx.rotate(p.rot + p.vRot * (t / 1000));
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (progress < 1) requestAnimationFrame(frame);
      else onDone?.();
    };
    requestAnimationFrame(frame);
    return () => ctx.clearRect(0, 0, rect.width, rect.height);
  }, [particleCount, duration, onDone]);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[60]" aria-hidden="true" />;
}
