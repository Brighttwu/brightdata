import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Wifi, Wallet, Plus, RefreshCw, Search, CheckCircle2, XCircle, ChevronRight, Zap, ShoppingCart, Bell, Truck, Clock, ShieldAlert, Ban } from 'lucide-react';

const Dashboard = () => {
    const { user, updateBalance } = useAuth();
    const [network, setNetwork] = useState('mtn');
    const [packages, setPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [platformSettings, setPlatformSettings] = useState(null);

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
        fetchPackages();
        const fetchSettings = async () => {
            try {
                const res = await api.get('/admin/settings');
                setPlatformSettings(res.data);
            } catch (err) { console.error(err); }
        };
        fetchSettings();

        // Refresh balance every 15 seconds while on dashboard to catch auto-verifications
        const interval = setInterval(async () => {
            try {
                const res = await api.get('/user/profile');
                if (res.data.balance !== user.balance) {
                    updateBalance(res.data.balance);
                }
            } catch (err) {}
        }, 15000);

        return () => clearInterval(interval);
    }, [fetchPackages, updateBalance, user?.balance]);

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
        { id: 'mtn', name: 'MTN', color: '#FFCC00', textColor: '#111', accent: '#f59e0b', bg: 'linear-gradient(135deg, #FFCC00 0%, #f59e0b 100%)' },
        { id: 'telecel', name: 'Telecel', color: '#E60000', textColor: '#fff', accent: '#dc2626', bg: 'linear-gradient(135deg, #E60000 0%, #9b1c1c 100%)' },
        { id: 'at', name: 'AT', color: '#003399', textColor: '#fff', accent: '#4f46e5', bg: 'linear-gradient(135deg, #003399 0%, #4f46e5 100%)' }
    ];
    const currentNet = networks.find(n => n.id === network);
    const filtered = packages.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const canBuy = selectedPackage && phone.replace(/\s/g, '').length >= 10 && !buying && !platformSettings?.isMaintenanceMode;

    return (
        <div style={{ background: '#f0f2f8', minHeight: 'calc(100vh - 72px)', padding: '24px 16px', fontFamily: "'Inter', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
            
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

            <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Platform Notification & Delivery Status */}
                {platformSettings && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {platformSettings.isMaintenanceMode && (
                            <div style={{ 
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                                border: 'none', borderRadius: 20, padding: '20px 24px',
                                display: 'flex', alignItems: 'center', gap: 16, color: '#fff',
                                boxShadow: '0 10px 25px rgba(220, 38, 38, 0.25)',
                                marginBottom: 4
                            }}>
                                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <ShieldAlert size={24} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.02em' }}>Platform Locked</div>
                                    <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginTop: 2 }}>
                                        Buying is currently disabled for maintenance. We'll be back shortly!
                                    </div>
                                </div>
                            </div>
                        )}
                        {platformSettings.globalNotification && (
                            <div style={{ 
                                background: 'linear-gradient(90deg, #fffbeb 0%, #fff 100%)', 
                                border: '1px solid #fde68a', borderRadius: 20, padding: '16px 24px',
                                display: 'flex', alignItems: 'center', gap: 16,
                                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.05)'
                            }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Bell size={20} />
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e', lineHeight: 1.5 }}>
                                    {platformSettings.globalNotification}
                                </div>
                            </div>
                        )}
                        
                        <div style={{ 
                            background: '#fff', border: '1px solid #f1f5f9', borderRadius: 20, padding: '12px 24px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Truck size={18} color="#64748b" />
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Delivery Speed Status:</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ 
                                    width: 8, height: 8, borderRadius: '50%', 
                                    background: platformSettings.deliveryStatus === 'fast' ? '#10b981' : (platformSettings.deliveryStatus === 'normal' ? '#f59e0b' : '#ef4444'),
                                    boxShadow: `0 0 8px ${platformSettings.deliveryStatus === 'fast' ? '#10b981' : (platformSettings.deliveryStatus === 'normal' ? '#f59e0b' : '#ef4444')}`
                                }} className="pulse-dot" />
                                <span style={{ 
                                    fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                                    color: platformSettings.deliveryStatus === 'fast' ? '#059669' : (platformSettings.deliveryStatus === 'normal' ? '#d97706' : '#dc2626')
                                }}>
                                    {platformSettings.deliveryStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Balance Hero Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    borderRadius: 28, padding: '32px 36px', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
                    boxShadow: '0 20px 60px -10px rgba(79, 70, 229, 0.5)',
                    position: 'relative', overflow: 'hidden'
                }}>
                    {/* Decorative circles */}
                    <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                    <div style={{ position: 'absolute', bottom: -60, right: 100, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

                    <div style={{ position: 'relative' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.75, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                            Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.6, marginBottom: 4 }}>Wallet Balance</div>
                        <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1 }}>
                            ₵{(user?.balance || 0).toFixed(2)}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
                        <Link to="/wallet" style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px',
                            background: '#fff', color: '#4f46e5', borderRadius: 16, fontWeight: 800,
                            textDecoration: 'none', fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                        }}>
                            <Plus size={16} /> Add Funds
                        </Link>
                        <Link to="/orders" style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px',
                            background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 16, fontWeight: 700,
                            textDecoration: 'none', fontSize: 14, border: '1px solid rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            History
                        </Link>
                    </div>
                </div>

                {/* Main Purchase Card */}
                <div style={{ background: '#fff', borderRadius: 28, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

                    {/* Header */}
                    <div style={{ padding: '28px 32px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 16, background: '#eef2ff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Wifi size={22} color="#4f46e5" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 900, fontSize: 20, color: '#0f172a' }}>Buy Data Bundle</div>
                                <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>Fast & affordable data for all networks</div>
                            </div>
                        </div>

                        {/* Network Selector */}
                        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                            {networks.map(n => (
                                <button key={n.id} onClick={() => setNetwork(n.id)} style={{
                                    flex: 1, padding: '14px 8px', borderRadius: 16, fontWeight: 800,
                                    fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                                    background: network === n.id ? n.bg : '#f8fafc',
                                    color: network === n.id ? n.textColor : '#64748b',
                                    boxShadow: network === n.id ? `0 8px 24px -4px ${n.color}66` : 'none',
                                    transform: network === n.id ? 'translateY(-2px)' : 'none'
                                }}>
                                    {n.name}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div style={{ position: 'relative', marginBottom: 20 }}>
                            <Search size={18} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
                            <input
                                type="text"
                                placeholder="Search plans..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%', padding: '14px 14px 14px 50px', borderRadius: 14,
                                    border: '2px solid #f1f5f9', outline: 'none', boxSizing: 'border-box',
                                    fontWeight: 600, fontSize: 14, background: '#f8fafc', color: '#0f172a',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={e => { e.target.style.borderColor = '#818cf8'; e.target.style.background = '#fff'; }}
                                onBlur={e => { e.target.style.borderColor = '#f1f5f9'; e.target.style.background = '#f8fafc'; }}
                            />
                        </div>
                    </div>

                    {/* Package Grid */}
                    <div style={{ padding: '0 32px', maxHeight: 320, overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '60px 0', color: '#94a3b8' }}>
                                <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                <span style={{ fontWeight: 700 }}>Loading plans...</span>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontWeight: 700 }}>No plans found.</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, paddingBottom: 8 }}>
                                {filtered.map(p => {
                                    const sel = selectedPackage?.key === p.key;
                                    return (
                                        <div key={p.key} onClick={() => setSelectedPackage(p)} style={{
                                            padding: '18px 16px', borderRadius: 18, cursor: 'pointer',
                                            border: sel ? `2.5px solid ${currentNet.color}` : '2px solid #f1f5f9',
                                            background: sel ? currentNet.bg : '#fafafa',
                                            color: sel ? currentNet.textColor : '#0f172a',
                                            transition: 'all 0.18s',
                                            boxShadow: sel ? `0 8px 24px -4px ${currentNet.color}55` : '0 2px 8px rgba(0,0,0,0.04)',
                                            transform: sel ? 'scale(1.03)' : 'scale(1)',
                                            position: 'relative'
                                        }}>
                                            {sel && (
                                                <CheckCircle2 size={16} style={{ position: 'absolute', top: 10, right: 10, opacity: 0.9 }} />
                                            )}
                                            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>{p.name}</div>
                                            <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>₵{p.price.toFixed(2)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Phone + Buy Section */}
                    <div style={{ padding: '24px 32px 32px' }}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 10 }}>
                                Recipient Phone Number
                            </label>
                            <input
                                type="tel"
                                inputMode="numeric"
                                placeholder="0240 000 000"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                style={{
                                    width: '100%', padding: '18px 24px', borderRadius: 16,
                                    border: '2px solid #f1f5f9', outline: 'none', boxSizing: 'border-box',
                                    fontSize: 22, fontWeight: 800, letterSpacing: '0.1em',
                                    textAlign: 'center', color: '#0f172a', background: '#f8fafc',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={e => { e.target.style.borderColor = `${currentNet.color}`; e.target.style.background = '#fff'; }}
                                onBlur={e => { e.target.style.borderColor = '#f1f5f9'; e.target.style.background = '#f8fafc'; }}
                            />
                        </div>

                        {/* Summary pill */}
                        {selectedPackage && (
                            <div style={{
                                background: '#f8fafc', borderRadius: 14, padding: '14px 20px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                marginBottom: 20, border: '1px solid #e2e8f0'
                            }}>
                                <div>
                                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>Selected Plan</div>
                                    <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a' }}>{currentNet.name} {selectedPackage.name}</div>
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 900, color: '#4f46e5' }}>₵{selectedPackage.price.toFixed(2)}</div>
                            </div>
                        )}

                        {/* Message */}
                        {message.text && (
                            <div style={{
                                padding: '14px 18px', borderRadius: 14, marginBottom: 20,
                                fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10,
                                background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                                color: message.type === 'success' ? '#16a34a' : '#dc2626',
                                border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                            }}>
                                {message.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                {message.text}
                            </div>
                        )}

                        {/* Buy Buttons */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => handleBuy('wallet')}
                                disabled={!canBuy}
                                style={{
                                    flex: 2, padding: '18px', borderRadius: 16, border: 'none',
                                    background: canBuy ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#e2e8f0',
                                    color: canBuy ? '#fff' : '#94a3b8', fontWeight: 800, fontSize: 15,
                                    cursor: canBuy ? 'pointer' : 'not-allowed',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    boxShadow: canBuy ? '0 8px 24px -4px rgba(79,70,229,0.5)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {buying
                                    ? <><RefreshCw size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Processing...</>
                                    : (platformSettings?.isMaintenanceMode ? <><Ban size={18} /> Locked</> : <><Wallet size={18} /> Pay with Wallet</>)
                                }
                            </button>
                            <button
                                onClick={() => handleBuy('paystack')}
                                disabled={!canBuy}
                                style={{
                                    flex: 1, padding: '18px', borderRadius: 16,
                                    border: '2px solid #e2e8f0', background: '#fff',
                                    color: canBuy ? '#0f172a' : '#cbd5e1', fontWeight: 800,
                                    fontSize: 14, cursor: canBuy ? 'pointer' : 'not-allowed',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Zap size={16} color={canBuy ? '#f59e0b' : '#cbd5e1'} /> Card
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Link to="/orders" style={{
                        background: '#fff', borderRadius: 20, padding: '20px 24px',
                        textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9'
                    }}>
                        <div>
                            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>View All</div>
                            <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>My Orders</div>
                        </div>
                        <div style={{ background: '#eef2ff', borderRadius: 12, padding: 12 }}>
                            <ShoppingCart size={20} color="#4f46e5" />
                        </div>
                    </Link>
                    <Link to="/wallet" style={{
                        background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 20, padding: '20px 24px',
                        textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        boxShadow: '0 8px 24px -4px rgba(15,23,42,0.3)'
                    }}>
                        <div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 700, marginBottom: 4 }}>Top Up</div>
                            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>Add Funds</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12 }}>
                            <Plus size={20} color="#fff" />
                        </div>
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
                .pulse-dot { animation: pulse 2s infinite ease-in-out; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
            `}</style>
        </div>
    );
};

export default Dashboard;
