import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Users, Copy, Gift, Wallet, ArrowUpRight, CheckCircle2, AlertCircle, RefreshCw, Smartphone, TrendingUp, ShoppingBag, Star } from 'lucide-react';

const Referrals = () => {
    const { user } = useAuth();
    const [showAll, setShowAll] = useState(false);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [accountName, setAccountName] = useState('');
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
        if (!accountName) return setMessage({ type: 'error', text: 'Account name is required' });
        setWithdrawLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await api.post('/agent/request-referral-withdrawal', { amount: Number(amount), accountName });
            setMessage({ type: 'success', text: res.data.message });
            setAmount('');
            setAccountName('');
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

    const fullReferrals = Array.isArray(stats?.referrals) ? stats.referrals : [];
    const referrals = showAll ? fullReferrals : fullReferrals.slice(0, 5);
    const avatarHue = (name) => ((String(name || '').charCodeAt(0) || 65) * 5) % 360;

    return (
        <div className="ref-page">

            {/* ── Header ────────────────────────────────────────────── */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>Refer &amp; Earn</h1>
                <p style={{ color: '#64748b', fontSize: 15, fontWeight: 500, margin: 0 }}>
                    Invite friends and earn{' '}
                    <span style={{ color: '#10b981', fontWeight: 800 }}>1% commission</span>{' '}
                    on every data bundle they buy—forever.
                </p>
            </div>

            {/* ── Stat Cards ────────────────────────────────────────── */}
            <div className="ref-stat-grid">
                {/* Balance */}
                <div style={{ background: '#4f46e5', borderRadius: 20, padding: '24px 22px', color: '#fff', boxShadow: '0 10px 28px rgba(79,70,229,0.28)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Wallet size={20} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.8 }}>Earnings</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 2 }}>₵{stats?.referralBalance?.toFixed(2) || '0.00'}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.7 }}>Available for withdrawal</div>
                </div>

                {/* Total earned */}
                <div style={{ background: '#fff', borderRadius: 20, padding: '24px 22px', border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={20} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>Total Earned</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginBottom: 2 }}>₵{(stats?.totalCommissionEarned || 0).toFixed(2)}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>All-time commission</div>
                </div>

                {/* Network count */}
                <div style={{ background: '#fff', borderRadius: 20, padding: '24px 22px', border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={20} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>Network</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginBottom: 2 }}>{stats?.referralCount || 0}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>People you've referred</div>
                </div>
            </div>

            {/* ── Invite Section ────────────────────────────────────── */}
            <div className="ref-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <Gift color="#4f46e5" size={22} />
                    <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>Spread the Word</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                        <label className="ref-label">Your Referral Link</label>
                        <div className="ref-link-row">
                            <div className="ref-link-box">
                                {stats?.referralCode
                                    ? `${window.location.origin}/register?ref=${stats.referralCode}`
                                    : '--- Generating ---'}
                            </div>
                            <button onClick={copyLink} disabled={!stats?.referralCode} className="ref-copy-btn" style={{ background: copied ? '#10b981' : '#0f172a' }}>
                                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="ref-label">Referral Code</label>
                        <div style={{ display: 'inline-flex', alignItems: 'center', background: '#fff', border: '2px dashed #4f46e5', borderRadius: 12, padding: '10px 20px', fontSize: 20, fontWeight: 900, color: '#4f46e5', letterSpacing: '0.1em' }}>
                            {stats?.referralCode || '------'}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Referral Network List ─────────────────────────────── */}
            <div className="ref-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 13, background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Star size={20} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>Your Referral Network</h2>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>People who signed up using your link</p>
                    </div>
                </div>

                {fullReferrals.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '36px 16px' }}>
                        <div style={{ fontSize: 44, marginBottom: 10 }}>👥</div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 15, marginBottom: 5 }}>No referrals yet</div>
                        <div style={{ color: '#94a3b8', fontSize: 13 }}>Share your link above to start earning!</div>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                            {/* Desktop table header (hidden on mobile via CSS) */}
                            <div className="ref-table-header">
                                <span>User</span>
                                <span style={{ textAlign: 'center' }}>Orders</span>
                                <span style={{ textAlign: 'center' }}>Commission</span>
                                <span style={{ textAlign: 'right' }}>Joined</span>
                            </div>

                            {(Array.isArray(referrals) ? referrals : []).map((r, i) => (
                                <div key={r?._id || i} className="ref-row" style={{ background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                                    {/* Avatar + name — always visible */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                                            background: `hsl(${avatarHue(r.name)}, 55%, 90%)`,
                                            color: `hsl(${avatarHue(r.name)}, 55%, 32%)`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 900, fontSize: 15
                                        }}>
                                            {(r.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14 }}>{r.name}</div>
                                            {/* Mobile-only: show date under name */}
                                            <div className="ref-mobile-date">
                                                {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile-only pill row (orders + commission) */}
                                    <div className="ref-mobile-pills">
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f0f9ff', color: '#0284c7', borderRadius: 8, padding: '4px 9px', fontSize: 12, fontWeight: 800 }}>
                                            <ShoppingBag size={11} /> {r.orderCount || 0} orders
                                        </span>
                                        <span style={{ display: 'inline-block', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 900, background: r.commissionEarned > 0 ? '#f0fdf4' : '#f8fafc', color: r.commissionEarned > 0 ? '#16a34a' : '#94a3b8' }}>
                                            ₵{(r.commissionEarned || 0).toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Desktop-only: orders column */}
                                    <div className="ref-desktop-col" style={{ textAlign: 'center' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f0f9ff', color: '#0284c7', borderRadius: 8, padding: '4px 9px', fontSize: 12, fontWeight: 800 }}>
                                            <ShoppingBag size={11} /> {r.orderCount || 0}
                                        </span>
                                    </div>

                                    {/* Desktop-only: commission column */}
                                    <div className="ref-desktop-col" style={{ textAlign: 'center' }}>
                                        <span style={{ display: 'inline-block', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 900, background: r.commissionEarned > 0 ? '#f0fdf4' : '#f8fafc', color: r.commissionEarned > 0 ? '#16a34a' : '#94a3b8' }}>
                                            ₵{(r.commissionEarned || 0).toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Desktop-only: date column */}
                                    <div className="ref-desktop-col" style={{ textAlign: 'right', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                                        {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                                    </div>
                                </div>
                            ))}

                            {/* Totals footer */}
                            <div className="ref-totals-row">
                                <span style={{ fontSize: 13, fontWeight: 900 }}>TOTAL</span>
                                <span className="ref-desktop-col" style={{ textAlign: 'center', fontSize: 13, fontWeight: 800 }}>
                                    {(Array.isArray(fullReferrals) ? fullReferrals : []).reduce((s, r) => s + (r?.orderCount || 0), 0)} orders
                                </span>
                                <span style={{ textAlign: 'center', fontSize: 14, fontWeight: 900 }}>
                                    ₵{(stats?.totalCommissionEarned || 0).toFixed(2)}
                                </span>
                                <span className="ref-desktop-col" />
                            </div>
                        </div>

                        {fullReferrals.length > 5 && (
                            <div style={{ textAlign: 'center', marginTop: 16 }}>
                                <button 
                                    onClick={() => setShowAll(!showAll)}
                                    style={{ 
                                        padding: '8px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', 
                                        background: '#fff', color: '#4f46e5', fontWeight: 800, fontSize: 13, cursor: 'pointer' 
                                    }}
                                >
                                    {showAll ? 'Show Less' : `View All (${fullReferrals.length})`}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Cash Out ─────────────────────────────────────────── */}
            <div className="ref-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 13, background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ArrowUpRight size={22} />
                    </div>
                    <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>Cash Out</h2>
                </div>

                {!user?.momoNumber ? (
                    <div style={{ padding: 18, background: '#fffbeb', borderRadius: 14, border: '1px solid #fed7aa', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <AlertCircle color="#f97316" size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                            <div style={{ fontWeight: 800, color: '#9a3412', marginBottom: 4, fontSize: 14 }}>MoMo Number Missing</div>
                            <div style={{ fontSize: 13, color: '#c2410c' }}>Please update your MoMo number in your profile to enable withdrawals.</div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ padding: 14, background: '#f8fafc', borderRadius: 14, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fff', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', flexShrink: 0 }}>
                                <Smartphone size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>Payout Destination</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                                    {user.momoNumber}{' '}
                                    <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: 13 }}>(MoMo)</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: '#94a3b8', fontSize: 15 }}>₵</div>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Amount (Min ₵10)"
                                    style={{ width: '100%', padding: '15px 15px 15px 36px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 14, fontWeight: 800, outline: 'none', boxSizing: 'border-box', fontSize: 15 }}
                                    required
                                />
                            </div>
                            <input
                                type="text"
                                value={accountName}
                                onChange={(e) => setAccountName(e.target.value)}
                                placeholder="Account Name (e.g. Ama Serwaa)"
                                style={{ width: '100%', padding: '15px 18px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: 14, fontWeight: 800, outline: 'none', boxSizing: 'border-box', fontSize: 15 }}
                                required
                            />
                        </div>

                        {message.text && (
                            <div style={{ padding: '13px 15px', borderRadius: 13, fontSize: 14, fontWeight: 700, background: message.type === 'success' ? '#f0fdf4' : '#fef2f2', color: message.type === 'success' ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: 10 }}>
                                {message.type === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={withdrawLoading || !amount}
                            style={{ padding: '16px', borderRadius: 16, border: 'none', background: '#0f172a', color: '#fff', fontWeight: 900, fontSize: 15, cursor: (withdrawLoading || !amount) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%' }}
                        >
                            {withdrawLoading ? <RefreshCw className="animate-spin" size={18} /> : 'Request Withdrawal'}
                        </button>
                    </form>
                )}
            </div>

            {/* ── Responsive Styles ─────────────────────────────────── */}
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }

                /* Page wrapper */
                .ref-page {
                    padding: 24px 16px;
                    max-width: 800px;
                    margin: 0 auto;
                    font-family: 'Inter', sans-serif;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                /* Stat cards grid */
                .ref-stat-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                }

                /* Shared card */
                .ref-card {
                    background: #fff;
                    border-radius: 24px;
                    padding: 28px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                }

                /* Label */
                .ref-label {
                    display: block;
                    font-size: 11px;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 10px;
                }

                /* Link row */
                .ref-link-row {
                    display: flex;
                    gap: 8px;
                    align-items: stretch;
                }
                .ref-link-box {
                    flex: 1;
                    background: #fff;
                    border: 2px solid #e2e8f0;
                    border-radius: 13px;
                    padding: 13px 16px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #475569;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    min-width: 0;
                }
                .ref-copy-btn {
                    padding: 12px 18px;
                    border-radius: 13px;
                    border: none;
                    color: #fff;
                    font-weight: 800;
                    font-size: 13px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    transition: background 0.2s;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                /* Table header row (desktop only) */
                .ref-table-header {
                    display: grid;
                    grid-template-columns: 1fr 80px 110px 88px;
                    gap: 8px;
                    padding: 8px 14px;
                    border-radius: 10px;
                    background: #f8fafc;
                    font-size: 11px;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                /* Data row */
                .ref-row {
                    display: grid;
                    grid-template-columns: 1fr 80px 110px 88px;
                    gap: 8px;
                    padding: 13px 14px;
                    border-radius: 14px;
                    border: 1px solid #f1f5f9;
                    align-items: center;
                }

                /* Totals footer */
                .ref-totals-row {
                    display: grid;
                    grid-template-columns: 1fr 80px 110px 88px;
                    gap: 8px;
                    padding: 13px 14px;
                    border-radius: 13px;
                    margin-top: 4px;
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    color: #fff;
                    align-items: center;
                }

                /* Mobile-only elements hidden on desktop */
                .ref-mobile-date { display: none; }
                .ref-mobile-pills { display: none; }

                /* ── Mobile ≤ 600px ────────────────────────────────── */
                @media (max-width: 600px) {
                    .ref-page { padding: 16px 12px; gap: 14px; }

                    /* Stack stat cards 1-col */
                    .ref-stat-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }

                    /* Tighter card padding */
                    .ref-card { padding: 20px 16px; border-radius: 18px; }

                    /* Stack link row */
                    .ref-link-row { flex-direction: column; }
                    .ref-copy-btn { justify-content: center; }

                    /* Hide desktop table header + extra columns */
                    .ref-table-header { display: none; }
                    .ref-desktop-col { display: none; }

                    /* Referral row becomes a flex column */
                    .ref-row {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                        padding: 14px;
                    }

                    /* Show mobile-only date under name */
                    .ref-mobile-date {
                        display: block;
                        font-size: 11px;
                        color: #94a3b8;
                        font-weight: 600;
                        margin-top: 2px;
                    }

                    /* Show mobile pill row */
                    .ref-mobile-pills {
                        display: flex;
                        gap: 8px;
                        flex-wrap: wrap;
                    }

                    /* Totals footer — simpler on mobile */
                    .ref-totals-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 13px 16px;
                    }
                }

                /* ── Tablet 601–768px ──────────────────────────────── */
                @media (min-width: 601px) and (max-width: 768px) {
                    .ref-stat-grid { grid-template-columns: repeat(2, 1fr); }

                    /* Shrink table to 3 cols (hide date) */
                    .ref-table-header,
                    .ref-row,
                    .ref-totals-row {
                        grid-template-columns: 1fr 80px 110px;
                    }
                    /* Hide joined date column on tablet */
                    .ref-table-header > span:last-child,
                    .ref-row > div:last-of-type,
                    .ref-totals-row > span:last-child { display: none; }
                }
            `}</style>
        </div>
    );
};

export default Referrals;
