import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Store, TrendingUp, DollarSign, ShoppingBag, Settings, AlertCircle,
    CheckCircle2, ChevronRight, Plus, Edit3, Wifi, ExternalLink, Copy, RefreshCw
} from 'lucide-react';

import API_URL from '../api/config';

const API = `${API_URL}/agent`;

const AgentPage = () => {
    const { user, updateBalance } = useAuth();
    const [tab, setTab] = useState('dashboard'); // dashboard | store | pricing | withdrawals
    const [dashboard, setDashboard] = useState({ profits: [], totalProfit: 0, totalSales: 0, store: null });
    const [packages, setPackages] = useState([]);
    const [selectedNetwork, setSelectedNetwork] = useState('mtn');
    const [storeForm, setStoreForm] = useState({ slug: '', name: '', description: '', whatsapp: '', groupLink: '', logo: '', theme: 'classic' });
    const [customPrices, setCustomPrices] = useState({});
    const [withdrawals, setWithdrawals] = useState([]);
    const [withdrawForm, setWithdrawForm] = useState({ amount: '', phone: '', network: 'mtn' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [upgrading, setUpgrading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [copiedLink, setCopiedLink] = useState(false);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const [justUpgraded, setJustUpgraded] = useState(false);
    
    const isAgent = user?.role === 'admin' || user?.role === 'agent' || user?.role === 'store' || justUpgraded;

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/dashboard`, { headers });
            setDashboard(res.data);
            if (res.data.store) {
                setStoreForm({
                    slug: res.data.store.slug || '',
                    name: res.data.store.name || '',
                    description: res.data.store.description || '',
                    whatsapp: res.data.store.whatsapp || '',
                    groupLink: res.data.store.groupLink || '',
                    logo: res.data.store.logo || '',
                    theme: res.data.store.theme || 'classic'
                });
                const priceMap = {};
                (res.data.store.customPrices || []).forEach(cp => {
                    priceMap[`${cp.network}-${(cp.packageKey||'').toLowerCase()}`] = cp.price;
                });
                setCustomPrices(priceMap);
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, [token]);

    const fetchWithdrawals = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/my-withdrawals`, { headers });
            setWithdrawals(res.data);
        } catch (err) { console.error(err); }
    }, [token]);

    const submitWithdrawal = async () => {
        if (!withdrawForm.amount || !withdrawForm.phone) return;
        if (Number(withdrawForm.amount) < 10) return setMessage({ type: 'error', text: 'Minimum withdrawal is ₵10.00' });
        
        setSaving(true);
        try {
            const combined = `${withdrawForm.network.toUpperCase()}: ${withdrawForm.phone}`;
            const res = await axios.post(`${API}/request-withdrawal`, { ...withdrawForm, paymentDetails: combined }, { headers });
            setMessage({ type: 'success', text: res.data.message });
            setWithdrawForm({ amount: '', phone: '', network: 'mtn' });
            fetchWithdrawals();
            window.location.reload(); 
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Withdrawal failed' });
        } finally { setSaving(false); }
    };

    const fetchPackages = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/data/packages/${selectedNetwork}`, { headers });
            const raw = res.data.packages || res.data || [];
            setPackages(Array.isArray(raw) ? raw.map(p => ({
                key: p.package_key || p.key || p.id || '',
                name: p.display_name || p.name,
                platformCost: Number(p.price)
            })).sort((a, b) => a.platformCost - b.platformCost) : []);
        } catch (err) { setPackages([]); }
    }, [selectedNetwork, token]);

    useEffect(() => { if (isAgent) fetchDashboard(); else setLoading(false); }, [isAgent, fetchDashboard]);
    useEffect(() => { if (tab === 'pricing' && isAgent) fetchPackages(); }, [tab, fetchPackages, isAgent]);
    useEffect(() => { if (tab === 'withdrawals' && isAgent) fetchWithdrawals(); }, [tab, fetchWithdrawals, isAgent]);

    const handleUpgrade = async () => {
        if (!window.confirm(`₵40 will be deducted from your wallet balance. Continue?`)) return;
        setUpgrading(true);
        try {
            const res = await axios.post(`${API}/upgrade`, {}, { headers });
            updateBalance(res.data.user.balance);
            setJustUpgraded(true);
            setMessage({ type: 'success', text: '🎉 Agent account activated!' });
            setTimeout(() => window.location.reload(), 800);
        } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Upgrade failed' }); } finally { setUpgrading(false); }
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) return setMessage({ type: 'error', text: 'Logo must be under 2MB' });
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setStoreForm(prev => ({ ...prev, logo: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const saveStore = async () => {
        if (!storeForm.slug || !storeForm.name) return setMessage({ type: 'error', text: 'Store name and URL are required.' });
        setSaving(true);
        try {
            await axios.post(`${API}/store`, storeForm, { headers });
            setMessage({ type: 'success', text: 'Store saved!' });
            fetchDashboard();
        } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Error saving store' }); } finally { setSaving(false); }
    };

    const savePrices = async () => {
        const invalidPrices = packages.filter(pkg => {
            const mapKey = `${selectedNetwork}-${pkg.key.toLowerCase()}`;
            const price = Number(customPrices[mapKey]);
            return price && price < pkg.platformCost;
        });
        if (invalidPrices.length > 0) return setMessage({ type: 'error', text: 'Some prices are too low.' });
        setSaving(true);
        const priceArr = packages.map(pkg => {
            const mapKey = `${selectedNetwork}-${pkg.key.toLowerCase()}`;
            const price = Number(customPrices[mapKey]);
            if (!price || price <= 0) return null;
            return { network: selectedNetwork, packageKey: pkg.key, packageName: pkg.name, price };
        }).filter(Boolean);
        try {
            await axios.post(`${API}/store/prices`, { customPrices: priceArr }, { headers });
            setMessage({ type: 'success', text: 'Prices updated!' });
        } catch (err) { setMessage({ type: 'error', text: 'Error saving prices' }); } finally { setSaving(false); }
    };

    const storeUrl = `${window.location.origin}/store/${dashboard.store?.slug}`;

    const copyStoreLink = () => {
        if (!dashboard.store?.slug) return;
        navigator.clipboard.writeText(storeUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };
    const networks = ['mtn', 'telecel', 'at'];

    const tabStyle = (t) => ({
        padding: '10px 20px', borderRadius: 10, border: 'none', fontWeight: 800,
        cursor: 'pointer', fontSize: 13, transition: 'all 0.2s',
        background: tab === t ? '#4f46e5' : '#fff',
        color: tab === t ? '#fff' : '#64748b',
        boxShadow: tab === t ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none'
    });

    const cardStyle = {
        background: '#fff', borderRadius: 20, padding: 24,
        border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
    };

    if (loading) return (
        <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={28} color="#4f46e5" style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!isAgent) return (
        <div style={{ background: '#f0f2f8', minHeight: 'calc(100vh - 72px)', padding: '24px 16px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: 620, margin: '0 auto' }}>
                <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 28, padding: '48px 40px', color: '#fff', textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>🏪</div>
                    <h1 style={{ fontSize: 30, fontWeight: 900, margin: '0 0 12px' }}>Become an Agent</h1>
                    <p style={{ fontSize: 16, opacity: 0.85, margin: '0 0 32px', lineHeight: 1.6 }}>Activate your store and start earning commission today.</p>
                    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '20px 24px', marginBottom: 32, backdropFilter: 'blur(10px)' }}>
                        <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 4 }}>Activation fee</div>
                        <div style={{ fontSize: 48, fontWeight: 900 }}>₵40</div>
                    </div>
                    <button onClick={handleUpgrade} disabled={upgrading || user?.balance < 40} style={{ padding: '18px 40px', borderRadius: 16, border: 'none', background: '#fff', color: '#4f46e5', fontWeight: 900, fontSize: 16, cursor: 'pointer', width: '100%' }}>Pay & Activate</button>
                    {message.text && <div style={{ marginTop: 20, color: '#fff', fontWeight: 700 }}>{message.text}</div>}
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ background: '#f0f2f8', minHeight: 'calc(100vh - 72px)', padding: '24px 16px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: 0 }}>Agent Dashboard</h1>
                        {dashboard.store && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                                <p style={{ fontSize: 13, color: '#64748b', fontWeight: 600, margin: 0 }}>
                                    Store: <a href={storeUrl} target="_blank" rel="noreferrer" style={{ color: '#4f46e5', textDecoration: 'none', borderBottom: '1.5px solid #4f46e5' }}>{storeUrl}</a>
                                </p>
                                <button onClick={copyStoreLink} style={{ 
                                    padding: '4px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', 
                                    background: copiedLink ? '#10b981' : '#fff', color: copiedLink ? '#fff' : '#64748b',
                                    fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s'
                                }}>
                                    {copiedLink ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                                    {copiedLink ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {message.text && (
                    <div style={{ padding: '14px 18px', borderRadius: 14, fontWeight: 700, fontSize: 14, background: message.type === 'success' ? '#f0fdf4' : '#fef2f2', color: message.type === 'success' ? '#16a34a' : '#dc2626', border: '1px solid #eee' }}>{message.text}</div>
                )}

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {[['dashboard', '📊 Stats'], ['store', '🏪 Setup'], ['pricing', '💰 Prices'], ['withdrawals', '💸 Withdraw']].map(([t, label]) => (
                        <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>{label}</button>
                    ))}
                </div>

                {tab === 'dashboard' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {!dashboard.store && (
                            <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: 20, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ fontSize: 32 }}>🏪</div>
                                <div style={{ flex: 1 }}><div style={{ fontWeight: 900, color: '#92400e' }}>Almost there!</div><div style={{ fontSize: 13, color: '#b45309' }}>Please set up your store name and URL to go live.</div></div>
                                <button onClick={() => setTab('store')} style={{ padding: '10px 18px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>Setup →</button>
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.8 }}>Commission Balance</div>
                                <div style={{ fontSize: 32, fontWeight: 900 }}>₵{(user?.commissionBalance || 0).toFixed(2)}</div>
                                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>Available for withdrawal</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>Total Profit</div>
                                <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>₵{dashboard.totalProfit.toFixed(2)}</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>Total Sales</div>
                                <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>{dashboard.totalSales}</div>
                            </div>
                        </div>
                        <div style={cardStyle}>
                            <div style={{ fontWeight: 900, fontSize: 18, color: '#0f172a', marginBottom: 16 }}>Recent Sales</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {dashboard.profits.map((p, i) => (
                                    <div key={i} style={{ padding: 14, background: '#f8fafc', borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div><div style={{ fontWeight: 800 }}>{p.network?.toUpperCase()} {p.packageName}</div><div style={{ fontSize: 12, color: '#64748b' }}>{p.customerPhone} • {new Date(p.createdAt).toLocaleDateString()}</div></div>
                                        <div style={{ fontWeight: 900, color: '#16a34a' }}>+₵{p.profit.toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'store' && (
                    <div style={cardStyle}>
                        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 20 }}>Store Settings</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                <input value={storeForm.name} onChange={e => setStoreForm(p => ({ ...p, name: e.target.value }))} placeholder="Store Name" style={{ padding: 14, borderRadius: 12, border: '2px solid #f1f5f9', outline: 'none', fontWeight: 700 }} />
                                <input value={storeForm.slug} onChange={e => setStoreForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} placeholder="store-url" style={{ padding: 14, borderRadius: 12, border: '2px solid #f1f5f9', outline: 'none', fontWeight: 700 }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                <input value={storeForm.whatsapp} onChange={e => setStoreForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="Support WhatsApp (e.g. 233...)" style={{ padding: 14, borderRadius: 12, border: '2px solid #f1f5f9', outline: 'none', fontWeight: 700 }} />
                                <input value={storeForm.groupLink} onChange={e => setStoreForm(p => ({ ...p, groupLink: e.target.value }))} placeholder="WhatsApp Community Group Link" style={{ padding: 14, borderRadius: 12, border: '2px solid #f1f5f9', outline: 'none', fontWeight: 700 }} />
                            </div>
                            <textarea value={storeForm.description} onChange={e => setStoreForm(p => ({ ...p, description: e.target.value }))} placeholder="Description..." rows={3} style={{ padding: 14, borderRadius: 12, border: '2px solid #f1f5f9', outline: 'none', fontWeight: 600 }} />
                            
                            <div style={{ marginTop: 10 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#64748b', marginBottom: 12, textTransform: 'uppercase' }}>Store Logo</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: '#f8fafc', padding: 20, borderRadius: 16, border: '2px dashed #e2e8f0' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: 16, background: '#fff', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {storeForm.logo ? <img src={storeForm.logo} alt="logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Store size={32} color="#94a3b8" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} id="logo-upload" />
                                        <label htmlFor="logo-upload" style={{ display: 'inline-block', padding: '10px 20px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontWeight: 800, color: '#0f172a', cursor: 'pointer' }}>Choose Image</label>
                                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>Square image, max 2MB</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ marginTop: 10 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#64748b', marginBottom: 12, textTransform: 'uppercase' }}>Store Theme</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                                    {[
                                        { id: 'classic', name: 'Classic Blue', color: '#4f46e5' },
                                        { id: 'modern', name: 'Vibrant Pink', color: '#ff0055' },
                                        { id: 'dark', name: 'Midnight Dark', color: '#0f172a' },
                                        { id: 'sunset', name: 'Golden Sunset', color: '#f59e0b' },
                                        { id: 'eco', name: 'Eco Green', color: '#059669' },
                                        { id: 'ocean', name: 'Ocean Blue', color: '#0284c7' },
                                        { id: 'luxury', name: 'Luxury Black', color: '#d4af37' }
                                    ].map(t => (
                                        <div key={t.id} onClick={() => setStoreForm(p => ({ ...p, theme: t.id }))} style={{
                                            padding: '12px', borderRadius: 16, border: storeForm.theme === t.id ? `2.5px solid ${t.color}` : '2.5px solid #f1f5f9',
                                            cursor: 'pointer', textAlign: 'center', background: storeForm.theme === t.id ? `${t.color}10` : '#fff', transiton: 'all 0.2s',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
                                        }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.color, border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                                            <div style={{ fontSize: 11, fontWeight: 800, color: storeForm.theme === t.id ? t.color : '#64748b' }}>{t.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button onClick={saveStore} disabled={saving} style={{ padding: 16, marginTop: 10, borderRadius: 14, background: '#4f46e5', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save Store'}</button>
                        </div>
                    </div>
                )}

                {tab === 'pricing' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', gap: 10 }}>{networks.map(n => <button key={n} onClick={() => setSelectedNetwork(n)} style={{ padding: '8px 20px', borderRadius: 10, border: 'none', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer', background: selectedNetwork === n ? '#4f46e5' : '#fff', color: selectedNetwork === n ? '#fff' : '#64748b' }}>{n}</button>)}</div>
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {packages.map(pkg => {
                                    const mk = `${selectedNetwork}-${pkg.key.toLowerCase()}`;
                                    const price = customPrices[mk] || '';
                                    return (
                                        <div key={pkg.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: '#f8fafc', borderRadius: 14 }}>
                                            <div style={{ flex: 1 }}><div style={{ fontWeight: 800 }}>{pkg.name}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>Cost: ₵{pkg.platformCost.toFixed(2)}</div></div>
                                            <input type="number" value={price} onChange={e => setCustomPrices(v => ({ ...v, [mk]: e.target.value }))} placeholder={pkg.platformCost} style={{ width: 100, padding: 10, borderRadius: 10, border: '2px solid #e2e8f0', fontWeight: 800, textAlign: 'center' }} />
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={savePrices} disabled={saving} style={{ marginTop: 20, width: '100%', padding: 16, borderRadius: 14, background: '#4f46e5', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}>Save Prices</button>
                        </div>
                    </div>
                )}

                {tab === 'withdrawals' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={cardStyle}>
                            <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>Request Payout</div>
                            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Minimum withdrawal is ₵10.00. Profits go here so your main balance stays clean.</div>
                            
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12 }}>Select Your Network</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {[
                                        { id: 'mtn', name: 'MTN', color: '#FFCC00' },
                                        { id: 'telecel', name: 'Telecel', color: '#E60000' },
                                        { id: 'at', name: 'AT', color: '#003399' }
                                    ].map(n => (
                                        <button key={n.id} onClick={() => setWithdrawForm(p => ({ ...p, network: n.id }))} style={{
                                            flex: 1, padding: '12px', borderRadius: 12, border: withdrawForm.network === n.id ? `2.5px solid ${n.color}` : '2px solid #f1f5f9',
                                            background: withdrawForm.network === n.id ? `${n.color}10` : '#fff', cursor: 'pointer', transition: 'all 0.2s',
                                            fontWeight: 800, color: withdrawForm.network === n.id ? n.color : '#64748b', fontSize: 13
                                        }}>{n.name}</button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>Amount (₵)</label>
                                    <input type="number" min="10" value={withdrawForm.amount} onChange={e => setWithdrawForm(p => ({ ...p, amount: e.target.value }))} placeholder="10.00" style={{ width: '100%', padding: 14, borderRadius: 12, border: '2px solid #f1f5f9', outline: 'none', fontWeight: 700, fontSize: 16, boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>Mobile Money Number</label>
                                    <input value={withdrawForm.phone} onChange={e => setWithdrawForm(p => ({ ...p, phone: e.target.value }))} placeholder="024XXXXXXX" style={{ width: '100%', padding: 14, borderRadius: 12, border: '2px solid #f1f5f9', outline: 'none', fontWeight: 700, fontSize: 16, boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <button onClick={submitWithdrawal} disabled={saving || !withdrawForm.amount || !withdrawForm.phone} style={{ width: '100%', padding: 16, borderRadius: 14, background: '#10b981', color: '#fff', fontWeight: 900, border: 'none', cursor: 'pointer' }}>Submit Request</button>
                        </div>

                        <div style={cardStyle}>
                            <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 16 }}>Payout History</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {withdrawals.map((w, i) => (
                                    <div key={i} style={{ padding: 16, background: '#f8fafc', borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: 15 }}>₵{w.amount.toFixed(2)}</div>
                                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{w.paymentDetails} • {new Date(w.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ 
                                            padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                                            background: w.status === 'pending' ? '#fef3c7' : w.status === 'approved' ? '#dcfce7' : '#fee2e2',
                                            color: w.status === 'pending' ? '#d97706' : w.status === 'approved' ? '#16a34a' : '#dc2626'
                                        }}>{w.status}</div>
                                    </div>
                                ))}
                                {withdrawals.length === 0 && <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8', fontWeight: 700 }}>No payouts yet.</div>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default AgentPage;
