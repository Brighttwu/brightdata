import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

import API_URL from '../api/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get(`${API_URL}/user/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => setUser(res.data))
            .catch(() => localStorage.removeItem('token'))
            .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await axios.post(`${API_URL}/auth/login`, { email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (name, email, password, referralCode = '', momoNumber = '') => {
        const res = await axios.post(`${API_URL}/auth/register`, { name, email, password, referralCode, momoNumber });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateBalance = (newBalance) => {
        setUser(prev => ({ ...prev, balance: newBalance }));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateBalance }}>
            {children}
        </AuthContext.Provider>
    );
};
