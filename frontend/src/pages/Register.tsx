import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, BrainCircuit } from 'lucide-react';
import api from '../api';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/register', { username, password });
            setSuccess('Initialization complete. Connecting...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }} className="animate-fade-in">
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <BrainCircuit size={48} className="brand-icon" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
                <h2 style={{ marginBottom: '2rem' }}>Initialize Account</h2>

                {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', background: 'rgba(248, 81, 73, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
                {success && <div style={{ color: 'var(--success-color)', marginBottom: '1rem', background: 'rgba(46, 160, 67, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label className="form-label">Identify Node (Username)</label>
                        <input
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label className="form-label">Encryption Key (Password)</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? <span className="loader"></span> : <><UserPlus size={18} /> Establish Connection</>}
                    </button>
                </form>
                <div style={{ marginTop: '2rem', color: 'var(--secondary-color)' }}>
                    Already integrated? <Link to="/login">Access Terminal</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
