import { Link, Navigate } from 'react-router-dom';
import { Zap, Shield, Globe, ArrowRight, Wifi, CheckCircle2, Store, Users, Wallet, Smartphone, TrendingUp, Star, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const Home = () => {
    const { user, loading } = useAuth();
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!loading && user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div style={{ background: '#020617', minHeight: '100vh', color: '#fff', fontFamily: "'Inter', 'Outfit', sans-serif", overflowX: 'hidden' }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;700;800;900&display=swap" rel="stylesheet" />

            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
                @keyframes float2 { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(3deg); } }
                @keyframes pulse-glow { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
                @keyframes slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                @keyframes orbit1 { 0% { transform: rotate(0deg) translateX(140px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(140px) rotate(-360deg); } }
                @keyframes orbit2 { 0% { transform: rotate(120deg) translateX(180px) rotate(-120deg); } 100% { transform: rotate(480deg) translateX(180px) rotate(-480deg); } }
                @keyframes orbit3 { 0% { transform: rotate(240deg) translateX(120px) rotate(-240deg); } 100% { transform: rotate(600deg) translateX(120px) rotate(-600deg); } }
                .home-cta-btn:hover { transform: translateY(-4px) scale(1.02) !important; box-shadow: 0 20px 60px rgba(99,102,241,0.5) !important; }
                .home-feature-card:hover { transform: translateY(-8px) !important; border-color: rgba(99,102,241,0.3) !important; box-shadow: 0 20px 60px rgba(0,0,0,0.4) !important; }
                .home-step-card:hover { border-color: rgba(99,102,241,0.4) !important; background: rgba(99,102,241,0.05) !important; }
                .home-stat-card:hover { transform: scale(1.05) !important; }
                @media (max-width: 768px) {
                    .home-hero-grid { flex-direction: column !important; text-align: center !important; }
                    .home-hero-visual { display: none !important; }
                    .home-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .home-features-grid { grid-template-columns: 1fr !important; }
                    .home-steps-grid { grid-template-columns: 1fr !important; }
                    .home-cta-buttons { flex-direction: column !important; width: 100% !important; }
                    .home-cta-buttons a { width: 100% !important; justify-content: center !important; }
                }
            `}</style>

            {/* ═══════════════════════ HERO SECTION ═══════════════════════ */}
            <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                {/* Animated mesh gradient background */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 0,
                    background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.3), transparent), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(14,165,233,0.15), transparent), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(168,85,247,0.12), transparent)'
                }} />

                {/* Floating grid lines */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 0, opacity: 0.04,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                    transform: `translateY(${scrollY * 0.1}px)`
                }} />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '140px 24px 100px', width: '100%' }}>
                    <div className="home-hero-grid" style={{ display: 'flex', alignItems: 'center', gap: 80 }}>
                        {/* Left: Copy */}
                        <div style={{ flex: '1 1 55%' }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                                padding: '10px 20px', borderRadius: 100, fontSize: 13, fontWeight: 700,
                                color: '#a5b4fc', marginBottom: 32, animation: 'slide-up 0.6s ease-out'
                            }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                                Platform Live — Trusted by 12,000+ Agents
                            </div>

                            <h1 style={{
                                fontSize: 'clamp(40px, 7vw, 76px)', fontWeight: 900, lineHeight: 1.0,
                                marginBottom: 28, letterSpacing: '-0.04em', animation: 'slide-up 0.8s ease-out',
                                fontFamily: "'Outfit', sans-serif"
                            }}>
                                Ghana's #1{' '}
                                <span style={{
                                    background: 'linear-gradient(135deg, #818cf8, #38bdf8, #818cf8)',
                                    backgroundSize: '200% auto', animation: 'gradient-shift 4s ease infinite',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                                }}>Data Reselling</span>
                                <br />Platform.
                            </h1>

                            <p style={{
                                fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#94a3b8', lineHeight: 1.7,
                                maxWidth: 520, marginBottom: 44, fontWeight: 500, animation: 'slide-up 1s ease-out'
                            }}>
                                Buy and sell data bundles across all networks. Launch your own branded storefront in minutes. Earn real commissions on every sale.
                            </p>

                            <div className="home-cta-buttons" style={{ display: 'flex', gap: 16, animation: 'slide-up 1.2s ease-out', flexWrap: 'wrap' }}>
                                <Link to="/register" className="home-cta-btn" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 12,
                                    padding: '20px 40px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                                    color: '#fff', borderRadius: 16, fontWeight: 800, fontSize: 17,
                                    textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 12px 40px rgba(79,70,229,0.35)'
                                }}>
                                    Start Selling Free <ArrowRight size={20} />
                                </Link>
                                <Link to="/login" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 10,
                                    padding: '20px 32px', background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1',
                                    borderRadius: 16, fontWeight: 700, fontSize: 16, textDecoration: 'none',
                                    transition: 'all 0.3s'
                                }}>
                                    Sign In <ChevronRight size={18} />
                                </Link>
                            </div>

                            {/* Trust strip */}
                            <div style={{ display: 'flex', gap: 28, marginTop: 48, flexWrap: 'wrap', animation: 'slide-up 1.4s ease-out' }}>
                                {[
                                    { icon: <Zap size={14} />, text: 'Instant Delivery' },
                                    { icon: <Shield size={14} />, text: 'Secure Payments' },
                                    { icon: <Clock size={14} />, text: '24/7 Support' }
                                ].map((t, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#64748b' }}>
                                        <div style={{ color: '#4f46e5' }}>{t.icon}</div>
                                        {t.text}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Animated visual */}
                        <div className="home-hero-visual" style={{ flex: '1 1 40%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: 400 }}>
                            {/* Central orb */}
                            <div style={{
                                width: 160, height: 160, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
                                boxShadow: '0 0 80px rgba(79,70,229,0.4), 0 0 160px rgba(79,70,229,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                animation: 'pulse-glow 4s ease-in-out infinite', zIndex: 2
                            }}>
                                <Wifi size={56} color="#fff" strokeWidth={2.5} />
                            </div>

                            {/* Orbiting network badges */}
                            <div style={{ position: 'absolute', animation: 'orbit1 10s linear infinite', zIndex: 3 }}>
                                <div style={{
                                    padding: '12px 20px', background: 'rgba(255,204,0,0.15)', border: '1px solid rgba(255,204,0,0.3)',
                                    borderRadius: 14, fontWeight: 900, fontSize: 13, color: '#FFCC00', backdropFilter: 'blur(8px)'
                                }}>MTN</div>
                            </div>
                            <div style={{ position: 'absolute', animation: 'orbit2 14s linear infinite', zIndex: 3 }}>
                                <div style={{
                                    padding: '12px 20px', background: 'rgba(230,0,0,0.15)', border: '1px solid rgba(230,0,0,0.3)',
                                    borderRadius: 14, fontWeight: 900, fontSize: 13, color: '#ff4444', backdropFilter: 'blur(8px)'
                                }}>Telecel</div>
                            </div>
                            <div style={{ position: 'absolute', animation: 'orbit3 12s linear infinite', zIndex: 3 }}>
                                <div style={{
                                    padding: '12px 20px', background: 'rgba(0,51,153,0.2)', border: '1px solid rgba(99,102,241,0.3)',
                                    borderRadius: 14, fontWeight: 900, fontSize: 13, color: '#818cf8', backdropFilter: 'blur(8px)'
                                }}>AT</div>
                            </div>

                            {/* Concentric rings */}
                            {[200, 280, 360].map((s, i) => (
                                <div key={i} style={{
                                    position: 'absolute', width: s, height: s, borderRadius: '50%',
                                    border: `1px solid rgba(99,102,241,${0.12 - i * 0.03})`,
                                    animation: `pulse-glow ${5 + i}s ease-in-out infinite ${i * 0.5}s`
                                }} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom gradient fade */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(transparent, #020617)', zIndex: 1 }} />
            </section>

            {/* ═══════════════════════ STATS SECTION ═══════════════════════ */}
            <section style={{ position: 'relative', zIndex: 2, padding: '0 24px 120px', marginTop: -60 }}>
                <div className="home-stats-grid" style={{
                    maxWidth: 1100, margin: '0 auto',
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20
                }}>
                    {[
                        { num: '50K+', label: 'Daily Transfers', icon: <Zap size={24} />, color: '#f59e0b', glow: 'rgba(245,158,11,0.15)' },
                        { num: '₵1M+', label: 'Agent Profits', icon: <TrendingUp size={24} />, color: '#10b981', glow: 'rgba(16,185,129,0.15)' },
                        { num: '12K', label: 'Verified Agents', icon: <Users size={24} />, color: '#6366f1', glow: 'rgba(99,102,241,0.15)' },
                        { num: '800+', label: 'Live Storefronts', icon: <Store size={24} />, color: '#ec4899', glow: 'rgba(236,72,153,0.15)' },
                    ].map((s, i) => (
                        <div key={i} className="home-stat-card" style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 24, padding: '36px 28px', textAlign: 'center',
                            backdropFilter: 'blur(12px)', transition: 'all 0.3s ease', cursor: 'default'
                        }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: s.glow, color: s.color, margin: '0 auto 16px'
                            }}>{s.icon}</div>
                            <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4, fontFamily: "'Outfit', sans-serif" }}>{s.num}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════════ FEATURES SECTION ═══════════════════════ */}
            <section style={{ padding: '80px 24px 120px', position: 'relative' }}>
                <div style={{
                    position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
                    width: '70vw', height: '70vw', maxWidth: 800, maxHeight: 800,
                    background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)', zIndex: 0
                }} />
                <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: 72 }}>
                        <span style={{
                            display: 'inline-block', color: '#818cf8', fontWeight: 800, fontSize: 13,
                            textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16,
                            background: 'rgba(99,102,241,0.1)', padding: '8px 20px', borderRadius: 100
                        }}>Why Agents Choose Us</span>
                        <h2 style={{
                            fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: '#fff', marginTop: 20,
                            letterSpacing: '-0.03em', fontFamily: "'Outfit', sans-serif"
                        }}>
                            Everything You Need to<br />
                            <span style={{ color: '#818cf8' }}>Build a Data Empire.</span>
                        </h2>
                    </div>

                    <div className="home-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                        {[
                            {
                                title: 'Your Own Branded Store',
                                desc: 'Launch a professional white-label storefront with 7 premium themes, custom logos, and your own WhatsApp support link.',
                                icon: <Store size={28} />, color: '#6366f1',
                                gradient: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.02))'
                            },
                            {
                                title: 'Instant Commissions',
                                desc: 'Earn profit on every sale automatically. Track earnings in real-time and withdraw directly to your Mobile Money.',
                                icon: <Wallet size={28} />, color: '#10b981',
                                gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.02))'
                            },
                            {
                                title: 'All Networks, One Hub',
                                desc: 'MTN, Telecel, and AT data bundles — all available instantly through our direct API connections. No middlemen.',
                                icon: <Globe size={28} />, color: '#0ea5e9',
                                gradient: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(14,165,233,0.02))'
                            },
                            {
                                title: 'Set Your Own Prices',
                                desc: 'Full control over your margins. Set custom prices per bundle and keep 100% of the markup you add.',
                                icon: <TrendingUp size={28} />, color: '#f59e0b',
                                gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.02))'
                            },
                            {
                                title: 'Price Protection',
                                desc: 'Our smart system auto-adjusts prices when costs change so you never sell below your wholesale rate.',
                                icon: <Shield size={28} />, color: '#ef4444',
                                gradient: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.02))'
                            },
                            {
                                title: 'Referral Rewards',
                                desc: 'Invite other agents and earn a percentage of every transaction they make. Build your network, grow your income.',
                                icon: <Users size={28} />, color: '#a855f7',
                                gradient: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.02))'
                            }
                        ].map((f, i) => (
                            <div key={i} className="home-feature-card" style={{
                                padding: '40px 32px', borderRadius: 24,
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'default'
                            }}>
                                <div style={{
                                    width: 60, height: 60, borderRadius: 18,
                                    background: f.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: f.color, marginBottom: 24
                                }}>{f.icon}</div>
                                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 12 }}>{f.title}</h3>
                                <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
            <section style={{ padding: '80px 24px 120px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 72 }}>
                        <span style={{
                            display: 'inline-block', color: '#10b981', fontWeight: 800, fontSize: 13,
                            textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16,
                            background: 'rgba(16,185,129,0.1)', padding: '8px 20px', borderRadius: 100
                        }}>How It Works</span>
                        <h2 style={{
                            fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#fff', marginTop: 20,
                            letterSpacing: '-0.03em', fontFamily: "'Outfit', sans-serif"
                        }}>Start Earning in 3 Simple Steps</h2>
                    </div>

                    <div className="home-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                        {[
                            {
                                step: '01', title: 'Create Your Account',
                                desc: 'Sign up for free in under 30 seconds. Fund your wallet via Mobile Money or bank card.',
                                color: '#6366f1'
                            },
                            {
                                step: '02', title: 'Set Up Your Store',
                                desc: 'Choose a theme, set your prices, and launch your own branded storefront. Share the link anywhere.',
                                color: '#0ea5e9'
                            },
                            {
                                step: '03', title: 'Earn Commissions',
                                desc: 'Every customer purchase on your store earns you instant profit. Withdraw to MoMo anytime.',
                                color: '#10b981'
                            }
                        ].map((s, i) => (
                            <div key={i} className="home-step-card" style={{
                                padding: '44px 36px', borderRadius: 24,
                                border: '1px solid rgba(255,255,255,0.06)',
                                background: 'rgba(255,255,255,0.02)',
                                transition: 'all 0.3s ease', cursor: 'default', position: 'relative'
                            }}>
                                <div style={{
                                    fontSize: 64, fontWeight: 900, fontFamily: "'Outfit', sans-serif",
                                    color: 'rgba(255,255,255,0.04)', position: 'absolute', top: 20, right: 28, lineHeight: 1
                                }}>{s.step}</div>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 14,
                                    background: `${s.color}20`, color: s.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 20, fontWeight: 900, marginBottom: 24, fontFamily: "'Outfit', sans-serif"
                                }}>{s.step}</div>
                                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12 }}>{s.title}</h3>
                                <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ NETWORKS ═══════════════════════ */}
            <section style={{ padding: '60px 24px 120px' }}>
                <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 40 }}>
                        Supported Networks
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
                        {[
                            { name: 'MTN', color: '#FFCC00', bg: 'rgba(255,204,0,0.08)', border: 'rgba(255,204,0,0.2)' },
                            { name: 'Telecel', color: '#E60000', bg: 'rgba(230,0,0,0.08)', border: 'rgba(230,0,0,0.2)' },
                            { name: 'AT (AirtelTigo)', color: '#4f83cc', bg: 'rgba(0,51,153,0.08)', border: 'rgba(0,51,153,0.25)' }
                        ].map((n, i) => (
                            <div key={i} style={{
                                padding: '24px 48px', borderRadius: 20,
                                background: n.bg, border: `1px solid ${n.border}`,
                                color: n.color, fontWeight: 900, fontSize: 18, letterSpacing: '0.05em',
                                transition: 'all 0.3s', animation: `float ${3 + i * 0.5}s ease-in-out infinite`
                            }}>{n.name}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ TESTIMONIALS ═══════════════════════ */}
            <section style={{ padding: '80px 24px 120px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <span style={{
                            display: 'inline-block', color: '#f59e0b', fontWeight: 800, fontSize: 13,
                            textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16,
                            background: 'rgba(245,158,11,0.1)', padding: '8px 20px', borderRadius: 100
                        }}>Agent Voices</span>
                        <h2 style={{
                            fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#fff', marginTop: 20,
                            fontFamily: "'Outfit', sans-serif"
                        }}>Real Agents, Real Profits</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                        {[
                            { name: 'Kwame A.', location: 'Accra', text: 'I set up my store in minutes and made my first sale the same day. The profit goes straight to my MoMo. This is the easiest side hustle ever.', profit: '₵2,400/mo' },
                            { name: 'Ama S.', location: 'Kumasi', text: 'My customers love the branded store. They think it\'s my own app! The price protection feature saved me from losing money twice already.', profit: '₵1,800/mo' },
                            { name: 'Kofi M.', location: 'Tamale', text: 'The referral system is genius. I brought 15 agents and now I earn extra from their sales too. brightdata changed my life.', profit: '₵3,100/mo' }
                        ].map((t, i) => (
                            <div key={i} style={{
                                padding: '36px 32px', borderRadius: 24,
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', flexDirection: 'column', gap: 20
                            }}>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    {[...Array(5)].map((_, si) => <Star key={si} size={16} fill="#f59e0b" color="#f59e0b" />)}
                                </div>
                                <p style={{ color: '#cbd5e1', fontSize: 15, lineHeight: 1.7, margin: 0, flex: 1 }}>"{t.text}"</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 800, color: '#fff', fontSize: 15 }}>{t.name}</div>
                                        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{t.location}</div>
                                    </div>
                                    <div style={{
                                        padding: '8px 16px', borderRadius: 12,
                                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                                        color: '#34d399', fontWeight: 900, fontSize: 14
                                    }}>{t.profit}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ FINAL CTA ═══════════════════════ */}
            <section style={{ padding: '80px 24px 120px', position: 'relative' }}>
                <div style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: '80vw', height: '100%',
                    background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.1), transparent 70%)', zIndex: 0
                }} />
                <div style={{
                    maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1,
                    background: 'linear-gradient(180deg, rgba(99,102,241,0.08), rgba(99,102,241,0.02))',
                    border: '1px solid rgba(99,102,241,0.15)', borderRadius: 40, padding: 'clamp(48px, 8vw, 80px) clamp(24px, 5vw, 60px)'
                }}>
                    <h2 style={{
                        fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: '#fff',
                        marginBottom: 20, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em'
                    }}>Ready to Start Earning?</h2>
                    <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.7, marginBottom: 40, maxWidth: 520, margin: '0 auto 40px' }}>
                        Join thousands of agents already making real money on brightdata. Setup is free — your first sale could be minutes away.
                    </p>
                    <Link to="/register" className="home-cta-btn" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 12,
                        padding: '22px 48px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                        color: '#fff', borderRadius: 18, fontWeight: 900, fontSize: 18,
                        textDecoration: 'none', transition: 'all 0.3s',
                        boxShadow: '0 16px 48px rgba(79,70,229,0.4)'
                    }}>
                        Create Free Account <ArrowRight size={20} />
                    </Link>
                </div>
            </section>

            {/* ═══════════════════════ FOOTER ═══════════════════════ */}
            <footer style={{
                padding: '60px 24px 40px', borderTop: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: 28, fontWeight: 950, color: '#fff', marginBottom: 16,
                    letterSpacing: '-0.04em', textTransform: 'lowercase', fontFamily: "'Outfit', sans-serif"
                }}>
                    brightdata<span style={{ color: '#6366f1' }}>.</span>
                </div>
                <p style={{ color: '#475569', fontSize: 14, fontWeight: 500, marginBottom: 24 }}>
                    Premium Infrastructure for Data Resellers in Ghana.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap', marginBottom: 32 }}>
                    {['Privacy Policy', 'Terms of Service', 'Contact Us'].map((link, i) => (
                        <span key={i} style={{ color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{link}</span>
                    ))}
                </div>
                <div style={{ color: '#334155', fontSize: 13, fontWeight: 500 }}>
                    © 2026 brightdata hub. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Home;
