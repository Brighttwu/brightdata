import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Wifi, RefreshCw, CheckCircle2, XCircle, MessageCircle, ShieldCheck, PartyPopper, Users2, Phone } from 'lucide-react';

import API_URL from '../api/config';

const API = `${API_URL}/agent`;

const StorePage = () => {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const [store, setStore] = useState(null);
    const [packages, setPackages] = useState([]);
    const [network, setNetwork] = useState('mtn');
    const [selectedPkg, setSelectedPkg] = useState(null);
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [pkgLoading, setPkgLoading] = useState(false);
    const [buying, setBuying] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [notFound, setNotFound] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await axios.get(`${API}/public/${slug}`);
                setStore(res.data);
            } catch {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchStore();
        else { setNotFound(true); setLoading(false); }
    }, [slug]);

    // Handle Paystack redirect back with ?reference=xxx
    useEffect(() => {
        const reference = searchParams.get('reference');
        if (!reference || !slug) return;
        setVerifying(true);
        axios.get(`${API}/public/verify/${reference}`)
            .then(res => {
                setOrderSuccess({ message: res.data.message, profit: res.data.profit });
                setSearchParams({});
            })
            .catch(err => {
                setMessage({ type: 'error', text: err.response?.data?.message || 'Payment verification failed.' });
                setSearchParams({});
            })
            .finally(() => setVerifying(false));
    }, [searchParams, slug, setSearchParams]);

    const fetchPackages = useCallback(async () => {
        if (!slug) return;
        setPkgLoading(true);
        setSelectedPkg(null);
        try {
            const res = await axios.get(`${API}/public/${slug}/packages/${network}`);
            setPackages(res.data.packages || []);
        } catch {
            setPackages([]);
        } finally {
            setPkgLoading(false);
        }
    }, [slug, network]);

    useEffect(() => { fetchPackages(); }, [fetchPackages]);

    const handleBuy = async () => {
        if (!selectedPkg || phone.replace(/\s/g,'').length < 10 || !email) return;
        setBuying(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await axios.post(`${API}/public/${slug}/buy-init`, {
                network,
                package_key: selectedPkg.package_key,
                recipient_phone: phone.replace(/\s/g, ''),
                customer_email: email
            });
            window.location.href = res.data.authorization_url;
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Payment failed. Try again.' });
            setBuying(false);
        }
    };

    const networks = [
        { id: 'mtn', name: 'MTN', color: '#FFCC00', textColor: '#111', bg: 'linear-gradient(135deg, #FFCC00, #f59e0b)' },
        { id: 'telecel', name: 'Telecel', color: '#E60000', textColor: '#fff', bg: 'linear-gradient(135deg, #E60000, #9b1c1c)' },
        { id: 'at', name: 'AT', color: '#003399', textColor: '#fff', bg: 'linear-gradient(135deg, #003399, #4f46e5)' }
    ];
    const currentNet = networks.find(n => n.id === network);
    const canBuy = selectedPkg && phone.replace(/\s/g,'').length >= 10 && email && !buying;

    if (loading || verifying) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f8', flexDirection: 'column', gap: 16 }}>
            <RefreshCw size={32} color={theme?.accent || "#4f46e5"} style={{ animation: 'spin 1s linear infinite' }} />
            <div style={{ fontWeight: 700, color: theme?.muted || '#64748b' }}>{verifying ? 'Verifying your payment...' : 'Loading store...'}</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg);} }`}</style>
        </div>
    );

    if (notFound) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f8', flexDirection: 'column' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏪</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>Store Not Found</div>
            <div style={{ fontSize: 15, color: '#64748b', marginTop: 8 }}>This store doesn't exist or has been deactivated.</div>
        </div>
    );

    if (orderSuccess) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f8', padding: 24, fontFamily: "'Inter', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
            <div style={{ background: '#fff', borderRadius: 28, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
                <div style={{ width: 80, height: 80, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <CheckCircle2 size={44} color="#16a34a" />
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 10px' }}>Payment Successful! 🎉</h2>
                <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 28px', lineHeight: 1.6 }}>Your data bundle is being processed and will be delivered shortly.</p>
                <div style={{ background: '#f8fafc', borderRadius: 16, padding: '20px 24px', marginBottom: 28, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Purchased at</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{store?.name}</div>
                </div>
                {store?.whatsapp && (
                    <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px', background: '#25D366', color: '#fff', borderRadius: 14, fontWeight: 800, textDecoration: 'none', fontSize: 15, marginBottom: 16 }}>
                        <MessageCircle size={18} /> Contact Store on WhatsApp
                    </a>
                )}
                <button onClick={() => setOrderSuccess(null)} style={{ width: '100%', padding: '14px', background: '#f1f5f9', border: 'none', borderRadius: 14, fontWeight: 800, color: '#64748b', cursor: 'pointer', fontSize: 14 }}>
                    Buy More Data
                </button>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const themes = {
        classic: {
            id: 'classic',
            headerBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            pageBg: '#f0f2f8',
            cardBg: '#fff',
            cardMuted: '#f8fafc',
            accent: '#4f46e5',
            text: '#0f172a',
            muted: '#64748b',
            radius: '24px',
            shadow: '0 4px 24px rgba(0,0,0,0.06)',
            font: "'Inter', sans-serif",
            border: 'none'
        },
        modern: {
            id: 'modern',
            headerBg: 'linear-gradient(135deg, #ff0055 0%, #ff8800 100%)',
            pageBg: '#fff5f8',
            cardBg: '#fff',
            cardMuted: '#fff0f5',
            accent: '#ff0055',
            text: '#1a1a1a',
            muted: '#777',
            radius: '40px',
            shadow: '0 20px 40px rgba(255, 0, 85, 0.1)',
            font: "'Outfit', sans-serif",
            border: 'none'
        },
        dark: {
            id: 'dark',
            headerBg: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
            pageBg: '#020617',
            cardBg: '#1e293b',
            cardMuted: '#0f172a',
            accent: '#38bdf8',
            text: '#ffffff',
            muted: '#cbd5e1',
            radius: '20px',
            shadow: '0 8px 32px rgba(0,0,0,0.4)',
            font: "'Inter', sans-serif",
            border: '1px solid #334155'
        },
        sunset: {
            id: 'sunset',
            headerBg: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            pageBg: '#fffaf0',
            cardBg: '#fff',
            cardMuted: '#fff7ed',
            accent: '#ea580c',
            text: '#451a03',
            muted: '#92400e',
            radius: '12px',
            shadow: '8px 8px 0px rgba(69, 26, 3, 0.1)',
            font: "'Work Sans', sans-serif",
            border: '3px solid #451a03'
        },
        eco: {
            id: 'eco',
            headerBg: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
            pageBg: '#f0fdf4',
            cardBg: '#fff',
            cardMuted: '#ecfdf5',
            accent: '#059669',
            text: '#064e3b',
            muted: '#047857',
            radius: '32px',
            shadow: '0 10px 25px -5px rgba(5, 150, 105, 0.2)',
            font: "'Nunito', sans-serif",
            border: '2px dashed #059669'
        },
        ocean: {
            id: 'ocean',
            headerBg: 'linear-gradient(135deg, #0369a1 0%, #0891b2 100%)',
            pageBg: '#f0f9ff',
            cardBg: 'rgba(255, 255, 255, 0.8)',
            cardMuted: 'rgba(255, 255, 255, 0.3)',
            accent: '#0284c7',
            text: '#0c4a6e',
            muted: '#0369a1',
            radius: '30px',
            shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            font: "'Quicksand', sans-serif",
            border: '1px solid rgba(255,255,255,0.4)',
            blur: 'blur(12px)'
        },
        luxury: {
            id: 'luxury',
            headerBg: 'linear-gradient(135deg, #000 0%, #333 100%)',
            pageBg: '#f8f8f8',
            cardBg: '#fff',
            cardMuted: '#eee',
            accent: '#d4af37',
            text: '#1a1a1a',
            muted: '#555',
            radius: '0px',
            shadow: 'none',
            font: "'Playfair Display', serif",
            border: '2px solid #d4af37'
        }
    };
    const theme = themes[store?.theme] || themes.classic;

    return (
        <div style={{ minHeight: '100vh', background: theme.pageBg, fontFamily: theme.font, color: theme.text, paddingBottom: 100 }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Outfit:wght@400;700;900&family=Playfair+Display:wght@400;700;900&family=Work+Sans:wght@400;700;900&family=Nunito:wght@400;700;900&family=Quicksand:wght@400;700&display=swap" rel="stylesheet" />

            {/* Store Navbar */}
            <nav style={{ 
                height: 64, position: 'sticky', top: 0, zIndex: 100, background: theme.cardBg, 
                borderBottom: theme.border !== 'none' ? theme.border : `1px solid ${theme.id === 'dark' ? '#334155' : '#e2e8f0'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
                backdropFilter: theme.blur || 'none'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {store?.logo ? 
                        <img src={store.logo} alt="logo" style={{ width: 36, height: 36, borderRadius: theme.id === 'luxury' ? '0px' : '8px', objectFit: 'cover' }} /> :
                        <div style={{ width: 36, height: 36, borderRadius: theme.id === 'luxury' ? '0px' : '8px', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>🏪</div>
                    }
                    <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: theme.id === 'luxury' ? '1px' : 'normal' }}>{store?.name}</div>
                </div>
                {store?.whatsapp && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: theme.accent }}>
                        <Phone size={14} /> <span className="store-whatsapp-text">{store.whatsapp}</span>
                    </div>
                )}
            </nav>

            <style>{`
                @media (max-width: 600px) {
                    .store-whatsapp-text { display: none; }
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                input::placeholder { color: ${theme.id === 'dark' ? '#64748b' : '#94a3b8'}; opacity: 0.8; }
            `}</style>

            {/* Floating Buttons */}
            <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {store?.groupLink && (
                    <a href={store.groupLink} target="_blank" rel="noreferrer" title="Join Community" style={{
                        width: 56, height: 56, borderRadius: '50%', background: '#4f46e5', color: '#fff', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        boxShadow: '0 8px 16px rgba(79, 70, 229, 0.4)', transition: 'transform 0.2s'
                    }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                        <Users2 size={24} />
                    </a>
                )}
                {store?.whatsapp && (
                    <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noreferrer" title="Chat Support" style={{
                        width: 56, height: 56, borderRadius: '50%', background: '#25D366', color: '#fff', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        boxShadow: '0 8px 16px rgba(37, 211, 102, 0.4)', transition: 'transform 0.2s'
                    }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                        <MessageCircle size={24} />
                    </a>
                )}
            </div>

            {/* Store Header */}
            <div style={{ background: theme.headerBg, padding: '56px 24px', textAlign: 'center', color: '#fff' }}>
                {store?.logo ? (
                    <img src={store.logo} alt="logo" style={{ width: 84, height: 84, borderRadius: theme.id === 'luxury' ? '0px' : '22%', objectFit: 'cover', marginBottom: 16, border: '3px solid rgba(255,255,255,0.2)' }} />
                ) : (
                    <div style={{ width: 84, height: 84, borderRadius: theme.id === 'luxury' ? '0px' : '22%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 40, border: '2px solid rgba(255,255,255,0.3)' }}>🏪</div>
                )}
                <h1 style={{ fontSize: 34, fontWeight: 900, margin: '0 0 10px', letterSpacing: theme.id === 'luxury' ? '3px' : 'normal' }}>{store?.name}</h1>
                {store?.description && <p style={{ fontSize: 16, opacity: 0.85, margin: '0 0 24px', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto', fontWeight: 500, lineHeight: 1.6 }}>{store.description}</p>}
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 8 }}>
                        <ShieldCheck size={14} /> Secure Store
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 80 }}>

                <div style={{ 
                    background: theme.cardBg, borderRadius: theme.radius, overflow: 'hidden', 
                    boxShadow: theme.shadow, border: theme.border,
                    backdropFilter: theme.blur || 'none'
                }}>
                    <div style={{ padding: '32px 32px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <Wifi size={24} color={theme.accent} />
                            <span style={{ fontWeight: 900, fontSize: 22, color: theme.text, textTransform: theme.id === 'luxury' ? 'uppercase' : 'none' }}>Data Bundles</span>
                        </div>

                        {/* Network Tabs */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                            {networks.map(n => (
                                <button key={n.id} onClick={() => setNetwork(n.id)} style={{
                                    flex: 1, padding: '15px', borderRadius: theme.id === 'eco' ? '25px' : (theme.id === 'luxury' ? '0px' : '16px'), 
                                    border: theme.id === 'luxury' ? `2px solid ${theme.accent}` : 'none', 
                                    fontWeight: 900, cursor: 'pointer', 
                                    background: network === n.id ? n.bg : theme.cardMuted,
                                    color: network === n.id ? n.textColor : theme.muted,
                                    transform: network === n.id ? 'translateY(-2px)' : 'none',
                                    transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}>{n.name}</button>
                            ))}
                        </div>
                    </div>

                    {/* Packages */}
                    <div style={{ padding: '0 32px', maxHeight: 450, overflowY: 'auto' }}>
                        {pkgLoading ? (
                            <div style={{ textAlign: 'center', padding: '48px 0' }}>
                                <RefreshCw size={24} color={theme.muted} style={{ animation: 'spin 1s linear infinite' }} />
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 14, paddingBottom: 12 }}>
                                {packages.map(p => {
                                    const sel = selectedPkg?.package_key === p.package_key;
                                    const pkgRadius = theme.id === 'eco' ? '20px' : (theme.id === 'luxury' ? '0px' : '16px');
                                    return (
                                        <div key={p.package_key} onClick={() => setSelectedPkg(p)} style={{
                                            padding: '20px 16px', borderRadius: pkgRadius, cursor: 'pointer', transition: 'all 0.25s',
                                            border: sel ? `3px solid ${currentNet.color}` : `1px solid ${theme.id === 'luxury' ? '#eee' : 'transparent'}`,
                                            background: sel ? currentNet.bg : theme.cardMuted,
                                            color: sel ? currentNet.textColor : theme.text,
                                            boxShadow: sel ? `0 12px 24px ${currentNet.color}33` : 'none',
                                            transform: sel ? 'scale(1.03) translateY(-4px)' : 'scale(1)',
                                            position: 'relative',
                                            textAlign: 'center'
                                        }}>
                                            {sel && <CheckCircle2 size={16} style={{ position: 'absolute', top: 12, right: 12 }} />}
                                            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, opacity: 0.8 }}>{p.display_name}</div>
                                            <div style={{ fontSize: 22, fontWeight: 900 }}>₵{p.price.toFixed(2)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Phone + Email + Button */}
                    <div style={{ padding: '24px 32px 32px' }}>
                        {selectedPkg && (
                            <div style={{ 
                                background: theme.cardMuted,
                                borderRadius: theme.id === 'luxury' ? '0px' : '16px', 
                                padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', 
                                border: theme.id === 'luxury' ? `1px solid ${theme.accent}` : `1px solid transparent` 
                            }}>
                                <div>
                                    <div style={{ fontSize: 11, color: theme.muted, fontWeight: 800, textTransform: 'uppercase' }}>Selected Bundle</div>
                                    <div style={{ fontWeight: 900, color: theme.text, fontSize: 16 }}>{currentNet.name} {selectedPkg.display_name}</div>
                                </div>
                                <div style={{ fontSize: 26, fontWeight: 900, color: theme.accent }}>₵{selectedPkg.price.toFixed(2)}</div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: theme.muted, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>Recipient Number</label>
                                <input type="tel" placeholder="024 000 0000" value={phone} onChange={e => setPhone(e.target.value)}
                                    style={{ 
                                        width: '100%', padding: '16px 20px', borderRadius: theme.id === 'eco' ? '30px' : (theme.id === 'luxury' ? '0px' : '14px'), 
                                        border: theme.id === 'luxury' ? `1px solid #ddd` : `2px solid ${theme.id === 'dark' ? '#334155' : '#f1f5f9'}`, outline: 'none', 
                                        fontWeight: 800, fontSize: 17, boxSizing: 'border-box', background: theme.id === 'dark' ? '#0f172a' : '#fff', color: theme.text,
                                        transition: 'all 0.2s'
                                    }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: theme.muted, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>Your Email</label>
                                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                                    style={{ 
                                        width: '100%', padding: '16px 20px', borderRadius: theme.id === 'eco' ? '30px' : (theme.id === 'luxury' ? '0px' : '14px'), 
                                        border: theme.id === 'luxury' ? `1px solid #ddd` : `2px solid ${theme.id === 'dark' ? '#334155' : '#f1f5f9'}`, outline: 'none', 
                                        fontWeight: 800, fontSize: 15, boxSizing: 'border-box', background: theme.id === 'dark' ? '#0f172a' : '#fff', color: theme.text,
                                        transition: 'all 0.2s'
                                    }} />
                            </div>
                        </div>

                        {message.text && (
                            <div style={{ padding: '14px 18px', borderRadius: theme.id === 'luxury' ? '0px' : '14px', marginBottom: 20, fontWeight: 800, fontSize: 14, background: message.type === 'success' ? '#f0fdf4' : '#fef2f2', color: message.type === 'success' ? '#16a34a' : '#dc2626', border: theme.id === 'luxury' ? `1px solid ${message.type === 'success' ? '#16a34a' : '#dc2626'}` : 'none' }}>
                                {message.text}
                            </div>
                        )}

                        <button onClick={handleBuy} disabled={!canBuy} style={{
                            width: '100%', padding: '20px', borderRadius: theme.id === 'eco' ? '40px' : (theme.id === 'luxury' ? '0px' : '18px'), border: 'none',
                            background: canBuy ? (theme.id === 'luxury' ? '#000' : `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`) : '#e2e8f0',
                            color: canBuy ? '#fff' : theme.muted, fontWeight: 900, fontSize: 17, cursor: canBuy ? 'pointer' : 'not-allowed',
                            boxShadow: canBuy && (theme.id !== 'luxury' && theme.id !== 'sunset') ? `0 12px 32px ${theme.accent}44` : 'none',
                            transition: 'all 0.3s ease',
                            textTransform: (theme.id === 'luxury' || theme.id === 'sunset') ? 'uppercase' : 'none',
                            letterSpacing: (theme.id === 'luxury' || theme.id === 'sunset') ? '2px' : 'normal'
                        }}>
                            {buying ? 'Processing Payment...' : (selectedPkg ? `Buy for ₵${selectedPkg.price.toFixed(2)}` : 'Select a Bundle')}
                        </button>
                    </div>
                </div>


            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default StorePage;
