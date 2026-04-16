import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { 
    TrendingUp, Users, ShoppingBag, DollarSign, MessageSquare, 
    ArrowUpRight, ArrowDownRight, Activity, BarChart3, PieChart,
    ChevronRight, Sparkles, Send, Bot, User, Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AnalysisDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello Boss! I've analyzed your platform's data for the last 30 days. How can I help you understand your progress today?" }
    ]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const res = await api.get('/admin/analysis');
                setData(res.data);
            } catch (err) {
                console.error('Analysis fetch failed');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !data) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');

        // Simple logic-driven "AI" response based on the fetched data
        setTimeout(() => {
            let response = "";
            const q = userMsg.toLowerCase();

            if (q.includes('revenue') || q.includes('money') || q.includes('earn')) {
                response = `In the last 30 days, you've generated ₵${data.summary.revenue.toFixed(2)} in total revenue with a net profit of ₵${data.summary.profit.toFixed(2)}. This comes from ${data.summary.orders} successful orders.`;
            } else if (q.includes('top') || q.includes('product') || q.includes('best')) {
                const top = data.topProducts[0];
                response = `Your top performing product is ${top?._id.name} (${top?._id.network.toUpperCase()}) with ${top?.count} sales. It has contributed ₵${top?.revenue.toFixed(2)} to your revenue.`;
            } else if (q.includes('user') || q.includes('growth')) {
                const totalGrowth = data.userTrend.reduce((acc, curr) => acc + curr.count, 0);
                response = `You've gained ${totalGrowth} new users in the last 30 days. Your top spender is ${data.topUsers[0]?.name} who has spent ₵${data.topUsers[0]?.totalSpent.toFixed(2)} so far.`;
            } else if (q.includes('how') && q.includes('doing')) {
                const profitMargin = (data.summary.profit / data.summary.revenue) * 100;
                response = `You are doing great! Your average order value is ₵${data.summary.avgOrderValue.toFixed(2)} and your current profit margin is approximately ${profitMargin.toFixed(1)}%. Revenue is primarily driven by ${data.topProducts[0]?._id.network.toUpperCase()} data.`;
            } else {
                response = "I can explain your revenue, profit trends, top selling products, or user growth. What would you like to dive into?";
            }

            setMessages(prev => [...prev, { role: 'assistant', text: response }]);
        }, 600);
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
            <Activity className="animate-spin" size={40} color="#4f46e5" />
        </div>
    );

    const cardStyle = {
        background: '#fff', padding: 24, borderRadius: 24, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px 16px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: 0 }}>Analysis Intelligence</h1>
                        <p style={{ color: '#64748b', fontWeight: 600, fontSize: 14, marginTop: 4 }}>Real-time business performance & AI insights</p>
                    </div>
                    <Link to="/admin" style={{ padding: '12px 20px', borderRadius: 12, background: '#fff', color: '#0f172a', textDecoration: 'none', fontWeight: 800, fontSize: 13, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                        Back to Admin <ChevronRight size={16} />
                    </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 }} className="analysis-grid">
                    
                    {/* Left: Stats & Trends */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        
                        {/* Summary Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                            <div style={cardStyle}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                    <DollarSign size={20} />
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>30D Revenue</div>
                                <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>₵{data.summary.revenue.toFixed(2)}</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                    <TrendingUp size={20} />
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>30D Profit</div>
                                <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981', marginTop: 4 }}>₵{data.summary.profit.toFixed(2)}</div>
                            </div>
                            <div style={cardStyle}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff7ed', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                    <ShoppingBag size={20} />
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Successful Orders</div>
                                <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>{data.summary.orders}</div>
                            </div>
                        </div>

                        {/* Top Products & Users */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="mobile-stack">
                            <div style={cardStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                    <PieChart size={18} color="#4f46e5" />
                                    <span style={{ fontWeight: 800, fontSize: 15 }}>Top Products</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {data.topProducts.map((p, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < data.topProducts.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: 14 }}>{p._id.name}</div>
                                                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{p._id.network}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 900, fontSize: 14 }}>{p.count} sales</div>
                                                <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>₵{p.revenue.toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={cardStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                    <Users size={18} color="#ec4899" />
                                    <span style={{ fontWeight: 800, fontSize: 15 }}>Top Customers</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {data.topUsers.map((u, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < data.topUsers.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#4f46e5' }}>
                                                {u.name.charAt(0)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 800, fontSize: 14 }}>{u.name}</div>
                                                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{u.orderCount} orders</div>
                                            </div>
                                            <div style={{ fontWeight: 900, fontSize: 14, color: '#0f172a' }}>₵{u.totalSpent.toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Visual Trend Placeholder (Simple Bar Chart) */}
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <BarChart3 size={18} color="#4f46e5" />
                                    <span style={{ fontWeight: 800, fontSize: 15 }}>Daily Sales Trend (Last 30 Days)</span>
                                </div>
                            </div>
                            <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 4, paddingBottom: 20, overflowX: 'auto' }} className="hide-scrollbar">
                                {data.salesTrend.map((day, i) => (
                                    <div key={i} style={{ flex: 1, minWidth: 12, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ 
                                            width: '100%', 
                                            height: `${Math.max(5, (day.revenue / Math.max(...data.salesTrend.map(d => d.revenue))) * 100)}%`, 
                                            background: 'linear-gradient(to top, #4f46e5, #818cf8)', 
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'height 1s ease-out'
                                        }}></div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                                <span>{data.salesTrend[0]?._id}</span>
                                <span>Today</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: AI Insights Chat */}
                    <div style={{ 
                        height: 'calc(100vh - 120px)', position: 'sticky', top: 24,
                        display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 28, border: '1px solid #f1f5f9', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', overflow: 'hidden'
                    }} className="analysis-chat">
                        <div style={{ padding: '24px', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 900 }}>Bossu AI</div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span> Live Data Assistant
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }} className="hide-scrollbar">
                            {messages.map((m, i) => (
                                <div key={i} style={{ 
                                    maxWidth: '85%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                    display: 'flex', flexDirection: 'column', gap: 6
                                }}>
                                    <div style={{ 
                                        padding: '14px 18px', borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                        background: m.role === 'user' ? '#4f46e5' : '#f8fafc',
                                        color: m.role === 'user' ? '#fff' : '#0f172a',
                                        fontSize: 14, lineHeight: 1.5, fontWeight: 600,
                                        boxShadow: m.role === 'user' ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none',
                                        border: m.role === 'assistant' ? '1px solid #f1f5f9' : 'none'
                                    }}>
                                        {m.text}
                                    </div>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                                        {m.role === 'user' ? 'Sent' : 'Bossu AI'}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} style={{ padding: 20, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Ask anything about progress..."
                                    style={{ width: '100%', padding: '14px 16px', borderRadius: 16, border: '2px solid #f1f5f9', background: '#fff', outline: 'none', fontWeight: 600, fontSize: 14 }}
                                />
                                <Sparkles size={16} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#4f46e5', opacity: 0.5 }} />
                            </div>
                            <button type="submit" style={{ width: 48, height: 48, borderRadius: 16, background: '#0f172a', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @media (max-width: 992px) {
                    .analysis-grid { grid-template-columns: 1fr !important; }
                    .analysis-chat { height: 500px !important; position: relative !important; top: 0 !important; }
                    .mobile-stack { grid-template-columns: 1fr !important; }
                }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AnalysisDashboard;
