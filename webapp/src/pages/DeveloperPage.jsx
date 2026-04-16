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
            desc: 'Include your API key in the x-api-key header of every request. All requests must be made over HTTPS.',
            icon: <ShieldCheck size={22} color="#10b981" />
        },
        {
            title: 'Buying Data',
            desc: 'The /buy endpoint accepts network, package_key, and phone. It returns an order_id for tracking.',
            icon: <Smartphone size={22} color="#6366f1" />
        },
        {
            title: 'Order Tracking',
            desc: 'Poll /order/:orderId to get real-time status (pending, completed, failed).',
            icon: <Layers size={22} color="#f59e0b" />
        }
    ];

    const snippets = {
        curl: `curl -X POST ${API_BASE}/buy \\
     -H "x-api-key: ${apiKey || 'YOUR_API_KEY'}" \\
     -H "Content-Type: application/json" \\
     -d '{
       "network": "mtn",
       "package_key": "mtn_500mb",
       "phone": "0240000001"
     }'`,
        php: `<?php
$url = "${API_BASE}/buy";
$data = [
    "network" => "mtn",
    "package_key" => "mtn_500mb",
    "phone" => "0240000001"
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "x-api-key: ${apiKey || 'YOUR_API_KEY'}",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`,
        node: `const axios = require('axios');

async function buyData() {
  try {
    const res = await axios.post('${API_BASE}/buy', {
      network: 'mtn',
      package_key: 'mtn_500mb',
      phone: '0240000001'
    }, {
      headers: { 'x-api-key': '${apiKey || 'YOUR_API_KEY'}' }
    });
    console.log('Order Success:', res.data);
  } catch (err) {
    console.error('Order Failed:', err.response.data);
  }
}

buyData();`,
        python: `import requests

url = "${API_BASE}/buy"
headers = {
    "x-api-key": "${apiKey || 'YOUR_API_KEY'}",
    "Content-Type": "application/json"
}
payload = {
    "network": "mtn",
    "package_key": "mtn_500mb",
    "phone": "0240000001"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 72px)', padding: '24px 12px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ marginBottom: 32, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: '#eef2ff', color: '#4f46e5', borderRadius: 99, fontWeight: 800, fontSize: 12, marginBottom: 16 }}>
                        <Terminal size={14} /> DEVELOPER API V1.0
                    </div>
                    <h1 className="responsive-h1" style={{ fontWeight: 900, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.02em' }}>Build Your Own Store</h1>
                    <p style={{ fontSize: 16, color: '#64748b', fontWeight: 600, maxWidth: 700, margin: '0 auto' }}>
                        Automate your data delivery with our robust infrastructure.
                    </p>
                </div>

                {/* PROMINENT BASE ENDPOINT */}
                <div style={{ background: '#4f46e5', borderRadius: 24, padding: '24px', marginBottom: 32, color: '#fff', boxShadow: '0 20px 40px -10px rgba(79,70,229,0.3)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.8, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        <Code size={14} /> Global Base Endpoint
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 800, fontFamily: "'Fira Code', monospace", wordBreak: 'break-all' }} className="responsive-endpoint">
                            {API_BASE}
                        </div>
                        <button 
                            onClick={() => handleCopy(API_BASE)}
                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: '10px 20px', borderRadius: 12, color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            <Copy size={16} /> Copy URL
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 }} className="dev-grid">
                    
                    {/* Left Column: Documentation Detailed */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        
                        {/* API Key Card */}
                        <div className="responsive-card" style={{ background: '#fff', borderRadius: 24, border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Key size={20} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>Private API Key</h2>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}
                                >
                                    {generating ? 'Rotating...' : 'Rotate'}
                                </button>
                            </div>

                            <div style={{ position: 'relative', background: '#0f172a', padding: '16px 20px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: apiKey ? '#10b981' : 'rgba(255,255,255,0.3)', fontFamily: "'Fira Code', monospace", wordBreak: 'break-all', paddingRight: 40 }}>
                                    {apiKey || '•••••••••••••••••'}
                                </div>
                                {apiKey && (
                                    <button 
                                        onClick={() => handleCopy(apiKey)}
                                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                        {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} color="#fff" />}
                                    </button>
                                )}
                            </div>
                            {!apiKey && (
                                <button onClick={handleGenerate} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: '#4f46e5', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Generate Key</button>
                            )}
                        </div>

                        {/* Guide Sections */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                            {docSections.map((s, i) => (
                                <div key={i} style={{ background: '#fff', padding: 24, borderRadius: 24, border: '1px solid #f1f5f9' }}>
                                    <div style={{ marginBottom: 12 }}>{s.icon}</div>
                                    <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', marginBottom: 4 }}>{s.title}</div>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: '#64748b', lineHeight: 1.5 }}>{s.desc}</div>
                                </div>
                            ))}
                        </div>

                        {/* Integration Details Table */}
                        <div className="responsive-card" style={{ background: '#fff', borderRadius: 24, border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', overflowX: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BookOpen size={20} />
                                </div>
                                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>API Parameters</h2>
                            </div>

                            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                <table style={{ width: '100%', minWidth: 500, borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                            <th style={{ padding: '12px 0', fontSize: 12, color: '#94a3b8', textTransform: 'uppercase' }}>Field</th>
                                            <th style={{ padding: '12px 0', fontSize: 12, color: '#94a3b8', textTransform: 'uppercase' }}>Required</th>
                                            <th style={{ padding: '12px 0', fontSize: 12, color: '#94a3b8', textTransform: 'uppercase' }}>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ fontSize: 13, fontWeight: 600 }}>
                                        {[
                                            { f: 'network', r: 'YES', d: 'mtn, telecel, or at' },
                                            { f: 'package_key', r: 'YES', d: 'ID of the data plan' },
                                            { f: 'phone', r: 'YES', d: 'Recipient (10 digits)' }
                                        ].map((row, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                <td style={{ padding: '14px 0', color: '#4f46e5', fontFamily: 'monospace' }}>{row.f}</td>
                                                <td style={{ padding: '14px 0', color: '#ef4444' }}>{row.r}</td>
                                                <td style={{ padding: '14px 0', color: '#0f172a' }}>{row.d}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Snippets */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="snippet-column">
                        <div style={{ background: '#0f172a', borderRadius: 24, overflow: 'hidden', boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.4)', position: 'sticky', top: 90 }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Code size={18} color="#4f46e5" />
                                    </div>
                                    <span style={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>Live Examples</span>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', padding: '12px', gap: 8, background: 'rgba(255,255,255,0.02)', overflowX: 'auto' }} className="hide-scrollbar">
                                {['curl', 'php', 'node', 'python'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setActiveSnippet(s)}
                                        style={{ 
                                            padding: '8px 16px', borderRadius: 10, border: 'none', fontSize: 11, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s', flexShrink: 0,
                                            background: activeSnippet === s ? '#4f46e5' : 'transparent',
                                            color: activeSnippet === s ? '#fff' : 'rgba(255,255,255,0.4)'
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            <div style={{ padding: 20, position: 'relative' }}>
                                <pre style={{ 
                                    background: 'rgba(0,0,0,0.5)', padding: 16, borderRadius: 16,
                                    color: '#fff', fontSize: 12, lineHeight: 1.6, overflowX: 'auto', margin: 0,
                                    fontFamily: "'Fira Code', monospace", border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    {snippets[activeSnippet]}
                                </pre>
                                <button 
                                    onClick={() => handleCopy(snippets[activeSnippet])}
                                    style={{ position: 'absolute', top: 32, right: 32, background: '#4f46e5', border: 'none', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                >
                                    <Copy size={16} color="#fff" />
                                </button>
                            </div>

                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Operations</div>
                                {[
                                    { m: 'POST', p: '/buy', t: 'Order Data' },
                                    { m: 'GET', p: '/user', t: 'Check Bal' }
                                ].map((e, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 10, fontWeight: 900, background: '#4f46e522', color: '#4f46e5', padding: '2px 6px', borderRadius: 4 }}>{e.m}</span>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: 'monospace' }}>{e.p}</span>
                                        </div>
                                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{e.t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 40, padding: 32, background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 24, textAlign: 'center', color: '#fff' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Need Help?</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>Our engineers are online to help you integrate.</p>
                    <a href="#" style={{ display: 'inline-block', padding: '14px 28px', background: '#fff', color: '#0f172a', borderRadius: 14, fontWeight: 900, textDecoration: 'none', fontSize: 14 }}>Contact Technical Support</a>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                .responsive-h1 { fontSize: 42px; }
                .responsive-endpoint { fontSize: 20px; }
                .responsive-card { padding: 32px; }

                @media (max-width: 968px) {
                    .dev-grid { grid-template-columns: 1fr !important; }
                    .snippet-column > div { position: static !important; }
                }

                @media (max-width: 600px) {
                    .responsive-h1 { fontSize: 28px !important; }
                    .responsive-endpoint { fontSize: 14px !important; }
                    .responsive-card { padding: 20px !important; }
                }
            `}</style>
        </div>
    );
};

export default DeveloperPage;
