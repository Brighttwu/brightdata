import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, Globe, ArrowRight, Wifi, CheckCircle2, Store, Users, Wallet, Smartphone } from 'lucide-react';

const Home = () => {
    return (
        <div style={{ background: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>
            
            {/* Background Decorative Elements */}
            <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)', zIndex: 0 }} />
            <div style={{ position: 'fixed', bottom: '-10%', left: '-5%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', zIndex: 0 }} />

            {/* HERO */}
            <section style={{
                position: 'relative',
                padding: '120px 24px 80px',
                maxWidth: 1000,
                margin: '0 auto',
                textAlign: 'center',
                zIndex: 1
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    color: '#818cf8',
                    padding: '10px 24px',
                    borderRadius: 100,
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 32,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}>
                    <Smartphone size={16} /> Fast, Secure & Reliable
                </div>

                <h1 style={{
                    fontSize: 'clamp(40px, 10vw, 84px)',
                    fontWeight: 900,
                    lineHeight: 0.95,
                    marginBottom: 28,
                    letterSpacing: '-0.04em',
                    background: 'linear-gradient(to bottom, #fff 40%, #94a3b8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Smart Data Reselling <br />
                    <span style={{ color: '#4f46e5', WebkitTextFillColor: 'initial' }}>For Modern Agents.</span>
                </h1>

                <p style={{
                    fontSize: 'clamp(17px, 3vw, 20px)',
                    color: '#94a3b8',
                    lineHeight: 1.6,
                    maxWidth: 600,
                    margin: '0 auto 48px',
                    fontWeight: 500
                }}>
                    The most advanced platform to buy and sell data bundles in Ghana. 
                    Empowering entrepreneurs with instant delivery and high profits.
                </p>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    smDirection: 'row',
                    gap: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 64
                }}>
                    <Link to="/register" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        padding: '20px 48px',
                        background: '#4f46e5',
                        color: '#fff',
                        borderRadius: 20,
                        fontWeight: 800,
                        fontSize: 18,
                        textDecoration: 'none',
                        boxShadow: '0 12px 32px rgba(79,70,229,0.4)',
                        transition: 'all 0.3s ease'
                    }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        Start Earning Now <ArrowRight size={20} />
                    </Link>
                    <Link to="/login" style={{
                        padding: '20px 48px',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        borderRadius: 20,
                        fontWeight: 800,
                        fontSize: 18,
                        textDecoration: 'none',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s'
                    }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                        Sign In
                    </Link>
                </div>

                {/* TRUST */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 32, opacity: 0.5 }}>
                    {['Instant Fulfillment', 'Zero Hidden Fees', 'Enterprise Security', 'Premium Support'].map(t => (
                        <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            <CheckCircle2 size={14} color="#4f46e5" /> {t}
                        </div>
                    ))}
                </div>
            </section>

            {/* PRODUCT SHOWCASE / STATS */}
            <section style={{ padding: '40px 24px 100px', position: 'relative', zIndex: 1 }}>
                <div style={{
                    maxWidth: 1100,
                    margin: '0 auto',
                    background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.8))',
                    borderRadius: 40,
                    padding: '60px 48px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.5)'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, textAlign: 'center' }}>
                        {[
                            { num: '50k+', label: 'Daily Transfers', icon: <Zap color="#f59e0b" /> },
                            { num: '₵1M+', label: 'Paid in Profits', icon: <Wallet color="#10b981" /> },
                            { num: '12k', label: 'Verified Agents', icon: <Users color="#6366f1" /> },
                            { num: '800+', label: 'Custom Stores', icon: <Store color="#ec4899" /> },
                        ].map((s, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>{s.icon}</div>
                                <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 4 }}>{s.num}</div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section style={{ padding: '60px 24px 120px', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 80 }}>
                        <h2 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16 }}>Everything You Need.</h2>
                        <p style={{ color: '#64748b', fontSize: 18, fontWeight: 500 }}>Powerful tools designed for scale.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                        {[
                            { title: 'Personalized Storefronts', desc: 'Get your own URL and 7 premium themes to brand your business.', icon: <Store size={32} />, color: '#4f46e5' },
                            { title: 'Dynamic Pricing Control', desc: 'Set your own profit margins. We provide the infrastructure, you set the rules.', icon: <CheckCircle2 size={32} />, color: '#10b981' },
                            { title: 'Global Network Support', desc: 'Seamlessly sell MTN, Vodafone (Telecel), and AT bundles at wholesale prices.', icon: <Globe size={32} />, color: '#0ea5e9' },
                        ].map((f, i) => (
                            <div key={i} style={{
                                padding: 48,
                                borderRadius: 32,
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 20,
                                transition: 'all 0.3s'
                            }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                                <div style={{ color: f.color }}>{f.icon}</div>
                                <h3 style={{ fontSize: 24, fontWeight: 800 }}>{f.title}</h3>
                                <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ padding: '60px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>BossuHub<span style={{ color: '#4f46e5' }}>.</span></div>
                <div style={{ color: '#64748b', fontSize: 14 }}>© 2026 BossuHub Technologies. All rights reserved.</div>
            </footer>
        </div>
    );
};

export default Home;
