import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Lock, Eye, EyeOff, RefreshCw, Smartphone, CheckCircle2, Gift } from 'lucide-react';
import API_URL from '../api/config';

const Profile = () => {
    const { user } = useAuth();
    const [profileForm, setProfileForm] = useState({ name: user?.name || '', momoNumber: user?.momoNumber || '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState({ profile: false, password: false });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPass, setShowPass] = useState(false);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const rows = [
        { icon: <User size={18} />, label: 'Full Name', value: user?.name },
        { icon: <Mail size={18} />, label: 'Email', value: user?.email },
        { icon: <Smartphone size={18} />, label: 'MoMo Number', value: user?.momoNumber || 'Not set' },
        { icon: <Gift size={18} />, label: 'My Referral Code', value: user?.referralCode },
        { icon: <Shield size={18} />, label: 'Role', value: user?.role || 'User' },
    ];

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading({ ...loading, profile: true });
        setMessage({ type: '', text: '' });
        try {
            await axios.post(`${API_URL}/user/update-profile`, profileForm, { headers });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            // Refresh would be good here or state update
            window.location.reload(); 
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setLoading({ ...loading, profile: false });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return setMessage({ type: 'error', text: 'New passwords do not match' });
        }
        setLoading({ ...loading, password: true });
        setMessage({ type: '', text: '' });
        try {
            const res = await axios.post(`${API_URL}/user/change-password`, passwordForm, { headers });
            setMessage({ type: 'success', text: res.data.message });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Error updating password' });
        } finally {
            setLoading({ ...loading, password: false });
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 72px)', padding: '24px 16px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: 500, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Profile Header */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: 28,
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', fontSize: 32, fontWeight: 900,
                        boxShadow: '0 8px 16px rgba(79, 70, 229, 0.2)'
                    }}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>{user?.name}</h1>
                    <div style={{ display: 'inline-block', padding: '4px 12px', background: '#eef2ff', color: '#4f46e5', borderRadius: 8, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {user?.role} Agent
                    </div>
                </div>

                {/* Info Card */}
                <div style={{ background: '#fff', borderRadius: 24, padding: '8px 0', border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
                    {rows.map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '15px 24px', borderBottom: i < rows.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {r.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 2 }}>{r.label}</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{r.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* General Settings */}
                <div style={{ background: '#fff', borderRadius: 24, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={18} />
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Account Details</h2>
                    </div>

                    <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>Full Name</label>
                            <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required
                                style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '2px solid #f1f5f9', outline: 'none', fontWeight: 700, boxSizing: 'border-box' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>MoMo Number</label>
                            <input type="text" value={profileForm.momoNumber} onChange={e => setProfileForm({ ...profileForm, momoNumber: e.target.value })} required
                                style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '2px solid #f1f5f9', outline: 'none', fontWeight: 700, boxSizing: 'border-box' }} />
                        </div>
                        <button type="submit" disabled={loading.profile} style={{ padding: '14px', borderRadius: 12, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                            {loading.profile ? 'Updating...' : 'Save Changes'}
                        </button>
                    </form>
                </div>

                {/* Change Password Card */}
                <div style={{ background: '#fff', borderRadius: 24, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Lock size={18} />
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Update Password</h2>
                    </div>

                    <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>Current Password</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPass ? "text" : "password"} value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required
                                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '2px solid #f1f5f9', outline: 'none', fontWeight: 700, boxSizing: 'border-box' }} />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>New Password</label>
                                <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required
                                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '2px solid #f1f5f9', outline: 'none', fontWeight: 700, boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>Confirm New</label>
                                <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required
                                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '2px solid #f1f5f9', outline: 'none', fontWeight: 700, boxSizing: 'border-box' }} />
                            </div>
                        </div>

                        {message.text && (
                            <div style={{ padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: message.type === 'success' ? '#f0fdf4' : '#fef2f2', color: message.type === 'success' ? '#16a34a' : '#dc2626' }}>
                                {message.text}
                            </div>
                        )}

                        <button type="submit" disabled={loading.password} style={{
                            marginTop: 8, padding: '16px', borderRadius: 14, border: 'none',
                            background: '#0f172a', color: '#fff', fontWeight: 800, fontSize: 15,
                            cursor: loading.password ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                        }}>
                            {loading.password ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Profile;
