import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle2, XCircle, ArrowRight, Home, RefreshCw, ShieldCheck, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { updateBalance } = useAuth();
    
    const [status, setStatus] = useState('processing'); // processing, success, error
    const [message, setMessage] = useState('Verifying your securely processed payment...');
    const [details, setDetails] = useState('');
    const hasCalledRef = useRef(false);

    const type = searchParams.get('type');
    const reference = searchParams.get('reference');
    const storeSlug = searchParams.get('storeSlug');

    useEffect(() => {
        if (!reference || !type) {
            setStatus('error');
            setMessage('Invalid payment parameters.');
            return;
        }

        if (hasCalledRef.current) return;
        hasCalledRef.current = true;

        const verifyPayment = async () => {
            try {
                let endpoint = '';
                
                if (type === 'wallet') {
                    endpoint = `/payment/verify/${reference}`;
                } else if (type === 'data') {
                    endpoint = `/data/buy-paystack-verify/${reference}`;
                } else if (type === 'store') {
                    endpoint = `/agent/public/verify/${reference}`;
                } else {
                    throw new Error('Unknown payment type');
                }

                const res = await api.get(endpoint);
                
                setStatus('success');
                
                if (type === 'wallet') {
                    if (res.data.balance !== undefined) {
                        updateBalance && updateBalance(res.data.balance);
                    }
                    setMessage('Top-up Successful!');
                    setDetails('Your wallet balance has been credited automatically.');
                } else if (type === 'data') {
                    setMessage('Payment Confirmed!');
                    setDetails('Your data bundle has been provisioned and sent to the recipient.');
                } else if (type === 'store') {
                    setMessage('Order Complete!');
                    setDetails('Payment was successful. The package has been sent to the beneficiary.');
                } else {
                    setMessage('Payment Successful!');
                    setDetails('Your transaction was processed successfully.');
                }
                
                // Clear URL parameters for cleanliness history
                window.history.replaceState({}, document.title, window.location.pathname);

                // AUTO-REDIRECT after 3 seconds for seamless experience
                setTimeout(() => {
                    navigate(getContinueUrl());
                }, 3000);

            } catch (err) {
                console.error("Payment verification error:", err);
                setStatus('error');
                setMessage('Verification Failed');
                setDetails(err.response?.data?.message || 'We could not verify your payment. Please contact support if you were debited.');
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        };

        verifyPayment();
    }, [reference, type, updateBalance]);

    const getContinueUrl = () => {
        if (type === 'store' && storeSlug) {
            return `/store/${storeSlug}`;
        }
        if (type === 'wallet') {
            return `/wallet`;
        }
        return '/dashboard';
    };

    return (
        <div style={{
            minHeight: '100vh', 
            background: '#0f172a',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: 20,
            fontFamily: "'Inter', sans-serif"
        }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
            
            {/* Background glowing orbs */}
            <div style={{ position: 'absolute', top: '10%', left: '20%', width: 300, height: 300, background: '#4f46e5', borderRadius: '50%', filter: 'blur(150px)', opacity: 0.15, zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: 300, height: 300, background: '#10b981', borderRadius: '50%', filter: 'blur(150px)', opacity: status === 'success' ? 0.2 : 0, transition: 'opacity 1s ease', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: 300, height: 300, background: '#ef4444', borderRadius: '50%', filter: 'blur(150px)', opacity: status === 'error' ? 0.2 : 0, transition: 'opacity 1s ease', zIndex: 0 }} />

            <div style={{
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(16px)',
                borderRadius: 32,
                padding: '48px 32px',
                width: '100%',
                maxWidth: 480,
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 10,
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Status Content */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                    {status === 'processing' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ position: 'relative', width: 100, height: 100, marginBottom: 32 }}>
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                    border: '4px solid rgba(79, 70, 229, 0.2)',
                                    borderRadius: '50%',
                                }} />
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                    border: '4px solid #4f46e5',
                                    borderTopColor: 'transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
                                }} />
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <ShieldCheck size={32} color="#818cf8" />
                                </div>
                            </div>
                            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#f8fafc', marginBottom: 12 }}>Processing Payment</h2>
                            <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.5, maxWidth: 300, margin: '0 auto' }}>
                                {message}
                            </p>
                            <div style={{ marginTop: 32, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(15, 23, 42, 0.5)', padding: '8px 16px', borderRadius: 20 }}>
                                <div style={{ width: 8, height: 8, background: '#f59e0b', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Do not close this window</span>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeInUp 0.6s ease-out' }}>
                            <div style={{
                                width: 100, height: 100, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28,
                                border: '2px solid rgba(16, 185, 129, 0.3)',
                                boxShadow: '0 0 40px rgba(16, 185, 129, 0.2)'
                            }}>
                                <CheckCircle2 size={52} color="#10b981" />
                            </div>
                            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#f8fafc', marginBottom: 12 }}>{message}</h2>
                            <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.6, marginBottom: 40, maxWidth: 340 }}>
                                {details}
                            </p>
                            <Link to={getContinueUrl()} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#fff', textDecoration: 'none', padding: '16px 32px', borderRadius: 16,
                                width: '100%', boxSizing: 'border-box', fontWeight: 800, fontSize: 16,
                                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
                                transition: 'transform 0.2s',
                            }}>
                                Continue <ArrowRight size={20} />
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeInUp 0.6s ease-out' }}>
                            <div style={{
                                width: 100, height: 100, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28,
                                border: '2px solid rgba(239, 68, 68, 0.3)',
                                boxShadow: '0 0 40px rgba(239, 68, 68, 0.2)'
                            }}>
                                <XCircle size={52} color="#ef4444" />
                            </div>
                            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#f8fafc', marginBottom: 12 }}>{message}</h2>
                            <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.6, marginBottom: 40, maxWidth: 340 }}>
                                {details}
                            </p>
                            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                                <button onClick={() => window.location.reload()} style={{
                                    flex: 1, padding: '16px', borderRadius: 16, background: 'rgba(255, 255, 255, 0.05)',
                                    color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 800,
                                    fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                }}>
                                    <RefreshCw size={18} /> Retry
                                </button>
                                <Link to={getContinueUrl()} style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    background: '#ef4444', color: '#fff', textDecoration: 'none', padding: '16px',
                                    borderRadius: 16, fontWeight: 800, fontSize: 16
                                }}>
                                    {type === 'store' ? <Store size={18} /> : <Home size={18} />}
                                    {type === 'store' ? 'Back to Store' : 'Home'}
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin { 
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default PaymentStatus;
