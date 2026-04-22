import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { 
    TrendingUp, Users, ShoppingBag, DollarSign, MessageSquare, 
    ArrowUpRight, ArrowDownRight, Activity, BarChart3, PieChart as PieChartIcon,
    ChevronRight, Sparkles, Send, Bot, User, Trash2, Smartphone, Globe, Code2,
    ShieldCheck, Store, UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';

const AnalysisDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello Boss! I've analyzed your platform's data across API, Storefronts, and Dashboard. How can I help you understand your performance today?" }
    ]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#8b5cf6'];

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

        setTimeout(() => {
            let response = "";
            const q = userMsg.toLowerCase();

            if (q.includes('revenue') || q.includes('money') || q.includes('earn')) {
                response = `In the last 30 days, your gross revenue is ₵${data.summary.revenue.toFixed(2)}. Out of this, your net platform profit is ₵${data.summary.profit.toFixed(2)}, while agents earned ₵${data.summary.agentProfit.toFixed(2)} in total.`;
            } else if (q.includes('service') || q.includes('channel') || q.includes('source')) {
                const api = data.sourceStats.find(s => s._id === 'api')?.count || 0;
                const store = data.sourceStats.find(s => s._id === 'store')?.count || 0;
                const dash = data.sourceStats.find(s => s._id === 'dashboard')?.count || 0;
                response = `Distribution breakdown: Dashboard (${dash} orders), Developer API (${api} orders), and Agent Storefronts (${store} orders). API volume is currently ${((api/(api+store+dash))*100).toFixed(1)}% of total traffic.`;
            } else if (q.includes('agent') || q.includes('merchant') || q.includes('paid')) {
                response = `You currently have ${data.summary.totalAgents} merchants on the platform. ${data.summary.newAgents} of these joined in the last 30 days. Their stores have processed ₵${data.sourceStats.find(s=>s._id==='store')?.revenue.toFixed(2) || '0.00'} in volume, earning them ₵${data.summary.agentProfit.toFixed(2)} in combined profit. Currently, ₵${data.summary.totalOwedToAgents.toFixed(2)} is available for withdrawal in their wallets.`;
            } else if (q.includes('top') || q.includes('product') || q.includes('best')) {
                const top = data.topProducts[0];
                response = `The best selling service overall is ${top?._id.name} on ${top?._id.network.toUpperCase()}. Your most popular network is ${data.networkStats[0]?._id.toUpperCase()} with ${data.networkStats[0]?.count} successful orders.`;
            } else if (q.includes('how') && q.includes('doing')) {
                const profitMargin = (data.summary.profit / data.summary.revenue) * 100;
                response = `The platform is healthy! Net profit is ₵${data.summary.profit.toFixed(2)} (${profitMargin.toFixed(1)}% margin). You've also shared ₵${data.summary.agentProfit.toFixed(2)} with your network of ${data.summary.totalAgents} agents, of which ₵${data.summary.totalOwedToAgents.toFixed(2)} is currently ready for payout. Growth is primarily driven by ${data.sourceStats.sort((a,b)=>b.count-a.count)[0]?._id} orders.`;
            } else {
                response = "I can explain your service distribution (API vs Store), network popularity, merchant growth, or revenue trends. What's on your mind?";
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
        background: '#fff', padding: 24, borderRadius: 24, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        display: 'flex', flexDirection: 'column'
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px 16px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <div style={{ background: '#4f46e5', color: '#fff', padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>V2.0 Core</div>
                            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: 0 }}>Analysis Intelligence</h1>
                        </div>
                        <p style={{ color: '#64748b', fontWeight: 600, fontSize: 14, margin: 0 }}>Live metrics & cross-channel multi-source analytics</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <Link to="/admin" style={{ padding: '12px 20px', borderRadius: 12, background: '#fff', color: '#0f172a', textDecoration: 'none', fontWeight: 800, fontSize: 13, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                            Back to Admin <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>

                <div className="layout-grid">
                    
                    {/* Left: Stats & Trends */}
                    <div className="main-content">
                        
                        {/* Summary Row */}
                        <div className="summary-grid">
                            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #4f46e5, #3730a3)', color: '#fff', border: 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <DollarSign size={22} />
                                    </div>
                                    <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800 }}>+ Live</div>
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.8 }}>30D Total Revenue</div>
                                <div style={{ fontSize: 30, fontWeight: 900, marginTop: 4 }}>₵{data.summary.revenue.toFixed(2)}</div>
                            </div>
                            
                            <div style={cardStyle}>
                                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                    <ShieldCheck size={22} />
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Platform Net Profit</div>
                                <div style={{ fontSize: 30, fontWeight: 900, color: '#10b981', marginTop: 4 }}>₵{data.summary.profit.toFixed(2)}</div>
                            </div>

                            <div style={cardStyle}>
                                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fff7ed', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                    <Users size={22} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Total Agent Earnings</div>
                                        <div style={{ fontSize: 26, fontWeight: 900, color: '#f59e0b', marginTop: 4 }}>₵{data.summary.agentProfit.toFixed(2)}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8' }}>Available for Withdrawal</div>
                                        <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>₵{data.summary.totalOwedToAgents.toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={cardStyle}>
                                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                    <Store size={22} />
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Active Merchants</div>
                                <div style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {data.summary.totalAgents}
                                    <span style={{ fontSize: 12, background: '#f8fafc', padding: '4px 8px', borderRadius: 6, color: '#7c3aed' }}>+{data.summary.newAgents}</span>
                                </div>
                            </div>
                        </div>

                        {/* Charts Row 1: Line Chart (Trends) */}
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fecaca', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Activity size={18} />
                                    </div>
                                    <span style={{ fontWeight: 900, fontSize: 17, color: '#0f172a' }}>Sales Performance Trend</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5' }}></div>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Revenue</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.salesTrend}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis 
                                            dataKey="_id" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} 
                                            minTickGap={30}
                                        />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 800, fontSize: 12 }}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Distribution Charts */}
                        <div className="dist-grid">
                            {/* Service Source Pie */}
                            <div style={cardStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                    <PieChartIcon size={18} color="#4f46e5" />
                                    <span style={{ fontWeight: 900, fontSize: 16 }}>Live Channel Share</span>
                                </div>
                                <div style={{ width: '100%', height: 280, position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data.sourceStats}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="count"
                                                nameKey="_id"
                                            >
                                                {(data.sourceStats || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} content={({payload}) => (
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 10 }}>
                                                    {payload.map((entry, index) => (
                                                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color }}></div>
                                                            <span style={{ fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'capitalize' }}>{entry.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                        <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{data.summary.orders}</div>
                                        <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Orders</div>
                                    </div>
                                </div>
                            </div>

                            {/* Network Chart */}
                            <div style={cardStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                    <Smartphone size={18} color="#10b981" />
                                    <span style={{ fontWeight: 900, fontSize: 16 }}>Network Popularity</span>
                                </div>
                                <div style={{ width: '100%', height: 280 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.networkStats} layout="vertical" margin={{ left: 10 }}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="_id" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#64748b' }} width={80} />
                                            <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }} />
                                            <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                                                {(data.networkStats || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry._id.toLowerCase()==='mtn' ? '#f59e0b' : entry._id.toLowerCase()==='telecel' ? '#ef4444' : '#4f46e5'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Top Performers Table */}
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <Sparkles size={18} color="#f59e0b" />
                                <span style={{ fontWeight: 900, fontSize: 16 }}>Top Selling Bundle Services</span>
                            </div>
                            <div className="table-responsive">
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '2px solid #f8fafc' }}>
                                            <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Product Name</th>
                                            <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Orders</th>
                                            <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Revenue</th>
                                            <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Trend</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(data.topProducts || []).map((p, i) => (
                                            <tr key={i} style={{ borderBottom: i < (data.topProducts?.length - 1 || 0) ? '1px solid #f8fafc' : 'none' }}>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ fontWeight: 800, fontSize: 14 }}>{p._id.name}</div>
                                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{p._id.network}</div>
                                                </td>
                                                <td style={{ padding: '16px', fontWeight: 900 }}>{p.count}</td>
                                                <td style={{ padding: '16px', fontWeight: 900, color: '#10b981' }}>₵{p.revenue.toFixed(2)}</td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ width: 80, height: 24 }}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={[...Array(5)].map(() => ({ v: Math.random() * 100 }))}>
                                                                <Area type="monotone" dataKey="v" stroke="#10b981" fill="#ecfdf5" strokeWidth={2} />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right: AI Insights Chat */}
                    <div className="ai-chat-sidebar">
                        <div style={{ padding: '24px', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Bot size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: 17, fontWeight: 900 }}>Bossu Intel AI</div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}></span> Real-time Deep Analysis
                                </div>
                            </div>
                        </div>

                        <div className="chat-body hide-scrollbar">
                            {messages.map((m, i) => (
                                <div key={i} style={{ 
                                    maxWidth: '90%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                    display: 'flex', flexDirection: 'column', gap: 6
                                }}>
                                    <div style={{ 
                                        padding: '16px 20px', borderRadius: m.role === 'user' ? '24px 24px 6px 24px' : '24px 24px 24px 6px',
                                        background: m.role === 'user' ? '#4f46e5' : '#f8fafc',
                                        color: m.role === 'user' ? '#fff' : '#0f172a',
                                        fontSize: 14, lineHeight: 1.6, fontWeight: 600,
                                        boxShadow: m.role === 'user' ? '0 10px 15px -3px rgba(79, 70, 229, 0.2)' : 'none',
                                        border: m.role === 'assistant' ? '1px solid #f1f5f9' : 'none'
                                    }}>
                                        {m.text}
                                    </div>
                                    <div style={{ fontSize: 10, fontWeight: 900, color: '#94a3b8', textAlign: m.role === 'user' ? 'right' : 'left', padding: '0 8px' }}>
                                        {m.role === 'user' ? 'Sent' : 'Bossu Intelligence'}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} style={{ padding: 24, borderTop: '1px solid #ececf1', display: 'flex', gap: 12, background: '#fff' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Ask for trends..."
                                    style={{ width: '100%', padding: '16px 20px', borderRadius: 18, border: '2px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontWeight: 600, fontSize: 14, transition: 'all 0.2s' }}
                                    className="chat-input"
                                />
                                <Sparkles size={16} style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', color: '#4f46e5', opacity: 0.6 }} />
                            </div>
                            <button type="submit" style={{ width: 54, height: 54, borderRadius: 18, background: '#0f172a', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                <Send size={22} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`
                .layout-grid { display: grid; grid-template-columns: 1fr 420px; gap: 32px; }
                .main-content { display: flex; flex-direction: column; gap: 32px; }
                .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                .dist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                .ai-chat-sidebar { 
                    height: calc(100vh - 120px); position: sticky; top: 24px;
                    display: flex; flex-direction: column; background: #fff; border-radius: 32px; border: 1px solid #f1f5f9; box-shadow: 0 10px 40px rgba(0,0,0,0.04); overflow: hidden; 
                }
                .chat-body { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 24px; background: #fff; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                .chat-input:focus { border-color: #4f46e5 !important; background: #fff !important; }
                .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; }
                
                @media (max-width: 1200px) {
                    .layout-grid { grid-template-columns: 1fr; }
                    .ai-chat-sidebar { height: 600px; position: relative; top: 0; }
                }

                @media (max-width: 768px) {
                    .summary-grid { grid-template-columns: 1fr; }
                    .dist-grid { grid-template-columns: 1fr; }
                }

                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
            `}</style>
        </div>
    );
};

export default AnalysisDashboard;
