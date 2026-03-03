import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, User, Send, Zap, BookOpen } from 'lucide-react';
import api from '../api';

interface AnalysisResult {
    analysis: string;
    keywords: string[];
}

const AIChat = () => {
    const location = useLocation();
    const statePaperText = location.state?.paperText || '';

    const [messages, setMessages] = useState<{ role: 'user' | 'sys', text: string }[]>([
        { role: 'sys', text: 'AI Agent initialized. Ready to assist with research analysis and literature queries.' }
    ]);
    const [inputVal, setInputVal] = useState('');
    const [loading, setLoading] = useState(false);
    const [paperInput, setPaperInput] = useState(statePaperText);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'analysis'>('chat');

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, analysisResult]);

    const handleSendChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputVal.trim()) return;

        const userMsg = inputVal;
        setInputVal('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await api.post('/chat', { message: userMsg });
            setMessages(prev => [...prev, { role: 'sys', text: res.data.reply }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'sys', text: 'Error connecting to the AI core.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzePaper = async () => {
        if (!paperInput.trim()) return;
        setAnalyzing(true);
        setAnalysisResult(null);
        try {
            const res = await api.post('/analyze-paper', { text: paperInput });
            setAnalysisResult(res.data);
            setActiveTab('analysis');
        } catch (err) {
            console.error(err);
            alert('Failed to analyze paper.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>

            {/* Sidebar for Paper Analysis Input */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', height: 'fit-content' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <BookOpen size={20} /> Content Analyzer
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--secondary-color)', marginBottom: '1rem' }}>
                    Paste paper abstract or full text for deep agentic extraction (summary, findings, queries, keywords).
                </p>
                <textarea
                    className="input-field"
                    placeholder="Paste scientific text here..."
                    value={paperInput}
                    onChange={(e) => setPaperInput(e.target.value)}
                    style={{ minHeight: '200px', fontSize: '0.9rem' }}
                />
                <button className="btn btn-primary" onClick={handleAnalyzePaper} disabled={analyzing || !paperInput.trim()} style={{ marginTop: '0.5rem' }}>
                    {analyzing ? <span className="loader"></span> : <><Zap size={16} /> Run Analysis</>}
                </button>
            </div>

            {/* Main chat & Results Area */}
            <div className="glass-panel chat-container" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'rgba(13, 17, 23, 0.4)' }}>
                    <button
                        onClick={() => setActiveTab('chat')}
                        style={{ flex: 1, padding: '1rem', background: activeTab === 'chat' ? 'rgba(88, 166, 255, 0.1)' : 'transparent', color: activeTab === 'chat' ? 'var(--primary-color)' : 'var(--text-primary)', border: 'none', borderBottom: activeTab === 'chat' ? '2px solid var(--primary-color)' : '2px solid transparent', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        <Bot size={18} /> General Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('analysis')}
                        style={{ flex: 1, padding: '1rem', background: activeTab === 'analysis' ? 'rgba(88, 166, 255, 0.1)' : 'transparent', color: activeTab === 'analysis' ? 'var(--primary-color)' : 'var(--text-primary)', border: 'none', borderBottom: activeTab === 'analysis' ? '2px solid var(--primary-color)' : '2px solid transparent', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        <Zap size={18} /> Analysis Results
                    </button>
                </div>

                {activeTab === 'chat' ? (
                    <>
                        <div className="chat-messages">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`chat-msg ${msg.role === 'user' ? 'msg-user' : 'msg-ai'}`}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: msg.role === 'user' ? 'var(--primary-color)' : 'var(--secondary-color)', fontSize: '0.85rem', fontWeight: 600 }}>
                                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                        {msg.role === 'user' ? 'Scientist' : 'AI Agent'}
                                    </div>
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                                </div>
                            ))}
                            {loading && (
                                <div className="chat-msg msg-ai">
                                    <span className="loader" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        <form onSubmit={handleSendChat} className="chat-input-area" style={{ padding: '1rem', background: 'rgba(13, 17, 23, 0.4)' }}>
                            <input
                                type="text"
                                className="input-field"
                                style={{ marginBottom: 0 }}
                                placeholder="Ask about research methodology, logic, or request literature advice..."
                                value={inputVal}
                                onChange={e => setInputVal(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary" disabled={loading || !inputVal.trim()} style={{ padding: '0 1.5rem' }}>
                                <Send size={18} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="chat-messages" style={{ background: 'rgba(13, 17, 23, 0.4)' }}>
                        {!analysisResult && !analyzing && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--secondary-color)' }}>
                                <Zap size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                <p>Run analysis on a paper to see results here.</p>
                            </div>
                        )}

                        {analyzing && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--primary-color)' }}>
                                <span className="loader" style={{ width: '48px', height: '48px', marginBottom: '1rem' }}></span>
                                <p className="animate-fade-in">Processing abstract semantics...</p>
                            </div>
                        )}

                        {analysisResult && (
                            <div className="animate-fade-in" style={{ padding: '0.5rem' }}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                        <Bot size={18} /> Comprehensive Analysis
                                    </h4>
                                    <div className="msg-ai" style={{ padding: '1.5rem', borderRadius: '12px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                        {analysisResult.analysis}
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>
                                        <Zap size={18} /> Extracted Keywords
                                    </h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {analysisResult.keywords.map((kw, i) => (
                                            <span key={i} className="badge">
                                                {kw.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIChat;
