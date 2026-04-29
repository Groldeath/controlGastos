import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface User {
    id: number;
    nombre_usuario: string;
    email: string;
    rol: 'admin' | 'usuario';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check for saved token and user
        const savedToken = sessionStorage.getItem('controlGastos_token');
        const savedUser = sessionStorage.getItem('controlGastos_user');

        if (savedToken && savedUser) {
            setToken(savedToken);
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                sessionStorage.removeItem('controlGastos_user');
            }
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        // Redirections based on auth state
        if (!isLoading) {
            if (!token && location.pathname !== '/login') {
                navigate('/login', { replace: true });
            } else if (token && location.pathname === '/login') {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [token, location.pathname, isLoading, navigate]);

    const login = (newToken: string, userData: User) => {
        sessionStorage.setItem('controlGastos_token', newToken);
        sessionStorage.setItem('controlGastos_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        navigate('/dashboard');
    };

    const logout = () => {
        sessionStorage.removeItem('controlGastos_token');
        sessionStorage.removeItem('controlGastos_user');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
