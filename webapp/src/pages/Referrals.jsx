import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Link as LinkIcon, Copy, Gift, Wallet, ArrowUpRight, CheckCircle2, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';

import API_URL from '../api/config';

const Referrals = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [copied, setCopied] = useState(false);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_URL}/agent/referral-stats`, { headers });
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching referral stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const copyLink = () => {
        const link = `${window.location.origin}/register?ref=${stats?.referralCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        if (Number(amount) < 10) return setMessage({ type: 'error', text: 'Minimum withdrawal is ₵10.00' });
        
        setWithdrawLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await axios.post(`${API_URL}/agent/request-referral-withdrawal`, { amount: Number(amount) }, { headers });
            setMessage({ type: 'success', text: res.data.message });
            setAmount('');
            fetchStats();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Withdrawal failed' });
        } finally {
            setWithdrawLoading(false);
        }
    };

    if (loading) return (
        <div style={{ padding: 40, textAlign: 'center' }}>
            <RefreshCw className="animate-spin" size={32} color="#4f46e5" />
        </div>
    );

    return (
        <div style={{ padding: '24px 16px', maxWidth: 800, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
            
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Refer & Earn</h1>
                <p style={{ color: '#64748b', fontSize: 16, fontWeight: 500 }}>Invite your friends and earn <span style={{ color: '#10b981', fontWeight: 800 }}>1% commission</span> on every data bundle they buy—forever.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
                {/* Referral Balance Card */}
                <div style={{ background: '#4f46e5', borderRadius: 24, padding: 32, color: '#fff', boxShadow: '0 12px 32px rgba(79,70,229,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Wallet size={22} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>Earnings</span>
                    </div>
                    <div style={{ fontSize: 40, fontWeight: 900, marginBottom: 4 }}>₵{stats?.referralBalance?.toFixed(2) || '0.00'}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.7 }}>Available for withdrawal</div>
                </div>

                {/* Referral Count Card */}
                <div style={{ background: '#fff', borderRadius: 24, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={22} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Network</span>
                    </div>
                    <div style={{ fontSize: 40, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>{stats?.referralCount || 0}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>People referred by you</div>
                </div>
            </div>

            {/* Invite Section */}
            <div style={{ background: '#f8fafc', borderRadius: 28, padding: 32, border: '1px solid #e2e8f0', marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <Gift color="#4f46e5" size={24} />
                    <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>Spread the Word</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.05em' }}>Your Referral Link</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ flex: 1, background: '#fff', border: '2px solid #e2e8f0', borderRadius: 14, padding: '14px 18px', fontSize: 14, fontWeight: 700, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {stats?.referralCode ? `${window.location.origin}/register?ref=${stats.referralCode}` : '--- Generating Link ---'}
                            </div>
                            <button onClick={copyLink} disabled={!stats?.referralCode} style={{ padding: '0 20px', borderRadius: 14, border: 'none', background: copied ? '#10b981' : '#0f172a', color: '#fff', fontWeight: 800, cursor: (copied || !stats?.referralCode) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}>
                                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.05em' }}>Referral Code</label>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#fff', border: '2px dashed #4f46e5', borderRadius: 12, padding: '10px 20px', fontSize: 18, fontWeight: 900, color: '#4f46e5' }}>
                            {stats?.referralCode || '------'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Withdrawal Section */}
            <div style={{ background: '#fff', borderRadius: 28, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowUpRight size={24} />
                        </div>
                        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>Cash Out</h2>
                    </div>
                </div>

                {!user?.momoNumber ? (
                    <div style={{ padding: 20, background: '#fffbeb', borderRadius: 16, border: '1px solid #fed7aa', display: 'flex', gap: 12 }}>
                        <AlertCircle color="#f97316" />
                        <div>
                            <div style={{ fontWeight: 800, color: '#9a3412', marginBottom: 4 }}>MoMo Number Missing</div>
                            <div style={{ fontSize: 14, color: '#c2410c' }}>Please update your MoMo number in your profile to enable withdrawals.</div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ padding: 16, background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                                <Smartphone size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Payout Destination</div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{user.momoNumber} <span style={{ color: '#94a3b8', fontWeight: 500 }}>(Mobile Money)</span></div>
                            </div>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: '#94a3b8' }}>₵</div>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Amount to withdraw (Min ₵10)"
                                style={{ width: '100%', padding: '16px 16px 16px 40px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 16, fontWeight: 800, outline: 'none', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

                        {message.text && (
                            <div style={{ padding: '14px 16px', borderRadius: 14, fontSize: 14, fontWeight: 700, background: message.type === 'success' ? '#f0fdf4' : '#fef2f2', color: message.type === 'success' ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: 10 }}>
                                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                {message.text}
                            </div>
                        )}

                        <button type="submit" disabled={withdrawLoading || !amount} style={{ padding: '18px', borderRadius: 18, border: 'none', background: '#0f172a', color: '#fff', fontWeight: 900, fontSize: 16, cursor: (withdrawLoading || !amount) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                            {withdrawLoading ? <RefreshCw className="animate-spin" size={20} /> : 'Request Withdrawal'}
                        </button>
                    </form>
                )}
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default Referrals;
