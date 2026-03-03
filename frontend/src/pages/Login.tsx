import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, BrainCircuit } from 'lucide-react';
import api from '../api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }} className="animate-fade-in">
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <BrainCircuit size={48} className="brand-icon" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
                <h2 style={{ marginBottom: '2rem' }}>Welcome Back</h2>

                {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', background: 'rgba(248, 81, 73, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group text-left" style={{ textAlign: 'left' }}>
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? <span className="loader"></span> : <><LogIn size={18} /> Access Terminal</>}
                    </button>
                </form>
                <div style={{ marginTop: '2rem', color: 'var(--secondary-color)' }}>
                    Don't have an account? <Link to="/register">Initialize here</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
