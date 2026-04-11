import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Users, ShoppingBag, DollarSign, Wallet, ShieldAlert, Ban, PlusCircle, MinusCircle } from 'lucide-react';
import API_CONFIG from '../api/config';

const AdminDashboard = () => {
    const [searchParams] = useSearchParams();
    const tab = searchParams.get('tab') || 'stats';
    const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, totalEarnings: 0, apiBalance: 0 });
    const [users, setUsers] = useState([]);
    const [pricingRules, setPricingRules] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [orders, setOrders] = useState([]);
    const [reportedOrders, setReportedOrders] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [packages, setPackages] = useState([]);
    const [selectedNetwork, setSelectedNetwork] = useState('mtn');
    const [loading, setLoading] = useState(true);
    const [editModal, setEditModal] = useState(null); 
    const [modalInputs, setModalInputs] = useState({ normal: '', retail: '' });

    const API_URL = `${API_CONFIG}/admin`;
    const DATA_URL = `${API_CONFIG}/data`;
    const token = localStorage.getItem('token');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            
            // Statistics
            if (tab === 'stats') {
                const res = await axios.get(`${API_URL}/stats`, { headers });
                setStats(res.data);
            } 
            // Users
            else if (tab === 'users') {
                const res = await axios.get(`${API_URL}/users`, { headers });
                setUsers(res.data);
            } 
            // Pricing Logic
            else if (tab === 'pricing') {
                // Get saved rules
                const rulesRes = await axios.get(`${API_URL}/pricing`, { headers });
                setPricingRules(rulesRes.data);
                
                // Get live packages for selected network
                const pkgRes = await axios.get(`${DATA_URL}/packages/${selectedNetwork}`, { headers });
                const raw = pkgRes.data.packages || pkgRes.data || [];
                const mapped = raw.map(p => ({
                    key: (p.package_key || p.key || p.id || '').toString().trim(),
                    name: p.display_name || p.name,
                    apiPrice: Number(p.price)
                })).sort((a,b) => a.apiPrice - b.apiPrice);
                setPackages(mapped);
            } 
            // Transactions
            else if (tab === 'transactions') {
                const res = await axios.get(`${API_URL}/transactions`, { headers });
                setTransactions(res.data);
            } 
            // Orders
            else if (tab === 'orders') {
                const res = await axios.get(`${API_URL}/orders`, { headers });
                setOrders(res.data);
            }
            else if (tab === 'reports') {
                const res = await axios.get(`${API_URL}/reported-orders`, { headers });
                setReportedOrders(res.data);
            }
            else if (tab === 'withdrawals') {
                const res = await axios.get(`${API_URL}/withdrawals`, { headers });
                setWithdrawals(res.data);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [tab, selectedNetwork, token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleBlock = async (id) => {
        try {
            await axios.post(`${API_URL}/user-block/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch (err) { alert('Action failed'); }
    };

    const handleBalance = async (id, action) => {
        const amount = prompt(`Amount to ${action}:`);
        if (!amount || isNaN(amount)) return;
        try {
            await axios.post(`${API_URL}/user-balance/${id}`, { amount, action }, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch (err) { alert('Action failed'); }
    };

    const handleRoleChange = async (id, role) => {
        try {
            await axios.post(`${API_URL}/user-role/${id}`, { role }, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch (err) { alert('Action failed'); }
    };

    const handleResolveWithdrawal = async (id, action) => {
        const note = prompt(`Optional note for ${action}:`);
        try {
            await axios.post(`${API_URL}/resolve-withdrawal/${id}`, { action, note }, { headers: { Authorization: `Bearer ${token}` } });
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
            retail: p.retailPrice || pkg.apiPrice || ''
        });
    };

    const savePrice = async () => {
        if (!editModal || !editModal.key) return;
        try {
            await axios.post(`${API_URL}/pricing`, { 
                network: selectedNetwork, 
                packageKey: editModal.key.toString().trim(), 
                normalPrice: Number(modalInputs.normal), 
                retailPrice: Number(modalInputs.retail)
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setEditModal(null);
            alert('Pricing updated successfully!');
            fetchData(); 
        } catch (err) { 
            alert('Error: ' + (err.response?.data?.message || 'Update failed')); 
        }
    };

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
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                            <button onClick={() => setEditModal(null)} style={{ flex: 1, padding: '14px', borderRadius: 12, border: 'none', background: '#f1f5f9', color: '#64748b', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                            <button onClick={savePrice} style={{ flex: 1, padding: '14px', borderRadius: 12, border: 'none', background: '#4f46e5', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, fontSize: 24, fontWeight: 900, color: '#0f172a' }}>
                    Admin Controls • <span style={{ color: '#4f46e5', textTransform: 'capitalize' }}>{tab}</span>
                </div>

                {/* Statistics */}
                {tab === 'stats' && !loading && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        <div style={cardStyle}>
                            <Users size={24} color="#6366f1" />
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginTop: 12 }}>Total Users</div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>{stats.totalUsers}</div>
                        </div>
                        <div style={cardStyle}>
                            <ShoppingBag size={24} color="#10b981" />
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginTop: 12 }}>Total Orders</div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>{stats.totalOrders}</div>
                        </div>
                        <div style={cardStyle}>
                            <DollarSign size={24} color="#f59e0b" />
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginTop: 12 }}>Total Revenue</div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>₵{(stats.totalEarnings || 0).toFixed(2)}</div>
                        </div>
                        <div style={{ ...cardStyle, background: '#0f172a', color: '#fff' }}>
                            <Wallet size={24} color="#4f46e5" />
                            <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.6, marginTop: 12 }}>API Hub Balance</div>
                            <div style={{ fontSize: 28, fontWeight: 900 }}>₵{(stats.apiBalance || 0).toFixed(2)}</div>
                        </div>
                    </div>
                )}

                {/* Users Management */}
                {tab === 'users' && !loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {users.map(u => (
                            <div key={u._id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                                <div>
                                    <div style={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
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
                                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{u.email}</div>
                                    <div style={{ fontSize: 14, fontWeight: 900, color: '#4f46e5', marginTop: 4 }}>
                                        Wallet: ₵{(u.balance || 0).toFixed(2)} | Profit: ₵{(u.commissionBalance || 0).toFixed(2)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => handleBalance(u._id, 'add')} style={{ border: 'none', background: '#f0fdf4', color: '#16a34a', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>Add Balance</button>
                                    <button onClick={() => handleBlock(u._id)} style={{ border: 'none', background: u.isBlocked ? '#0f172a' : '#f1f5f9', color: u.isBlocked ? '#fff' : '#64748b', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>
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
                        <div style={{ display: 'flex', gap: 10 }}>
                            {['mtn', 'telecel', 'at'].map(net => (
                                <button key={net} 
                                    onClick={() => setSelectedNetwork(net)}
                                    style={{
                                        padding: '10px 20px', borderRadius: 10, fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer',
                                        border: selectedNetwork === net ? '2px solid #4f46e5' : '2px solid transparent',
                                        background: selectedNetwork === net ? '#eef2ff' : '#fff',
                                        color: selectedNetwork === net ? '#4f46e5' : '#64748b'
                                    }}>
                                    {net}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {packages.map(pkg => (
                                <div key={pkg.key} style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
                                    <div>
                                        <div style={{ fontWeight: 900, fontSize: 16, color: '#0f172a' }}>
                                            {pkg.name} <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>ID: {pkg.key}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                                            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>API: ₵{(pkg.apiPrice || 0).toFixed(2)}</span>
                                            {(() => {
                                                const rule = pricingRules.find(x => 
                                                    (x.packageKey || '').toString().trim().toLowerCase() === (pkg.key || '').toLowerCase() && 
                                                    (x.network || '').toLowerCase() === (selectedNetwork || '').toLowerCase()
                                                );
                                                return rule ? (
                                                    <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 800 }}>
                                                        Set: ₵{rule.normalPrice || 0}
                                                    </span>
                                                ) : <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700 }}>Not Set</span>;
                                            })()}
                                        </div>
                                    </div>
                                    <button onClick={() => handleEditPriceBtn(pkg)} style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Adjust</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Transactions Management */}
                {tab === 'transactions' && !loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {transactions.map(tx => (
                            <div key={tx._id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{tx.description}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>{tx.user?.email} • {new Date(tx.createdAt).toLocaleString()}</div>
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
                        {orders.map(o => (
                            <div key={o._id} style={{ ...cardStyle }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <span style={{ fontWeight: 900, fontSize: 18 }}>{o.packageName}</span>
                                    <span style={{ fontWeight: 900, color: '#4f46e5' }}>₵{(o.amount || 0).toFixed(2)}</span>
                                </div>
                                <div style={{ fontSize: 13, color: '#64748b' }}>User: {o.user?.email} • Net: {o.network} • Status: <b style={{ textTransform: 'capitalize', color: o.status === 'completed' ? '#16a34a' : o.status === 'failed' ? '#dc2626' : '#d97706' }}>{o.status}</b></div>
                                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 8, color: '#0f172a' }}>To: {o.phoneNumber}</div>
                                {o.isReported && <div style={{ marginTop: 8, padding: '6px 12px', background: '#fef2f2', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#dc2626' }}>⚠ Reported: {o.reportReason}</div>}
                            </div>
                        ))}
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
                        ) : reportedOrders.map(o => (
                            <div key={o._id} style={{ ...cardStyle, border: '1.5px solid #fecaca' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                                    <div>
                                        <div style={{ fontWeight: 900, fontSize: 17 }}>{o.network?.toUpperCase()} {o.packageName} — ₵{(o.amount || 0).toFixed(2)}</div>
                                        <div style={{ fontSize: 13, color: '#64748b' }}>User: {o.user?.name} ({o.user?.email})</div>
                                        <div style={{ marginTop: 8, padding: '8px 12px', background: '#fef2f2', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#dc2626' }}>Issue: {o.reportReason}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={async () => {
                                            if (!window.confirm(`Refund ₵${(o.amount||0).toFixed(2)} to ${o.user?.name}?`)) return;
                                            await axios.post(`${API_URL}/resolve-report/${o._id}`, { action: 'refund' }, { headers: { Authorization: `Bearer ${token}` } });
                                            fetchData();
                                        }} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Refund</button>
                                        <button onClick={async () => {
                                            await axios.post(`${API_URL}/resolve-report/${o._id}`, { action: 'dismiss' }, { headers: { Authorization: `Bearer ${token}` } });
                                            fetchData();
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
                        ) : withdrawals.map(w => (
                            <div key={w._id} style={{ ...cardStyle, border: w.status === 'pending' ? '1.5px solid #fcd34d' : '1px solid #f1f5f9' }}>
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
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => handleResolveWithdrawal(w._id, 'approved')} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Mark Paid</button>
                                            <button onClick={() => handleResolveWithdrawal(w._id, 'rejected')} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #fee2e2', background: '#fff', color: '#ef4444', fontWeight: 800, cursor: 'pointer' }}>Reject</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {loading && <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8', fontWeight: 800 }}>Syncing...</div>}
            </div>
        </div>
    );
};

export default AdminDashboard;
