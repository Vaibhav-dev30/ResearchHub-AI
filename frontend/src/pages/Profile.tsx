import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  BookMarked,
  MessageSquare,
  Building2,
  Tag,
  Calendar,
  Edit3,
  Save,
  X,
  Award,
  TrendingUp,
  Activity,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { motion, AnimatePresence, type Variants, type Easing } from 'framer-motion';
import api from '../api';

interface ProfileData {
  id: number;
  username: string;
  full_name: string;
  bio: string;
  institution: string;
  research_interests: string;
  avatar_url: string;
  joined_at: string;
  saved_papers_count: number;
  total_chats: number;
  profile_updated_at: string;
}

interface Analytics {
  papers_by_month: { month: string; count: number }[];
  top_keywords: { keyword: string; count: number }[];
  chats_by_month: { month: string; count: number }[];
  total_saved: number;
  total_chats: number;
}

const ACHIEVEMENTS = [
  { id: 'first_save', label: 'First Save', icon: BookMarked, desc: 'Saved your first paper', threshold: 1, type: 'saved' },
  { id: 'explorer', label: 'Research Explorer', icon: TrendingUp, desc: 'Saved 5 papers', threshold: 5, type: 'saved' },
  { id: 'knowledge', label: 'Knowledge Builder', icon: Award, desc: 'Saved 10 papers', threshold: 10, type: 'saved' },
  { id: 'first_chat', label: 'First Conversation', icon: MessageSquare, desc: 'First AI chat', threshold: 1, type: 'chats' },
  { id: 'ai_researcher', label: 'AI Researcher', icon: Sparkles, desc: '10 AI conversations', threshold: 10, type: 'chats' },
];

