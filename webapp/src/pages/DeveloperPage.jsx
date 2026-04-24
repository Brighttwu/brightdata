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
    const [selectedEndpoint, setSelectedEndpoint] = useState('buy');
    
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

    const API_BASE = window.location.origin.includes('localhost') ? 'http://localhost:5001/api/v1' : `${window.location.origin}/api/v1`;

    const docSections = [
        {
            title: 'Authentication',
            desc: 'Include your API key in the x-api-key header of every request.',
            icon: <ShieldCheck size={20} color="#10b981" />
        },
        {
            title: 'Buying Data',
            desc: 'POST to /buy with network, package_key, and phone fields.',
            icon: <Smartphone size={20} color="#6366f1" />
        },
        {
            title: 'Order Tracking',
            desc: 'GET /order/:orderId for real-time status updates.',
            icon: <Layers size={20} color="#f59e0b" />
        }
    ];

    const endpointsList = [
        { id: 'user', m: 'GET', p: '/user', d: 'Check wallet balance', c: '#10b981' },
        { id: 'packages', m: 'GET', p: '/packages/:network', d: 'List available plans', c: '#8b5cf6' },
        { id: 'buy', m: 'POST', p: '/buy', d: 'Purchase data bundle', c: '#6366f1' },
        { id: 'order', m: 'GET', p: '/order/:orderId', d: 'Track order status', c: '#f59e0b' },
    ];

    const generateSnippets = (endpointId) => {
        const apiKeyVal = apiKey || 'YOUR_API_KEY';
        const baseUrl = API_BASE;
        
        switch(endpointId) {
            case 'user':
                return {
                    curl: `curl -X GET ${baseUrl}/user \\
  -H "x-api-key: ${apiKeyVal}"`,
                    php: `<?php
$url = "${baseUrl}/user";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  "x-api-key: ${apiKeyVal}"
]);

$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`,
                    node: `const axios = require('axios');

async function getBalance() {
  try {
    const res = await axios.get('${baseUrl}/user', {
      headers: { 'x-api-key': '${apiKeyVal}' }
    });
    console.log('Balance info:', res.data);
  } catch (err) {
    console.error('Error:', err.response.data);
  }
}

getBalance();`,
                    python: `import requests

url = "${baseUrl}/user"
headers = { "x-api-key": "${apiKeyVal}" }

res = requests.get(url, headers=headers)
print(res.json())`
                };
            case 'packages':
                return {
                    curl: `curl -X GET ${baseUrl}/packages/mtn \\
  -H "x-api-key: ${apiKeyVal}"`,
                    php: `<?php
$url = "${baseUrl}/packages/mtn";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  "x-api-key: ${apiKeyVal}"
]);

$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`,
                    node: `const axios = require('axios');

async function getPackages() {
  try {
    const res = await axios.get('${baseUrl}/packages/mtn', {
      headers: { 'x-api-key': '${apiKeyVal}' }
    });
    console.log('Available Packages:', res.data);
  } catch (err) {
    console.error('Error:', err.response.data);
  }
}

getPackages();`,
                    python: `import requests

url = "${baseUrl}/packages/mtn"
headers = { "x-api-key": "${apiKeyVal}" }

res = requests.get(url, headers=headers)
print(res.json())`
                };
            case 'buy':
                return {
                    curl: `curl -X POST ${baseUrl}/buy \\
  -H "x-api-key: ${apiKeyVal}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "network": "mtn",
    "package_key": "mtn_500mb",
    "phone": "0240000001"
  }'`,
                    php: `<?php
$url = "${baseUrl}/buy";
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
  "x-api-key: ${apiKeyVal}",
  "Content-Type: application/json"
]);

$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`,
                    node: `const axios = require('axios');

async function buyData() {
  try {
    const res = await axios.post(
      '${baseUrl}/buy',
      {
        network: 'mtn',
        package_key: 'mtn_500mb',
        phone: '0240000001'
      },
      {
        headers: { 'x-api-key': '${apiKeyVal}' }
      }
    );
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response.data);
  }
}

buyData();`,
                    python: `import requests

url = "${baseUrl}/buy"
headers = {
  "x-api-key": "${apiKeyVal}",
  "Content-Type": "application/json"
}
payload = {
  "network": "mtn",
  "package_key": "mtn_500mb",
  "phone": "0240000001"
}

res = requests.post(url, json=payload, headers=headers)
print(res.json())`
                };
            case 'order':
                return {
                    curl: `curl -X GET ${baseUrl}/order/6618300000000 \\
  -H "x-api-key: ${apiKeyVal}"`,
                    php: `<?php
$url = "${baseUrl}/order/6618300000000";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  "x-api-key: ${apiKeyVal}"
]);

$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`,
                    node: `const axios = require('axios');

async function getOrder() {
  try {
    const res = await axios.get('${baseUrl}/order/6618300000000', {
      headers: { 'x-api-key': '${apiKeyVal}' }
    });
    console.log('Order Status:', res.data);
  } catch (err) {
    console.error('Error:', err.response.data);
  }
}

getOrder();`,
                    python: `import requests

url = "${baseUrl}/order/6618300000000"
headers = { "x-api-key": "${apiKeyVal}" }

res = requests.get(url, headers=headers)
print(res.json())`
                };
            default: return {};
        }
    };

    const currentSnippets = generateSnippets(selectedEndpoint);

    return (
        <div className="dev-page">
            <div className="dev-container">
                
                {/* Header */}
                <div className="dev-header">
                    <div className="dev-badge">
                        <Terminal size={14} /> DEVELOPER API V1.0
                    </div>
                    <h1 className="dev-title">Build Your Own Store</h1>
                    <p className="dev-subtitle">
                        Automate data delivery with our robust API infrastructure.
                    </p>
                </div>

                {/* Base Endpoint Banner */}
                <div className="dev-endpoint-banner">
                    <div className="dev-endpoint-label">
                        <Code size={14} /> BASE ENDPOINT
                    </div>
                    <div className="dev-endpoint-row">
                        <code className="dev-endpoint-url">{API_BASE}</code>
                        <button className="dev-copy-btn" onClick={() => handleCopy(API_BASE)}>
                            <Copy size={14} /> Copy
                        </button>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="dev-grid">
                    
                    {/* Left Column */}
                    <div className="dev-left">
                        
                        {/* API Key Card */}
                        <div className="dev-card">
                            <div className="dev-card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div className="dev-icon-box" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#d97706' }}>
                                        <Key size={18} />
                                    </div>
                                    <h2 className="dev-card-title">Private API Key</h2>
                                </div>
                                <button className="dev-text-btn" onClick={handleGenerate} disabled={generating}>
                                    <RefreshCw size={14} style={{ animation: generating ? 'spin 1s linear infinite' : 'none' }} />
                                    {generating ? 'Wait...' : 'Rotate'}
                                </button>
                            </div>

                            <div className="dev-key-display">
                                <code className="dev-key-text" style={{ color: apiKey ? '#10b981' : 'rgba(255,255,255,0.3)' }}>
                                    {apiKey || '•••••••••••••••••••••••'}
                                </code>
                                {apiKey && (
                                    <button className="dev-key-copy" onClick={() => handleCopy(apiKey)}>
                                        {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} color="#fff" />}
                                    </button>
                                )}
                            </div>
                            {!apiKey && (
                                <button className="dev-generate-btn" onClick={handleGenerate}>
                                    Generate API Key
                                </button>
                            )}
                        </div>

                        {/* Quick Guide Cards */}
                        <div className="dev-guide-grid">
                            {docSections.map((s, i) => (
                                <div key={i} className="dev-guide-card">
                                    <div style={{ marginBottom: 8 }}>{s.icon}</div>
                                    <div className="dev-guide-title">{s.title}</div>
                                    <div className="dev-guide-desc">{s.desc}</div>
                                </div>
                            ))}
                        </div>

                        {/* Parameters Table */}
                        <div className="dev-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div className="dev-icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                                    <BookOpen size={18} />
                                </div>
                                <h2 className="dev-card-title">POST /buy Parameters</h2>
                            </div>

                            <div className="dev-table-wrap">
                                <table className="dev-table">
                                    <thead>
                                        <tr>
                                            <th>Field</th>
                                            <th>Required</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { f: 'network', d: 'mtn, telecel, or at' },
                                            { f: 'package_key', d: 'ID of the data plan' },
                                            { f: 'phone', d: 'Recipient phone (10 digits)' }
                                        ].map((row, i) => (
                                            <tr key={i}>
                                                <td style={{ color: '#4f46e5', fontFamily: 'monospace' }}>{row.f}</td>
                                                <td style={{ color: '#ef4444' }}>YES</td>
                                                <td>{row.d}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Endpoints Reference */}
                        <div className="dev-card">
                            <h2 className="dev-card-title" style={{ marginBottom: 16 }}>All Endpoints</h2>
                            <div className="dev-endpoints-list">
                                {endpointsList.map((e, i) => (
                                    <div 
                                        key={i} 
                                        className={`dev-endpoint-item ${selectedEndpoint === e.id ? 'active' : ''}`}
                                        onClick={() => setSelectedEndpoint(e.id)}
                                        style={{ cursor: 'pointer', padding: '8px', borderRadius: '10px', transition: 'all 0.2s' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span className="dev-method-badge" style={{ background: `${e.c}18`, color: e.c }}>{e.m}</span>
                                            <code className="dev-endpoint-path">{e.p}</code>
                                        </div>
                                        <span className="dev-endpoint-desc">{e.d}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Code Snippets */}
                    <div className="dev-right">
                        <div className="dev-code-box">
                            <div className="dev-code-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span className="dev-dot" style={{ background: '#ef4444' }} />
                                        <span className="dev-dot" style={{ background: '#f59e0b' }} />
                                        <span className="dev-dot" style={{ background: '#10b981' }} />
                                        <span className="dev-code-label">Code Samples</span>
                                    </div>
                                    <div className="dev-endpoint-tag">
                                        {endpointsList.find(e => e.id === selectedEndpoint)?.p}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="dev-lang-tabs hide-scrollbar">
                                {['curl', 'php', 'node', 'python'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setActiveSnippet(s)}
                                        className={`dev-lang-btn ${activeSnippet === s ? 'active' : ''}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            <div className="dev-code-body">
                                <pre className="dev-pre">{currentSnippets[activeSnippet]}</pre>
                                <button className="dev-code-copy" onClick={() => handleCopy(currentSnippets[activeSnippet])}>
                                    <Copy size={14} color="#fff" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="dev-footer-cta">
                    <h3>Need Help Integrating?</h3>
                    <p>Our engineers are online to support your integration.</p>
                    <a href="#">Contact Support</a>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }

                .dev-page {
                    background: #f8fafc;
                    min-height: calc(100vh - 72px);
                    padding: 32px 16px;
                    font-family: 'Inter', sans-serif;
                    box-sizing: border-box;
                }
                .dev-container {
                    max-width: 1100px;
                    margin: 0 auto;
                    width: 100%;
                    box-sizing: border-box;
                }

                /* Header */
                .dev-header { text-align: center; margin-bottom: 32px; }
                .dev-badge {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 6px 16px; background: #eef2ff; color: #4f46e5;
                    border-radius: 99px; font-weight: 800; font-size: 12px; margin-bottom: 16px;
                }
                .dev-title {
                    font-size: 40px; font-weight: 900; color: #0f172a;
                    margin: 0 0 12px; letter-spacing: -0.02em;
                }
                .dev-subtitle {
                    font-size: 16px; color: #64748b; font-weight: 600;
                    max-width: 600px; margin: 0 auto;
                }

                /* Endpoint Banner */
                .dev-endpoint-banner {
                    background: #4f46e5; border-radius: 20px; padding: 20px 24px;
                    margin-bottom: 28px; color: #fff;
                    box-shadow: 0 16px 40px -10px rgba(79,70,229,0.3);
                }
                .dev-endpoint-label {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 11px; font-weight: 800; text-transform: uppercase;
                    letter-spacing: 0.1em; opacity: 0.7; margin-bottom: 8px;
                }
                .dev-endpoint-row {
                    display: flex; align-items: center; justify-content: space-between;
                    gap: 12px; flex-wrap: wrap;
                }
                .dev-endpoint-url {
                    font-size: 18px; font-weight: 800; font-family: 'Fira Code', monospace;
                    word-break: break-all;
                }
                .dev-copy-btn {
                    background: rgba(255,255,255,0.2); border: none;
                    padding: 8px 16px; border-radius: 10px; color: #fff;
                    font-weight: 800; cursor: pointer; font-size: 13px;
                    display: flex; align-items: center; gap: 6px; flex-shrink: 0;
                }

                /* Main Grid */
                .dev-grid {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 24px;
                }
                .dev-left { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
                .dev-right { display: flex; flex-direction: column; gap: 20px; min-width: 0; }

                /* Cards */
                .dev-card {
                    background: #fff; border-radius: 20px; padding: 24px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.02);
                }
                .dev-card-header {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 16px; gap: 8px; flex-wrap: wrap;
                }
                .dev-card-title { font-size: 17px; font-weight: 900; color: #0f172a; margin: 0; }
                .dev-icon-box {
                    width: 40px; height: 40px; border-radius: 12px;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .dev-text-btn {
                    background: transparent; border: none; color: #64748b;
                    cursor: pointer; font-weight: 700; font-size: 12px;
                    display: flex; align-items: center; gap: 6px;
                }

                /* API Key */
                .dev-key-display {
                    position: relative; background: #0f172a;
                    padding: 14px 18px; border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05);
                    margin-bottom: 10px;
                }
                .dev-key-text {
                    font-size: 13px; font-weight: 600;
                    font-family: 'Fira Code', monospace;
                    word-break: break-all; display: block; padding-right: 40px;
                }
                .dev-key-copy {
                    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
                    background: rgba(255,255,255,0.1); border: none;
                    width: 32px; height: 32px; border-radius: 8px;
                    display: flex; align-items: center; justify-content: center; cursor: pointer;
                }
                .dev-generate-btn {
                    width: 100%; padding: 12px; border-radius: 12px;
                    border: none; background: #4f46e5; color: #fff;
                    font-weight: 800; cursor: pointer; font-size: 14px;
                }

                /* Guide Cards */
                .dev-guide-grid { display: flex; flex-direction: column; gap: 12px; }
                .dev-guide-card {
                    background: #fff; padding: 18px 20px; border-radius: 16px;
                    border: 1px solid #f1f5f9;
                }
                .dev-guide-title { font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 2px; }
                .dev-guide-desc { font-size: 13px; font-weight: 500; color: #64748b; line-height: 1.4; }

                /* Table */
                .dev-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
                .dev-table { width: 100%; border-collapse: collapse; text-align: left; }
                .dev-table th {
                    padding: 10px 8px 10px 0; font-size: 11px; color: #94a3b8;
                    text-transform: uppercase; border-bottom: 2px solid #f1f5f9;
                    white-space: nowrap;
                }
                .dev-table td {
                    padding: 12px 8px 12px 0; font-size: 13px; font-weight: 600;
                    color: #0f172a; border-bottom: 1px solid #f8fafc;
                }

                /* Endpoints List */
                .dev-endpoints-list { display: flex; flex-direction: column; gap: 10px; }
                .dev-endpoint-item {
                    display: flex; align-items: center; justify-content: space-between;
                    gap: 8px; flex-wrap: wrap;
                }
                .dev-method-badge {
                    font-size: 10px; font-weight: 900; padding: 3px 8px;
                    border-radius: 6px; text-align: center; flex-shrink: 0;
                }
                .dev-endpoint-path {
                    font-size: 13px; font-weight: 600; color: #0f172a;
                    font-family: monospace;
                }
                .dev-endpoint-desc { font-size: 12px; color: #94a3b8; font-weight: 500; }

                /* Code Box */
                .dev-code-box {
                    background: #0f172a; border-radius: 20px; overflow: hidden;
                    box-shadow: 0 20px 50px -12px rgba(0,0,0,0.35);
                }
                .dev-code-header {
                    padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .dev-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
                .dev-code-label {
                    color: rgba(255,255,255,0.35); font-weight: 800;
                    font-size: 12px; margin-left: 10px;
                }
                .dev-lang-tabs {
                    display: flex; padding: 10px 16px; gap: 6px;
                    background: rgba(255,255,255,0.02); overflow-x: auto;
                }
                .dev-lang-btn {
                    padding: 7px 14px; border-radius: 8px; border: none;
                    font-size: 11px; font-weight: 800; cursor: pointer;
                    text-transform: uppercase; transition: all 0.2s; flex-shrink: 0;
                    background: transparent; color: rgba(255,255,255,0.35);
                }
                .dev-lang-btn.active { background: #4f46e5; color: #fff; }
                .dev-code-body { padding: 16px; position: relative; }
                .dev-pre {
                    background: rgba(0,0,0,0.45); padding: 16px; border-radius: 14px;
                    color: #e2e8f0; font-size: 12px; line-height: 1.6;
                    overflow-x: auto; margin: 0;
                    font-family: 'Fira Code', 'Courier New', monospace;
                    border: 1px solid rgba(255,255,255,0.05);
                    white-space: pre; word-break: normal;
                }
                .dev-code-copy {
                    position: absolute; top: 28px; right: 28px;
                    background: #4f46e5; border: none;
                    width: 34px; height: 34px; border-radius: 8px;
                    display: flex; align-items: center; justify-content: center; cursor: pointer;
                }

                /* Scrollbar hide */
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                .dev-endpoint-item.active { background: #f1f5f9; border-left: 2px solid #4f46e5; }
                .dev-endpoint-tag {
                    color: #4f46e5; background: rgba(79,70,229,0.1);
                    padding: 4px 10px; border-radius: 6px; font-size: 11px;
                    font-weight: 800; font-family: monospace;
                }

                /* Footer */
                .dev-footer-cta {
                    margin-top: 36px; padding: 32px 24px;
                    background: linear-gradient(135deg, #0f172a, #1e293b);
                    border-radius: 20px; text-align: center; color: #fff;
                }
                .dev-footer-cta h3 { font-size: 20px; font-weight: 900; margin: 0 0 6px; }
                .dev-footer-cta p { color: rgba(255,255,255,0.5); font-size: 14px; font-weight: 600; margin: 0 0 20px; }
                .dev-footer-cta a {
                    display: inline-block; padding: 12px 28px; background: #fff;
                    color: #0f172a; border-radius: 12px; font-weight: 900;
                    text-decoration: none; font-size: 14px;
                }

                /* ======= TABLET ======= */
                @media (max-width: 968px) {
                    .dev-grid { grid-template-columns: 1fr !important; }
                    .dev-code-box { position: static !important; }
                }

                /* ======= MOBILE ======= */
                @media (max-width: 600px) {
                    .dev-page { padding: 16px 10px; }
                    .dev-title { font-size: 26px; }
                    .dev-subtitle { font-size: 14px; }
                    .dev-endpoint-banner { padding: 16px; border-radius: 16px; }
                    .dev-endpoint-url { font-size: 13px; }
                    .dev-card { padding: 16px; border-radius: 16px; }
                    .dev-card-title { font-size: 15px; }
                    .dev-guide-card { padding: 14px 16px; border-radius: 14px; }
                    .dev-code-box { border-radius: 16px; }
                    .dev-pre { font-size: 11px; padding: 12px; border-radius: 10px; }
                    .dev-code-body { padding: 12px; }
                    .dev-code-copy { top: 22px; right: 22px; width: 30px; height: 30px; }
                    .dev-footer-cta { padding: 24px 16px; border-radius: 16px; }
                    .dev-footer-cta h3 { font-size: 18px; }
                    .dev-endpoint-row { flex-direction: column; align-items: flex-start; }
                    .dev-copy-btn { width: 100%; justify-content: center; }
                }
            `}</style>
        </div>
    );
};

export default DeveloperPage;
