import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import api from './api/axios';
import { MessageCircle } from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import WalletPage from './pages/WalletPage';
import Profile from './pages/Profile';
import OrdersPage from './pages/OrdersPage';
import AdminDashboard from './pages/AdminDashboard';
import AgentPage from './pages/AgentPage';
import StorePage from './pages/StorePage';
import Referrals from './pages/Referrals';
import PaymentStatus from './pages/PaymentStatus';
import AnalysisDashboard from './pages/AnalysisDashboard';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', background: '#f8fafc'
        }}>
            <div style={{
                width: 48, height: 48, border: '4px solid #e2e8f0',
                borderTopColor: '#4f46e5', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', marginBottom: 20
            }}></div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Initializing Session...
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
    if (!user) return <Navigate to="/login" />;
    return children;
};

function AppContent() {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const isStore = location.pathname.startsWith('/store/') || (location.pathname === '/payment-status' && query.get('type') === 'store');
    
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/admin/settings');
                setSettings(res.data);
            } catch (err) {
                console.error('Failed to fetch settings');
            }
        };
        fetchSettings();
    }, []);

    const communityLink = settings?.communityLink || 'https://chat.whatsapp.com/';
    return (
        <div style={{ minHeight: '100vh', background: '#fff' }}>
            {!isStore && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/analysis" element={<ProtectedRoute><AnalysisDashboard /></ProtectedRoute>} />
                <Route path="/agent" element={<ProtectedRoute><AgentPage /></ProtectedRoute>} />
                <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
                <Route path="/store/:slug" element={<StorePage />} />
                <Route path="/store" element={<Navigate to="/dashboard" />} />
                <Route path="/payment-status" element={<PaymentStatus />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>

            {/* Global WhatsApp Floating Button — Only show on platform pages, not agent stores */}
            {!isStore && (
                <a 
                    href={communityLink}
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        width: 60,
                        height: 60,
                        background: '#25D366',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(37,211,102,0.4)',
                        zIndex: 9999,
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
                >
                    <div style={{ position: 'absolute', top: -10, left: -10, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 900, padding: '4px 8px', borderRadius: 10, border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>SUPPORT</div>
                    <MessageCircle size={32} color="#fff" />
                </a>
            )}
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
