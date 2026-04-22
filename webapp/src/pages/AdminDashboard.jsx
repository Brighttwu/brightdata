import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Users, ShoppingBag, DollarSign, Wallet, ShieldAlert, Ban, PlusCircle, MinusCircle, Search, Store, ExternalLink, Power, Settings as SettingsIcon, Bell, Truck, Save, Smartphone, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
    const [searchParams] = useSearchParams();
    const tab = searchParams.get('tab') || 'stats';
    const [stats, setStats] = useState({ 
        totalUsers: 0, totalAgents: 0, totalOrders: 0, totalEarnings: 0, 
        totalWalletBalance: 0, adminProfit: 0, agentProfit: 0, apiBalance: 0 
    });
    const [statsDays, setStatsDays] = useState(1);
    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    // ... rest of state
    const [pricingRules, setPricingRules] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [orders, setOrders] = useState([]);
    const [reportedOrders, setReportedOrders] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [packages, setPackages] = useState([]);
    const [selectedNetwork, setSelectedNetwork] = useState('mtn');
    const [loading, setLoading] = useState(true);
    const [editModal, setEditModal] = useState(null); 
    const [modalInputs, setModalInputs] = useState({ normal: '', retail: '', apiUserPrice: '' });
    
    // Analysis State
    const [analysisData, setAnalysisData] = useState(null);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello Boss! I've analyzed your platform's data for the last 30 days. How can I help you today?" }
    ]);
    const [analysisInput, setAnalysisInput] = useState('');
    const chatEndRef = React.useRef(null);
    
    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Platform Settings State
    const [platformSettings, setPlatformSettings] = useState({
        globalNotification: '',
        deliveryStatus: 'fast',
        communityLink: '',
        isMaintenanceMode: false
    });
    const [settingsLoading, setSettingsLoading] = useState(false);

    // Manual verification
    const [verifyRef, setVerifyRef] = useState('');
    const [verifyLoading, setVerifyLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Statistics
            if (tab === 'stats') {
                const res = await api.get(`/admin/stats?days=${statsDays}`);
                setStats(res.data);
            } 
            // Users
            else if (tab === 'users') {
                const res = await api.get('/admin/users');
                setUsers(res.data);
            } 
            // ... (rest of fetchData logic is same, just ensure dependencies include statsDays)
            else if (tab === 'pricing') {
                const rulesRes = await api.get('/admin/pricing');
                setPricingRules(rulesRes.data);
                const pkgRes = await api.get(`/data/packages/${selectedNetwork}`);
                const raw = pkgRes.data.packages || pkgRes.data || [];
                const mapped = raw.map(p => ({
                    key: (p.package_key || p.key || p.id || '').toString().trim(),
                    name: p.display_name || p.name,
                    apiPrice: Number(p.price)
                })).sort((a,b) => a.apiPrice - b.apiPrice);
                setPackages(mapped);
            } 
            else if (tab === 'transactions') {
                const res = await api.get('/admin/transactions');
                setTransactions(res.data);
            } 
            else if (tab === 'orders') {
                const res = await api.get('/admin/orders');
                setOrders(res.data);
            }
            else if (tab === 'reports') {
                const res = await api.get('/admin/reported-orders');
                setReportedOrders(res.data);
            }
            else if (tab === 'withdrawals') {
                const res = await api.get('/admin/withdrawals');
                setWithdrawals(res.data);
            }
            else if (tab === 'stores') {
                const res = await api.get('/admin/stores');
                setStores(res.data);
            }
            else if (tab === 'settings') {
                const res = await api.get('/admin/settings');
                setPlatformSettings(res.data);
            }
            else if (tab === 'analysis') {
                const res = await api.get('/admin/analysis');
                setAnalysisData(res.data);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [tab, selectedNetwork, statsDays]);

    useEffect(() => {
        fetchData();
    }, [tab, statsDays, selectedNetwork]);

    const handleRefresh = () => fetchData();

    const handleBlock = async (id) => {
        try {
            await api.post(`/admin/user-block/${id}`, {});
            fetchData();
        } catch (err) { alert('Action failed'); }
    };

    const handleBalance = async (id, action) => {
        const amount = prompt(`Amount to ${action}:`);
        if (!amount || isNaN(amount)) return;
        try {
            await api.post(`/admin/user-balance/${id}`, { amount, action });
            fetchData();
        } catch (err) { alert('Action failed'); }
    };

    const handleRoleChange = async (id, role) => {
        try {
            await api.post(`/admin/user-role/${id}`, { role });
            fetchData();
        } catch (err) { alert('Action failed'); }
    };

    const handleResolveWithdrawal = async (id, action) => {
        const note = prompt(`Optional note for ${action}:`);
        try {
            await api.post(`/admin/resolve-withdrawal/${id}`, { action, note });
            fetchData();
        } catch (err) { alert('Action failed'); }
    };

    const handleStoreStatus = async (id) => {
        try {
            await api.post(`/admin/store-status/${id}`);
            fetchData();
        } catch (err) { alert('Action failed'); }
    };

    const handleEditPriceBtn = (pkg) => {
        const p = pricingRules.find(x => 
            (x.network || '').toLowerCase() === selectedNetwork.toLowerCase() && 
            (x.packageKey || '').toString().trim().toLowerCase() === pkg.key.toLowerCase()
        ) || {};
        
        setEditModal(pkg);
        setModalInputs({
            normal: p.normalPrice || pkg.apiPrice || '',
            retail: p.retailPrice || pkg.apiPrice || '',
            apiUserPrice: p.apiUserPrice || pkg.apiPrice || ''
        });
    };

    const savePrice = async () => {
        if (!editModal || !editModal.key) return;
        try {
            await api.post('/admin/pricing', { 
                network: selectedNetwork, 
                packageKey: editModal.key.toString().trim(), 
                normalPrice: Number(modalInputs.normal), 
                retailPrice: Number(modalInputs.retail),
                apiUserPrice: Number(modalInputs.apiUserPrice)
            });
            
            setEditModal(null);
            alert('Pricing updated successfully!');
        } catch (err) { 
            alert('Error: ' + (err.response?.data?.message || 'Update failed')); 
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSettingsLoading(true);
        try {
            await api.post('/admin/settings', platformSettings);
            alert('Settings updated successfully!');
        } catch (err) {
            alert('Update failed');
        } finally {
            setSettingsLoading(false);
        }
    };

    const [isAiTyping, setIsAiTyping] = useState(false);
    const handleSendMessage = async (e) => {
        e.preventDefault();
        const userMsg = analysisInput.trim();
        if (!userMsg) return;

        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setAnalysisInput('');
        setIsAiTyping(true);

        try {
            const res = await api.post('/admin/chat', { 
                message: userMsg, 
                history: messages,
                context: analysisData 
            });
            setMessages(prev => [...prev, { role: 'assistant', text: res.data.text }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry Boss, I'm having trouble connecting to my brain right now." }]);
        } finally {
            setIsAiTyping(false);
        }
    };

    useEffect(() => {
        if (tab === 'analysis') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, tab]);

    const cardStyle = {
        background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 72px)', padding: '24px 16px' }}>
            {/* Common Modal for Pricing */}
            {editModal && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    padding: 20
                }}>
                    <div style={{ 
                        background: '#fff', padding: 32, borderRadius: 24, width: '100%', maxWidth: 440,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <div style={{ fontWeight: 900, fontSize: 20, color: '#0f172a', marginBottom: 8 }}>Edit Pricing</div>
                        <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24, fontWeight: 700 }}>
                            {editModal.name} • {selectedNetwork.toUpperCase()}
                            <div style={{ color: '#10b981', marginTop: 6, fontSize: 13, fontWeight: 800 }}>
                                Bossu API Cost: ₵{Number(editModal.apiPrice || 0).toFixed(2)}
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Normal User Price (₵)</label>
                                <input 
                                    type="number" 
                                    value={modalInputs.normal}
                                    onChange={(e) => setModalInputs(prev => ({ ...prev, normal: e.target.value }))}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '2px solid #f1f5f9', outline: 'none', fontWeight: 700, fontSize: 16 }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Retail (Agent/Store) Price (₵)</label>
                                <input 
                                    type="number" 
                                    value={modalInputs.retail}
                                    onChange={(e) => setModalInputs(prev => ({ ...prev, retail: e.target.value }))}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '2px solid #f1f5f9', outline: 'none', fontWeight: 700, fontSize: 16 }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>API Developers Price (₵)</label>
                                <input 
                                    type="number" 
                                    value={modalInputs.apiUserPrice}
                                    onChange={(e) => setModalInputs(prev => ({ ...prev, apiUserPrice: e.target.value }))}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '2px solid #f1f5f9', outline: 'none', fontWeight: 700, fontSize: 16 }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                            <button onClick={() => setEditModal(null)} style={{ flex: 1, padding: '14px', borderRadius: 12, border: 'none', background: '#f1f5f9', color: '#64748b', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                            <button onClick={savePrice} style={{ flex: 1, padding: '14px', borderRadius: 12, border: 'none', background: '#4f46e5', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 900, color: '#0f172a' }}>
                        Admin <span style={{ color: '#4f46e5', textTransform: 'capitalize' }}>{tab}</span>
                        <button onClick={handleRefresh} style={{
                            marginLeft: 4, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                            background: '#fff', color: '#4f46e5', border: '1px solid #e2e8f0', borderRadius: 10,
                            fontWeight: 700, cursor: 'pointer', fontSize: 12
                        }}>
                            <RefreshCw size={12} /> Refresh
                        </button>
                    </div>
                    {tab === 'stats' && (
                        <select 
                            value={statsDays} 
                            onChange={(e) => setStatsDays(Number(e.target.value))}
                            style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 700, fontSize: 14, width: 'auto' }}
                            className="mobile-full-width"
                        >
                            <option value={1}>Last 24 Hours</option>
                            <option value={7}>Last 7 Days</option>
                            <option value={30}>Last 30 Days</option>
                        </select>
                    )}
                </div>

                {/* Statistics */}
                {tab === 'stats' && !loading && (
                    <>
                        <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                            <div style={cardStyle}>
                                <Users size={24} color="#6366f1" />
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginTop: 12 }}>Total Users / Agents</div>
                                <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>{stats.totalUsers} <span style={{ fontSize: 16, color: '#6366f1' }}>/ {stats.totalAgents}</span></div>
                            </div>
                            <div style={cardStyle}>
                                <Wallet size={24} color="#ec4899" />
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginTop: 12 }}>User Wallet Totals</div>
                                <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>₵{(stats.totalWalletBalance || 0).toFixed(2)}</div>
                            </div>
                            <div style={{ ...cardStyle, background: '#0f172a', color: '#fff' }}>
                                <ShieldAlert size={24} color="#4f46e5" />
                                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.6, marginTop: 12 }}>Provider API balance</div>
                                <div style={{ fontSize: 28, fontWeight: 900 }}>₵{(stats.apiBalance || 0).toFixed(2)}</div>
                            </div>
                        </div>

                        <div style={{ fontSize: 12, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 16, letterSpacing: '0.05em' }}>Profit Analytics ({statsDays === 1 ? '24h' : `${statsDays} days`})</div>
                        <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                            <div style={cardStyle}>
                                <ShoppingBag size={24} color="#10b981" />
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginTop: 12 }}>Admin Profit</div>
                                <div style={{ fontSize: 28, fontWeight: 900, color: '#10b981' }}>₵{(stats.adminProfit || 0).toFixed(2)}</div>
                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Revenue: ₵{(stats.totalEarnings || 0).toFixed(2)}</div>
                            </div>
                            <div style={cardStyle}>
                                <ShoppingBag size={24} color="#f59e0b" />
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginTop: 12 }}>Store Profits (Life-Time)</div>
                                <div style={{ fontSize: 28, fontWeight: 900, color: '#f59e0b' }}>₵{(stats.storeLifetimeProfit || 0).toFixed(2)}</div>
                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Total earned via shop sales</div>
                            </div>
                            <div style={cardStyle}>
                                <TrendingUp size={24} color="#8b5cf6" />
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginTop: 12 }}>Referral Profits (Life-Time)</div>
                                <div style={{ fontSize: 28, fontWeight: 900, color: '#8b5cf6' }}>₵{(stats.referralLifetimeProfit || 0).toFixed(2)}</div>
                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Total earned via referrals</div>
                            </div>
                            <div style={{ ...cardStyle, border: '1px solid #dcfce7', background: '#f0fdf4' }}>
                                <Wallet size={24} color="#16a34a" />
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginTop: 12 }}>Unpaid Store Commissions</div>
                                <div style={{ fontSize: 28, fontWeight: 900, color: '#16a34a' }}>₵{(stats.totalCommissionsOwed || 0).toFixed(2)}</div>
                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Owed to agents from shop sales</div>
                            </div>
                            <div style={{ ...cardStyle, border: '1px solid #ede9fe', background: '#f5f3ff' }}>
                                <Wallet size={24} color="#8b5cf6" />
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginTop: 12 }}>Unpaid Referral Balances</div>
                                <div style={{ fontSize: 28, fontWeight: 900, color: '#8b5cf6' }}>₵{(stats.totalReferralsOwed || 0).toFixed(2)}</div>
                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Owed to users from referrals</div>
                            </div>
                        </div>
                    </>
                )}

                {/* Analysis/Intelligence Tab Content */}
                {tab === 'analysis' && (
                    !analysisData ? (
                        <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8', fontWeight: 800 }}>Analyzing platform patterns...</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                <div style={cardStyle}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>Revenue (30D)</div>
                                    <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>₵{analysisData.summary.revenue.toFixed(2)}</div>
                                </div>
                                <div style={cardStyle}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>Profit (30D)</div>
                                    <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981', marginTop: 4 }}>₵{analysisData.summary.profit.toFixed(2)}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="mobile-stack">
                                <div style={cardStyle}>
                                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Top Products</div>
                                    {analysisData.topProducts.map((p, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                                            <div style={{ fontWeight: 700, fontSize: 13 }}>{p._id.name}</div>
                                            <div style={{ fontWeight: 800, fontSize: 13, color: '#10b981' }}>₵{p.revenue.toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={cardStyle}>
                                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Top Customers</div>
                                    {analysisData.topUsers.map((u, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                                            <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                                            <div style={{ fontWeight: 800, fontSize: 13 }}>₵{u.totalSpent.toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Analysis Chat */}
                            <div style={{ ...cardStyle, background: '#0f172a', color: '#fff', padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <Sparkles size={20} color="#4f46e5" />
                                    <div style={{ fontWeight: 900, fontSize: 16 }}>Intelligence Assistant</div>
                                </div>
                                <div style={{ height: 300, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }} className="hide-scrollbar">
                                    {messages.map((m, i) => (
                                        <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                            <div style={{ 
                                                padding: '12px 16px', borderRadius: 16, fontSize: 13, fontWeight: 600,
                                                background: m.role === 'user' ? '#4f46e5' : 'rgba(255,255,255,0.1)',
                                                color: '#fff'
                                            }}>{m.text}</div>
                                        </div>
                                    ))}
                                    {isAiTyping && (
                                        <div style={{ alignSelf: 'flex-start', color: '#94a3b8', fontSize: 11, fontWeight: 700, fontStyle: 'italic', paddingLeft: 8 }}>
                                            BrightData AI is thinking...
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                                <form onSubmit={handleSendMessage} style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 8 }}>
                                    <input 
                                        type="text" 
                                        disabled={isAiTyping}
                                        value={analysisInput}
                                        onChange={e => setAnalysisInput(e.target.value)}
                                        placeholder={isAiTyping ? "Thinking..." : "Ask about sales, trends, or customers..."}
                                        style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, outline: 'none' }}
                                    />
                                    <button disabled={isAiTyping} type="submit" style={{ padding: '0 24px', borderRadius: 10, background: isAiTyping ? '#475569' : '#4f46e5', color: '#fff', border: 'none', fontWeight: 800, cursor: isAiTyping ? 'not-allowed' : 'pointer' }}>
                                        {isAiTyping ? '...' : 'Ask'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )
                )}

                {/* Search & Global Filter UI (Visible on lists) */}
                {['users', 'transactions', 'orders', 'reports', 'withdrawals'].includes(tab) && (
                    <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', gap: 12 }} className="mobile-stack">
                            <div style={{ position: 'relative', flex: 1 }} className="mobile-full-width">
                                <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input 
                                    type="text" 
                                    placeholder={`Search ${tab}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ 
                                        width: '100%', padding: '14px 14px 14px 48px', borderRadius: 16, 
                                        border: '1px solid #e2e8f0', background: '#fff', fontSize: 14, fontWeight: 700,
                                        outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Management */}
                {tab === 'users' && !loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {users.filter(u => 
                            u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map(u => (
                            <div key={u._id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }} className="admin-list-card">
                                <div>
                                    <div style={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                        {u.name} 
                                        <select 
                                            value={u.role} 
                                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                            style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 700 }}
                                        >
                                            <option value="user">User</option>
                                            <option value="agent">Agent</option>
                                            <option value="store">Store</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                                        {u.email} {u.phoneNumber && <span style={{ marginLeft: 8, color: '#4f46e5', fontWeight: 700 }}>• {u.phoneNumber}</span>}
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 900, color: '#4f46e5', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                        <span>Wallet: ₵{(u.balance || 0).toFixed(2)}</span>
                                        <span style={{ color: '#10b981' }}>Total Spent: ₵{(u.totalSpent || 0).toFixed(2)}</span>
                                        <span>Profit: ₵{(u.commissionBalance || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }} className="mobile-full-width">
                                    <button onClick={() => handleBalance(u._id, 'add')} style={{ flex: 1, border: 'none', background: '#f0fdf4', color: '#16a34a', padding: '10px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Add ₵</button>
                                    <button onClick={() => handleBlock(u._id)} style={{ flex: 1, border: 'none', background: u.isBlocked ? '#0f172a' : '#f1f5f9', color: u.isBlocked ? '#fff' : '#64748b', padding: '10px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                        {u.isBlocked ? 'Unblock' : 'Block'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pricing Management */}
                {tab === 'pricing' && !loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, margin: '0 -4px', padding: '0 4px' }} className="hide-scrollbar">
                            {['mtn', 'telecel', 'at'].map(net => (
                                <button key={net} 
                                    onClick={() => setSelectedNetwork(net)}
                                    style={{
                                        padding: '10px 20px', borderRadius: 10, fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer',
                                        border: selectedNetwork === net ? '2px solid #4f46e5' : '2px solid transparent',
                                        background: selectedNetwork === net ? '#eef2ff' : '#fff',
                                        color: selectedNetwork === net ? '#4f46e5' : '#64748b',
                                        flex: '1 0 auto', textAlign: 'center'
                                    }}>
                                    {net}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {packages.map(pkg => (
                                <div key={pkg.key} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', gap: 12 }} className="admin-list-card">
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 900, fontSize: 16, color: '#0f172a' }}>
                                            {pkg.name} <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>ID: {pkg.key}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                                            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Bossu Cost: ₵{(pkg.apiPrice || 0).toFixed(2)}</span>
                                            {(() => {
                                                 const rule = pricingRules.find(x => 
                                                     (x.packageKey || '').toString().trim().toLowerCase() === (pkg.key || '').toLowerCase() && 
                                                     (x.network || '').toLowerCase() === (selectedNetwork || '').toLowerCase()
                                                 );
                                                 return rule ? (
                                                     <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                                         <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 800 }}>User: ₵{rule.normalPrice || 0}</span>
                                                         <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 800 }}>Retail: ₵{rule.retailPrice || 0}</span>
                                                         <span style={{ fontSize: 13, color: '#4f46e5', fontWeight: 800 }}>API: ₵{rule.apiUserPrice || 0}</span>
                                                     </div>
                                                 ) : <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700 }}>Not Set</span>;
                                             })()}
                                         </div>
                                     </div>
                                     <button className="mobile-full-width" onClick={() => handleEditPriceBtn(pkg)} style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Adjust</button>
                                 </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Transactions Management */}
                {tab === 'transactions' && !loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        
                        {/* Manual Verification Tool */}
                        <div style={{ ...cardStyle, background: '#0f172a', color: '#fff' }}>
                            <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ShieldAlert size={20} color="#4f46e5" /> Manual Payment Verification
                            </div>
                            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
                                Force verify a hung Paystack transaction using its reference ID (BH_, BD_PAY_, or STORE_).
                            </div>
                            <div style={{ display: 'flex', gap: 12 }} className="mobile-stack">
                                <input 
                                    type="text" 
                                    placeholder="Enter reference ID" 
                                    value={verifyRef}
                                    onChange={e => setVerifyRef(e.target.value)}
                                    style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none', outline: 'none', fontWeight: 700 }}
                                    className="mobile-full-width"
                                />
                                <button 
                                    disabled={verifyLoading || !verifyRef.trim()}
                                    onClick={async () => {
                                        setVerifyLoading(true);
                                        try {
                                            const ref = verifyRef.trim();
                                            let endpoint = '';
                                            if (ref.startsWith('BH_')) endpoint = `/payment/verify/${ref}`;
                                            else if (ref.startsWith('BD_PAY_')) endpoint = `/data/buy-paystack-verify/${ref}`;
                                            else if (ref.startsWith('STORE_')) endpoint = `/agent/public/verify/${ref}`;
                                            else throw new Error('Unknown reference format. Must start with BH_, BD_PAY_, or STORE_');
                                    
                                            const res = await api.get(endpoint);
                                            alert(res.data.message || 'Payment verified successfully!');
                                            setVerifyRef('');
                                            fetchData();
                                        } catch (err) {
                                            alert(err.response?.data?.message || err.message || 'Verification failed');
                                        } finally {
                                            setVerifyLoading(false);
                                        }
                                    }}
                                    style={{ 
                                        padding: '12px 24px', borderRadius: 10, border: 'none', 
                                        background: verifyLoading ? '#475569' : '#4f46e5', 
                                        color: '#fff', fontWeight: 800, cursor: verifyLoading ? 'not-allowed' : 'pointer'
                                    }}
                                    className="mobile-full-width"
                                >
                                    {verifyLoading ? '...' : 'Verify'}
                                </button>
                            </div>
                        </div>

                        {transactions.filter(tx => 
                            tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            tx.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tx.reference?.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map(tx => (
                            <div key={tx._id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{tx.description}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>
                                        {tx.user?.email} • {new Date(tx.createdAt).toLocaleString()} • 
                                        <span style={{ fontWeight: 700, color: tx.status === 'success' ? '#16a34a' : (tx.status === 'pending' ? '#f59e0b' : '#dc2626') }}> {tx.status.toUpperCase()}</span>
                                    </div>
                                    {tx.status === 'pending' && tx.reference?.startsWith('BH_') && (
                                        <button 
                                            onClick={async () => {
                                                try {
                                                    const res = await api.get(`/payment/verify/${tx.reference}`);
                                                    alert(res.data.message || 'Verified!');
                                                    fetchData();
                                                } catch (e) {
                                                    alert('Verification failed: ' + (e.response?.data?.message || e.message));
                                                }
                                            }}
                                            style={{ marginTop: 8, padding: '4px 10px', borderRadius: 6, border: 'none', background: '#f59e0b', color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                                        >
                                            Verify Transaction
                                        </button>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right', fontWeight: 900, color: tx.type === 'deposit' ? '#16a34a' : '#0f172a' }}>
                                    {tx.type === 'deposit' ? '+' : '-'}₵{(tx.amount || 0).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Orders Management */}
                {tab === 'orders' && !loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Manage all customer orders</div>
                            <button 
                                onClick={async () => {
                                    if (window.confirm('Sync all pending orders with Bossu API?')) {
                                        setLoading(true);
                                        try {
                                            const res = await api.post('/admin/sync-orders');
                                            alert(res.data.message);
                                            fetchData();
                                        } catch (e) { alert('Sync failed'); setLoading(false); }
                                    }
                                }}
                                style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
                                className="mobile-full-width"
                            >
                                Sync with Bossu
                            </button>
                        </div>
                        {orders.filter(o => {
                            const matchesSearch = o.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                                o.phoneNumber?.includes(searchTerm) ||
                                                o.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                o.externalReference?.toLowerCase().includes(searchTerm.toLowerCase());
                            const matchesFilter = statusFilter === 'all' || o.status === statusFilter;
                            return matchesSearch && matchesFilter;
                        }).map(o => {
                            const statusColor = o.status === 'completed' ? '#16a34a' : (o.status === 'failed' ? '#dc2626' : (o.status === 'pending_payment' ? '#f59e0b' : '#d97706'));
                            return (
                                <div key={o._id} className="admin-list-card" style={{ 
                                    ...cardStyle, borderLeft: `5px solid ${statusColor}`, 
                                    display: 'flex', flexDirection: 'column', gap: 12 
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <span style={{
                                                    background: '#f1f5f9', color: '#475569', fontWeight: 800, fontSize: 10,
                                                    padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase'
                                                }}>{o.network}</span>
                                                <span style={{ 
                                                    fontWeight: 800, padding: '2px 8px', borderRadius: 6, fontSize: 10,
                                                    background: o.source === 'store' ? '#f0fdf4' : (o.source === 'api' ? '#eef2ff' : '#f8fafc'),
                                                    color: o.source === 'store' ? '#16a34a' : (o.source === 'api' ? '#4f46e5' : '#64748b'),
                                                    textTransform: 'uppercase'
                                                }}>{o.source || 'dashboard'}</span>
                                            </div>
                                            <div style={{ fontWeight: 900, fontSize: 18, color: '#0f172a' }}>{o.packageName}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 900, fontSize: 18, color: '#4f46e5' }}>₵{(o.amount || 0).toFixed(2)}</div>
                                            <div style={{ fontSize: 11, fontWeight: 800, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                                                {o.status === 'pending' ? 'PROCESSING' : o.status.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                                        <div>
                                            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>User Account</div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', wordBreak: 'break-all' }}>{o.user?.email}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>Recipient Number</div>
                                            <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>{o.phoneNumber}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>Order Time</div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>{new Date(o.createdAt).toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Ref: {o.externalReference}</div>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <select 
                                                value={o.status} 
                                                onChange={async (e) => {
                                                    const newStatus = e.target.value;
                                                    try {
                                                        await api.post(`/admin/order-status/${o._id}`, { status: newStatus });
                                                        alert(`Order updated to ${newStatus}`);
                                                        handleRefresh();
                                                    } catch (err) { alert('Failed to update status'); }
                                                }}
                                                style={{ padding: '6px', borderRadius: 6, fontSize: 11, fontWeight: 700, border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', color: '#0f172a' }}
                                            >
                                                <option value="pending_payment">Pending Payment</option>
                                                <option value="pending">Processing</option>
                                                <option value="completed">Completed</option>
                                                <option value="failed">Failed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        {o.status === 'pending_payment' && (
                                            <button 
                                                onClick={async () => {
                                                    const ref = o.externalReference;
                                                    let endpoint = '';
                                                    if (ref.startsWith('BD_PAY_')) endpoint = `/data/buy-paystack-verify/${ref}`;
                                                    else if (ref.startsWith('STORE_')) endpoint = `/agent/public/verify/${ref}`;
                                                    
                                                    if (!endpoint) return alert('Cannot verify this order type automatically.');
                                                    
                                                    try {
                                                        const res = await api.get(endpoint);
                                                        alert(res.data.message || 'Verified!');
                                                        handleRefresh();
                                                    } catch (e) {
                                                        alert('Verification failed: ' + (e.response?.data?.message || e.message));
                                                    }
                                                }}
                                                style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#f59e0b', color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 6px rgba(245,158,11,0.3)' }}
                                            >
                                                Verify Payment
                                            </button>
                                        )}
                                        </div>
                                    </div>
                                    {o.isReported && <div style={{ marginTop: 4, padding: '8px 12px', background: '#fef2f2', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#dc2626', border: '1px solid #fecaca' }}>⚠ Reported: {o.reportReason}</div>}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Reports Management */}
                {tab === 'reports' && !loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {reportedOrders.length === 0 ? (
                            <div style={{ ...cardStyle, padding: 48, textAlign: 'center' }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 18 }}>No reported orders</div>
                            </div>
                        ) : reportedOrders.filter(o => 
                            o.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            o.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            o.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map(o => (
                            <div key={o._id} className="admin-list-card" style={{ ...cardStyle, border: '1.5px solid #fecaca' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                                    <div>
                                        <div style={{ fontWeight: 900, fontSize: 17 }}>{o.network?.toUpperCase()} {o.packageName} — ₵{(o.amount || 0).toFixed(2)}</div>
                                        <div style={{ fontSize: 13, color: '#64748b' }}>User: {o.user?.name} ({o.user?.email})</div>
                                        <div style={{ fontSize: 13, color: '#0f172a', marginTop: 4, fontWeight: 700 }}>Recipient: {o.phoneNumber}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Ordered: {new Date(o.createdAt).toLocaleString()}</div>
                                        <div style={{ marginTop: 8, padding: '8px 12px', background: '#fef2f2', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#dc2626' }}>Issue: {o.reportReason}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={async () => {
                                            if (!window.confirm(`Refund ₵${(o.amount||0).toFixed(2)} to ${o.user?.name}?`)) return;
                                            try {
                                                await api.post(`/admin/resolve-report/${o._id}`, { action: 'refund' });
                                                fetchData();
                                            } catch (e) { alert('Refund failed'); }
                                        }} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Refund</button>
                                        <button onClick={async () => {
                                            try {
                                                await api.post(`/admin/resolve-report/${o._id}`, { action: 'dismiss' });
                                                fetchData();
                                            } catch (e) { alert('Action failed'); }
                                        }} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 800, cursor: 'pointer' }}>Dismiss</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Withdrawals Management */}
                {tab === 'withdrawals' && !loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {withdrawals.length === 0 ? (
                            <div style={{ ...cardStyle, padding: 48, textAlign: 'center' }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>💸</div>
                                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 18 }}>No payout requests</div>
                            </div>
                        ) : withdrawals.filter(w => 
                            w.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            w.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            w.paymentDetails?.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map(w => (
                            <div key={w._id} className="admin-list-card" style={{ ...cardStyle, border: w.status === 'pending' ? '1.5px solid #fcd34d' : '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                                    <div>
                                        <div style={{ fontWeight: 900, fontSize: 18, color: '#0f172a' }}>₵{w.amount.toFixed(2)}</div>
                                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Agent: <b>{w.user?.name}</b> ({w.user?.email})</div>
                                        <div style={{ fontSize: 13, color: '#4f46e5', fontWeight: 700, marginTop: 4 }}>Payout to: {w.paymentDetails}</div>
                                        <div style={{ 
                                            display: 'inline-block', marginTop: 8, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                                            background: w.status === 'pending' ? '#fef3c7' : w.status === 'approved' ? '#dcfce7' : '#fee2e2',
                                            color: w.status === 'pending' ? '#d97706' : w.status === 'approved' ? '#16a34a' : '#dc2626'
                                        }}>{w.status}</div>
                                        {w.adminNote && <div style={{ fontSize: 12, color: '#64748b', marginTop: 8, fontStyle: 'italic' }}>Note: {w.adminNote}</div>}
                                    </div>
                                    {w.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: 8 }} className="mobile-full-width">
                                            <button onClick={() => handleResolveWithdrawal(w._id, 'approved')} style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Mark Paid</button>
                                            <button onClick={() => handleResolveWithdrawal(w._id, 'rejected')} style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid #fee2e2', background: '#fff', color: '#ef4444', fontWeight: 800, cursor: 'pointer' }}>Reject</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stores Management */}
                {tab === 'stores' && !loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ marginBottom: 12, fontSize: 13, color: '#64748b', fontWeight: 700 }}>
                            Manage agent stores and disable their dashboards if needed.
                        </div>
                        {stores.filter(s => 
                            s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.agent?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.agent?.email?.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map(s => (
                            <div key={s._id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }} className="admin-list-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ 
                                        width: 48, height: 48, borderRadius: 12, background: '#f1f5f9', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' 
                                    }}>
                                        {s.logo ? <img src={s.logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Store size={24} color="#94a3b8" />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {s.name}
                                            <span style={{ fontSize: 11, background: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: 6 }}>/{s.slug}</span>
                                        </div>
                                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                                            Agent: <b>{s.agent?.name}</b> ({s.agent?.email})
                                        </div>
                                        <div style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: 11, fontWeight: 800, flexWrap: 'wrap' }}>
                                            <span style={{ color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: 6, border: '1px solid #dcfce7' }}>Sales: {s.totalSales || 0}</span>
                                            <span style={{ color: '#4f46e5', background: '#eff6ff', padding: '2px 8px', borderRadius: 6, border: '1px solid #dbeafe' }}>Store: ₵{(s.totalProfit || 0).toFixed(2)}</span>
                                            <span style={{ color: '#8b5cf6', background: '#f5f3ff', padding: '2px 8px', borderRadius: 6, border: '1px solid #ede9fe' }}>Referral: ₵{((s.lifetimeProfit || 0) - (s.totalProfit || 0)).toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 11, fontWeight: 800, flexWrap: 'wrap' }}>
                                            <span style={{ color: '#16a34a', background: '#fff', padding: '2px 8px', borderRadius: 6, border: '1.5px solid #dcfce7' }}>Avail-Comm: ₵{(s.agent?.commissionBalance || 0).toFixed(2)}</span>
                                            <span style={{ color: '#8b5cf6', background: '#fff', padding: '2px 8px', borderRadius: 6, border: '1.5px solid #ede9fe' }}>Avail-Ref: ₵{(s.agent?.referralBalance || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: 10 }} className="mobile-full-width">
                                    <a href={`${window.location.origin}/store/${s.slug}`} target="_blank" rel="noreferrer" style={{ 
                                        flex: 1, padding: '12px', borderRadius: 10, background: '#f8fafc', color: '#64748b', 
                                        border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                    }}>
                                        <ExternalLink size={18} />
                                    </a>
                                    <button 
                                        onClick={() => handleStoreStatus(s._id)}
                                        style={{ 
                                            flex: 3, padding: '12px 16px', borderRadius: 10, border: 'none', 
                                            background: s.isActive ? '#fef2f2' : '#f0fdf4', 
                                            color: s.isActive ? '#dc2626' : '#16a34a',
                                            fontWeight: 800, fontSize: 13, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                        }}
                                    >
                                        <Power size={16} />
                                        {s.isActive ? 'Disable' : 'Enable'}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {stores.length === 0 && (
                            <div style={{ ...cardStyle, padding: 60, textAlign: 'center' }}>
                                <div style={{ fontSize: 40, marginBottom: 16 }}>🏪</div>
                                <div style={{ fontWeight: 800, color: '#0f172a' }}>No agent stores found</div>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'settings' && !loading && (
                    <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 28, padding: 40, border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <SettingsIcon size={24} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0 }}>Platform Settings</h2>
                                <p style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Manage global notifications and delivery status</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>
                                    <Bell size={14} /> Global Notification
                                </label>
                                <textarea 
                                    rows="3"
                                    value={platformSettings.globalNotification}
                                    onChange={(e) => setPlatformSettings({...platformSettings, globalNotification: e.target.value})}
                                    placeholder="Enter message for all users..."
                                    style={{ width: '100%', padding: '16px 18px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 16, fontSize: 15, fontWeight: 600, color: '#0f172a', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>
                                    <Truck size={14} /> Delivery Speed Status
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                    {['fast', 'normal', 'slow'].map(speed => (
                                        <button 
                                            key={speed}
                                            type="button"
                                            onClick={() => setPlatformSettings({...platformSettings, deliveryStatus: speed})}
                                            style={{
                                                padding: '14px', borderRadius: 12, border: '2px solid',
                                                borderColor: platformSettings.deliveryStatus === speed ? (speed === 'fast' ? '#10b981' : (speed === 'normal' ? '#f59e0b' : '#ef4444')) : '#f1f5f9',
                                                background: platformSettings.deliveryStatus === speed ? (speed === 'fast' ? '#f0fdf4' : (speed === 'normal' ? '#fffbeb' : '#fef2f2')) : '#fff',
                                                color: platformSettings.deliveryStatus === speed ? (speed === 'fast' ? '#16a34a' : (speed === 'normal' ? '#d97706' : '#dc2626')) : '#64748b',
                                                fontWeight: 800, textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            {speed}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>
                                    <ExternalLink size={14} /> Community Link
                                </label>
                                <input 
                                    type="text"
                                    value={platformSettings.communityLink}
                                    onChange={(e) => setPlatformSettings({...platformSettings, communityLink: e.target.value})}
                                    placeholder="e.g. https://chat.whatsapp.com/..."
                                    style={{ width: '100%', padding: '16px 18px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 16, fontSize: 15, fontWeight: 600, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ ...cardStyle, border: platformSettings.isMaintenanceMode ? '2px solid #ef4444' : '1px solid #f1f5f9', background: platformSettings.isMaintenanceMode ? '#fef2f2' : '#f8fafc', padding: '20px', marginTop: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                    <Ban size={20} color={platformSettings.isMaintenanceMode ? "#ef4444" : "#64748b"} />
                                    <div style={{ fontSize: 16, fontWeight: 900, color: platformSettings.isMaintenanceMode ? '#dc2626' : '#0f172a' }}>Platform Lock (Maintenance)</div>
                                </div>
                                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16, fontWeight: 500 }}>
                                    When locked, all data purchases (including agent stores) will be disabled. 
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setPlatformSettings(p => ({ ...p, isMaintenanceMode: !p.isMaintenanceMode }))}
                                    style={{ 
                                        width: '100%', padding: '14px', borderRadius: 12, cursor: 'pointer',
                                        fontWeight: 800, fontSize: 13, transition: 'all 0.2s',
                                        background: platformSettings.isMaintenanceMode ? '#dc2626' : '#fff',
                                        color: platformSettings.isMaintenanceMode ? '#fff' : '#0f172a',
                                        border: platformSettings.isMaintenanceMode ? 'none' : '2px solid #e2e8f0',
                                        boxShadow: platformSettings.isMaintenanceMode ? '0 4px 12px rgba(220, 38, 38, 0.2)' : 'none'
                                    }}
                                >
                                    {platformSettings.isMaintenanceMode ? '🔒 UNLOCK PLATFORM' : '🔓 LOCK PLATFORM NOW'}
                                </button>
                            </div>

                            <button 
                                type="submit" 
                                disabled={settingsLoading}
                                style={{ 
                                    width: '100%', padding: '18px', borderRadius: 18, border: 'none', 
                                    background: '#0f172a', color: '#fff', fontWeight: 900, fontSize: 16, 
                                    cursor: settingsLoading ? 'not-allowed' : 'pointer', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, 
                                    marginTop: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' 
                                }}
                            >
                                {settingsLoading ? 'Applying...' : <><Save size={20} /> Save Platform Settings</>}
                            </button>
                        </form>
                    </div>
                )}

                {loading && <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8', fontWeight: 800 }}>Syncing...</div>}
            </div>
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                @media (max-width: 768px) {
                    .mobile-stack { flex-direction: column !important; }
                    .mobile-full-width { width: 100% !important; margin-bottom: 8px !important; }
                    .admin-grid { grid-template-columns: 1fr !important; }
                    .admin-list-card { flex-direction: column !important; align-items: stretch !important; padding: 16px !important; gap: 12px !important; }
                    .mobile-hide { display: none !important; }
                    .mobile-text-sm { fontSize: 13px !important; }
                    .home-cta-buttons { flex-direction: column; }
                    .mobile-header-stack { flex-direction: column; align-items: flex-start !important; gap: 12px !important; }
                    
                    /* Modal responsiveness */
                    .modal-container { padding: 16px !important; }
                    .modal-content { padding: 24px !important; width: 100% !important; border-radius: 20px !important; }

                    /* Pricing rule grid */
                    .pricing-card-stats { flex-direction: column !important; gap: 4px !important; }
                    
                    /* Fix button alignment */
                    .mobile-full-width button { width: 100% !important; }
                    
                    /* Form inputs */
                    input, select, textarea { font-size: 16px !important; width: 100% !important; box-sizing: border-box !important; }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
