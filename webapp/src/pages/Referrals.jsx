import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Users, Copy, Gift, Wallet, ArrowUpRight, CheckCircle2, AlertCircle, RefreshCw, Smartphone, TrendingUp, ShoppingBag, Star } from 'lucide-react';

const Referrals = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [copied, setCopied] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await api.get('/agent/referral-stats');
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching referral stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

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
            const res = await api.post('/agent/request-referral-withdrawal', { amount: Number(amount) });
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

    const referrals = stats?.referrals || [];

    // Color from first letter for avatars
    const avatarHue = (name) => ((name?.charCodeAt(0) || 65) * 5) % 360;

    return (
        <div style={{ padding: '24px 16px', maxWidth: 800, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Refer &amp; Earn</h1>
                <p style={{ color: '#64748b', fontSize: 16, fontWeight: 500 }}>
                    Invite your friends and earn{' '}
                    <span style={{ color: '#10b981', fontWeight: 800 }}>1% commission</span>{' '}
                    on every data bundle they buy—forever.
                </p>
            </div>

            {/* ── Stat Cards ────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
                <div style={{ background: '#4f46e5', borderRadius: 24, padding: 28, color: '#fff', boxShadow: '0 12px 32px rgba(79,70,229,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Wallet size={22} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>Earnings</span>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 4 }}>₵{stats?.referralBalance?.toFixed(2) || '0.00'}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.7 }}>Available for withdrawal</div>
                </div>

                <div style={{ background: '#fff', borderRadius: 24, padding: 28, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={22} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Total Earned</span>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>₵{(stats?.totalCommissionEarned || 0).toFixed(2)}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>All-time commission</div>
                </div>

                <div style={{ background: '#fff', borderRadius: 24, padding: 28, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={22} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Network</span>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>{stats?.referralCount || 0}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>People you've referred</div>
                </div>
            </div>

            {/* ── Invite Section ────────────────────────────────────── */}
            <div style={{ background: '#f8fafc', borderRadius: 28, padding: 32, border: '1px solid #e2e8f0', marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <Gift color="#4f46e5" size={24} />
                    <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>Spread the Word</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.05em' }}>Your Referral Link</label>
                        <div style={{ display: 'flex', gap: 8 }} className="mobile-stack">
                            <div style={{ flex: 1, background: '#fff', border: '2px solid #e2e8f0', borderRadius: 14, padding: '14px 18px', fontSize: 13, fontWeight: 700, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="mobile-full-width">
                                {stats?.referralCode ? `${window.location.origin}/register?ref=${stats.referralCode}` : '--- Generating Link ---'}
                            </div>
                            <button onClick={copyLink} disabled={!stats?.referralCode} className="mobile-full-width" style={{ padding: '14px 20px', borderRadius: 14, border: 'none', background: copied ? '#10b981' : '#0f172a', color: '#fff', fontWeight: 800, cursor: (copied || !stats?.referralCode) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}>
                                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                {copied ? 'Copied' : 'Copy link'}
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

            {/* ── Referral Network List ─────────────────────────────── */}
            <div style={{ background: '#fff', borderRadius: 28, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.03)', marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Star size={22} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>Your Referral Network</h2>
                        <p style={{ fontSize: 13, color: '#94a3b8', margin: '2px 0 0' }}>People who signed up using your link</p>
                    </div>
                </div>

                {referrals.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 16, marginBottom: 6 }}>No referrals yet</div>
                        <div style={{ color: '#94a3b8', fontSize: 14 }}>Share your link above to start earning commission!</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {/* Column headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 90px', gap: 8, padding: '8px 14px', borderRadius: 10, background: '#f8fafc' }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</span>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Orders</span>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Commission</span>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Joined</span>
                        </div>

                        {referrals.map((r, i) => (
                            <div key={r._id || i} style={{
                                display: 'grid', gridTemplateColumns: '1fr 80px 100px 90px', gap: 8,
                                padding: '13px 14px', borderRadius: 16,
                                background: i % 2 === 0 ? '#fafafa' : '#fff',
                                border: '1px solid #f1f5f9', alignItems: 'center'
                            }}>
                                {/* Avatar + name */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                        background: `hsl(${avatarHue(r.name)}, 55%, 90%)`,
                                        color: `hsl(${avatarHue(r.name)}, 55%, 35%)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 900, fontSize: 14
                                    }}>
                                        {(r.name || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                                </div>

                                {/* Orders badge */}
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f0f9ff', color: '#0284c7', borderRadius: 8, padding: '4px 8px', fontSize: 12, fontWeight: 800 }}>
                                        <ShoppingBag size={11} />
                                        {r.orderCount || 0}
                                    </span>
                                </div>

                                {/* Commission badge */}
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{
                                        display: 'inline-block', borderRadius: 8, padding: '4px 10px',
                                        fontSize: 12, fontWeight: 900,
                                        background: r.commissionEarned > 0 ? '#f0fdf4' : '#f8fafc',
                                        color: r.commissionEarned > 0 ? '#16a34a' : '#94a3b8'
                                    }}>
                                        ₵{(r.commissionEarned || 0).toFixed(2)}
                                    </span>
                                </div>

                                {/* Date */}
                                <div style={{ textAlign: 'right', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                                    {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                                </div>
                            </div>
                        ))}

                        {/* Totals row */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 80px 100px 90px', gap: 8,
                            padding: '13px 14px', borderRadius: 14, marginTop: 4,
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', alignItems: 'center'
                        }}>
                            <span style={{ fontSize: 13, fontWeight: 900 }}>TOTAL</span>
                            <span style={{ textAlign: 'center', fontSize: 13, fontWeight: 800 }}>
                                {referrals.reduce((s, r) => s + (r.orderCount || 0), 0)}
                            </span>
                            <span style={{ textAlign: 'center', fontSize: 14, fontWeight: 900 }}>
                                ₵{(stats?.totalCommissionEarned || 0).toFixed(2)}
                            </span>
                            <span />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Cash Out ─────────────────────────────────────────── */}
            <div style={{ background: '#fff', borderRadius: 28, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowUpRight size={24} />
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>Cash Out</h2>
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
                @media (max-width: 600px) {
                    .mobile-stack { flex-direction: column !important; }
                    .mobile-full-width { width: 100% !important; }
                }
            `}</style>
        </div>
    );
};

export default Referrals;
