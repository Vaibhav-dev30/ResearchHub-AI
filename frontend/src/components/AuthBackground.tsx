import React, { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  connections: number[];
  pulse: number;
  pulseSpeed: number;
}

const PARTICLE_COLORS = ['#60A5FA', '#A78BFA', '#34D399', '#60A5FA'];

const AuthBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const nodesRef = useRef<Node[]>([]);
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Respect prefers-reduced-motion
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particles
    particlesRef.current = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.8 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    }));

    // Neural network nodes
    nodesRef.current = Array.from({ length: 18 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 3 + 2,
      connections: [],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.015,
    }));

    // Build edges (connect nearby nodes)
    const nodes = nodesRef.current;
    nodes.forEach((node, i) => {
      nodes.forEach((other, j) => {
        if (i >= j) return;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 260 && node.connections.length < 3) {
          node.connections.push(j);
        }
      });
    });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    // ── Mesh gradient background ──
    const grad = ctx.createRadialGradient(w * 0.15, h * 0.4, 0, w * 0.15, h * 0.4, w * 0.7);
    grad.addColorStop(0, 'rgba(96,165,250,0.06)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const grad2 = ctx.createRadialGradient(w * 0.85, h * 0.3, 0, w * 0.85, h * 0.3, w * 0.6);
    grad2.addColorStop(0, 'rgba(167,139,250,0.05)');
    grad2.addColorStop(1, 'transparent');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, w, h);

    // ── Mouse glow ──
    if (mx > 0 && my > 0) {
      const mouseGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 200);
      mouseGlow.addColorStop(0, 'rgba(96,165,250,0.08)');
      mouseGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = mouseGlow;
      ctx.fillRect(0, 0, w, h);
    }

    // ── Light beams ──
    const t = Date.now() * 0.0003;
    const beams = [
      { angle: Math.sin(t) * 0.3 + 0.2, color: 'rgba(96,165,250,0.025)' },
      { angle: Math.sin(t * 0.7 + 1) * 0.4 + 0.8, color: 'rgba(167,139,250,0.02)' },
    ];
    beams.forEach(({ angle, color }) => {
      ctx.save();
      ctx.translate(w * angle, 0);
      ctx.rotate(Math.sin(t * 0.5) * 0.12);
      const beamGrad = ctx.createLinearGradient(0, 0, 0, h);
      beamGrad.addColorStop(0, 'transparent');
      beamGrad.addColorStop(0.3, color);
      beamGrad.addColorStop(0.7, color);
      beamGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(-60, 0, 120, h);
      ctx.restore();
    });

    // ── Neural network edges ──
    const nodes = nodesRef.current;
    nodes.forEach((node, i) => {
      node.connections.forEach(j => {
        const other = nodes[j];
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const alpha = Math.max(0, 1 - dist / 260) * 0.3 * (Math.sin(node.pulse) * 0.3 + 0.7);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(96,165,250,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      });
    });

    // ── Neural network nodes ──
    nodes.forEach(node => {
      node.pulse += node.pulseSpeed;
      const glow = Math.sin(node.pulse) * 0.4 + 0.6;

      const nodeGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 4);
      nodeGrad.addColorStop(0, `rgba(96,165,250,${0.7 * glow})`);
      nodeGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.fillStyle = nodeGrad;
      ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `rgba(147,197,253,${0.9 * glow})`;
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();

      // Move nodes
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < 0 || node.x > w) node.vx *= -1;
      if (node.y < 0 || node.y > h) node.vy *= -1;
    });

    // ── Floating particles ──
    particlesRef.current.forEach(p => {
      ctx.beginPath();
      const pGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
      pGrad.addColorStop(0, p.color.replace(')', `,${p.opacity})`).replace('rgb', 'rgba'));
      pGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = pGrad;
      ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;
    });

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    if (prefersReduced) return;
    initCanvas();
    rafRef.current = requestAnimationFrame(draw);

    const handleResize = () => { initCanvas(); };
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouse);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, [initCanvas, draw, prefersReduced]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 0,
        overflow: 'hidden',
        background: 'var(--bg-color)',
      }}
    >
      {/* Canvas layer */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Noise texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
          opacity: 0.4,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Content layer */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        {children}
      </div>
    </div>
  );
};

export default AuthBackground;
