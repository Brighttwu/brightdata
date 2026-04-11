import axios from 'axios';
import API_BASE_URL from './config';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Request interceptor to add token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            // Optional: redirect to login or reload
        }
        return Promise.reject(error);
    }
);

export default api;
