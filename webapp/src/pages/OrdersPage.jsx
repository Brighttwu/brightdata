import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { RefreshCw, AlertCircle, CheckCircle2, Clock, XCircle, Search, FileText, ShieldAlert, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
    completed:        { label: 'Completed',    bg: '#dcfce7', color: '#16a34a', icon: <CheckCircle2 size={14} /> },
    pending:          { label: 'Pending',      bg: '#fef3c7', color: '#d97706', icon: <Clock size={14} /> },
    pending_payment:  { label: 'Awaiting Pay', bg: '#f0f9ff', color: '#0284c7', icon: <Clock size={14} /> },
    failed:           { label: 'Failed',       bg: '#fee2e2', color: '#dc2626', icon: <XCircle size={14} /> },
    cancelled:        { label: 'Cancelled',    bg: '#f1f5f9', color: '#64748b', icon: <XCircle size={14} /> },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['pending'];
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800,
            background: cfg.bg, color: cfg.color
        }}>
            {cfg.icon} {cfg.label}
        </span>
    );
};

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const { user } = useAuth();

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/data/orders');
            setOrders(res.data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load your orders.' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleCheckStatus = async (order) => {
        setActionLoadingId(order._id);
        setMessage({ type: '', text: '' });
        try {
            const res = await api.get(`/data/order-status/${order._id}`);
            const newStatus = res.data.order?.status;
            setOrders(prev => prev.map(o => o._id === order._id ? { ...o, status: newStatus || o.status } : o));
            setMessage({ type: 'success', text: `Status updated: ${STATUS_CONFIG[newStatus]?.label || newStatus}` });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Error checking status.' });
        } finally {
            setActionLoadingId(null);
        }
    const handleVerifyPaystackOrder = async (order) => {
        setActionLoadingId(order._id);
        setMessage({ type: '', text: '' });
        try {
            await api.get(`/data/buy-paystack-verify/${order.externalReference}`);
            setOrders(prev => prev.map(o => o._id === order._id ? { ...o, status: 'pending' } : o));
            setMessage({ type: 'success', text: 'Payment verified! Order is now being processed.' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Verification failed. This might happen if payment was not completed.' });
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleReport = async (order) => {
        const reason = window.prompt('Describe the issue with this order:');
        if (!reason || !reason.trim()) return;
        setActionLoadingId(order._id);
        try {
            await api.post(`/data/report-order/${order._id}`, { reason });
            setOrders(prev => prev.map(o => o._id === order._id ? { ...o, isReported: true, reportReason: reason } : o));
            setMessage({ type: 'success', text: 'Issue reported. Admin has been notified.' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Error reporting order. Try again.' });
        } finally {
            setActionLoadingId(null);
        }
    };

    const filtered = orders.filter(o =>
        (o.phoneNumber && o.phoneNumber.includes(searchQuery)) ||
        (o.packageName && o.packageName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (o.network && o.network.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div style={{ background: '#f0f2f8', minHeight: 'calc(100vh - 72px)', padding: '24px 16px', fontFamily: "'Inter', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
            <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: 0 }}>My Orders</h1>
                        <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600, margin: '4px 0 0' }}>Track and manage your data purchases</p>
                    </div>
                    <button onClick={fetchOrders} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                        background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 12,
                        fontWeight: 700, cursor: 'pointer', fontSize: 13
                    }}>
                        <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
                    </button>
                </div>

                {/* Alert */}
                {message.text && (
                    <div style={{
                        padding: '14px 18px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10,
                        fontWeight: 700, fontSize: 14,
                        background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                        color: message.type === 'success' ? '#16a34a' : '#dc2626',
                        border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                    }}>
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        {message.text}
                    </div>
                )}

                {/* Search */}
                <div style={{ background: '#fff', borderRadius: 16, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #e2e8f0' }}>
                    <Search size={18} color="#94a3b8" />
                    <input
                        type="text"
                        placeholder="Search by phone, plan, or network..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ border: 'none', outline: 'none', fontSize: 14, fontWeight: 600, color: '#0f172a', flex: 1, background: 'transparent', padding: '8px 0' }}
                    />
                </div>

                {/* Orders List */}
                {loading ? (
                    <div style={{ background: '#fff', borderRadius: 20, padding: 48, textAlign: 'center' }}>
                        <RefreshCw size={28} color="#94a3b8" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                        <p style={{ color: '#94a3b8', fontWeight: 700, margin: 0 }}>Loading your orders...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 20, padding: 64, textAlign: 'center' }}>
                        <FileText size={48} color="#e2e8f0" style={{ marginBottom: 16 }} />
                        <p style={{ color: '#94a3b8', fontWeight: 700, fontSize: 16, margin: 0 }}>No orders found.</p>
                        <Link to="/dashboard" style={{ display: 'inline-block', marginTop: 16, color: '#4f46e5', fontWeight: 800, fontSize: 14 }}>Buy Data →</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filtered.map(order => {
                            const isLoading = actionLoadingId === order._id;
                            return (
                                <div key={order._id} style={{
                                    background: '#fff', borderRadius: 20, padding: '20px 24px',
                                    border: order.isReported ? '1.5px solid #fecaca' : '1px solid #f1f5f9',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                                }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        {/* Left: Info */}
                                        <div style={{ flex: '1 1 220px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                <span style={{
                                                    background: '#f1f5f9', color: '#475569', fontWeight: 800, fontSize: 11,
                                                    padding: '3px 10px', borderRadius: 8, textTransform: 'uppercase'
                                                }}>{order.network}</span>
                                                <StatusBadge status={order.status} />
                                                {order.isReported && (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fee2e2', color: '#dc2626', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 8 }}>
                                                        <ShieldAlert size={12} /> Reported
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>
                                                {order.packageName}
                                                <span style={{ fontSize: 18, color: '#4f46e5', marginLeft: 10 }}>₵{(order.amount || 0).toFixed(2)}</span>
                                            </div>
                                            <div style={{ fontSize: 14, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>
                                                📱 {order.phoneNumber}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                                                {new Date(order.createdAt).toLocaleString()}
                                            </div>
                                            {order.isReported && order.reportReason && (
                                                <div style={{ marginTop: 10, padding: '8px 12px', background: '#fef2f2', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#dc2626' }}>
                                                    Issue: {order.reportReason}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right: Actions */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                                            <button
                                                onClick={() => handleCheckStatus(order)}
                                                disabled={isLoading}
                                                style={{
                                                    padding: '9px 18px', borderRadius: 10, border: 'none',
                                                    background: '#eef2ff', color: '#4f46e5', fontWeight: 800, fontSize: 12,
                                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: 6
                                                }}>
                                                <RefreshCw size={12} style={{ animation: isLoading ? 'spin 0.8s linear infinite' : 'none' }} />
                                                Check Status
                                            </button>
                                            {!order.isReported && (
                                                <button
                                                    onClick={() => handleReport(order)}
                                                    disabled={isLoading}
                                                    style={{
                                                        padding: '9px 18px', borderRadius: 10,
                                                        border: '1px solid #fecaca', background: '#fff',
                                                        color: '#ef4444', fontWeight: 800, fontSize: 12,
                                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: 6
                                                    }}>
                                                    <ShieldAlert size={12} /> Report Issue
                                                </button>
                                            )}
                                            {order.status === 'pending_payment' && (
                                                <button
                                                    onClick={() => handleVerifyPaystackOrder(order)}
                                                    disabled={isLoading}
                                                    style={{
                                                        padding: '9px 18px', borderRadius: 10,
                                                        border: 'none', background: '#f59e0b',
                                                        color: '#fff', fontWeight: 800, fontSize: 12,
                                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: 6,
                                                        boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
                                                    }}>
                                                    <RefreshCw size={12} style={{ animation: isLoading ? 'spin 0.8s linear infinite' : 'none' }} />
                                                    Verify Payment
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default OrdersPage;
