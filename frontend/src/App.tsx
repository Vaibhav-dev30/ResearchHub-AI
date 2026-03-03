import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { BrainCircuit, Search as SearchIcon, MessageSquare, LayoutDashboard, LogOut, LogIn, UserPlus } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import AIChat from './pages/AIChat';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const Navigation = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="brand">
        <BrainCircuit className="brand-icon" size={28} />
        ResearchHub AI
      </div>
      <div className="nav-links">
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link to="/search" className={`nav-link ${isActive('/search')}`}>
          <SearchIcon size={18} /> Search Papers
        </Link>
        <Link to="/chat" className={`nav-link ${isActive('/chat')}`}>
          <MessageSquare size={18} /> AI Chat
        </Link>
        <button onClick={handleLogout} className="btn" style={{ marginLeft: '1rem', padding: '0.4rem 1rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <div className="page-container">
        <Navigation />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/search" element={
            <PrivateRoute><Search /></PrivateRoute>
          } />
          <Route path="/chat" element={
            <PrivateRoute><AIChat /></PrivateRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
