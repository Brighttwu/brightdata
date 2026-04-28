import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    Wifi, RefreshCw, CheckCircle2, MessageCircle,
    ShieldCheck, ShieldAlert, Users2, AlertCircle, Ban, Zap, Star, Sparkles, Download, X, Search, ShoppingBag, Clock
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   THEME DEFINITIONS
   Each theme has: colors, typography, shape/radius DNA, and layout hints
───────────────────────────────────────────────────────────────────────────── */
const THEMES = {

    // ── 1. CLASSIC ── Clean corporate navy/indigo
    classic: {
        font: "'Inter', sans-serif",
        pageBg: '#f0f2f8',
        // Header: tall centered gradient banner
        headerBg: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        headerStyle: 'centered',        // centered | split | minimal
        navBg: '#fff',
        navBorder: '1px solid #e2e8f0',
        cardBg: '#fff',
        cardMuted: '#f8fafc',
        accent: '#4f46e5',
        accentText: '#fff',
        text: '#0f172a',
        muted: '#64748b',
        radius: '20px',
        btnRadius: '16px',
        inputRadius: '12px',
        tabRadius: '12px',
        pkgRadius: '16px',
        shadow: '0 4px 24px rgba(0,0,0,0.06)',
        pkgLayout: 'grid',             // grid | list | cards
        pkgSelected: (net) => ({ background: net.bg, color: net.textColor, border: `3px solid ${net.color}` }),
        border: '1px solid #f1f5f9',
        headerTitleSize: 34,
    },

    // ── 2. MODERN ── Vibrant pink gradient, big pill shapes
    modern: {
        font: "'Outfit', sans-serif",
        pageBg: '#fdf2f8',
        headerBg: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
        headerStyle: 'centered',
        navBg: '#fff',
        navBorder: '1px solid #fce7f3',
        cardBg: '#fff',
        cardMuted: '#fff0f7',
        accent: '#ec4899',
        accentText: '#fff',
        text: '#1a1a2e',
        muted: '#9d174d',
        radius: '32px',
        btnRadius: '50px',
        inputRadius: '50px',
        tabRadius: '50px',
        pkgRadius: '24px',
        shadow: '0 16px 48px rgba(236, 72, 153, 0.13)',
        pkgLayout: 'grid',
        pkgSelected: (net) => ({ background: net.bg, color: net.textColor, border: `0px`, boxShadow: `0 12px 32px ${net.color}55` }),
        border: 'none',
        headerTitleSize: 38,
    },

    // ── 3. DARK ── Midnight terminal aesthetic, cyan accents
    dark: {
        font: "'JetBrains Mono', 'Fira Code', monospace",
        pageBg: '#050a14',
        headerBg: 'linear-gradient(180deg, #0a0f1e 0%, #050a14 100%)',
        headerStyle: 'split',
        navBg: '#0a0f1e',
        navBorder: '1px solid #1e2d45',
        cardBg: '#0d1927',
        cardMuted: '#0a0f1e',
        accent: '#00d4ff',
        accentText: '#000',
        text: '#e2e8f0',
        muted: '#64748b',
        radius: '8px',
        btnRadius: '6px',
        inputRadius: '6px',
        tabRadius: '6px',
        pkgRadius: '8px',
        shadow: '0 0 0 1px #1e2d45, 0 8px 32px rgba(0,0,0,0.6)',
        pkgLayout: 'list',
        pkgSelected: (net) => ({ background: 'rgba(0,212,255,0.12)', color: '#00d4ff', border: `1px solid #00d4ff`, boxShadow: '0 0 12px rgba(0,212,255,0.3)' }),
        border: '1px solid #1e2d45',
        headerTitleSize: 28,
    },

    // ── 4. SUNSET ── Bold newspaper / brutalist style, warm oranges
    sunset: {
        font: "'Work Sans', sans-serif",
        pageBg: '#fffbf5',
        headerBg: 'linear-gradient(135deg, #f97316 0%, #ef4444 60%, #db2777 100%)',
        headerStyle: 'centered',
        navBg: '#fff',
        navBorder: '4px solid #0f172a',
        cardBg: '#fff',
        cardMuted: '#fff7ed',
        accent: '#ea580c',
        accentText: '#fff',
        text: '#1c0a00',
        muted: '#78350f',
        radius: '0px',
        btnRadius: '0px',
        inputRadius: '0px',
        tabRadius: '0px',
        pkgRadius: '0px',
        shadow: '5px 5px 0 #1c0a00',
        pkgLayout: 'grid',
        pkgSelected: (net) => ({ background: net.bg, color: net.textColor, border: `3px solid #1c0a00`, boxShadow: '4px 4px 0 #1c0a00' }),
        border: '3px solid #1c0a00',
        headerTitleSize: 40,
    },

    // ── 5. ECO ── Nature rounded, lush greens, organic feel
    eco: {
        font: "'Nunito', sans-serif",
        pageBg: '#f0fdf4',
        headerBg: 'linear-gradient(160deg, #064e3b 0%, #059669 60%, #34d399 100%)',
        headerStyle: 'leafy',
        navBg: '#fff',
        navBorder: '2px solid #a7f3d0',
        cardBg: '#fff',
        cardMuted: '#ecfdf5',
        accent: '#10b981',
        accentText: '#fff',
        text: '#064e3b',
        muted: '#047857',
        radius: '28px',
        btnRadius: '50px',
        inputRadius: '50px',
        tabRadius: '50px',
        pkgRadius: '24px',
        shadow: '0 8px 24px rgba(5,150,105,0.15)',
        pkgLayout: 'grid',
        pkgSelected: (net) => ({ background: net.bg, color: net.textColor, border: `2px dashed white`, boxShadow: '0 8px 20px rgba(5,150,105,0.4)' }),
        border: '2px dashed #10b981',
        headerTitleSize: 36,
    },

    // ── 6. OCEAN ── Glassmorphism, deep blue-cyan, frosted cards
    ocean: {
        font: "'Quicksand', sans-serif",
        pageBg: 'linear-gradient(160deg, #0c4a6e 0%, #0ea5e9 60%, #67e8f9 100%)',
        headerBg: 'transparent',
        headerStyle: 'glass',
        navBg: 'rgba(12,74,110,0.7)',
        navBorder: '1px solid rgba(255,255,255,0.15)',
        cardBg: 'rgba(255,255,255,0.12)',
        cardMuted: 'rgba(255,255,255,0.08)',
        accent: '#38bdf8',
        accentText: '#0c4a6e',
        text: '#fff',
        muted: 'rgba(255,255,255,0.75)',
        radius: '24px',
        btnRadius: '20px',
        inputRadius: '16px',
        tabRadius: '50px',
        pkgRadius: '20px',
        shadow: '0 8px 32px rgba(0,0,0,0.2)',
        pkgLayout: 'grid',
        pkgSelected: (net) => ({ background: 'rgba(255,255,255,0.25)', color: '#fff', border: `2px solid rgba(255,255,255,0.6)`, backdropFilter: 'blur(12px)' }),
        border: '1px solid rgba(255,255,255,0.2)',
        headerTitleSize: 36,
        blur: 'blur(20px)',
    },

    // ── 7. LUXURY ── Black/gold, serif typography, editorial
    luxury: {
        font: "'Playfair Display', serif",
        pageBg: '#0a0a0a',
        headerBg: 'linear-gradient(180deg, #000 0%, #1a1400 100%)',
        headerStyle: 'luxury',
        navBg: '#000',
        navBorder: '1px solid #d4af37',
        cardBg: '#111',
        cardMuted: '#1a1a1a',
        accent: '#d4af37',
        accentText: '#000',
        text: '#f5f0e0',
        muted: '#a09070',
        radius: '0px',
        btnRadius: '0px',
        inputRadius: '0px',
        tabRadius: '0px',
        pkgRadius: '0px',
        shadow: 'none',
        pkgLayout: 'grid',
        pkgSelected: (net) => ({ background: '#d4af37', color: '#000', border: `1px solid #d4af37` }),
        border: '1px solid #d4af37',
        headerTitleSize: 44,
    },
};

