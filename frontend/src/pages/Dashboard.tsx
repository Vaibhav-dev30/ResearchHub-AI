import React, { useState, useEffect, useCallback } from 'react';
import { Search, MessageSquare, BookMarked, Trash2, ExternalLink, Calendar, Tag, ChevronRight, X, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

interface SavedAnalysis {
  id: number;
  title: string;
  authors: string;
  abstract: string;
  summary: string;
  keywords: string;
  created_at: string;
}

const Dashboard = () => {
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchSaved = useCallback(async () => {
    try {
      const res = await api.get('/saved-analyses');
      setSavedAnalyses(res.data);
    } catch (err) {
      console.error('Failed to fetch saved analyses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(id);
    try {
      await api.delete(`/saved-analyses/${id}`);
      setSavedAnalyses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleOpenInChat = (analysis: SavedAnalysis, e: React.MouseEvent) => {
    e.stopPropagation();
    const context = `Title: ${analysis.title}\nAuthors: ${analysis.authors}\nAbstract: ${analysis.abstract}\n\nSummary:\n${analysis.summary}`;
    navigate('/chat', { state: { paperText: context, paperTitle: analysis.title } });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1rem 0' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Control Center</h1>
        <p style={{ color: 'var(--secondary-color)', fontSize: '1.1rem' }}>
          Manage your academic research protocols and AI analysis library.
        </p>
      </header>

      {/* Quick Actions */}
      <div className="card-grid" style={{ marginBottom: '3rem' }}>
        <Link
          to="/search"
          className="glass-panel"
          style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer' }}
        >
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(88, 166, 255, 0.1)', borderRadius: '12px', width: 'fit-content', color: 'var(--primary-color)' }}>
            <Search size={32} />
          </div>
          <h3>Literature Search</h3>
          <p style={{ color: 'var(--text-primary)' }}>
            Query ArXiv in real-time for research papers and academic literature.
          </p>
        </Link>

        <Link
          to="/chat"
          className="glass-panel"
          style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer' }}
        >
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(88, 166, 255, 0.1)', borderRadius: '12px', width: 'fit-content', color: 'var(--primary-color)' }}>
            <MessageSquare size={32} />
          </div>
          <h3>AI Analysis Interface</h3>
          <p style={{ color: 'var(--text-primary)' }}>
            Extract insights, summaries, keywords, and research questions from any paper.
          </p>
        </Link>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(138, 43, 226, 0.1)', borderRadius: '12px', width: 'fit-content', color: '#a78bfa' }}>
            <BookMarked size={32} />
          </div>
          <h3>Library</h3>
          <p style={{ color: 'var(--text-primary)' }}>
            {savedAnalyses.length > 0
              ? `${savedAnalyses.length} saved protocol${savedAnalyses.length !== 1 ? 's' : ''} in your library.`
              : 'Your library is empty. Analyze papers to build it.'}
          </p>
        </div>
      </div>

      {/* Saved Library Section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 0 }}>
            <BookMarked size={24} style={{ color: '#a78bfa' }} />
            Saved Protocols Library
          </h2>
          {savedAnalyses.length > 0 && (
            <span className="badge" style={{ background: 'rgba(138, 43, 226, 0.15)', color: '#a78bfa', border: '1px solid rgba(138, 43, 226, 0.3)' }}>
              {savedAnalyses.length} entries
            </span>
          )}
        </div>

        {loading ? (
          <div className="glass-panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', gap: '1rem' }}>
            <Loader2 size={24} style={{ color: 'var(--primary-color)', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'var(--secondary-color)' }}>Loading library...</span>
          </div>
        ) : savedAnalyses.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary-color)' }}>
            <BookMarked size={52} style={{ opacity: 0.25, marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No analyses saved yet.</p>
            <p style={{ fontSize: '0.9rem' }}>Go to <Link to="/chat" style={{ color: 'var(--primary-color)' }}>AI Analysis</Link> and click "Save Analysis" after running a paper analysis.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {savedAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                className="glass-panel"
                onClick={() => setExpanded(expanded === analysis.id ? null : analysis.id)}
                style={{ cursor: 'pointer', padding: '1.5rem', transition: 'all 0.3s ease' }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.4rem', fontSize: '1rem', lineHeight: 1.4 }}>
                      {analysis.title}
                    </h3>
                    {analysis.authors && (
                      <p style={{ color: 'var(--secondary-color)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        {analysis.authors}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--secondary-color)', fontSize: '0.8rem' }}>
                        <Calendar size={12} />
                        {formatDate(analysis.created_at)}
                      </span>
                      {analysis.keywords && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--secondary-color)', fontSize: '0.8rem' }}>
                          <Tag size={12} />
                          {analysis.keywords.split(',').slice(0, 3).join(', ')}
                          {analysis.keywords.split(',').length > 3 && '...'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      className="btn"
                      onClick={(e) => handleOpenInChat(analysis, e)}
                      title="Open in AI Chat"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      <ExternalLink size={14} /> Chat
                    </button>
                    <button
                      className="btn"
                      onClick={(e) => handleDelete(analysis.id, e)}
                      disabled={deleting === analysis.id}
                      title="Delete analysis"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}
                    >
                      {deleting === analysis.id
                        ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        : <Trash2 size={14} />
                      }
                    </button>
                    <button
                      style={{ background: 'none', border: 'none', color: 'var(--secondary-color)', cursor: 'pointer', padding: '0.4rem', display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }}
                      title={expanded === analysis.id ? 'Collapse' : 'Expand'}
                    >
                      {expanded === analysis.id
                        ? <X size={16} />
                        : <ChevronRight size={16} />
                      }
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expanded === analysis.id && (
                  <div className="animate-fade-in" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                    {analysis.summary && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Summary
                        </h4>
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                          {analysis.summary}
                        </p>
                      </div>
                    )}

                    {analysis.keywords && (
                      <div>
                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Keywords
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {analysis.keywords.split(',').map((kw, i) => (
                            <span key={i} className="badge">{kw.trim()}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
