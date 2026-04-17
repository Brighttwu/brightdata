import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, Loader2, AlertCircle, ArrowLeft, ArrowRight, Smartphone, Gift } from 'lucide-react';

const Register = () => {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({ 
        name: '', email: '', password: '', 
        referralCode: searchParams.get('ref') || '', 
        phoneNumber: '' 
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.phoneNumber) return setError('Phone Number is required.');
        setLoading(true);
        try {
            await register(formData.name, formData.email, formData.password, formData.referralCode, '', formData.phoneNumber);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        background: '#f8fafc',
        border: '2px solid transparent',
        borderRadius: 14,
        padding: '16px 16px 16px 48px',
        fontSize: 16,
        fontWeight: 500,
        color: '#0f172a',
        outline: 'none',
        transition: 'all 0.2s',
        boxSizing: 'border-box'
    };

    const labelStyle = {
        display: 'block',
        fontSize: 11,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#94a3b8',
        marginBottom: 8,
        paddingLeft: 4
    };

    const iconStyle = {
        position: 'absolute',
        left: 16,
        top: 16,
        color: '#cbd5e1'
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px'
        }}>
            <div style={{ width: '100%', maxWidth: 440 }}>

                <Link to="/" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#94a3b8',
                    fontSize: 14,
                    fontWeight: 700,
                    textDecoration: 'none',
                    marginBottom: 32
                }}>
                    <ArrowLeft size={16} /> Home
                </Link>

                <div style={{
                    background: '#fff',
                    borderRadius: 24,
                    padding: '48px 32px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    border: '1px solid #f1f5f9'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <div style={{
                            width: 64,
                            height: 64,
                            background: '#eef2ff',
                            borderRadius: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            color: '#4f46e5'
                        }}>
                            <UserIcon size={32} />
                        </div>
                        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Create Account</h1>
                        <p style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500 }}>Start your data business in seconds</p>
                    </div>

                    {error && (
                        <div style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            padding: '14px 16px',
                            borderRadius: 14,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            fontSize: 14,
                            fontWeight: 700,
                            marginBottom: 24
                        }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <UserIcon size={18} style={iconStyle} />
                                <input 
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={inputStyle}
                                    placeholder="Your full name"
                                    onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#818cf8'; e.target.style.boxShadow = '0 0 0 4px rgba(79,70,229,0.08)'; }}
                                    onBlur={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={iconStyle} />
                                <input 
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={inputStyle}
                                    placeholder="you@email.com"
                                    onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#818cf8'; e.target.style.boxShadow = '0 0 0 4px rgba(79,70,229,0.08)'; }}
                                    onBlur={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>Phone Number (Primary)</label>
                            <div style={{ position: 'relative' }}>
                                <Smartphone size={18} style={iconStyle} />
                                <input 
                                    type="text"
                                    required
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    style={inputStyle}
                                    placeholder="05XXXXXXXX"
                                    onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#818cf8'; e.target.style.boxShadow = '0 0 0 4px rgba(79,70,229,0.08)'; }}
                                    onBlur={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 32 }}>
                            <label style={labelStyle}>Referral Code (Optional)</label>
                            <div style={{ position: 'relative' }}>
                                <Gift size={18} style={iconStyle} />
                                <input 
                                    type="text"
                                    value={formData.referralCode}
                                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                                    style={inputStyle}
                                    placeholder="INVITE123"
                                    onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#818cf8'; e.target.style.boxShadow = '0 0 0 4px rgba(79,70,229,0.08)'; }}
                                    onBlur={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 32 }}>
                            <label style={labelStyle}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={iconStyle} />
                                <input 
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    style={inputStyle}
                                    placeholder="••••••••"
                                    onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#818cf8'; e.target.style.boxShadow = '0 0 0 4px rgba(79,70,229,0.08)'; }}
                                    onBlur={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '18px',
                                background: loading ? '#e2e8f0' : '#4f46e5',
                                color: loading ? '#94a3b8' : '#fff',
                                border: 'none',
                                borderRadius: 14,
                                fontSize: 16,
                                fontWeight: 800,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10,
                                boxShadow: loading ? 'none' : '0 8px 24px rgba(79,70,229,0.3)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {loading ? <Loader2 size={22} className="animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
                        </button>
                    </form>

                    <div style={{
                        textAlign: 'center',
                        marginTop: 32,
                        padding: '20px',
                        background: '#f8fafc',
                        borderRadius: 16
                    }}>
                        <p style={{ color: '#64748b', fontSize: 14, fontWeight: 600 }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 800 }}>Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
