import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/showProfile');
                    setUser(response.data);
                } catch (error) {
                    console.error('Auth verification failed:', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (credentials) => {
        const response = await api.post('/signIn', credentials);
        const { token } = response.data;
        localStorage.setItem('token', token);
        const profileResponse = await api.get('/showProfile');
        setUser(profileResponse.data.user);
    };

    const register = async (data) => {
        const response = await api.post('/signUp', data);
        const { token } = response.data;
        localStorage.setItem('token', token);
        const profileResponse = await api.get('/showProfile');
        setUser(profileResponse.data.user);
    };

    const logout = async () => {
        try {
            await api.post('/signOut');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
