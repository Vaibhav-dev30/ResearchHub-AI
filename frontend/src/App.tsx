import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from 'react-router-dom';
import {
  BrainCircuit,
  Search as SearchIcon,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  User,
  Sun,
  Moon,
  FileText,
} from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import PDFUpload from './pages/PDFUpload';
import AIChat from './pages/AIChat';
import Profile from './pages/Profile';
import CitationGraph from './pages/CitationGraph';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
};

const Navigation = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const isActive = (path: string) =>
    location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="brand">
        <BrainCircuit className="brand-icon" size={26} />
        ResearchHub AI
      </div>
      <div className="nav-links">
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </Link>
        <Link to="/search" className={`nav-link ${isActive('/search')}`}>
          <SearchIcon size={16} />
          <span>Search</span>
        </Link>
        <Link to="/pdf-upload" className={`nav-link ${isActive('/pdf-upload')}`}>
          <FileText size={16} />
          <span>PDFs</span>
        </Link>
        <Link to="/chat" className={`nav-link ${isActive('/chat')}`}>
          <MessageSquare size={16} />
          <span>AI Chat</span>
        </Link>
        <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
          <User size={16} />
          <span>Profile</span>
        </Link>
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="btn btn-sm"
          style={{ marginLeft: '0.5rem' }}
          title="Logout"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  return (
    <div className="page-container">
      <Navigation />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
        <Route path="/pdf-upload" element={<PrivateRoute><PDFUpload /></PrivateRoute>} />
        <Route path="/citations/:arxiv_id" element={<PrivateRoute><CitationGraph /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><AIChat /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        {/* Fallback for any unknown route */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