const formatMonth = (month: string) => {
  if (!month || month === 'unknown') return month;
  const [y, m] = month.split('-');
  const date = new Date(parseInt(y), parseInt(m) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};

const easeOut: Easing = [0.25, 0.46, 0.45, 0.94];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    full_name: '',
    bio: '',
    institution: '',
    research_interests: '',
  });

  const fetchAll = useCallback(async () => {
    try {
      const [profileRes, analyticsRes] = await Promise.all([
        api.get('/profile'),
        api.get('/analytics'),
      ]);
      setProfile(profileRes.data);
      setAnalytics(analyticsRes.data);
      setEditData({
        full_name: profileRes.data.full_name || '',
        bio: profileRes.data.bio || '',
        institution: profileRes.data.institution || '',
        research_interests: profileRes.data.research_interests || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/profile', editData);
      setProfile(res.data);
      setEditing(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (profile) {
      setEditData({
        full_name: profile.full_name,
        bio: profile.bio,
        institution: profile.institution,
        research_interests: profile.research_interests,
      });
    }
  };

  const getInitials = (name: string, username: string) => {
    if (name) return name.slice(0, 2).toUpperCase();
    return username.slice(0, 2).toUpperCase();
  };

  const formatJoinDate = (date: string) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const tooltipStyle = {
    backgroundColor: 'var(--panel-bg-solid)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontSize: '0.82rem',
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ padding: '1rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="skeleton skeleton-card" style={{ height: '280px' }} />
          <div className="glass-panel-flat">
            <div className="skeleton skeleton-title" style={{ width: '40%', marginBottom: '1rem' }} />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text" style={{ width: '80%' }} />
            <div className="skeleton skeleton-text" style={{ width: '60%' }} />
          </div>
        </div>
        <div className="skeleton skeleton-card" style={{ height: '260px' }} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <motion.div
      className="animate-fade-in"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ padding: '1rem 0' }}
    >
      {/* ── Header ── */}
      <motion.header variants={itemVariants} style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>Research Profile</h1>
        <p style={{ color: 'var(--secondary-color)' }}>
          Your personal research workspace dashboard.
        </p>
      </motion.header>

      {/* ── Profile Card + Stats ── */}
      <motion.div
        variants={itemVariants}
        style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'start' }}
      >
        {/* Avatar + Name Card */}
        <div className="glass-panel-flat" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#fff',
              boxShadow: 'var(--glow-primary)',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            {getInitials(profile.full_name, profile.username)}
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>
            {profile.full_name || profile.username}
          </h2>
          <p style={{ color: 'var(--secondary-color)', fontSize: '0.88rem', marginBottom: '1rem' }}>
            @{profile.username}
          </p>
          {profile.institution && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--secondary-color)', fontSize: '0.83rem', marginBottom: '0.75rem' }}>
              <Building2 size={13} />
              {profile.institution}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Calendar size={12} />
            Joined {formatJoinDate(profile.joined_at)}
          </div>
          <hr className="divider" />
          <button
            className={`btn btn-sm ${editing ? 'btn-danger' : ''}`}
            onClick={() => (editing ? handleCancel() : setEditing(true))}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {editing ? <><X size={14} /> Cancel</> : <><Edit3 size={14} /> Edit Profile</>}
          </button>
        </div>

        {/* Info / Edit Panel */}
        <div className="glass-panel-flat" style={{ padding: '1.75rem' }}>
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Edit3 size={18} style={{ color: 'var(--primary-color)' }} />
                  Edit Profile
                </h3>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="input-field" value={editData.full_name} onChange={e => setEditData(p => ({ ...p, full_name: e.target.value }))} placeholder="Your full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="input-field" value={editData.bio} onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))} placeholder="Brief description of your research focus..." rows={3} />
                </div>
                <div className="form-group">
                  <label className="form-label">Institution</label>
                  <input className="input-field" value={editData.institution} onChange={e => setEditData(p => ({ ...p, institution: e.target.value }))} placeholder="e.g. MIT, Stanford, IIT" />
                </div>
                <div className="form-group">
                  <label className="form-label">Research Interests (comma-separated)</label>
                  <input className="input-field" value={editData.research_interests} onChange={e => setEditData(p => ({ ...p, research_interests: e.target.value }))} placeholder="e.g. machine learning, NLP, computer vision" />
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: '120px' }}>
                  {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <><Save size={15} /> Save Changes</>}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} style={{ color: 'var(--primary-color)' }} />
                  About
                </h3>
                <p style={{ color: 'var(--text-primary)', marginBottom: '1.25rem', lineHeight: 1.7, minHeight: '48px' }}>
                  {profile.bio || <span style={{ color: 'var(--text-muted)' }}>No bio yet. Click "Edit Profile" to add one.</span>}
                </p>
                {profile.research_interests && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary-color)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Tag size={12} /> Research Interests
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {profile.research_interests.split(',').map((t, i) => (
                        <span key={i} className="badge badge-accent">{t.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
                <hr className="divider" />
                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {[
                    { icon: BookMarked, value: profile.saved_papers_count, label: 'Papers Saved', colorClass: 'stat-icon-blue' },
                    { icon: MessageSquare, value: profile.total_chats, label: 'AI Chats', colorClass: 'stat-icon-purple' },
                  ].map((stat, i) => (
                    <div key={i} className="stat-card" style={{ padding: '1rem' }}>
                      <div className={`stat-icon ${stat.colorClass}`} style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
                        <stat.icon size={18} />
                      </div>
                      <div>
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>{stat.value}</div>
                        <div className="stat-label" style={{ fontSize: '0.72rem' }}>{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Achievements ── */}
      <motion.div variants={itemVariants} className="glass-panel-flat" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <Award size={20} style={{ color: 'var(--warning-color)' }} />
          Achievements
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem' }}>
          {ACHIEVEMENTS.map(a => {
            const current = a.type === 'saved' ? profile.saved_papers_count : profile.total_chats;
            const unlocked = current >= a.threshold;
            return (
              <div
                key={a.id}
                style={{
                  background: unlocked ? 'rgba(251, 191, 36, 0.08)' : 'var(--glass-bg)',
                  border: `1px solid ${unlocked ? 'rgba(251, 191, 36, 0.3)' : 'var(--border-color)'}`,
                  borderRadius: '14px',
                  padding: '1rem',
                  textAlign: 'center',
                  opacity: unlocked ? 1 : 0.45,
                  transition: 'all 0.2s',
                }}
              >
                <a.icon
                  size={28}
                  style={{
                    color: unlocked ? 'var(--warning-color)' : 'var(--text-muted)',
                    marginBottom: '0.5rem',
                    display: 'block',
                    margin: '0 auto 0.5rem',
                  }}
                />
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.25rem' }}>{a.label}</p>
                <p style={{ fontSize: '0.73rem', color: 'var(--secondary-color)' }}>{a.desc}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Analytics Charts ── */}
      {analytics && (
        <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Papers by Month */}
          <div className="glass-panel-flat" style={{ padding: '1.75rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
              <TrendingUp size={18} style={{ color: 'var(--primary-color)' }} />
              Papers Saved Over Time
            </h3>
            {analytics.papers_by_month.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>
                No data yet. Start saving papers!
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.papers_by_month.map(d => ({ ...d, month: formatMonth(d.month) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--secondary-color)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--secondary-color)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--glass-bg)' }} />
                  <Bar dataKey="count" fill="var(--primary-color)" radius={[6, 6, 0, 0]} name="Papers" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* AI Chats by Month */}
          <div className="glass-panel-flat" style={{ padding: '1.75rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
              <Activity size={18} style={{ color: 'var(--accent-color)' }} />
              AI Chat Activity
            </h3>
            {analytics.chats_by_month.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>
                No chat data yet. Start chatting with the AI!
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analytics.chats_by_month.map(d => ({ ...d, month: formatMonth(d.month) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--secondary-color)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--secondary-color)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="count" stroke="var(--accent-color)" strokeWidth={2.5} dot={{ fill: 'var(--accent-color)', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} name="Chats" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Keywords */}
          <div className="glass-panel-flat" style={{ padding: '1.75rem', gridColumn: '1 / -1' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', fontSize: '1.05rem' }}>
              <Tag size={18} style={{ color: 'var(--accent-color)' }} />
              Most Researched Topics
            </h3>
            {analytics.top_keywords.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No keywords yet. Analyze some papers to see your research topics!
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {analytics.top_keywords.map((kw, i) => (
                  <motion.span
                    key={kw.keyword}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="badge"
                    style={{
                      fontSize: `${Math.max(0.78, Math.min(1.1, 0.78 + kw.count * 0.06))}rem`,
                      padding: '0.3rem 0.9rem',
                    }}
                  >
                    {kw.keyword}
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7em', marginLeft: '0.3rem' }}>×{kw.count}</span>
                  </motion.span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Profile;
