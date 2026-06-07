import React, { useState } from 'react';
import { Search as SearchIcon, Beaker, FileText, ChevronRight, ExternalLink, Loader2, Atom, Share2 } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

interface Paper {
  id: number;
  title: string;
  abstract: string;
  authors: string;
  arxiv_url?: string;
}

const Search = () => {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/search?query=${encodeURIComponent(query)}`);
      setPapers(res.data);
    } catch (err) {
      console.error('Search failed:', err);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = (paper: Paper) => {
    const text = `Title: ${paper.title}\nAuthors: ${paper.authors}\nAbstract: ${paper.abstract}`;
    navigate('/chat', { state: { paperText: text, paperTitle: paper.title } });
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SearchIcon /> Literature Search
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary-color)' }}>
          <span>Powered by</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#b77dff', fontWeight: 600 }}>
            <Atom size={16} /> ArXiv
          </span>
          <span>— search millions of research papers in real-time</span>
        </div>
      </header>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
        <input
          id="search-query-input"
          type="text"
          className="input-field"
          style={{ marginBottom: 0, flex: 1, fontSize: '1.1rem' }}
          placeholder="Enter keywords, topics, author names..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" id="search-btn" className="btn btn-primary" disabled={loading} style={{ minWidth: '130px' }}>
          {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <><SearchIcon size={16} /> Search</>}
        </button>
      </form>

      {/* Results */}
      {papers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ marginBottom: 0 }}>
              {papers.length} results for &ldquo;<span style={{ color: 'var(--primary-color)' }}>{query}</span>&rdquo;
            </h3>
            <span style={{ color: 'var(--secondary-color)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Atom size={14} style={{ color: '#b77dff' }} /> Source: ArXiv
            </span>
          </div>

          {papers.map((paper) => (
            <div key={paper.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                    {paper.title}
                  </h3>
                  <div style={{ color: 'var(--secondary-color)', fontSize: '0.875rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Beaker size={14} />
                    <span>{paper.authors}</span>
                  </div>
                  <p style={{ fontSize: '0.925rem', lineHeight: 1.65, color: 'var(--text-primary)' }}>
                    {paper.abstract.length > 280 ? paper.abstract.slice(0, 280) + '...' : paper.abstract}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAnalyze(paper)}
                    id={`analyze-paper-${paper.id}`}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    Analyze <ChevronRight size={14} />
                  </button>
                  {paper.arxiv_url && (
                    <>
                      <button
                        className="btn"
                        onClick={() => navigate(`/citations/${paper.arxiv_url?.split('/').pop()}`)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderColor: 'rgba(167,139,250,0.5)', color: '#A78BFA' }}
                      >
                        Citation Graph <Share2 size={14} />
                      </button>
                      <a
                        href={paper.arxiv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', textDecoration: 'none' }}
                      >
                        ArXiv <ExternalLink size={14} />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {searched && papers.length === 0 && !loading && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary-color)' }}>
          <FileText size={48} style={{ opacity: 0.35, marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No results found for &ldquo;{query}&rdquo;</p>
          <p style={{ fontSize: '0.875rem' }}>Try different keywords or check the ArXiv directly.</p>
        </div>
      )}

      {/* Initial state */}
      {!searched && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--secondary-color)' }}>
          <SearchIcon size={52} style={{ opacity: 0.2, marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '1rem' }}>Enter a topic, keyword, or author name to search ArXiv.</p>
        </div>
      )}
    </div>
  );
};

export default Search;