/* ─────────────────────────────────────────────────────────────────────────────
   STORE PAGE COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const StorePage = () => {
    const { slug } = useParams();
    const { loading: authLoading } = useAuth();

    const [store, setStore] = useState(null);
    const [packages, setPackages] = useState([]);
    const [network, setNetwork] = useState('mtn');
    const [selectedPkg, setSelectedPkg] = useState(null);
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [pkgLoading, setPkgLoading] = useState(false);
    const [buying, setBuying] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [notFound, setNotFound] = useState(false);
    const [platformSettings, setPlatformSettings] = useState(null);
    const [showStoreNotification, setShowStoreNotification] = useState(false);
    const [showTracking, setShowTracking] = useState(false);
    const [trackingPhone, setTrackingPhone] = useState('');
    const [trackingOrders, setTrackingOrders] = useState([]);
    const [trackingLoading, setTrackingLoading] = useState(false);
    
    const [detectedNet, setDetectedNet] = useState(null);
    const [isMismatch, setIsMismatch] = useState(false);
    const [duplicateLock, setDuplicateLock] = useState(null); // { timeLeft: number, phone: string }

    useEffect(() => {
        // Show notification popup once per session after store loads
        if (store?.notification && !sessionStorage.getItem(`notified_${slug}`)) {
            const timer = setTimeout(() => setShowStoreNotification(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [store, slug]);

    const closeNotification = () => {
        setShowStoreNotification(false);
        sessionStorage.setItem(`notified_${slug}`, 'true');
    };

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const [storeRes, settingsRes] = await Promise.all([
                    api.get(`/agent/public/${slug}`),
                    api.get('/admin/settings')
                ]);
                setStore(storeRes.data);
                setPlatformSettings(settingsRes.data);
                // Update page title
                if (storeRes.data?.name) {
                    document.title = `${storeRes.data.name} - Data Hub`;
                }
            } catch {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchStore();
        else { setNotFound(true); setLoading(false); }
    }, [slug]);

    const fetchPackages = useCallback(async () => {
        if (!slug) return;
        setPkgLoading(true);
        setSelectedPkg(null);
        try {
            const res = await api.get(`/agent/public/${slug}/packages/${network}`);
            setPackages(res.data.packages || []);
        } catch {
            setPackages([]);
        } finally {
            setPkgLoading(false);
        }
    }, [slug, network]);

    useEffect(() => { fetchPackages(); }, [fetchPackages]);

    useEffect(() => {
        const num = phone.replace(/\s/g, '');
        if (num.length >= 3) {
            const prefix = num.substring(0, 3);
            const mtn = ['024', '025', '053', '054', '055', '059'];
            const telecel = ['020', '050'];
            const at = ['026', '027', '056', '057'];
            
            let detected = null;
            if (mtn.includes(prefix)) detected = 'mtn';
            else if (telecel.includes(prefix)) detected = 'telecel';
            else if (at.includes(prefix)) detected = 'at';
            
            setDetectedNet(detected);
            setIsMismatch(detected && detected !== network);
        } else {
            setDetectedNet(null);
            setIsMismatch(false);
        }
    }, [phone, network]);

    useEffect(() => {
        if (duplicateLock && duplicateLock.timeLeft > 0) {
            const timer = setInterval(() => {
                setDuplicateLock(prev => prev ? { ...prev, timeLeft: prev.timeLeft - 1 } : null);
            }, 1000);
            return () => clearInterval(timer);
        } else if (duplicateLock && duplicateLock.timeLeft <= 0) {
            setDuplicateLock(null);
        }
    }, [duplicateLock]);

    const handleBuy = async () => {
        if (!selectedPkg || phone.replace(/\s/g, '').length < 10 || !email || platformSettings?.isMaintenanceMode) return;
        setBuying(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await api.post(`/agent/public/${slug}/buy-init`, {
                network,
                package_key: selectedPkg.package_key,
                recipient_phone: phone.replace(/\s/g, ''),
                customer_email: email
            });
            window.location.href = res.data.authorization_url;
        } catch (err) {
            if (err.response?.data?.recentOrder) {
                setDuplicateLock({ 
                    timeLeft: err.response.data.timeLeft, 
                    phone: phone 
                });
            } else {
                setMessage({ type: 'error', text: err.response?.data?.message || 'Payment failed. Try again.' });
            }
            setBuying(false);
        }
    };

    const handleTrackOrders = async () => {
        if (trackingPhone.length < 10) return;
        setTrackingLoading(true);
        try {
            const res = await api.get(`/agent/public/${slug}/track/${trackingPhone}`);
            setTrackingOrders(res.data || []);
            if (res.data.length === 0) setMessage({ type: 'info', text: 'No orders found for this number.' });
            else setMessage({ type: '', text: '' });
        } catch {
            setMessage({ type: 'error', text: 'Error fetching orders.' });
        } finally {
            setTrackingLoading(false);
        }
    };

    const networks = [
        { id: 'mtn', name: 'MTN', color: '#FFCC00', textColor: '#111', bg: 'linear-gradient(135deg, #FFCC00, #f59e0b)' },
        { id: 'telecel', name: 'Telecel', color: '#E60000', textColor: '#fff', bg: 'linear-gradient(135deg, #E60000, #9b1c1c)' },
        { id: 'at', name: 'AT', color: '#003399', textColor: '#fff', bg: 'linear-gradient(135deg, #003399, #4f46e5)' }
    ];
    const currentNet = networks.find(n => n.id === network);
    const canBuy = selectedPkg && phone.replace(/\s/g, '').length >= 10 && email && !buying && !platformSettings?.isMaintenanceMode;

    // ── Loading / Not Found ──────────────────────────────────────────────────
    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050a14', fontFamily: "'Inter', sans-serif" }}>
            <RefreshCw size={36} color="#4f46e5" style={{ animation: 'spin 1s linear infinite' }} />
            <div style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: '#64748b', letterSpacing: '0.1em' }}>LOADING STORE…</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (notFound) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f8', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏪</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>Store Not Found</div>
            <div style={{ fontSize: 15, color: '#64748b', marginTop: 8 }}>This store doesn't exist or has been deactivated.</div>
        </div>
    );

    const t = THEMES[store?.theme] || THEMES.classic;
    const isDark = ['dark', 'ocean', 'luxury'].includes(store?.theme);
    const isOcean = store?.theme === 'ocean';

    /* ── Shared input style ─────────────────────────────────────────────── */
    const inputStyle = {
        width: '100%',
        padding: '15px 18px',
        borderRadius: t.inputRadius,
        border: `2px solid ${isDark && !isOcean ? '#1e2d45' : isOcean ? 'rgba(255,255,255,0.25)' : '#e2e8f0'}`,
        outline: 'none',
        fontWeight: 700,
        fontSize: 15,
        boxSizing: 'border-box',
        background: isDark && !isOcean ? '#050a14' : isOcean ? 'rgba(255,255,255,0.1)' : '#fff',
        color: t.text,
        fontFamily: t.font,
        backdropFilter: isOcean ? 'blur(10px)' : 'none',
        transition: 'border-color 0.2s',
    };

    /* ── Package card render ───────────────────────────────────────────── */
    const renderPackage = (p) => {
        const sel = selectedPkg?.package_key === p.package_key;
        const selStyle = sel ? t.pkgSelected(currentNet) : {};
        const baseStyle = {
            padding: t.pkgLayout === 'list' ? '14px 20px' : '20px 14px',
            borderRadius: t.pkgRadius,
            cursor: 'pointer',
            transition: 'all 0.22s ease',
            border: `1px solid ${isDark ? '#1e2d45' : isOcean ? 'rgba(255,255,255,0.15)' : '#f1f5f9'}`,
            background: isDark && !isOcean ? t.cardMuted : isOcean ? 'rgba(255,255,255,0.07)' : t.cardMuted,
            color: t.text,
            position: 'relative',
            textAlign: t.pkgLayout === 'list' ? 'left' : 'center',
            display: t.pkgLayout === 'list' ? 'flex' : 'block',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: isOcean ? 'blur(8px)' : 'none',
            transform: sel && t.pkgLayout !== 'list' ? 'translateY(-4px) scale(1.03)' : 'none',
            ...selStyle,
        };

        return (
            <div key={p.package_key} className="store-pkg-item" onClick={() => setSelectedPkg(p)} style={baseStyle}>
                {sel && t.pkgLayout !== 'list' && (
                    <CheckCircle2 size={15} style={{ position: 'absolute', top: 10, right: 10 }} />
                )}
                <div style={{ fontSize: t.pkgLayout === 'list' ? 14 : 12, fontWeight: 800, opacity: sel ? 1 : 0.75, marginBottom: t.pkgLayout === 'list' ? 0 : 6 }}>
                    {p.display_name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: t.pkgLayout === 'list' ? 'flex-end' : 'center' }}>
                    {sel && t.pkgLayout === 'list' && <CheckCircle2 size={14} />}
                    <div style={{ fontSize: t.pkgLayout === 'list' ? 18 : 22, fontWeight: 900 }}>
                        ₵{p.price.toFixed(2)}
                    </div>
                </div>
            </div>
        );
    };

    /* ── Google Fonts loader ───────────────────────────────────────────── */
    const googleFonts = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Outfit:wght@400;700;900&family=Playfair+Display:wght@400;700;900&family=Work+Sans:wght@400;700;900&family=Nunito:wght@400;700;900&family=Quicksand:wght@500;700&family=JetBrains+Mono:wght@400;700;800&display=swap";

    return (
        <div style={{ minHeight: '100vh', background: t.pageBg, fontFamily: t.font, color: t.text, paddingBottom: 80 }}>
            <link href={googleFonts} rel="stylesheet" />

            {/* ── DUPLICATE LOCK MODAL ────────────────────────────────── */}
            {duplicateLock && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.8)', zIndex: 100001,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 20, backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s'
                }}>
                    <div style={{
                        background: t.cardBg, borderRadius: t.radius, padding: 32, maxWidth: 400, width: '100%',
                        textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        animation: 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        color: t.text, border: t.border
                    }}>
                        <div style={{
                            width: 64, height: 64, background: isOcean ? 'rgba(255,255,255,0.1)' : t.cardMuted, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px', color: t.accent
                        }}>
                            <Clock size={32} />
                        </div>
                        <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>Please Wait</h3>
                        <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.6, marginBottom: 24 }}>
                            A recent order for <b>{duplicateLock.phone}</b> is being processed. 
                            To avoid double charges, please wait for the timer to finish.
                        </p>
                        
                        <div style={{ 
                            fontSize: 32, fontWeight: 900, color: t.accent, 
                            background: isOcean ? 'rgba(255,255,255,0.05)' : t.cardMuted, padding: '16px', borderRadius: 16,
                            marginBottom: 24, border: t.border
                        }}>
                            {Math.floor(duplicateLock.timeLeft / 60)}:{(duplicateLock.timeLeft % 60).toString().padStart(2, '0')}
                        </div>

                        <button 
                            onClick={() => setDuplicateLock(null)}
                            style={{
                                width: '100%', padding: '14px', background: t.accent,
                                color: t.accentText, border: 'none', borderRadius: t.btnRadius,
                                fontWeight: 800, cursor: 'pointer'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* ── Global CSS ────────────────────────────────────────── */}
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes glow { 0%,100% { box-shadow: 0 0 12px ${t.accent}44; } 50% { box-shadow: 0 0 28px ${t.accent}88; } }
                .store-pkg-item:hover { transform: translateY(-3px) !important; }
                .store-nav-icon { transition: transform 0.2s; }
                .store-nav-icon:hover { transform: scale(1.12); }
                input::placeholder { color: ${isDark ? '#334155' : '#94a3b8'}; }
                .store-tab-btn:hover { opacity: 0.9; transform: translateY(-1px); }
                /* Dark theme mono price */
                ${store?.theme === 'dark' ? '.mono-price { font-variant-numeric: tabular-nums; letter-spacing: 0.05em; }' : ''}
                /* Luxury gold underline */
                ${store?.theme === 'luxury' ? 'h1 { border-bottom: 2px solid #d4af37; padding-bottom: 12px; display: inline-block; }' : ''}
                /* Eco leaf border */
                ${store?.theme === 'eco' ? '.eco-section { position: relative; } .eco-section::before { content: "🌿"; position: absolute; top: -14px; left: 20px; font-size: 24px; }' : ''}

                @media (max-width: 600px) {
                    .mobile-hide { display: none !important; }
                    .store-nav { padding: 0 14px !important; }
                    .store-header { padding: 36px 16px !important; }
                    .store-content { padding: 16px 12px !important; }
                    .store-card-inner { padding: 20px 16px !important; }
                    .store-tabs { gap: 8px !important; }
                    .pkg-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .pkg-list { gap: 6px !important; }
                    .store-inputs { grid-template-columns: 1fr !important; }
                }
            `}</style>

            {/* ── NAVBAR ────────────────────────────────────────────── */}
            <nav className="store-nav" style={{
                height: 60,
                position: 'sticky', top: 0, zIndex: 100,
                background: t.navBg,
                borderBottom: t.navBorder,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 24px',
                backdropFilter: t.blur || 'none',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {store?.logo ? (
                        <img src={store.logo} alt="logo" style={{ width: 34, height: 34, borderRadius: store?.theme === 'luxury' ? 0 : store?.theme === 'sunset' ? 0 : '8px', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: 34, height: 34, borderRadius: store?.theme === 'luxury' ? 0 : '8px', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.accentText, fontSize: 16 }}>🏪</div>
                    )}
                    <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: store?.theme === 'luxury' ? '2px' : 'normal', textTransform: store?.theme === 'luxury' ? 'uppercase' : 'none', color: isOcean ? '#fff' : t.text }}>
                        {store?.name}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button 
                        onClick={() => setShowTracking(true)}
                        title="Track Order"
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, 
                            color: t.accent, background: isOcean ? 'rgba(255,255,255,0.12)' : isDark ? `${t.accent}14` : `${t.accent}12`, 
                            padding: '5px 12px', borderRadius: '50px', border: `1px solid ${t.accent}33`, cursor: 'pointer' 
                        }}
                    >
                        <Search size={13} /> <span className="mobile-hide">Track Order</span>
                    </button>

                    <button 
                        onClick={() => {
                            alert("To install this store on your phone:\n\n1. Tap the Share button (iOS) or Menu (Android)\n2. Select 'Add to Home Screen'\n3. Enjoy instant access!");
                        }}
                        title="Install App"
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, 
                            color: t.accent, background: isOcean ? 'rgba(255,255,255,0.12)' : isDark ? `${t.accent}14` : `${t.accent}12`, 
                            padding: '5px 12px', borderRadius: '50px', border: `1px solid ${t.accent}33`, cursor: 'pointer' 
                        }}
                    >
                        <Download size={13} /> <span className="mobile-hide">Install</span>
                    </button>

                    {/* Agent's own WhatsApp number — clickable link */}
                    {store?.whatsapp ? (
                        <a
                            href={`https://wa.me/${store.whatsapp}`}
                            target="_blank"
                            rel="noreferrer"
                            className="store-whatsapp-nav"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                fontSize: 11, fontWeight: 800,
                                color: t.accent,
                                background: isOcean ? 'rgba(255,255,255,0.12)' : isDark ? `${t.accent}14` : `${t.accent}12`,
                                padding: '5px 10px', borderRadius: '50px',
                                border: `1px solid ${t.accent}33`,
                                textDecoration: 'none',
                                transition: 'opacity 0.2s',
                            }}
                        >
                            <MessageCircle size={14} />
                            <span className="store-whatsapp-num mobile-hide">{store.whatsapp}</span>
                        </a>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: t.accent, background: isOcean ? 'rgba(255,255,255,0.12)' : isDark ? `${t.accent}14` : `${t.accent}12`, padding: '5px 10px', borderRadius: '50px', border: `1px solid ${t.accent}33` }}>
                            <ShieldCheck size={13} /> <span className="mobile-hide">Secure</span>
                        </div>
                    )}
                </div>
            </nav>

            {/* ── HEADER — varies by theme ───────────────────────────── */}
            {t.headerStyle === 'glass' ? (
                /* Ocean: full-page glass, no separate header block */
                <div className="store-header" style={{ padding: '64px 24px 48px', textAlign: 'center', color: '#fff', position: 'relative' }}>
                    {store?.logo ? (
                        <img src={store.logo} alt="logo" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', marginBottom: 16, border: '3px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(6px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} />
                    ) : (
                        <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 40, border: '2px solid rgba(255,255,255,0.3)' }}>🏪</div>
                    )}
                    <h1 style={{ fontSize: t.headerTitleSize, fontWeight: 900, margin: '0 0 8px', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>{store?.name}</h1>
                    {store?.description && <p style={{ fontSize: 15, opacity: 0.85, margin: '0 0 0', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>{store.description}</p>}
                </div>
            ) : t.headerStyle === 'luxury' ? (
                /* Luxury: tight centered with gold dividers */
                <div className="store-header" style={{ padding: '60px 24px 48px', textAlign: 'center', background: t.headerBg, color: '#f5f0e0' }}>
                    <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#d4af37', marginBottom: 16, textTransform: 'uppercase' }}>✦ Premium Data Store ✦</div>
                    {store?.logo ? (
                        <img src={store.logo} alt="logo" style={{ width: 80, height: 80, objectFit: 'cover', marginBottom: 18, border: '2px solid #d4af37' }} />
                    ) : (
                        <div style={{ width: 80, height: 80, background: '#1a1400', border: '2px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 36 }}>🏪</div>
                    )}
                    <h1 style={{ fontSize: t.headerTitleSize, fontWeight: 900, margin: '0 0 12px', letterSpacing: '4px', textTransform: 'uppercase', color: '#f5f0e0' }}>{store?.name}</h1>
                    <div style={{ width: 80, height: 2, background: '#d4af37', margin: '0 auto 16px' }} />
                    {store?.description && <p style={{ fontSize: 14, opacity: 0.7, margin: 0, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.8, letterSpacing: '0.05em' }}>{store.description}</p>}
                </div>
            ) : t.headerStyle === 'split' ? (
                /* Dark: split side layout with code-style decorations */
                <div className="store-header" style={{ padding: '40px 24px', background: t.headerBg, borderBottom: '1px solid #1e2d45' }}>
                    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                        {store?.logo ? (
                            <img src={store.logo} alt="logo" style={{ width: 80, height: 80, borderRadius: '8px', objectFit: 'cover', border: '1px solid #1e2d45' }} />
                        ) : (
                            <div style={{ width: 80, height: 80, borderRadius: '8px', background: '#0a0f1e', border: '1px solid #00d4ff33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🏪</div>
                        )}
                        <div>
                            <div style={{ fontSize: 11, color: '#00d4ff', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 6 }}>$ ./store --name</div>
                            <h1 style={{ fontSize: t.headerTitleSize, fontWeight: 900, margin: '0 0 8px', color: '#e2e8f0', fontFamily: t.font }}>{store?.name}</h1>
                            {store?.description && <p style={{ fontSize: 13, color: '#64748b', margin: 0, maxWidth: 480, lineHeight: 1.6 }}>{store.description}</p>}
                        </div>
                    </div>
                </div>
            ) : t.headerStyle === 'leafy' ? (
                /* Eco: leafy organic curves */
                <div className="store-header" style={{ padding: '56px 24px 72px', textAlign: 'center', background: t.headerBg, color: '#fff', borderRadius: '0 0 60px 60px', position: 'relative' }}>
                    {store?.logo ? (
                        <img src={store.logo} alt="logo" style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', marginBottom: 16, border: '4px solid rgba(255,255,255,0.35)' }} />
                    ) : (
                        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 40, border: '3px dashed rgba(255,255,255,0.4)' }}>🌿</div>
                    )}
                    <h1 style={{ fontSize: t.headerTitleSize, fontWeight: 900, margin: '0 0 8px' }}>{store?.name}</h1>
                    {store?.description && <p style={{ fontSize: 15, opacity: 0.85, margin: 0, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>{store.description}</p>}
                    <div style={{ marginTop: 16, fontSize: 22 }}>🌱 🌿 🍃</div>
                </div>
            ) : (
                /* Classic, Modern, Sunset: standard centered hero */
                <div className="store-header" style={{ padding: '56px 24px 48px', textAlign: 'center', background: t.headerBg, color: '#fff' }}>
                    {store?.logo ? (
                        <img src={store.logo} alt="logo" style={{ width: 86, height: 86, borderRadius: store?.theme === 'sunset' ? '0px' : '22%', objectFit: 'cover', marginBottom: 16, border: '3px solid rgba(255,255,255,0.3)' }} />
                    ) : (
                        <div style={{ width: 86, height: 86, borderRadius: store?.theme === 'sunset' ? '0px' : '22%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 40, border: store?.theme === 'sunset' ? '4px solid #fff' : '2px solid rgba(255,255,255,0.3)' }}>🏪</div>
                    )}
                    {store?.theme === 'sunset' && (
                        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8, opacity: 0.8 }}>⚡ DATA STORE ⚡</div>
                    )}
                    <h1 style={{ fontSize: t.headerTitleSize, fontWeight: 900, margin: '0 0 10px', letterSpacing: store?.theme === 'modern' ? '-1px' : store?.theme === 'sunset' ? '2px' : 'normal', textTransform: store?.theme === 'sunset' ? 'uppercase' : 'none' }}>{store?.name}</h1>
                    {store?.description && <p style={{ fontSize: 15, opacity: 0.85, margin: '0 0 20px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>{store.description}</p>}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, background: 'rgba(255,255,255,0.12)', padding: '6px 14px', borderRadius: store?.theme === 'sunset' ? '0' : '50px', border: store?.theme === 'sunset' ? '2px solid #fff' : 'none' }}>
                        <ShieldCheck size={13} /> Secure Payments
                    </div>
                </div>
            )}

            {/* ── MAIN CONTENT ──────────────────────────────────────── */}
            <div className="store-content" style={{ maxWidth: 800, margin: '0 auto', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 80 }}>

                {/* Agent Store Notification Popup */}
                {showStoreNotification && (
                    <div style={{ 
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                        padding: 20
                    }}>
                        <div style={{ 
                            background: t.cardBg, padding: 32, borderRadius: t.radius, width: '100%', maxWidth: 420,
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: t.border,
                            position: 'relative', textAlign: 'center', color: t.text, animation: 'fadeUp 0.3s ease'
                        }}>
                            <button onClick={closeNotification} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: t.muted }}>
                                <X size={20} />
                            </button>
                            <div style={{ width: 64, height: 64, background: `${t.accent}22`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <AlertCircle size={32} color={t.accent} />
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>Store Notice</h2>
                            <p style={{ fontSize: 15, lineHeight: 1.6, fontWeight: 600, color: t.muted }}>{store.notification}</p>
                            <button 
                                onClick={closeNotification}
                                style={{ 
                                    marginTop: 24, width: '100%', padding: '14px', borderRadius: t.btnRadius, 
                                    background: t.accent, color: t.accentText, border: 'none', fontWeight: 900, cursor: 'pointer' 
                                }}
                            >
                                Got it, Boss!
                            </button>
                        </div>
                    </div>
                )}

                {/* Price protection warning */}
                {packages.some(p => p.isPriceWarning) && (
                    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: t.radius, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12, color: '#9a3412' }}>
                        <AlertCircle size={20} color="#ea580c" style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                            <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 3 }}>Price Protection Active</div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>Some bundles are priced below cost and have been auto-adjusted.</div>
                        </div>
                    </div>
                )}

                {/* ── Main card ─────────────────────────────────────── */}
                <div style={{
                    background: t.cardBg,
                    borderRadius: t.radius,
                    boxShadow: t.shadow,
                    border: t.border,
                    overflow: 'hidden',
                    backdropFilter: t.blur || 'none',
                    animation: 'fadeUp 0.4s ease',
                }}>
                    <div className="store-card-inner" style={{ padding: '28px 28px 0' }}>
                        {/* Section title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                            {store?.theme === 'dark' ? <Zap size={20} color={t.accent} /> :
                             store?.theme === 'luxury' ? <Star size={20} color={t.accent} /> :
                             store?.theme === 'eco' ? <span style={{ fontSize: 18 }}>🌿</span> :
                             store?.theme === 'modern' ? <Sparkles size={20} color={t.accent} /> :
                             <Wifi size={20} color={t.accent} />}
                            <span style={{
                                fontWeight: 900,
                                fontSize: 20,
                                color: isOcean ? '#fff' : t.text,
                                textTransform: store?.theme === 'luxury' || store?.theme === 'sunset' ? 'uppercase' : 'none',
                                letterSpacing: store?.theme === 'luxury' ? '3px' : store?.theme === 'dark' ? '0.05em' : 'normal',
                            }}>
                                {store?.theme === 'dark' ? '> Data Bundles' :
                                 store?.theme === 'luxury' ? 'Select Bundle' :
                                 store?.theme === 'eco' ? 'Eco Data Bundles 🌱' :
                                 'Data Bundles'}
                            </span>
                        </div>

                        {/* ── Network Tabs ────────────────────────────── */}
                        <div className="store-tabs" style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                            {networks.map(n => {
                                const active = network === n.id;
                                return (
                                    <button
                                        key={n.id}
                                        className="store-tab-btn"
                                        onClick={() => setNetwork(n.id)}
                                        style={{
                                            flex: 1,
                                            padding: '13px 8px',
                                            borderRadius: t.tabRadius,
                                            border: store?.theme === 'luxury' ? `2px solid ${active ? n.color : '#333'}` :
                                                    store?.theme === 'sunset' ? `3px solid #1c0a00` :
                                                    store?.theme === 'dark' ? `1px solid ${active ? n.color : '#1e2d45'}` :
                                                    isOcean ? `1px solid ${active ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}` :
                                                    'none',
                                            fontWeight: 900,
                                            fontSize: 14,
                                            cursor: 'pointer',
                                            background: active ? n.bg :
                                                        isOcean ? 'rgba(255,255,255,0.07)' :
                                                        t.cardMuted,
                                            color: active ? n.textColor :
                                                   isOcean ? 'rgba(255,255,255,0.6)' :
                                                   t.muted,
                                            fontFamily: t.font,
                                            transition: 'all 0.22s ease',
                                            transform: active ? 'translateY(-2px)' : 'none',
                                            boxShadow: active && store?.theme !== 'luxury' && store?.theme !== 'sunset' ? `0 6px 18px ${n.color}44` : active && store?.theme === 'sunset' ? `4px 4px 0 #1c0a00` : 'none',
                                            textTransform: store?.theme === 'luxury' ? 'uppercase' : 'none',
                                            letterSpacing: store?.theme === 'luxury' ? '1px' : 'normal',
                                        }}
                                    >{n.name}</button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Package List ─────────────────────────────────── */}
                    <div style={{ padding: '0 28px', maxHeight: 420, overflowY: 'auto' }}>
                        {pkgLoading ? (
                            <div style={{ textAlign: 'center', padding: '48px 0', color: t.muted }}>
                                <RefreshCw size={24} color={t.accent} style={{ animation: 'spin 1s linear infinite' }} />
                                {store?.theme === 'dark' && <div style={{ marginTop: 10, fontSize: 12, color: '#64748b' }}>loading packages…</div>}
                            </div>
                        ) : (
                            <div
                                className={t.pkgLayout === 'list' ? 'pkg-list' : 'pkg-grid'}
                                style={
                                    t.pkgLayout === 'list'
                                        ? { display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 12 }
                                        : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))', gap: 12, paddingBottom: 12 }
                                }
                            >
                                {packages.map(p => renderPackage(p))}
                            </div>
                        )}
                    </div>

                    {/* ── Phone, Email, Buy Button ──────────────────────── */}
                    <div className="store-card-inner" style={{ padding: '20px 28px 28px' }}>

                        {/* Selected bundle summary */}
                        {selectedPkg && (
                            <div style={{
                                background: isOcean ? 'rgba(255,255,255,0.1)' : t.cardMuted,
                                borderRadius: t.radius,
                                padding: '14px 18px',
                                marginBottom: 18,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                border: t.border,
                                backdropFilter: isOcean ? 'blur(10px)' : 'none',
                                animation: 'fadeUp 0.25s ease',
                            }}>
                                <div>
                                    <div style={{ fontSize: 10, color: t.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Selected Bundle</div>
                                    <div style={{ fontWeight: 900, color: isOcean ? '#fff' : t.text, fontSize: 15 }}>{currentNet.name} · {selectedPkg.display_name}</div>
                                </div>
                                <div style={{ fontSize: 26, fontWeight: 900, color: t.accent }} className="mono-price">₵{selectedPkg.price.toFixed(2)}</div>
                            </div>
                        )}

                        {/* Inputs */}
                        <div className="store-inputs" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 18 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Recipient Number</label>
                                <input type="tel" placeholder="024 000 0000" value={phone} maxLength={10} onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setPhone(val);
                                }} style={{
                                    ...inputStyle,
                                    borderColor: isMismatch ? '#ea580c' : (detectedNet ? '#10b981' : inputStyle.borderColor)
                                }} />
                                
                                {detectedNet && (
                                    <div style={{ 
                                        marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, 
                                        fontSize: 11, fontWeight: 800,
                                        color: isMismatch ? '#ea580c' : '#10b981'
                                    }}>
                                        {isMismatch ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                                        {isMismatch ? `Warning: Detected ${detectedNet.toUpperCase()} number` : `Verified ${detectedNet.toUpperCase()} Number`}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Your Email</label>
                                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                            </div>
                        </div>

                        {/* Mismatch Alert Box */}
                        {isMismatch && (
                            <div style={{ 
                                padding: '14px 18px', borderRadius: t.btnRadius, marginBottom: 18, 
                                background: '#fff7ed', border: '1.5px solid #fed7aa', color: '#9a3412',
                                animation: 'fadeUp 0.3s ease'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <ShieldAlert size={18} color="#ea580c" />
                                    <span style={{ fontWeight: 900, fontSize: 13 }}>Network Mismatch Detected</span>
                                </div>
                                <p style={{ margin: 0, fontSize: 11, lineHeight: 1.5, fontWeight: 600 }}>
                                    The number entered belongs to <b>{detectedNet.toUpperCase()}</b> but you've selected <b>{network.toUpperCase()}</b>. 
                                    Transactions sent to the wrong network are non-refundable. Please verify before proceeding.
                                </p>
                            </div>
                        )}

                        {/* Maintenance banner */}
                        {platformSettings?.isMaintenanceMode && (
                            <div style={{ padding: '13px 16px', borderRadius: t.btnRadius, marginBottom: 14, fontWeight: 800, fontSize: 13, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Ban size={17} /> Store Locked for Maintenance
                            </div>
                        )}

                        {/* Error message */}
                        {message.text && (
                            <div style={{ padding: '13px 16px', borderRadius: t.btnRadius, marginBottom: 14, fontWeight: 800, fontSize: 13, background: message.type === 'success' ? '#f0fdf4' : '#fef2f2', color: message.type === 'success' ? '#16a34a' : '#dc2626', border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                                {message.type === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />} {message.text}
                            </div>
                        )}

                        {/* Buy button */}
                        <button onClick={handleBuy} disabled={!canBuy} style={{
                            width: '100%',
                            padding: store?.theme === 'luxury' ? '18px' : '19px',
                            borderRadius: t.btnRadius,
                            border: store?.theme === 'luxury' ? '2px solid #d4af37' : store?.theme === 'sunset' ? '4px solid #1c0a00' : 'none',
                            background: canBuy
                                ? store?.theme === 'luxury' ? '#d4af37'
                                : store?.theme === 'dark' ? 'transparent'
                                : `linear-gradient(135deg, ${t.accent}, ${t.accent}cc)`
                                : platformSettings?.isMaintenanceMode ? '#dc2626' : (isDark ? '#1e2d45' : '#e2e8f0'),
                            color: canBuy
                                ? store?.theme === 'luxury' ? '#000'
                                : store?.theme === 'dark' ? t.accent
                                : t.accentText
                                : isDark ? '#334155' : '#94a3b8',
                            fontWeight: 900,
                            fontSize: 16,
                            fontFamily: t.font,
                            cursor: canBuy ? 'pointer' : 'not-allowed',
                            transition: 'all 0.25s ease',
                            textTransform: store?.theme === 'luxury' || store?.theme === 'sunset' ? 'uppercase' : 'none',
                            letterSpacing: store?.theme === 'luxury' || store?.theme === 'sunset' ? '2px' : 'normal',
                            boxShadow: canBuy && store?.theme === 'dark' ? `0 0 0 2px ${t.accent}, 0 0 20px ${t.accent}44` :
                                       canBuy && store?.theme === 'sunset' ? '5px 5px 0 #1c0a00' :
                                       canBuy ? `0 10px 28px ${t.accent}44` : 'none',
                        }}>
                            {buying ? 'Processing…'
                             : platformSettings?.isMaintenanceMode ? '🔒 STORE LOCKED'
                             : selectedPkg ? `Pay ₵${selectedPkg.price.toFixed(2)}`
                             : 'Select a Bundle'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── TRACK ORDER MODAL ────────────────────────────────────── */}
            {showTracking && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    padding: 16
                }}>
                    <div style={{ 
                        background: t.cardBg, borderRadius: t.radius, width: '100%', maxWidth: 500,
                        maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: t.border,
                        animation: 'fadeUp 0.3s ease', color: t.text
                    }}>
                        <div style={{ padding: '24px 24px 16px', borderBottom: t.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <ShoppingBag size={20} color={t.accent} />
                                <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Track Your Orders</h2>
                            </div>
                            <button onClick={() => { setShowTracking(false); setTrackingOrders([]); setTrackingPhone(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: 24, overflowY: 'auto' }}>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Enter Phone Number</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <input 
                                        type="tel" 
                                        placeholder="024XXXXXXX" 
                                        value={trackingPhone}
                                        onChange={e => setTrackingPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        style={inputStyle}
                                    />
                                    <button 
                                        onClick={handleTrackOrders}
                                        disabled={trackingLoading || trackingPhone.length < 10}
                                        style={{ 
                                            padding: '0 20px', borderRadius: t.btnRadius, background: t.accent, 
                                            color: t.accentText, border: 'none', fontWeight: 900, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 80
                                        }}
                                    >
                                        {trackingLoading ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Find'}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {trackingOrders.map((o, i) => (
                                    <div key={i} style={{ 
                                        padding: 16, background: isOcean ? 'rgba(255,255,255,0.05)' : t.cardMuted, 
                                        borderRadius: t.pkgRadius, border: t.border 
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 900 }}>{o.network.toUpperCase()} {o.packageName}</div>
                                                <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{new Date(o.createdAt).toLocaleDateString()} • {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                            <div style={{ 
                                                fontSize: 10, fontWeight: 900, textTransform: 'uppercase', padding: '4px 8px', borderRadius: 6,
                                                background: o.status === 'completed' ? '#dcfce7' : o.status === 'failed' ? '#fee2e2' : '#fef3c7',
                                                color: o.status === 'completed' ? '#16a34a' : o.status === 'failed' ? '#dc2626' : '#d97706',
                                            }}>
                                                {o.status}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: t.muted }}>{o.phoneNumber}</div>
                                            <div style={{ fontSize: 16, fontWeight: 900, color: t.accent }}>₵{o.amount.toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))}

                                {!trackingLoading && trackingPhone.length === 10 && trackingOrders.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '40px 20px', color: t.muted }}>
                                        <ShoppingBag size={32} style={{ opacity: 0.2, marginBottom: 12 }} />
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>No orders found yet.</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Floating Action Buttons ────────────────────────────── */}
            <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {store?.groupLink && (
                    <a href={store.groupLink} target="_blank" rel="noreferrer" title="Join Community"
                        className="store-nav-icon"
                        style={{ width: 54, height: 54, borderRadius: '50%', background: t.accent, color: t.accentText, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 20px ${t.accent}55`, textDecoration: 'none' }}>
                        <Users2 size={22} />
                    </a>
                )}
                {store?.whatsapp && (
                    <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noreferrer" title="WhatsApp Support"
                        className="store-nav-icon"
                        style={{ width: 54, height: 54, borderRadius: '50%', background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(37,211,102,0.45)', textDecoration: 'none' }}>
                        <MessageCircle size={22} />
                    </a>
                )}
            </div>
        </div>
    );
};

export default StorePage;
