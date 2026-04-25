import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Globe, ShoppingCart, Info, AlertCircle, CheckCircle2, Search, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Boosting = () => {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedService, setSelectedService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [boostingSettings, setBoostingSettings] = useState({ isBoostingEnabled: true });
    
    // Form state
    const [link, setLink] = useState('');
    const [quantity, setQuantity] = useState('');
    const [customData, setCustomData] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const [servicesRes, settingsRes] = await Promise.all([
                    api.get('/smm/services'),
                    api.get('/settings') // Use public settings endpoint if exists or just handle error
                ]);
                
                if (Array.isArray(servicesRes.data)) {
                    setServices(servicesRes.data);
                    const cats = [...new Set(servicesRes.data.map(s => s.category))];
                    setCategories(cats);
                }
                if (settingsRes.data) {
                    setBoostingSettings(settingsRes.data);
                }
            } catch (err) {
                console.error('Failed to fetch services or settings');
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setSelectedService(null);
    };

    const handleServiceChange = (e) => {
        const service = services.find(s => s.service === e.target.value);
        setSelectedService(service);
    };

    const calculatePrice = () => {
        if (!selectedService || !quantity) return 0;
        const rate = parseFloat(selectedService.rate);
        const calculated = (rate / 1000) * parseInt(quantity);
        return Math.max(4.00, calculated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedService || !link || !quantity) {
            setError('Please fill in all required fields');
            return;
        }

        const amount = calculatePrice();
        if (user.balance < amount) {
            setError('Insufficient balance in your wallet');
            return;
        }

        if (quantity < parseInt(selectedService.min) || quantity > parseInt(selectedService.max)) {
            setError(`Quantity must be between ${selectedService.min} and ${selectedService.max}`);
            return;
        }

        try {
            setSubmitting(true);
            const res = await api.post('/smm/order', {
                serviceId: selectedService.service,
                serviceName: selectedService.name,
                category: selectedService.category,
                link,
                quantity: parseInt(quantity),
                amount,
                customData
            });

            setSuccess('Order placed successfully!');
            await refreshProfile();
            setTimeout(() => navigate('/orders?tab=boosting'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredServices = services.filter(s => s.category === selectedCategory);

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #f1f5f9', borderTopColor: '#ec4899', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!boostingSettings.isBoostingEnabled) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
                <div style={{ width: 80, height: 80, background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: 24 }}>
                    <AlertCircle size={40} />
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>Feature Suspended</h1>
                <p style={{ color: '#64748b', maxWidth: 400 }}>Social Boosting is currently undergoing maintenance. Please check back later or contact support for assistance.</p>
                <button onClick={() => navigate('/dashboard')} style={{ marginTop: 24, padding: '12px 24px', borderRadius: 12, background: '#0f172a', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ 
                        width: 64, height: 64, background: 'linear-gradient(135deg, #ec4899, #f43f5e)', 
                        borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        margin: '0 auto 20px', color: '#fff', boxShadow: '0 10px 25px rgba(236,72,153,0.3)'
                    }}>
                        <Globe size={32} />
                    </div>
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>Social Media Boosting</h1>
                    <p style={{ color: '#64748b', fontSize: 16 }}>Grow your social presence instantly. Targeted and high-quality services.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 24 }}>
                    
                    {/* Form Section */}
                    <div style={{ background: '#fff', borderRadius: 24, padding: 32, border: '1px solid #eef2ff', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <form onSubmit={handleSubmit}>
                             <div style={{ position: 'relative', marginBottom: 24 }}>
                                <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search categories (e.g. Instagram, TikTok)..." 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: 12, border: '2px solid #f1f5f9', fontSize: 14, fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            {/* Category Selection */}
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Select Category</label>
                                <select 
                                    value={selectedCategory} 
                                    onChange={handleCategoryChange}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '2px solid #f1f5f9', fontSize: 15, fontWeight: 600, outline: 'none' }}
                                >
                                    <option value="">-- Select Category --</option>
                                    {categories.filter(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Service Selection */}
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Select Service</label>
                                <select 
                                    value={selectedService?.service || ''} 
                                    onChange={handleServiceChange}
                                    disabled={!selectedCategory}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '2px solid #f1f5f9', fontSize: 15, fontWeight: 600, outline: 'none', background: !selectedCategory ? '#f8fafc' : '#fff' }}
                                >
                                    <option value="">-- Select Service --</option>
                                    {filteredServices.map(s => (
                                        <option key={s.service} value={s.service}>{s.name} - (₵{s.rate} per 1k)</option>
                                    ))}
                                </select>
                            </div>

                            {selectedService && (
                                <div style={{ background: '#fdf2f8', padding: 20, borderRadius: 16, marginBottom: 24, border: '1px solid #fce7f3' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#db2777', fontWeight: 800, fontSize: 14 }}>
                                            <Info size={16} /> Service Details
                                        </div>
                                        {selectedService.refill && (
                                            <div style={{ background: '#f0fdf4', color: '#16a34a', fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                                                Refill Support
                                            </div>
                                        )}
                                    </div>
                                    <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                                        <strong>Description:</strong> {selectedService.name}<br />
                                        {selectedService.description && (
                                            <div style={{ margin: '8px 0', padding: 8, background: 'rgba(0,0,0,0.02)', borderRadius: 8, fontSize: 12, borderLeft: '3px solid #ec4899' }}>
                                                {selectedService.description}
                                            </div>
                                        )}
                                        <strong>Minimum:</strong> {selectedService.min} | <strong>Maximum:</strong> {selectedService.max}<br />
                                        <strong>Rate:</strong> ₵{selectedService.rate} per 1,000 units<br />
                                        {selectedService.averageTime && <strong>Average Time: <span style={{ color: '#4f46e5' }}>{selectedService.averageTime}</span></strong>}
                                    </p>
                                    <div style={{ marginTop: 12, fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Note: Minimum order price is ₵4.00
                                    </div>
                                </div>
                            )}

                            {/* Link Input */}
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Target Link / URL</label>
                                <input 
                                    type="text" 
                                    placeholder="https://" 
                                    value={link}
                                    onChange={e => setLink(e.target.value)}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '2px solid #f1f5f9', fontSize: 15, outline: 'none' }}
                                />
                            </div>

                            {/* Quantity Input */}
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Quantity</label>
                                <input 
                                    type="number" 
                                    placeholder={selectedService ? `${selectedService.min} - ${selectedService.max}` : "Enter quantity"} 
                                    value={quantity}
                                    onChange={e => setQuantity(e.target.value)}
                                    style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '2px solid #f1f5f9', fontSize: 15, outline: 'none' }}
                                />
                            </div>

                            {/* Custom Section (Only if service is custom comments) */}
                            {selectedService?.name?.toLowerCase().includes('custom') && (
                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Custom Comments (One per line)</label>
                                    <textarea 
                                        rows="4"
                                        placeholder="Add your custom comments here..."
                                        value={customData}
                                        onChange={e => setCustomData(e.target.value)}
                                        style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: '2px solid #f1f5f9', fontSize: 15, outline: 'none', resize: 'vertical' }}
                                    />
                                </div>
                            )}

                            {error && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 12, color: '#ef4444', marginBottom: 24, fontSize: 14, fontWeight: 600 }}>
                                    <AlertCircle size={18} /> {error}
                                </div>
                            )}

                            {success && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: 12, color: '#10b981', marginBottom: 24, fontSize: 14, fontWeight: 600 }}>
                                    <CheckCircle2 size={18} /> {success}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={submitting || !selectedService}
                                style={{ 
                                    width: '100%', padding: '18px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', 
                                    color: '#fff', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 800, 
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    boxShadow: '0 8px 25px rgba(79,70,229,0.25)', transition: 'all 0.3s'
                                }}
                            >
                                {submitting ? <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <ShoppingCart size={20} />}
                                {submitting ? 'Processing...' : `Place Order (₵${calculatePrice().toFixed(2)})`}
                            </button>
                        </form>
                    </div>

                    {/* Summary Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ background: '#0f172a', borderRadius: 24, padding: 24, color: '#fff' }}>
                            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.6, letterSpacing: '0.1em', marginBottom: 8 }}>AVAILABLE BALANCE</div>
                            <div style={{ fontSize: 32, fontWeight: 900 }}>₵{(user?.balance || 0).toFixed(2)}</div>
                            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700 }}>Fast Delivery</div>
                                    <div style={{ fontSize: 11, opacity: 0.6 }}>98% instant processing</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: '#fff', borderRadius: 24, padding: 24, border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Info size={18} color="#4f46e5" /> Quality Tips
                            </h3>
                            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[
                                    'External profile must be public.',
                                    'Do not order for same link twice.',
                                    'Expect 0-24h start time.',
                                    'Real-time status tracking available.'
                                ].map((tip, i) => (
                                    <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>
                                        <div style={{ width: 6, height: 6, background: '#4f46e5', borderRadius: '50%', marginTop: 6, flexShrink: 0 }} />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    div[style*="gridTemplateColumns: minmax(0, 1fr) 320px"] {
                        grid-template-columns: 1fr !important;
                    }
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Boosting;
