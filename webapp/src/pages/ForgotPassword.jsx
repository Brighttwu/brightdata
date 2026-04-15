import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Mail, Lock, Loader2, AlertCircle, ArrowLeft, ArrowRight, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setSuccess(res.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request password reset.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const res = await api.post('/auth/reset-password', { email, otp, newPassword });
            setSuccess(res.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Check OTP.');
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
                <Link to="/login" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#94a3b8',
                    fontSize: 14,
                    fontWeight: 700,
                    textDecoration: 'none',
                    marginBottom: 32
                }}>
                    <ArrowLeft size={16} /> Back to Login
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
                            {step === 1 ? <KeyRound size={32} /> : <Lock size={32} />}
                        </div>
                        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>
                            {step === 1 ? 'Forgot Password' : 'Reset Password'}
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500 }}>
                            {step === 1 ? "Enter your email to receive an OTP." : "Enter the OTP and your new password."}
                        </p>
                    </div>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '14px 16px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, marginBottom: 24 }}>
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '14px 16px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, marginBottom: 24 }}>
                            ✅ {success}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleRequestOtp}>
                            <div style={{ marginBottom: 32 }}>
                                <label style={labelStyle}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={iconStyle} />
                                    <input 
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={inputStyle}
                                        placeholder="you@email.com"
                                        onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#818cf8'; e.target.style.boxShadow = '0 0 0 4px rgba(79,70,229,0.08)'; }}
                                        onBlur={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading || !email}
                                style={{
                                    width: '100%', padding: '18px',
                                    background: loading || !email ? '#e2e8f0' : '#4f46e5',
                                    color: loading || !email ? '#94a3b8' : '#fff',
                                    border: 'none', borderRadius: 14,
                                    fontSize: 16, fontWeight: 800,
                                    cursor: loading || !email ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    boxShadow: loading || !email ? 'none' : '0 8px 24px rgba(79,70,229,0.3)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {loading ? <Loader2 size={22} className="animate-spin" /> : <>Send OTP <ArrowRight size={18} /></>}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <div style={{ marginBottom: 20 }}>
                                <label style={labelStyle}>Enter 6-Digit OTP</label>
                                <div style={{ position: 'relative' }}>
                                    <KeyRound size={18} style={iconStyle} />
                                    <input 
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        style={{...inputStyle, letterSpacing: '0.2em', fontWeight: 900}}
                                        placeholder="••••••"
                                        maxLength="6"
                                        onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#818cf8'; e.target.style.boxShadow = '0 0 0 4px rgba(79,70,229,0.08)'; }}
                                        onBlur={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: 32 }}>
                                <label style={labelStyle}>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={iconStyle} />
                                    <input 
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
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
                                    width: '100%', padding: '18px',
                                    background: loading ? '#e2e8f0' : '#4f46e5',
                                    color: loading ? '#94a3b8' : '#fff',
                                    border: 'none', borderRadius: 14,
                                    fontSize: 16, fontWeight: 800,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    boxShadow: loading ? 'none' : '0 8px 24px rgba(79,70,229,0.3)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {loading ? <Loader2 size={22} className="animate-spin" /> : <>Complete Reset <ArrowRight size={18} /></>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
