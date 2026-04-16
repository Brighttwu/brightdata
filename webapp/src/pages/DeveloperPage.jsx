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
        <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 72px)', padding: '40px 16px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ marginBottom: 48, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', background: '#eef2ff', color: '#4f46e5', borderRadius: 99, fontWeight: 800, fontSize: 13, marginBottom: 16 }}>
                        <Terminal size={14} /> DEVELOPER API V1.0
                    </div>
                    <h1 style={{ fontSize: 42, fontWeight: 900, color: '#0f172a', margin: '0 0 16px', letterSpacing: '-0.02em' }}>Build Your Own Data Website</h1>
                    <p style={{ fontSize: 18, color: '#64748b', fontWeight: 600, maxWidth: 700, margin: '0 auto' }}>
                        Automate your data delivery or launch your own reseller platform using our ultra-fast infrastructure.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 420px)', gap: 32 }} className="dev-grid">
                    
                    {/* Left Column: Documentation Detailed */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        
                        {/* API Key Card */}
                        <div style={{ background: '#fff', borderRadius: 32, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Key size={22} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>Private API Key</h2>
                                        <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Your production access token</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12 }}
                                >
                                    <RefreshCw size={14} style={{ animation: generating ? 'spin 1s linear infinite' : 'none' }} />
                                    Refresh Key
                                </button>
                            </div>

                            <div style={{ position: 'relative', background: '#0f172a', padding: '18px 24px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <div style={{ fontSize: 15, fontWeight: 600, color: apiKey ? '#10b981' : 'rgba(255,255,255,0.3)', fontFamily: "'Fira Code', monospace", wordBreak: 'break-all', paddingRight: 40 }}>
                                    {apiKey || '••••••••••••••••••••••••••••••••'}
                                </div>
                                {apiKey && (
                                    <button 
                                        onClick={() => handleCopy(apiKey)}
                                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                        {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} color="#fff" />}
                                    </button>
                                )}
                            </div>
                            {!apiKey && (
                                <button onClick={handleGenerate} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: '#4f46e5', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Generate Initial Key</button>
                            )}
                        </div>

                        {/* Integration Details Table */}
                        <div style={{ background: '#fff', borderRadius: 32, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 16, background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BookOpen size={22} />
                                </div>
                                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0 }}>Buy Data Parameters</h2>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                            <th style={{ padding: '12px 0', fontSize: 13, color: '#94a3b8', textTransform: 'uppercase' }}>Field</th>
                                            <th style={{ padding: '12px 0', fontSize: 13, color: '#94a3b8', textTransform: 'uppercase' }}>Type</th>
                                            <th style={{ padding: '12px 0', fontSize: 13, color: '#94a3b8', textTransform: 'uppercase' }}>Required</th>
                                            <th style={{ padding: '12px 0', fontSize: 13, color: '#94a3b8', textTransform: 'uppercase' }}>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ fontSize: 14, fontWeight: 600 }}>
                                        {[
                                            { f: 'network', t: 'string', r: 'YES', d: 'mtn, telecel, or at' },
                                            { f: 'package_key', t: 'string', r: 'YES', d: 'The unique ID of the plan' },
                                            { f: 'phone', t: 'string', r: 'YES', d: 'Recipient number (10 digits)' }
                                        ].map((row, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                <td style={{ padding: '16px 0', color: '#4f46e5', fontFamily: 'monospace' }}>{row.f}</td>
                                                <td style={{ padding: '16px 0', color: '#64748b' }}>{row.t}</td>
                                                <td style={{ padding: '16px 0', color: row.r === 'YES' ? '#ef4444' : '#64748b' }}>{row.r}</td>
                                                <td style={{ padding: '16px 0', color: '#0f172a' }}>{row.d}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Success Response */}
                        <div style={{ background: '#fff', borderRadius: 32, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                            <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                                Example Success Response
                            </div>
                            <pre style={{ background: '#f8fafc', padding: 20, borderRadius: 16, margin: 0, fontWeight: 600, fontSize: 13, color: '#0f172a', overflowX: 'auto' }}>
{`{
  "status": true,
  "message": "Transaction successful",
  "order_id": "67b3f9...",
  "reference": "API_170245...",
  "new_balance": 450.25
}`}
                            </pre>
                        </div>
                    </div>

                    {/* Right Column: Code Playbox */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ background: '#0f172a', borderRadius: 32, overflow: 'hidden', boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.4)', position: 'sticky', top: 100 }}>
                            <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: 13, marginLeft: 12 }}>Terminal Snippets</span>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', padding: '12px 24px', gap: 12, background: 'rgba(255,255,255,0.02)' }}>
                                {['curl', 'php', 'node', 'python'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setActiveSnippet(s)}
                                        style={{ 
                                            padding: '8px 16px', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s',
                                            background: activeSnippet === s ? '#4f46e5' : 'transparent',
                                            color: activeSnippet === s ? '#fff' : 'rgba(255,255,255,0.4)'
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            <div style={{ padding: 24, position: 'relative' }}>
                                <pre style={{ 
                                    background: 'rgba(0,0,0,0.5)', padding: 24, borderRadius: 20,
                                    color: '#fff', fontSize: 14, lineHeight: 1.7, overflowX: 'auto', margin: 0,
                                    fontFamily: "'Fira Code', 'Roboto Mono', monospace", border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    {snippets[activeSnippet]}
                                </pre>
                                <button 
                                    onClick={() => handleCopy(snippets[activeSnippet])}
                                    style={{ position: 'absolute', top: 36, right: 36, background: '#4f46e5', border: 'none', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}
                                >
                                    <Copy size={18} color="#fff" />
                                </button>
                            </div>

                            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Core Endpoints</div>
                                {[
                                    { m: 'GET', p: '/packages/:network', c: '#10b981' },
                                    { m: 'POST', p: '/buy', c: '#6366f1' },
                                    { m: 'GET', p: '/order/:orderId', c: '#f59e0b' },
                                    { m: 'GET', p: '/user', c: '#8b5cf6' }
                                ].map((e, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ minWidth: 50, fontSize: 10, fontWeight: 900, background: `${e.c}22`, color: e.c, padding: '4px 8px', borderRadius: 6, textAlign: 'center' }}>{e.m}</span>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', fontFamily: 'monospace' }}>{e.p}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section: Support */}
                <div style={{ marginTop: 60, padding: 40, background: '#fff', borderRadius: 32, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 32, marginBottom: 16 }}>🚀</div>
                    <h3 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>Ready to Go Live?</h3>
                    <p style={{ color: '#64748b', fontWeight: 600, marginBottom: 24 }}>Need custom endpoints or callback URLs? Our API team is here to help.</p>
                    <a href="#" style={{ display: 'inline-flex', padding: '16px 32px', background: '#0f172a', color: '#fff', borderRadius: 16, fontWeight: 900, textDecoration: 'none', fontSize: 16 }}>Get Integrated Support</a>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (max-width: 900px) {
                    .dev-grid { grid-template-columns: 1fr !important; }
                    .dev-grid > div:last-child { position: static !important; }
                }
            `}</style>
        </div>
    );
};

export default DeveloperPage;
