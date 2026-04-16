import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Check, RefreshCw, ShieldCheck, Key, BookOpen, Code, Layers, Smartphone } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const DeveloperPage = () => {
    const { user, refreshProfile } = useAuth();
    const [apiKey, setApiKey] = useState(user?.apiKey || '');
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeSnippet, setActiveSnippet] = useState('curl');
    
    useEffect(() => {
        if (user?.apiKey) setApiKey(user.apiKey);
    }, [user]);

    const handleGenerate = async () => {
        if (!window.confirm('Generating a new key will invalidate your current API key. Continue?')) return;
        setGenerating(true);
        try {
            const res = await api.post('/user/generate-api-key');
            setApiKey(res.data.apiKey);
            await refreshProfile();
        } catch (err) {
            alert('Failed to generate API key');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const API_BASE = window.location.origin.includes('localhost') ? 'http://localhost:5000/api/v1' : `${window.location.origin}/api/v1`;

    const docSections = [
        {
            title: 'Authentication',
            desc: 'All API requests must include your valid API key in the x-api-key header.',
            icon: <ShieldCheck size={20} color="#10b981" />
        },
        {
            title: 'Buying Data',
            desc: 'Purchase data for any phone number. Ensure you have enough wallet balance.',
            icon: <Smartphone size={20} color="#6366f1" />
        },
        {
            title: 'Order Tracking',
            desc: 'Instantly track the status of delivered data using our tracking endpoint.',
            icon: <Layers size={20} color="#f59e0b" />
        }
    ];

    const snippets = {
        curl: `curl -X POST ${API_BASE}/buy \\
     -H "x-api-key: YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     -d '{
       "network": "mtn",
       "package_key": "mtn_500mb",
       "phone": "0240000000"
     }'`,
        node: `const axios = require('axios');

const buyData = async () => {
  const response = await axios.post('${API_BASE}/buy', {
    network: 'mtn',
    package_key: 'mtn_500mb',
    phone: '0240000000'
  }, {
    headers: { 'x-api-key': 'YOUR_API_KEY' }
  });
  console.log(response.data);
};`,
        python: `import requests

url = "${API_BASE}/buy"
headers = {"x-api-key": "YOUR_API_KEY"}
data = {
    "network": "mtn",
    "package_key": "mtn_500mb",
    "phone": "0240000000"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 72px)', padding: '40px 16px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ marginBottom: 40, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#eef2ff', color: '#4f46e5', borderRadius: 99, fontWeight: 800, fontSize: 13, marginBottom: 16 }}>
                        <Terminal size={14} /> DEVELOPER API V1.0
                    </div>
                    <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', margin: '0 0 12px' }}>Plug Into Our Data Engine</h1>
                    <p style={{ fontSize: 16, color: '#64748b', fontWeight: 600, maxWidth: 600, margin: '0 auto' }}>
                        Automate your data sales or integrate data top-ups into your own application with our robust developer API.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }} className="dev-grid">
                    
                    {/* Left Side: Auth & Sections */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        
                        {/* API Key Card */}
                        <div style={{ background: '#fff', borderRadius: 28, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Key size={20} />
                                    </div>
                                    <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Your API Key</h2>
                                </div>
                                <button 
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13 }}
                                >
                                    <RefreshCw size={14} style={{ animation: generating ? 'spin 1s linear infinite' : 'none' }} />
                                    {generating ? 'Rotating...' : 'Rotate Key'}
                                </button>
                            </div>

                            <div style={{ position: 'relative', background: '#f8fafc', padding: '16px 20px', borderRadius: 16, border: '1.5px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: apiKey ? '#0f172a' : '#94a3b8', fontFamily: apiKey ? 'monospace' : 'inherit', letterSpacing: apiKey ? '0.05em' : 'normal', wordBreak: 'break-all', paddingRight: 40 }}>
                                    {apiKey || 'Generate a key to start building'}
                                </div>
                                {apiKey && (
                                    <button 
                                        onClick={() => handleCopy(apiKey)}
                                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: '#fff', border: '1px solid #e2e8f0', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} color="#64748b" />}
                                    </button>
                                )}
                            </div>
                            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                                ⚠️ Keep this key secret. If compromised, anyone can spend your wallet balance.
                            </div>
                        </div>

                        {/* Guide Sections */}
                        <div style={{ background: '#fff', borderRadius: 28, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BookOpen size={20} />
                                </div>
                                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Quick Start Guide</h2>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {docSections.map((s, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 16 }}>
                                        <div style={{ marginTop: 2 }}>{s.icon}</div>
                                        <div>
                                            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{s.title}</div>
                                            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, lineHeight: 1.5 }}>{s.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Code Snippets */}
                    <div style={{ background: '#0f172a', borderRadius: 28, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Code size={20} color="#4f46e5" />
                                <span style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>Code Snippets</span>
                            </div>
                            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 3 }}>
                                {['curl', 'node', 'python'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setActiveSnippet(s)}
                                        style={{ 
                                            padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s',
                                            background: activeSnippet === s ? '#4f46e5' : 'transparent',
                                            color: activeSnippet === s ? '#fff' : 'rgba(255,255,255,0.4)'
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ flex: 1, padding: 24, position: 'relative' }}>
                            <pre style={{ 
                                background: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)',
                                color: '#94a3b8', fontSize: 13, lineHeight: 1.6, overflowX: 'auto', margin: 0,
                                fontFamily: "'Fira Code', 'Courier New', monospace", width: '100%', boxSizing: 'border-box'
                            }}>
                                {snippets[activeSnippet]}
                            </pre>
                            <button 
                                onClick={() => handleCopy(snippets[activeSnippet])}
                                style={{ position: 'absolute', top: 32, right: 32, background: 'rgba(255,255,255,0.1)', border: 'none', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <Copy size={14} color="#fff" />
                            </button>
                        </div>

                        <div style={{ padding: 24, background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 16 }}>Available Endpoints</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[
                                    { m: 'GET', p: '/packages/:network', d: 'List packages & prices' },
                                    { m: 'POST', p: '/buy', d: 'Execute data purchase' },
                                    { m: 'GET', p: '/order/:orderId', d: 'Track status' },
                                    { m: 'GET', p: '/user', d: 'Check wallet balance' }
                                ].map((e, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontWeight: 900, color: e.m === 'POST' ? '#6366f1' : '#10b981', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>{e.m}</span>
                                            <span style={{ color: '#fff', fontWeight: 600 }}>{e.p}</span>
                                        </div>
                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{e.d}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Link */}
                <div style={{ marginTop: 40, textAlign: 'center', fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>
                    Need help? Contact our <a href="#" style={{ color: '#4f46e5', textDecoration: 'none' }}>Developer Support Team</a>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (max-width: 900px) {
                    .dev-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default DeveloperPage;
