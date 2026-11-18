import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  brightness: number;
  targetBrightness: number;
}

const PARTICLE_COUNT = 70;
const MAX_DIST = 140;
const MOUSE_RADIUS = 160;

export default function CanvasNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let particles: Particle[] = [];
    let mouse = { x: -9999, y: -9999 };
    let w = 0, h = 0;
    let visible = true;

    const resize = () => {
      w = canvas.width  = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: 1 + Math.random() * 1.5,
        brightness: 0.2 + Math.random() * 0.4,
        targetBrightness: 0.2 + Math.random() * 0.4,
      }));
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onVisibilityChange = () => { visible = !document.hidden; };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    resize();

    const draw = () => {
      if (!visible) { raf = requestAnimationFrame(draw); return; }

      ctx.clearRect(0, 0, w, h);

      // Update particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Mouse proximity brightening
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        p.targetBrightness = dist < MOUSE_RADIUS
          ? 0.6 + (1 - dist / MOUSE_RADIUS) * 0.4
          : 0.2 + Math.random() * 0.05;
        p.brightness += (p.targetBrightness - p.brightness) * 0.08;
      }

      // Draw edges
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < MAX_DIST) {
            const opacity = (1 - dist / MAX_DIST) * 0.25 * ((a.brightness + b.brightness) / 2);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            // Navy-to-orange gradient edges based on node brightness
            const edgeColor = a.brightness > 0.65
              ? `rgba(255,140,26,${opacity})`
              : `rgba(42,63,181,${opacity})`;
            ctx.strokeStyle = edgeColor;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const p of particles) {
        const isHot = p.brightness > 0.65;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * (isHot ? 1.4 : 1), 0, Math.PI * 2);
        ctx.fillStyle = isHot
          ? `rgba(255,140,26,${p.brightness})`
          : `rgba(100,120,220,${p.brightness})`;
        ctx.fill();

        // Glow on hot nodes
        if (isHot) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
          grad.addColorStop(0, `rgba(255,140,26,${p.brightness * 0.3})`);
          grad.addColorStop(1, 'rgba(255,140,26,0)');
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
      aria-hidden="true"
    />
  );
}
