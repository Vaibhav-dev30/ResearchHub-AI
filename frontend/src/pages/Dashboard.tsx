import React from 'react';
import { LayoutDashboard, FileText, Search, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    return (
        <div className="animate-fade-in" style={{ padding: '1rem 0' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Control Center</h1>
                <p style={{ color: 'var(--secondary-color)', fontSize: '1.1rem' }}>Manage your academic research protocols.</p>
            </header>

            <div className="card-grid">
                <Link to="/search" className="glass-panel" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(88, 166, 255, 0.1)', borderRadius: '12px', width: 'fit-content', color: 'var(--primary-color)' }}>
                        <Search size={32} />
                    </div>
                    <h3>Literature Search</h3>
                    <p style={{ color: 'var(--text-primary)' }}>Query the global database for research papers and academic literature.</p>
                </Link>

                <Link to="/chat" className="glass-panel" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(88, 166, 255, 0.1)', borderRadius: '12px', width: 'fit-content', color: 'var(--primary-color)' }}>
                        <MessageSquare size={32} />
                    </div>
                    <h3>AI Analysis Interface</h3>
                    <p style={{ color: 'var(--text-primary)' }}>Interact with the Agentic AI to extract key insights, summaries, and keywords from papers.</p>
                </Link>

                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.7 }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(139, 148, 158, 0.1)', borderRadius: '12px', width: 'fit-content', color: 'var(--secondary-color)' }}>
                        <FileText size={32} />
                    </div>
                    <h3>Saved Protocols <span className="badge">Coming Soon</span></h3>
                    <p style={{ color: 'var(--text-primary)' }}>Access and manage your library of analyzed research and active projects.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
