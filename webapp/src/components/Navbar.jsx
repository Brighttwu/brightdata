import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Wallet, Smartphone, Menu, X, ArrowRight, User, History, Plus, ShieldAlert, BarChart2, Users, Tag, Receipt, ShoppingCart, Home, DollarSign, Gift, Store, Settings, RefreshCw, Code } from 'lucide-react';

const Navbar = () => {
    const { user, logout, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handleNavbarRefresh = async () => {
        setRefreshing(true);
        await refreshProfile();
        setTimeout(() => setRefreshing(false), 800);
    };

    const isAdminMode = user?.role === 'admin' && location.pathname.startsWith('/admin');

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
    };

    const isCurrent = (path, tabParam) => {
        if (tabParam) {
            return location.pathname === path && location.search.includes(`tab=${tabParam}`);
        }
        return location.pathname === path;
    };

    const navLink = (to, label, icon, tabParam = null) => (
        <Link to={to} onClick={() => setIsOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            fontSize: 16, fontWeight: 700,
            color: isCurrent(to.split('?')[0], tabParam) ? '#4f46e5' : '#334155',
            textDecoration: 'none',
            padding: '14px 0',
            borderBottom: '1px solid #f1f5f9'
        }}>
            {icon} {label}
            <ArrowRight size={16} style={{ marginLeft: 'auto', color: '#cbd5e1' }} />
        </Link>
    );

    const desktopNavLink = (to, label, tabParam = null) => (
        <Link to={to} style={{
            fontSize: 14, fontWeight: 700, 
            color: isCurrent(to.split('?')[0], tabParam) ? '#4f46e5' : '#64748b', 
            textDecoration: 'none', padding: '8px 14px', borderRadius: 10,
            background: isCurrent(to.split('?')[0], tabParam) ? '#eef2ff' : 'transparent'
        }}>{label}</Link>
    );

    return (
        <>
            <nav style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
                position: 'sticky', top: 0, zIndex: 50,
                borderBottom: '1px solid #f1f5f9',
                padding: '0 24px', height: 72,
                display: 'flex', alignItems: 'center'
            }}>
                <div style={{
                    maxWidth: 1200, margin: '0 auto', width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 20
                }}>
                    {/* Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }} onClick={() => setIsOpen(false)}>
                        <div style={{
                            width: 36, height: 36, background: isAdminMode ? '#0f172a' : '#4f46e5', borderRadius: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {isAdminMode ? <ShieldAlert size={20} color="#fff" /> : <Smartphone size={20} color="#fff" />}
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>
                            bright{isAdminMode ? <span style={{ color: '#ef4444' }}>Admin</span> : <span style={{ color: '#4f46e5' }}>data</span>}
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div style={{ 
                        display: 'flex', alignItems: 'center', gap: isAdminMode ? 6 : 12, 
                        overflowX: 'auto', padding: '10px 0', 
                        msOverflowStyle: 'none', scrollbarWidth: 'none'
                    }} className="desktop-nav hide-scrollbar">
                        {user ? (
                            isAdminMode ? (
                                /* ADMIN MODE NAV */
                                <>
                                    {desktopNavLink('/admin?tab=stats', 'Stats', 'stats')}
                                    {desktopNavLink('/admin?tab=analysis', 'Analysis', 'analysis')}
                                    {desktopNavLink('/admin?tab=users', 'Users', 'users')}
                                    {desktopNavLink('/admin?tab=pricing', 'Pricing', 'pricing')}
                                    {desktopNavLink('/admin?tab=transactions', 'Transactions', 'transactions')}
                                    {desktopNavLink('/admin?tab=orders', 'Orders', 'orders')}
                                    {desktopNavLink('/admin?tab=stores', 'Stores', 'stores')}
                                    {desktopNavLink('/admin?tab=reports', 'Reports', 'reports')}
                                    {desktopNavLink('/admin?tab=withdrawals', 'Withdrawals', 'withdrawals')}
                                    {desktopNavLink('/admin?tab=settings', 'Settings', 'settings')}
                                    {desktopNavLink('/developer', 'API')}
                                    
                                    <Link to="/dashboard" style={{
                                        fontSize: 13, fontWeight: 800, color: '#4f46e5', textDecoration: 'none', padding: '8px 12px', borderRadius: 8, background: '#eef2ff', marginLeft: 10, whiteSpace: 'nowrap'
                                    }}><Home size={14} style={{marginBottom: -2}} /> Switch</Link>

                                    <button onClick={handleLogout} style={{
                                        background: '#f8fafc', border: '1px solid #e2e8f0',
                                        padding: 8, borderRadius: 10, cursor: 'pointer', color: '#94a3b8',
                                        display: 'flex', alignItems: 'center', marginLeft: 6, flexShrink: 0
                                    }}>
                                        <LogOut size={16} />
                                    </button>
                                </>
                            ) : (
                                /* USER MODE NAV */
                                <>
                                    {desktopNavLink('/dashboard', 'Dashboard')}
                                    {desktopNavLink('/orders', 'Orders')}
                                    {desktopNavLink('/agent', 'Agent')}
                                    {desktopNavLink('/referrals', 'Refer')}
                                    {desktopNavLink('/developer', 'API')}
                                    <Link to="/wallet" style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        fontSize: 14, fontWeight: 700, color: location.pathname==='/wallet'?'#4f46e5':'#64748b', textDecoration: 'none', padding: '8px 14px', borderRadius: 10,
                                        background: location.pathname==='/wallet'?'#eef2ff':'transparent', whiteSpace: 'nowrap'
                                    }}><Wallet size={16} /> Wallet</Link>
                                    
                                    {user.role === 'admin' && (
                                        <Link to="/admin?tab=stats" style={{
                                            fontSize: 14, fontWeight: 800, color: '#ef4444', textDecoration: 'none', padding: '8px 14px', borderRadius: 10, background: '#fef2f2', marginLeft: 16, whiteSpace: 'nowrap'
                                        }}><ShieldAlert size={16} style={{marginBottom: -3}} /> Admin</Link>
                                    )}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        background: '#4f46e5', color: '#fff',
                                        padding: '10px 18px', borderRadius: 14, fontSize: 14, fontWeight: 800, marginLeft: 8, whiteSpace: 'nowrap'
                                    }}>
                                        ₵{(user?.balance || 0).toFixed(2)}
                                        <button onClick={handleNavbarRefresh} style={{
                                            background: 'transparent', border: 'none', color: '#fff', padding: 0,
                                            marginLeft: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.8
                                        }} title="Refresh Balance">
                                            <RefreshCw size={12} style={{ animation: refreshing ? 'spin-anim 0.8s linear infinite' : 'none' }} />
                                        </button>
                                    </div>

                                    <button onClick={handleLogout} style={{
                                        background: '#f8fafc', border: '1px solid #e2e8f0',
                                        padding: 10, borderRadius: 12, cursor: 'pointer', color: '#94a3b8',
                                        display: 'flex', alignItems: 'center', flexShrink: 0
                                    }}>
                                        <LogOut size={18} />
                                    </button>
                                </>
                            )
                        ) : (
                            <>
                                <Link to="/login" style={{ fontSize: 14, fontWeight: 700, color: '#64748b', textDecoration: 'none', whiteSpace: 'nowrap' }}>Sign In</Link>
                                <Link to="/register" style={{
                                    fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none',
                                    background: '#4f46e5', padding: '10px 24px', borderRadius: 12,
                                    display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap'
                                }}>Get Started <ArrowRight size={16} /></Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} style={{
                        display: 'none', background: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: 12, width: 44, height: 44,
                        alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
                    }}>
                        {isOpen ? <X size={22} color="#0f172a" /> : <Menu size={22} color="#0f172a" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="mobile-menu" style={{
                    position: 'fixed', inset: 0, top: 72,
                    background: '#fff', zIndex: 40,
                    padding: '24px 28px',
                    display: 'flex', flexDirection: 'column',
                    overflowY: 'auto'
                }}>
                    {user ? (
                        isAdminMode ? (
                            /* ADMIN MOBILE NAV */
                            <>
                                {/* Admin Header component */}
                                <div style={{ background: '#0f172a', padding: '24px', borderRadius: 20, color: '#fff', marginBottom: 24 }}>
                                    <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.6, marginBottom: 6 }}>Admin Access Active</div>
                                    <div style={{ fontSize: 24, fontWeight: 900 }}>Control Room</div>
                                </div>
                                {navLink('/admin?tab=stats', 'Platform Stats', <BarChart2 size={20} style={{ color: '#4f46e5' }} />, 'stats')}
                                {navLink('/admin?tab=analysis', 'Analysis Chat', <BarChart2 size={20} style={{ color: '#7c3aed' }} />, 'analysis')}
                                {navLink('/admin?tab=users', 'Manage Users', <Users size={20} style={{ color: '#0ea5e9' }} />, 'users')}
                                {navLink('/admin?tab=pricing', 'Manage Pricing', <Tag size={20} style={{ color: '#f59e0b' }} />, 'pricing')}
                                {navLink('/admin?tab=transactions', 'Global Transactions', <Receipt size={20} style={{ color: '#10b981' }} />, 'transactions')}
                                {navLink('/admin?tab=orders', 'Global Orders', <ShoppingCart size={20} style={{ color: '#ef4444' }} />, 'orders')}
                                {navLink('/admin?tab=stores', 'Agent Stores', <Store size={20} style={{ color: '#8b5cf6' }} />, 'stores')}
                                {navLink('/admin?tab=reports', 'Reported Orders', <ShieldAlert size={20} style={{ color: '#dc2626' }} />, 'reports')}
                                {navLink('/admin?tab=withdrawals', 'Payout Requests', <DollarSign size={20} style={{ color: '#10b981' }} />, 'withdrawals')}
                                {navLink('/admin?tab=settings', 'Platform Settings', <Settings size={20} style={{ color: '#64748b' }} />, 'settings')}
                                {navLink('/developer', 'API Docs', <Code size={20} style={{ color: '#6366f1' }} />)}
                                
                                {navLink('/dashboard', 'Switch to User View', <Home size={20} style={{ color: '#64748b' }} />)}
                                
                                <div style={{ marginTop: 'auto', paddingTop: 24 }}>
                                    <button onClick={handleLogout} style={{
                                        width: '100%', padding: 16, background: '#fef2f2', color: '#ef4444',
                                        border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                                    }}>
                                        <LogOut size={18} /> Sign Out
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* USER MOBILE NAV */
                            <>
                                <div style={{ background: '#4f46e5', padding: '24px', borderRadius: 20, color: '#fff', marginBottom: 24 }}>
                                    <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.6, marginBottom: 6 }}>Balance</div>
                                    <div style={{ fontSize: 32, fontWeight: 900 }}>GH₵{(user?.balance || 0).toFixed(2)}</div>
                                </div>

                                {navLink('/dashboard', 'Dashboard', <Smartphone size={20} style={{ color: '#4f46e5' }} />)}
                                {navLink('/orders', 'My Orders', <History size={20} style={{ color: '#f59e0b' }} />)}
                                {navLink('/wallet', 'My Wallet', <Wallet size={20} style={{ color: '#4f46e5' }} />)}
                                {navLink('/agent', 'Agent Store', <Tag size={20} style={{ color: '#10b981' }} />)}
                                {navLink('/referrals', 'Refer & Earn', <Gift size={20} style={{ color: '#4f46e5' }} />)}
                                {navLink('/developer', 'Developers API', <Code size={20} style={{ color: '#6366f1' }} />)}
                                {navLink('/profile', 'My Profile', <User size={20} style={{ color: '#0ea5e9' }} />)}
                                
                                {user.role === 'admin' && navLink('/admin?tab=stats', 'Admin Panel', <ShieldAlert size={20} style={{ color: '#ef4444' }} />)}

                                <div style={{ marginTop: 'auto', paddingTop: 24 }}>
                                    <button onClick={handleLogout} style={{
                                        width: '100%', padding: 16, background: '#fef2f2', color: '#ef4444',
                                        border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                                    }}>
                                        <LogOut size={18} /> Sign Out
                                    </button>
                                </div>
                            </>
                        )
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setIsOpen(false)} style={{
                                fontSize: 18, fontWeight: 800, color: '#0f172a', textDecoration: 'none',
                                padding: '16px 0', borderBottom: '1px solid #f1f5f9'
                            }}>Sign In</Link>
                            <Link to="/register" onClick={() => setIsOpen(false)} style={{
                                width: '100%', padding: 18, background: '#4f46e5', color: '#fff',
                                borderRadius: 14, fontSize: 16, fontWeight: 800,
                                textDecoration: 'none', textAlign: 'center', display: 'block', marginTop: 16,
                                boxShadow: '0 8px 24px rgba(79,70,229,0.3)'
                            }}>Create Free Account</Link>
                        </>
                    )}
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .desktop-nav { display: none !important; }
                    .mobile-toggle { display: flex !important; }
                }
            `}</style>
        </>
    );
};

export default Navbar;
