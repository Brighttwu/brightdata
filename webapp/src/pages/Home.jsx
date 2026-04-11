import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, Globe, ArrowRight, Wifi, CheckCircle2, Store, Users, Wallet, Smartphone } from 'lucide-react';

const Home = () => {
    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#1e293b', fontFamily: "'Outfit', 'Inter', sans-serif", overflowX: 'hidden' }}>
            
            {/* Background Decorative Elements */}
            <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', zIndex: 0 }} />
            <div style={{ position: 'fixed', bottom: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)', zIndex: 0 }} />

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
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    color: '#6366f1',
                    padding: '12px 28px',
                    borderRadius: 100,
                    fontSize: 14,
                    fontWeight: 800,
                    marginBottom: 32,
                    boxShadow: '0 10px 30px rgba(99,102,241,0.1)',
                    letterSpacing: '0.02em'
                }}>
                    <Smartphone size={16} /> Fast, Secure & Reliable Bundles
                </div>

                <h1 style={{
                    fontSize: 'clamp(44px, 10vw, 88px)',
                    fontWeight: 900,
                    lineHeight: 0.9,
                    marginBottom: 32,
                    letterSpacing: '-0.05em',
                    color: '#0f172a'
                }}>
                    The Future of <br />
                    <span style={{ 
                        background: 'linear-gradient(90deg, #4f46e5, #0ea5e9)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>Smart Data Reselling.</span>
                </h1>

                <p style={{
                    fontSize: 'clamp(18px, 3vw, 22px)',
                    color: '#64748b',
                    lineHeight: 1.6,
                    maxWidth: 650,
                    margin: '0 auto 56px',
                    fontWeight: 500
                }}>
                    <strong>Bright Data</strong> empowers entrepreneurs across Ghana with instant data fulfillment, 
                    custom white-label stores, and industry-leading profit margins.
                </p>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 80
                }}>
                    <Link to="/register" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        padding: '24px 60px',
                        background: '#4f46e5',
                        color: '#fff',
                        borderRadius: 24,
                        fontWeight: 900,
                        fontSize: 20,
                        textDecoration: 'none',
                        boxShadow: '0 20px 40px rgba(79,70,229,0.3)',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}>
                        Create Free Account <ArrowRight size={22} />
                    </Link>
                    <Link to="/login" style={{
                        padding: '20px 48px',
                        background: '#fff',
                        color: '#475569',
                        borderRadius: 24,
                        fontWeight: 800,
                        fontSize: 18,
                        textDecoration: 'none',
                        border: '2px solid #f1f5f9',
                        transition: 'all 0.3s'
                    }} onMouseOver={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }} onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#f1f5f9'; }}>
                        Agent Login
                    </Link>
                </div>

                {/* TRUST */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 40, opacity: 0.8 }}>
                    {['Instant Fulfillment', 'No Hidden Fees', 'Bank-Grade Security', '24/7 Priority Support'].map(t => (
                        <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <div style={{ background: 'rgba(79,70,229,0.1)', padding: 6, borderRadius: '50%', display: 'flex' }}>
                                <CheckCircle2 size={16} color="#4f46e5" />
                            </div>
                            {t}
                        </div>
                    ))}
                </div>
            </section>

            {/* PRODUCT SHOWCASE / STATS */}
            <section style={{ padding: '40px 24px 100px', position: 'relative', zIndex: 1 }}>
                <div style={{
                    maxWidth: 1100,
                    margin: '0 auto',
                    background: '#fff',
                    borderRadius: 48,
                    padding: '80px 48px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 40px 100px rgba(15,23,42,0.08)'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 48, textAlign: 'center' }}>
                        {[
                            { num: '50k+', label: 'Daily Transfers', icon: <Zap size={32} color="#f59e0b" fill="#f59e0b22" /> },
                            { num: '₵1M+', label: 'Paid in Profits', icon: <Wallet size={32} color="#10b981" fill="#10b98122" /> },
                            { num: '12k', label: 'Verified Agents', icon: <Users size={32} color="#6366f1" fill="#6366f122" /> },
                            { num: '800+', label: 'Storefronts', icon: <Store size={32} color="#ec4899" fill="#ec489922" /> },
                        ].map((s, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>{s.icon}</div>
                                <div style={{ fontSize: 56, fontWeight: 900, marginBottom: 6, color: '#0f172a', letterSpacing: '-0.02em' }}>{s.num}</div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section style={{ padding: '60px 24px 140px', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 80 }}>
                        <span style={{ color: '#4f46e5', fontWeight: 900, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Platform Features</span>
                        <h2 style={{ fontSize: 48, fontWeight: 900, color: '#0f172a', marginTop: 16 }}>Built for Modern Commerce.</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
                        {[
                            { title: 'AI-Powered Stores', desc: 'Launch a professional store in seconds with customizable themes and local branding.', icon: <Store size={32} />, color: '#4f46e5' },
                            { title: 'Real-time Commissions', desc: 'Track your earnings down to the pesewa. Automated withdrawals keep you in control.', icon: <CheckCircle2 size={32} />, color: '#10b981' },
                            { title: 'Bulk Network Access', desc: 'Connect to MTN, Telecel, and AT Hubs directly. No middleware, just pure speed.', icon: <Globe size={32} />, color: '#0ea5e9' },
                        ].map((f, i) => (
                            <div key={i} style={{
                                padding: '60px 48px',
                                borderRadius: 40,
                                background: '#fff',
                                border: '1px solid #f1f5f9',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 24,
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                            }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-12px)'; e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'rgba(79,70,229,0.1)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#f1f5f9'; }}>
                                <div style={{ 
                                    width: 72, height: 72, 
                                    background: `${f.color}11`, 
                                    color: f.color, 
                                    borderRadius: 24, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>{f.title}</h3>
                                <p style={{ color: '#475569', fontSize: 17, lineHeight: 1.7 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ padding: '80px 24px', textAlign: 'center', background: '#fff', borderTop: '2px solid #f1f5f9' }}>
                <div style={{ fontSize: 32, fontWeight: 950, color: '#0f172a', marginBottom: 16, letterSpacing: '-0.04em' }}>
                    BRIGHT <span style={{ color: '#4f46e5' }}>DATA</span>
                </div>
                <div style={{ color: '#64748b', fontSize: 15, fontWeight: 500 }}>© 2026 Bright Data Hub. Premium Infrastructure for Data Resellers.</div>
            </footer>
        </div>
    );
};

export default Home;
