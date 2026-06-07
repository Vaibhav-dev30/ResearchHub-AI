import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence, type Variants, type Easing } from 'framer-motion';
import api from '../api';
import AuthLayout from '../components/AuthLayout';

// ── Framer Motion variants ─────────────────────────────────────────────────────
const easeOut: Easing = [0.25, 0.46, 0.45, 0.94];
const spring = { type: 'spring' as const, stiffness: 400, damping: 28 };

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } },
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: easeOut } },
};

const shakeVariants: Variants = {
  idle: { x: 0 },
  shake: { x: [-6, 6, -5, 5, -3, 3, 0], transition: { duration: 0.45 } },
};

// ── Login component (auth logic is identical to original) ──────────────────────
const Login = () => {
    // ── Auth state (unchanged) ────────────────────────────────────────────────
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // ── Visual state only ─────────────────────────────────────────────────────
    const [shaking, setShaking] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
    const btnRef = useRef<HTMLButtonElement>(null);

    // ── Original handleSubmit (completely unchanged) ───────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/login', { username, password });
            localStorage.setItem('token', response.data.access_token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed');
            setShaking(true);
            setTimeout(() => setShaking(false), 500);
        } finally {
            setLoading(false);
        }
    };

    const handleBtnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = btnRef.current?.getBoundingClientRect();
        if (rect) setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setTimeout(() => setRipple(null), 600);
    };

    const focusGlow = (field: string) =>
        focusedField === field
            ? '0 0 0 2px rgba(96,165,250,0.2), 0 0 20px rgba(96,165,250,0.12)'
            : undefined;

    return (
        <AuthLayout mode="login">
            <motion.div
                variants={shakeVariants}
                animate={shaking ? 'shake' : 'idle'}
            >
                {/* Glassmorphism card */}
                <div style={{
                    background: 'rgba(15,23,42,0.72)',
                    backdropFilter: 'blur(28px)',
                    WebkitBackdropFilter: 'blur(28px)',
                    border: '1px solid rgba(96,165,250,0.18)',
                    borderRadius: '24px',
                    padding: '2.5rem 2rem',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Shimmer top edge */}
                    <div style={{
                        position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.6), transparent)',
                    }} />

                    {/* Inner glow corner */}
                    <div style={{
                        position: 'absolute', top: -40, right: -40, width: 120, height: 120,
                        background: 'radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {/* Floating icon */}
                        <motion.div variants={fieldVariants} style={{ marginBottom: '1.5rem' }}>
                            <motion.div
                                animate={{ y: [0, -7, 0] }}
                                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                                style={{ display: 'inline-block' }}
                            >
                                <BrainCircuit
                                    size={46}
                                    style={{
                                        color: '#60A5FA',
                                        filter: 'drop-shadow(0 0 12px rgba(96,165,250,0.7))',
                                        display: 'block',
                                        margin: '0 auto',
                                    }}
                                />
                            </motion.div>
                        </motion.div>

                        {/* Title */}
                        <motion.h2 variants={fieldVariants} style={{ marginBottom: '0.4rem', fontSize: '1.65rem', color: '#F8FAFC' }}>
                            Welcome Back
                        </motion.h2>
                        <motion.p variants={fieldVariants} style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
                            Access your research terminal
                        </motion.p>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    transition={{ duration: 0.28 }}
                                    style={{
                                        color: '#F87171',
                                        background: 'rgba(248,113,113,0.08)',
                                        padding: '0.6rem 0.75rem',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        border: '1px solid rgba(248,113,113,0.2)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form — original structure 100% preserved */}
                        <form onSubmit={handleSubmit}>
                            <motion.div variants={fieldVariants} className="form-group" style={{ textAlign: 'left' }}>
                                <label className="form-label" style={{ color: '#94A3B8' }}>Username</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    style={{
                                        background: 'rgba(15,23,42,0.6)',
                                        borderColor: focusedField === 'username' ? '#60A5FA' : 'rgba(51,65,85,0.8)',
                                        boxShadow: focusGlow('username'),
                                        transition: 'all 0.22s ease',
                                        color: '#F8FAFC',
                                    }}
                                />
                            </motion.div>

                            <motion.div variants={fieldVariants} className="form-group" style={{ textAlign: 'left' }}>
                                <label className="form-label" style={{ color: '#94A3B8' }}>Password</label>
                                <input
                                    type="password"
                                    className="input-field"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    style={{
                                        background: 'rgba(15,23,42,0.6)',
                                        borderColor: focusedField === 'password' ? '#60A5FA' : 'rgba(51,65,85,0.8)',
                                        boxShadow: focusGlow('password'),
                                        transition: 'all 0.22s ease',
                                        color: '#F8FAFC',
                                    }}
                                />
                            </motion.div>

                            {/* Submit button */}
                            <motion.div variants={fieldVariants}>
                                <motion.button
                                    ref={btnRef}
                                    type="submit"
                                    disabled={loading}
                                    onClick={handleBtnClick}
                                    whileHover={loading ? {} : { scale: 1.025, boxShadow: '0 0 36px rgba(96,165,250,0.45)' }}
                                    whileTap={loading ? {} : { scale: 0.97 }}
                                    transition={spring}
                                    style={{
                                        width: '100%',
                                        marginTop: '0.75rem',
                                        padding: '0.8rem 1.5rem',
                                        background: loading
                                            ? 'rgba(37,99,235,0.5)'
                                            : 'linear-gradient(135deg, #1D4ED8, #7C3AED)',
                                        border: 'none',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        fontFamily: 'Inter, sans-serif',
                                        fontWeight: 600,
                                        fontSize: '0.92rem',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'background 0.3s ease',
                                    }}
                                >
                                    {/* Ripple */}
                                    <AnimatePresence>
                                        {ripple && (
                                            <motion.span
                                                key="ripple"
                                                initial={{ scale: 0, opacity: 0.45 }}
                                                animate={{ scale: 7, opacity: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.55 }}
                                                style={{
                                                    position: 'absolute',
                                                    left: ripple.x, top: ripple.y,
                                                    width: 40, height: 40,
                                                    borderRadius: '50%',
                                                    background: 'rgba(255,255,255,0.3)',
                                                    transform: 'translate(-50%,-50%)',
                                                    pointerEvents: 'none',
                                                }}
                                            />
                                        )}
                                    </AnimatePresence>
                                    {loading ? (
                                        <motion.span
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
                                            style={{ display: 'inline-block' }}
                                        >
                                            <span className="loader loader-sm" />
                                        </motion.span>
                                    ) : (
                                        <><LogIn size={17} /> Access Terminal</>
                                    )}
                                </motion.button>
                            </motion.div>
                        </form>

                        {/* Footer */}
                        <motion.div variants={fieldVariants} style={{ marginTop: '1.75rem', color: '#64748B', fontSize: '0.875rem' }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ color: '#60A5FA', fontWeight: 600 }}>Initialize here</Link>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </AuthLayout>
    );
};

export default Login;
