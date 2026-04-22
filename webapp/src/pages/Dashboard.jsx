import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Wifi, Wallet, Plus, RefreshCw, Search, CheckCircle2, XCircle, ChevronRight, Zap, ShoppingCart, Bell, Truck, Clock, ShieldAlert, Ban, Gift, User, TrendingUp, Sparkles, CreditCard, ArrowUpRight, Code, History } from 'lucide-react';

const Dashboard = () => {
    const { user, updateBalance, refreshProfile } = useAuth();
    const [network, setNetwork] = useState('mtn');
    const [packages, setPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [platformSettings, setPlatformSettings] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
 
    const fetchPackages = useCallback(async () => {
        setLoading(true);
        setSelectedPackage(null);
        try {
            const res = await api.get(`/data/packages/${network}`);
            const raw = res.data.packages || res.data || [];
            const mapped = Array.isArray(raw) ? raw.map(p => ({
                key: p.package_key || p.key || p.id || '',
                name: p.display_name || p.name || 'Unknown Plan',
                price: Number(p.price) || 0
            })).sort((a, b) => a.price - b.price) : [];
            setPackages(mapped);
        } catch (err) {
            console.error("Dashboard: Error fetching packages", err);
            setPackages([]);
        } finally {
            setLoading(false);
        }
    }, [network]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/admin/settings');
                setPlatformSettings(res.data);
                
                // Check if notification should be shown
                if (res.data.globalNotification) {
                    const dismissed = localStorage.getItem('dismissed_global_notif');
                    if (dismissed !== res.data.globalNotification) {
                        setShowNotif(true);
                    }
                }
            } catch (err) { console.error(err); }
        };
        fetchSettings();
    }, []);

    const handleDismissNotif = () => {
        if (platformSettings?.globalNotification) {
            localStorage.setItem('dismissed_global_notif', platformSettings.globalNotification);
        }
        setShowNotif(false);
    };

    useEffect(() => {
        // Full profile sync when dashboard is opened
        refreshProfile();
    }, []);

    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshProfile();
        } catch (err) {}
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleBuy = async (method) => {
        if (!selectedPackage || phone.replace(/\s/g, '').length < 10) return;
        setBuying(true);
        setMessage({ type: '', text: '' });
        try {
            if (method === 'wallet') {
                const res = await api.post('/data/buy', {
                    network,
                    package_key: selectedPackage.key,
                    package_name: selectedPackage.name,
                    recipient_phone: phone.replace(/\s/g, '')
                });
                updateBalance(res.data.balance);
                setMessage({ type: 'success', text: `${selectedPackage.name} data sent to ${phone} successfully!` });
                setPhone('');
                setSelectedPackage(null);
            } else if (method === 'paystack') {
                const res = await api.post('/data/buy-paystack-init', {
                    network,
                    package_key: selectedPackage.key,
                    package_name: selectedPackage.name,
                    recipient_phone: phone.replace(/\s/g, '')
                });
                window.location.href = res.data.authorization_url;
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Transaction failed. Try again.' });
        } finally {
            setBuying(false);
        }
    };

    const networks = [
        { id: 'mtn', name: 'MTN', color: '#FFCC00', textColor: '#111', accent: '#f59e0b', bg: 'linear-gradient(135deg, #FFCC00 0%, #f59e0b 100%)', emoji: '🟡' },
        { id: 'telecel', name: 'Telecel', color: '#E60000', textColor: '#fff', accent: '#dc2626', bg: 'linear-gradient(135deg, #E60000 0%, #9b1c1c 100%)', emoji: '🔴' },
        { id: 'at', name: 'AT', color: '#003399', textColor: '#fff', accent: '#4f46e5', bg: 'linear-gradient(135deg, #003399 0%, #4f46e5 100%)', emoji: '🔵' }
    ];
    const currentNet = networks.find(n => n.id === network);
    const filtered = packages.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const canBuy = selectedPackage && phone.replace(/\s/g, '').length >= 10 && !buying && !platformSettings?.isMaintenanceMode;

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 72px)', fontFamily: "'Inter', sans-serif" }}>
            {showNotif && platformSettings?.globalNotification && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100000,
                    padding: 20,
                    backdropFilter: 'blur(8px)',
                    animation: 'fadeIn 0.3s ease-out'
                }} onClick={handleDismissNotif}>
                    <div 
                        style={{
                            background: '#fff',
                            borderRadius: 24,
                            padding: '40px 32px',
                            maxWidth: 400,
                            width: '100%',
                            textAlign: 'center',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                            position: 'relative',
                            animation: 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            width: 64,
                            height: 64,
                            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            color: '#fff',
                            boxShadow: '0 8px 24px rgba(79,70,229,0.3)'
                        }}>
                            <Bell size={32} />
                        </div>
                        <h3 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>New Update</h3>
                        <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.6, marginBottom: 32 }}>
                            {platformSettings.globalNotification}
                        </p>
                        <button 
                            onClick={handleDismissNotif}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: '#0f172a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 16,
                                fontWeight: 800,
                                fontSize: 16,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

            {/* Hero Balance Section */}
            <div style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                padding: '32px 16px 80px', position: 'relative', overflow: 'hidden'
            }} className="hero-container">
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2), transparent 70%)', filter: 'blur(40px)' }} />
                <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)', filter: 'blur(30px)' }} />

                <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Alerts Zone */}
                    {platformSettings && platformSettings.isMaintenanceMode && (
                         <div style={{ 
                            background: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: '12px 20px',
                            display: 'flex', alignItems: 'center', gap: 12, color: '#fff', fontWeight: 700,
                            border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)',
                            alignSelf: 'flex-start'
                        }}>
                            <ShieldAlert size={18} />
                            <span style={{ fontSize: 13 }}>Platform under maintenance — purchases disabled</span>
                        </div>
                    )}

                    {/* Greeting & Quick Stats row */}
                    <div className="hero-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em', marginBottom: 4 }}>
                                {greeting()},
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                                {user?.name?.split(' ')[0] || 'User'} 👋
                            </div>
                        </div>

                        {/* Delivery indicator */}
                        {platformSettings && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.15)', padding: '8px 16px', borderRadius: 99, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ 
                                    width: 10, height: 10, borderRadius: '50%', 
                                    background: platformSettings.deliveryStatus === 'fast' ? '#4ade80' : (platformSettings.deliveryStatus === 'normal' ? '#fbbf24' : '#f87171'),
                                    boxShadow: `0 0 12px ${platformSettings.deliveryStatus === 'fast' ? '#4ade80' : (platformSettings.deliveryStatus === 'normal' ? '#fbbf24' : '#f87171')}`
                                }} className="pulse-dot" />
                                <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {platformSettings.deliveryStatus} Delivery
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Balance Glass Card */}
                    <div className="hero-balance-card" style={{
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(24px)',
                        borderRadius: 28, padding: '32px',
                        border: '1px solid rgba(255,255,255,0.3)',
                        display: 'flex', flexDirection: 'column', gap: 24,
                        boxShadow: '0 24px 48px rgba(0,0,0,0.12)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }} className="balance-wrap">
                            <div style={{ flex: '1 1 auto' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Wallet size={16} /> Total Balance
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ fontSize: 'clamp(44px, 8vw, 64px)', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.04em' }}>
                                        ₵{(user?.balance || 0).toFixed(2)}
                                    </div>
                                    <button onClick={handleRefresh} style={{
                                        background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%',
                                        width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', color: '#fff', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        flexShrink: 0
                                    }} onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#4f46e5'; e.currentTarget.style.transform = 'rotate(180deg)'; e.currentTarget.style.border = '1px solid #fff'; }}
                                       onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'rotate(0deg)'; e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; }}>
                                        <RefreshCw size={20} style={{ animation: refreshing ? 'spin-anim 0.8s linear infinite' : 'none' }} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="hero-buttons-mobile" style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                                <Link to="/wallet" style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '16px 28px',
                                    background: '#fff', color: '#4f46e5', borderRadius: 16, fontWeight: 900,
                                    textDecoration: 'none', fontSize: 16, boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.2)'; }}
                                   onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'; }}>
                                    <Plus size={18} /> Add Funds
                                </Link>
                                <Link to="/orders" style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '16px 24px',
                                    background: 'rgba(0,0,0,0.2)', color: '#fff', borderRadius: 16, fontWeight: 800,
                                    textDecoration: 'none', fontSize: 16, border: '1px solid rgba(255,255,255,0.15)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                   onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                    <History size={18} /> History
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area — Overlapping Hero */}
            <div style={{ maxWidth: 960, margin: '-48px auto 0', padding: '0 16px 40px', position: 'relative', zIndex: 2 }}>

                {/* Quick Action Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }} className="quick-actions-grid">
                    {[
                        { to: '/dashboard', icon: <Wifi size={20} />, label: 'Buy Data', color: '#4f46e5', bg: '#eef2ff', active: true },
                        { to: '/orders', icon: <ShoppingCart size={20} />, label: 'Orders', color: '#f59e0b', bg: '#fffbeb' },
                        { to: '/referrals', icon: <Gift size={20} />, label: 'Referrals', color: '#10b981', bg: '#ecfdf5' },
                        { to: '/developer', icon: <Code size={20} />, label: 'API Access', color: '#6366f1', bg: '#eef2ff' },
                        { to: '/profile', icon: <User size={20} />, label: 'Profile', color: '#8b5cf6', bg: '#f5f3ff' },
                    ].map((item, i) => (
                        <Link key={i} to={item.to} style={{
                            background: '#fff', borderRadius: 20, padding: '20px 16px', textDecoration: 'none',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                            boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: item.active ? `2px solid ${item.color}` : '1px solid #f1f5f9',
                            transition: 'all 0.2s', cursor: 'pointer'
                        }} className="quick-action-card">
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {item.icon}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 800, color: item.active ? item.color : '#64748b' }}>{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Main Purchase Card */}
                <div style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>

                    {/* Network Selector — Pill style */}
                    <div style={{ padding: '24px 24px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <Wifi size={18} color="#4f46e5" />
                            <span style={{ fontWeight: 900, fontSize: 17, color: '#0f172a' }}>Select Network</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, background: '#f8fafc', borderRadius: 16, padding: 4 }}>
                            {networks.map(n => (
                                <button key={n.id} onClick={() => setNetwork(n.id)} style={{
                                    flex: 1, padding: '12px 8px', borderRadius: 12, fontWeight: 800,
                                    fontSize: 13, cursor: 'pointer', transition: 'all 0.25s', border: 'none',
                                    background: network === n.id ? n.bg : 'transparent',
                                    color: network === n.id ? n.textColor : '#94a3b8',
                                    boxShadow: network === n.id ? `0 4px 16px -2px ${n.color}55` : 'none',
                                    transform: network === n.id ? 'scale(1.02)' : 'none'
                                }}>
                                    {n.emoji} {n.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search */}
                    <div style={{ padding: '16px 24px 0' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
                            <input
                                type="text"
                                placeholder="Search data plans..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px 12px 12px 42px', borderRadius: 12,
                                    border: '1.5px solid #f1f5f9', outline: 'none', boxSizing: 'border-box',
                                    fontWeight: 600, fontSize: 14, background: '#fafbfc', color: '#0f172a',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={e => { e.target.style.borderColor = '#818cf8'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
                                onBlur={e => { e.target.style.borderColor = '#f1f5f9'; e.target.style.background = '#fafbfc'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                    </div>

                    {/* Package Grid */}
                    <div style={{ padding: '16px 24px', maxHeight: 300, overflowY: 'auto' }} className="hide-scrollbar">
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '48px 0', color: '#94a3b8' }}>
                                <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                <span style={{ fontWeight: 700, fontSize: 13 }}>Loading plans...</span>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8', fontWeight: 700, fontSize: 14 }}>No plans found.</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }} className="package-grid">
                                {filtered.map(p => {
                                    const sel = selectedPackage?.key === p.key;
                                    return (
                                        <div key={p.key} onClick={() => setSelectedPackage(p)} style={{
                                            padding: '16px 14px', borderRadius: 16, cursor: 'pointer',
                                            border: sel ? `2px solid ${currentNet.color}` : '1.5px solid #f1f5f9',
                                            background: sel ? currentNet.bg : '#fff',
                                            color: sel ? currentNet.textColor : '#0f172a',
                                            transition: 'all 0.2s ease',
                                            boxShadow: sel ? `0 8px 24px -6px ${currentNet.color}66` : '0 1px 4px rgba(0,0,0,0.03)',
                                            transform: sel ? 'scale(1.03)' : 'scale(1)',
                                            position: 'relative'
                                        }}>
                                            {sel && (
                                                <CheckCircle2 size={14} style={{ position: 'absolute', top: 8, right: 8, opacity: 0.8 }} />
                                            )}
                                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
                                            <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>₵{p.price.toFixed(2)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: '#f1f5f9', margin: '0 24px' }} />

                    {/* Phone + Buy Section */}
                    <div style={{ padding: '20px 24px 24px' }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 8 }}>
                            Recipient Phone Number
                        </label>
                        <input
                            type="tel"
                            inputMode="numeric"
                            placeholder="0240 000 000"
                            value={phone}
                            maxLength={10}
                            onChange={e => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setPhone(val);
                            }}
                            style={{
                                width: '100%', padding: '16px 20px', borderRadius: 14,
                                border: '1.5px solid #f1f5f9', outline: 'none', boxSizing: 'border-box',
                                fontSize: 20, fontWeight: 800, letterSpacing: '0.08em',
                                textAlign: 'center', color: '#0f172a', background: '#fafbfc',
                                transition: 'all 0.2s'
                            }}
                            onFocus={e => { e.target.style.borderColor = currentNet.color; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${currentNet.color}15`; }}
                            onBlur={e => { e.target.style.borderColor = '#f1f5f9'; e.target.style.background = '#fafbfc'; e.target.style.boxShadow = 'none'; }}
                        />

                        {/* Summary */}
                        {selectedPackage && (
                            <div style={{
                                background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', borderRadius: 14, padding: '14px 18px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                marginTop: 16, border: '1px solid #e2e8f0'
                            }}>
                                <div>
                                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Selected</div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{currentNet.name} — {selectedPackage.name}</div>
                                </div>
                                <div style={{ fontSize: 22, fontWeight: 900, color: '#4f46e5' }}>₵{selectedPackage.price.toFixed(2)}</div>
                            </div>
                        )}

                        {/* Message */}
                        {message.text && (
                            <div style={{
                                padding: '12px 16px', borderRadius: 12, marginTop: 16,
                                fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
                                background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                                color: message.type === 'success' ? '#16a34a' : '#dc2626',
                                border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                            }}>
                                {message.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                {message.text}
                            </div>
                        )}

                        {/* Buy Buttons */}
                        <div style={{ display: 'flex', gap: 10, marginTop: 18 }} className="buy-buttons">
                            <button
                                onClick={() => handleBuy('wallet')}
                                disabled={!canBuy}
                                style={{
                                    flex: 2, padding: '16px', borderRadius: 14, border: 'none',
                                    background: canBuy ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : '#e2e8f0',
                                    color: canBuy ? '#fff' : '#94a3b8', fontWeight: 800, fontSize: 14,
                                    cursor: canBuy ? 'pointer' : 'not-allowed',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    boxShadow: canBuy ? '0 8px 24px -4px rgba(79,70,229,0.4)' : 'none',
                                    transition: 'all 0.25s'
                                }}
                            >
                                {buying
                                    ? <><RefreshCw size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Processing...</>
                                    : (platformSettings?.isMaintenanceMode ? <><Ban size={16} /> Locked</> : <><Wallet size={16} /> Wallet</>)
                                }
                            </button>
                            <button
                                onClick={() => handleBuy('paystack')}
                                disabled={!canBuy}
                                style={{
                                    flex: 1, padding: '16px', borderRadius: 14,
                                    border: canBuy ? '1.5px solid #e2e8f0' : '1.5px solid #f1f5f9', background: '#fff',
                                    color: canBuy ? '#0f172a' : '#cbd5e1', fontWeight: 800,
                                    fontSize: 13, cursor: canBuy ? 'pointer' : 'not-allowed',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    transition: 'all 0.25s'
                                }}
                            >
                                <CreditCard size={14} color={canBuy ? '#f59e0b' : '#cbd5e1'} /> Card
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Quick Links */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 20 }} className="bottom-grid">
                    <Link to="/orders" style={{
                        background: '#fff', borderRadius: 20, padding: '22px 20px',
                        textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', transition: 'all 0.2s'
                    }}>
                        <div>
                            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>View All</div>
                            <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a' }}>My Orders</div>
                        </div>
                        <div style={{ background: '#eef2ff', borderRadius: 12, padding: 10, color: '#4f46e5' }}>
                            <ShoppingCart size={18} />
                        </div>
                    </Link>
                    <Link to="/wallet" style={{
                        background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 20, padding: '22px 20px',
                        textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        boxShadow: '0 8px 24px -4px rgba(15,23,42,0.3)', transition: 'all 0.2s'
                    }}>
                        <div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Top Up</div>
                            <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>Add Funds</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 10 }}>
                            <Plus size={18} color="#fff" />
                        </div>
                    </Link>
                </div>

                {/* Referral Banner */}
                <Link to="/referrals" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    borderRadius: 20, padding: '20px 24px', marginTop: 12, textDecoration: 'none',
                    boxShadow: '0 8px 32px -6px rgba(79,70,229,0.4)', transition: 'all 0.2s',
                    overflow: 'hidden', position: 'relative'
                }}>
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Gift size={20} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Invite & Earn</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Share your code, earn on every purchase</div>
                        </div>
                    </div>
                    <ArrowUpRight size={20} color="rgba(255,255,255,0.5)" style={{ position: 'relative' }} />
                </Link>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes spin-anim { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.4); } 100% { opacity: 1; transform: scale(1); } }
                .pulse-dot { animation: pulse 2s infinite ease-in-out; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                .quick-action-card:hover { transform: translateY(-3px) !important; box-shadow: 0 8px 24px rgba(0,0,0,0.06) !important; }
                
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }

                @media (max-width: 768px) {
                    .balance-wrap { flex-direction: column !important; align-items: stretch !important; gap: 24px !important; }
                    .hero-buttons-mobile { flex-direction: column !important; width: 100% !important; }
                    .hero-buttons-mobile a { width: 100% !important; justify-content: center !important; text-align: center !important; flex: none !important; }
                    .hero-top-row { flex-direction: column !important; align-items: flex-start !important; }

                    .quick-actions-grid { grid-template-columns: repeat(5, 1fr) !important; gap: 4px !important; }
                    .quick-actions-grid a { padding: 12px 4px !important; border-radius: 12px !important; }
                    .quick-actions-grid span { font-size: 9px !important; }
                    .quick-actions-grid div { width: 32px !important; height: 32px !important; }
                    .quick-actions-grid svg { width: 16px !important; height: 16px !important; }
                    .package-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .bottom-grid { grid-template-columns: 1fr !important; }
                    .buy-buttons { flex-direction: column !important; }
                    .buy-buttons button { flex: none !important; }
                    input { font-size: 16px !important; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
