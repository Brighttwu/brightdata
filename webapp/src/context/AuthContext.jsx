import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // The token is automatically added by the axios interceptor
                const res = await api.get('/user/profile');
                setUser(res.data);
            } catch (err) {
                console.error('Session restoration failed:', err.message);
                // Token is removed by interceptor on 401
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (name, email, password, referralCode = '', momoNumber = '', phoneNumber = '') => {
        const res = await api.post('/auth/register', { name, email, password, referralCode, momoNumber, phoneNumber });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateBalance = useCallback((newBalance) => {
        setUser(prev => ({ ...prev, balance: newBalance }));
    }, []);

    const refreshProfile = async () => {
        try {
            const res = await api.get('/user/profile');
            setUser(res.data);
            return res.data;
        } catch (err) {
            console.error('Profile refresh failed:', err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateBalance, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
