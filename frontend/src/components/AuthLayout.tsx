import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, type Variants, type Easing } from 'framer-motion';
import { BrainCircuit, Telescope, Users, Search, BookOpen, Atom } from 'lucide-react';
import HolographicCore from './HolographicCore';

// ── Stats data ────────────────────────────────────────────────────────────────
const STATS = [
  { icon: BookOpen, value: '1M+', label: 'Research Papers' },
  { icon: Users, value: '250K+', label: 'Researchers' },
  { icon: Search, value: '50K+', label: 'Daily Searches' },
  { icon: Atom, value: '100+', label: 'Research Domains' },
];

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedStat({ stat, delay }: { stat: typeof STATS[0]; delay: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const easeOut: Easing = [0.25, 0.46, 0.45, 0.94];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: easeOut }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        background: 'rgba(96,165,250,0.06)',
        border: '1px solid rgba(96,165,250,0.15)',
        borderRadius: '12px',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: '9px',
        background: 'rgba(96,165,250,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#60A5FA', flexShrink: 0,
      }}>
        <stat.icon size={16} />
      </div>
      <div>
        <motion.p
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC', lineHeight: 1, marginBottom: '0.15rem' }}
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: delay + 0.15 }}
        >
          {stat.value}
        </motion.p>
        <p style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {stat.label}
        </p>
      </div>
    </motion.div>
  );
}

// ── 2D canvas background (behind the 3D canvas) ───────────────────────────────
function BackgroundCanvas({ mouseXY }: { mouseXY: { x: number; y: number } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      // Animated mesh gradients
      const t = Date.now() * 0.0003;
      const cx = w * (0.3 + Math.sin(t * 0.7) * 0.15);
      const cy = h * (0.4 + Math.cos(t * 0.5) * 0.15);
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.7);
      g1.addColorStop(0, 'rgba(29,78,216,0.18)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, w, h);

      const g2 = ctx.createRadialGradient(w * 0.85, h * 0.2, 0, w * 0.85, h * 0.2, w * 0.55);
      g2.addColorStop(0, 'rgba(139,92,246,0.12)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);

      // Mouse glow on left panel
      if (mouseXY.x > 0) {
        const mg = ctx.createRadialGradient(mouseXY.x, mouseXY.y, 0, mouseXY.x, mouseXY.y, 280);
        mg.addColorStop(0, 'rgba(96,165,250,0.06)');
        mg.addColorStop(1, 'transparent');
        ctx.fillStyle = mg; ctx.fillRect(0, 0, w, h);
      }

      // Subtle holographic grid
      ctx.strokeStyle = 'rgba(96,165,250,0.05)';
      ctx.lineWidth = 0.5;
      const gridSize = 52;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); };
  }, [mouseXY]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}

// ── Main layout component ─────────────────────────────────────────────────────
interface AuthLayoutProps {
  children: React.ReactNode;
  mode: 'login' | 'register';
}

const easeOut: Easing = [0.25, 0.46, 0.45, 0.94];

const cardVariants: Variants = {
  hidden: { opacity: 0, x: 48, scale: 0.97 },
  show: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.65, ease: easeOut } },
};

const heroVariants: Variants = {
  hidden: { opacity: 0, x: -32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: easeOut, delay: 0.1 } },
};

const AuthLayout = ({ children, mode }: AuthLayoutProps) => {
  const mouseXY = useRef({ x: 0, y: 0 });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const rect = (currentTarget as HTMLElement).getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = -((clientY - rect.top) / rect.height - 0.5) * 2;
    mouseXY.current = { x: nx, y: ny };
    setMouse({ x: clientX - rect.left, y: clientY - rect.top });
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        position: 'fixed', inset: 0,
        display: 'flex',
        background: '#0F172A',
        overflow: 'hidden',
      }}
    >
      {/* ── LEFT: Hero panel ── */}
      <motion.div
        variants={heroVariants}
        initial="hidden"
        animate="show"
        style={{
          flex: '0 0 55%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 2D canvas background */}
        <BackgroundCanvas mouseXY={mouse} />

        {/* Gradient separator */}
        <div style={{
          position: 'absolute',
          right: 0, top: 0, bottom: 0,
          width: '1px',
          background: 'linear-gradient(to bottom, transparent, rgba(96,165,250,0.3) 30%, rgba(167,139,250,0.3) 70%, transparent)',
          zIndex: 2,
        }} />

        {/* Brand header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: easeOut }}
          style={{ padding: '2rem 2.5rem', position: 'relative', zIndex: 3 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <BrainCircuit size={28} style={{ color: '#60A5FA', filter: 'drop-shadow(0 0 8px rgba(96,165,250,0.8))' }} />
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#F8FAFC',
              letterSpacing: '-0.02em',
            }}>
              ResearchHub AI
            </span>
          </div>
        </motion.div>

        {/* 3D Canvas — holographic core */}
        <div style={{ flex: 1, position: 'relative', zIndex: 3 }}>
          <HolographicCore mouseXY={mouseXY.current} />
        </div>

        {/* Hero copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: easeOut }}
          style={{ padding: '1.5rem 2.5rem', position: 'relative', zIndex: 3 }}
        >
          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
            fontWeight: 700,
            color: '#F8FAFC',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            marginBottom: '0.75rem',
          }}>
            Accelerate Scientific<br />
            <span style={{
              background: 'linear-gradient(135deg, #60A5FA, #A78BFA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Discovery with AI
            </span>
          </h1>
          <p style={{
            color: '#94A3B8',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            maxWidth: '380px',
            marginBottom: '1.5rem',
          }}>
            Search, analyze, and synthesize academic literature at the speed of thought.
            Powered by advanced language models.
          </p>

          {/* Animated stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {STATS.map((stat, i) => (
              <AnimatedStat key={stat.label} stat={stat} delay={0.75 + i * 0.1} />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ── RIGHT: Auth card panel ── */}
      <div style={{
        flex: '0 0 45%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(96,165,250,0.04) 0%, transparent 70%)',
      }}>
        {/* Noise texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px',
          opacity: 0.5,
          pointerEvents: 'none',
        }} />

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="show"
          style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}
        >
          {children}
        </motion.div>
      </div>

      {/* ── Mobile: stack vertically ── */}
      <style>{`
        @media (max-width: 860px) {
          .auth-layout-left { display: none !important; }
          .auth-layout-right { flex: 1 !important; background: var(--bg-color) !important; }
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;
