import React, { useState } from 'react';
import { Search as SearchIcon, Beaker, FileText, ChevronRight } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

interface Paper {
    id: number;
    title: string;
    abstract: string;
    authors: string;
}

const Search = () => {
    const [query, setQuery] = useState('');
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        try {
            const res = await api.get(`/search?query=${encodeURIComponent(query)}`);
            setPapers(res.data);
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = (paper: Paper) => {
        navigate('/chat', { state: { paperText: `Title: ${paper.title}\nAuthors: ${paper.authors}\nAbstract: ${paper.abstract}` } });
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <SearchIcon /> Database Query
                </h1>
                <p style={{ color: 'var(--secondary-color)' }}>Search academic literature from available repositories</p>
            </header>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                <input
                    type="text"
                    className="input-field"
                    style={{ marginBottom: 0, flex: 1, fontSize: '1.1rem' }}
                    placeholder="Enter keywords, topics, or authors..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '120px' }}>
                    {loading ? <span className="loader"></span> : 'Scan Data'}
                </button>
            </form>

            {papers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        Results found: {papers.length}
                    </h3>

                    {papers.map((paper) => (
                        <div key={paper.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                <div>
                                    <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>{paper.title}</h3>
                                    <div style={{ color: 'var(--secondary-color)', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Beaker size={14} /> Authors: {paper.authors}
                                    </div>
                                    <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{paper.abstract}</p>
                                </div>
                                <button className="btn" onClick={() => handleAnalyze(paper)} style={{ flexShrink: 0, padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                    Analyze <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {papers.length === 0 && !loading && query && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary-color)' }}>
                    <FileText size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <p>No matches found in the current databanks.</p>
                </div>
            )}
        </div>
    );
};

export default Search;
