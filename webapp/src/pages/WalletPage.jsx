import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

const WalletPage = () => {
    const { user, updateBalance } = useAuth();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [txLoading, setTxLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    const quickAmounts = [5, 10, 20, 50, 100];


    const handleManualVerify = async (ref) => {
        setMessage({ type: '', text: '' });
        setLoading(true);
        try {
            const res = await api.get(`/payment/verify/${ref}`);
            updateBalance(res.data.balance);
            setMessage({ type: 'success', text: 'Payment verified! Your wallet has been credited.' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Verification failed. Try again.' });
        } finally {
            setLoading(false);
        }
    };

    const fetchTx = useCallback(async (showLoading = false) => {
        if (showLoading) setTxLoading(true);
        try {
            const res = await api.get('/payment/transactions');
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            if (showLoading) setTxLoading(false);
        }
    }, []);

    // Fetch transactions
    useEffect(() => {
        fetchTx(true);
    }, [fetchTx]);

    const handleRefresh = () => {
        fetchTx(true);
        api.get('/user/profile').then(res => updateBalance(res.data.balance)).catch(() => {});
    };

    const handleFund = async () => {
        const val = parseFloat(amount);
        if (!val || val < 1) return setMessage({ type: 'error', text: 'Enter at least GH₵1' });
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await api.post('/payment/initialize', { amount: val });
            window.location.href = res.data.authorization_url;
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to start payment' });
            setLoading(false);
        }
    };

    const statusIcon = (status) => {
        if (status === 'success') return <CheckCircle2 size={16} style={{ color: '#16a34a' }} />;
        if (status === 'failed') return <XCircle size={16} style={{ color: '#dc2626' }} />;
        return <Clock size={16} style={{ color: '#f59e0b' }} />;
    };

    const typeColor = (type) => {
        if (type === 'deposit') return '#16a34a';
        if (type === 'purchase') return '#dc2626';
        return '#4f46e5';
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 72px)', padding: '24px 16px' }}>

            <div style={{ maxWidth: 600, margin: '0 auto' }}>

                {/* Balance Card */}
                <div style={{
                    background: '#4f46e5',
                    borderRadius: 20,
                    padding: '32px 28px',
                    color: '#fff',
                    marginBottom: 24,
                    textAlign: 'center'
                }}>
                    <Wallet size={32} style={{ opacity: 0.6, marginBottom: 8 }} />
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.6, marginBottom: 8 }}>Available Balance</div>
                    <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.02em' }}>₵{user?.balance?.toFixed(2) || '0.00'}</div>
                </div>

                {/* Fund Wallet */}
                <div style={{
                    background: '#fff',
                    borderRadius: 20,
                    padding: '28px 24px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                    marginBottom: 24
                }}>
                    <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Plus size={20} style={{ color: '#4f46e5' }} /> Fund Wallet
                    </h2>

                    {/* Quick Amounts */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                        {quickAmounts.map(a => (
                            <button key={a} onClick={() => setAmount(String(a))} style={{
                                padding: '10px 20px',
                                borderRadius: 10,
                                border: amount === String(a) ? '2px solid #4f46e5' : '2px solid #e2e8f0',
                                background: amount === String(a) ? '#eef2ff' : '#fff',
                                color: amount === String(a) ? '#4f46e5' : '#64748b',
                                fontWeight: 800,
                                fontSize: 14,
                                cursor: 'pointer'
                            }}>₵{a}</button>
                        ))}
                    </div>

                    <input
                        type="number"
                        placeholder="Enter custom amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '16px 20px',
                            background: '#f8fafc',
                            border: '2px solid transparent',
                            borderRadius: 14,
                            fontSize: 18,
                            fontWeight: 800,
                            outline: 'none',
                            boxSizing: 'border-box',
                            marginBottom: 16
                        }}
                        onFocus={e => { e.target.style.borderColor = '#818cf8'; e.target.style.background = '#fff'; }}
                        onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#f8fafc'; }}
                    />

                    {message.text && (
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: 12,
                            display: 'flex', alignItems: 'center', gap: 8,
                            marginBottom: 16, fontSize: 13, fontWeight: 700,
                            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                            color: message.type === 'success' ? '#16a34a' : '#dc2626',
                            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                        }}>
                            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            {message.text}
                        </div>
                    )}

                    <button onClick={handleFund} disabled={loading} style={{
                        width: '100%',
                        padding: '18px',
                        borderRadius: 14,
                        border: 'none',
                        fontSize: 16,
                        fontWeight: 800,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        background: loading ? '#e2e8f0' : '#4f46e5',
                        color: loading ? '#94a3b8' : '#fff',
                        boxShadow: loading ? 'none' : '0 8px 24px rgba(79,70,229,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                    }}>
                        {loading ? <Clock size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={18} />}
                        {loading ? 'Redirecting to Paystack...' : `Fund ₵${amount || '0'}`}
                    </button>
                </div>

                {/* Transaction History */}
                <div style={{
                    background: '#fff',
                    borderRadius: 20,
                    padding: '28px 24px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>Transaction History</h3>
                        <button onClick={handleRefresh} style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                            background: '#fff', color: '#4f46e5', border: '1px solid #e2e8f0', borderRadius: 10,
                            fontWeight: 700, cursor: 'pointer', fontSize: 13
                        }}>
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>

                    {txLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                            <Clock size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
                            <p style={{ fontWeight: 700, fontSize: 14 }}>Loading...</p>
                        </div>
                    ) : transactions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {transactions.map(tx => (
                                <div key={tx._id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '14px 16px', background: '#fafafa', borderRadius: 14, gap: 12
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 12,
                                            background: tx.type === 'deposit' ? '#f0fdf4' : '#fef2f2',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {tx.type === 'deposit' ? <ArrowDownLeft size={18} style={{ color: '#16a34a' }} /> : <ArrowUpRight size={18} style={{ color: '#dc2626' }} />}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {tx.description || tx.type}
                                            </div>
                                            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                {statusIcon(tx.status)} {new Date(tx.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                                        <div style={{
                                            fontSize: 15, fontWeight: 900,
                                            color: typeColor(tx.type)
                                        }}>
                                            {tx.type === 'deposit' ? '+' : '-'}₵{tx.amount.toFixed(2)}
                                        </div>
                                        {tx.type === 'deposit' && tx.status !== 'success' && (
                                            <button 
                                                onClick={() => handleManualVerify(tx.reference)}
                                                disabled={loading}
                                                style={{
                                                    padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0',
                                                    background: '#fff', fontSize: 10, fontWeight: 800, color: '#4f46e5',
                                                    cursor: loading ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                Verify
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center', padding: '40px 20px',
                            background: '#fafafa', borderRadius: 14, border: '2px dashed #e2e8f0'
                        }}>
                            <p style={{ color: '#94a3b8', fontWeight: 700, fontSize: 14, margin: 0 }}>No transactions yet</p>
                        </div>
                    )}
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default WalletPage;
