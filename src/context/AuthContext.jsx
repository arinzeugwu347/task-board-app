import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { successToast, errorToast } from '../utils/toast';
import { login as apiLogin, register as apiRegister, getCurrentUser } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        // Synchronous check on mount — survives refresh
        return !!sessionStorage.getItem('authToken');
    });

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState(null);
    const navigate = useNavigate();

    const validateAndSetUser = async () => {
        const token = sessionStorage.getItem('authToken');
        if (!token) return;

        setLoading(true);
        try {
            const userData = await getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
        } catch (err) {
            console.error('Token validation failed:', err);
            sessionStorage.removeItem('authToken');
            setIsAuthenticated(false);
            setUser(null);
            setAuthError('Session expired. Please log in again.');
            errorToast('Session expired. Please log in again.');
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        setAuthError(null);

        try {
            const data = await apiLogin(email, password);
            sessionStorage.setItem('authToken', data.token);
            const userData = await getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
            successToast(`Welcome back, ${userData?.name || 'there'}!`);
            navigate('/');
        } catch (err) {
            const message = err.message || 'Login failed. Please check your credentials.';
            setAuthError(message);
            errorToast(message);
        } finally {
            setLoading(false);
        }
    };

    const signup = async (name, email, password) => {
        setLoading(true);
        setAuthError(null);

        try {
            const data = await apiRegister(name, email, password);
            sessionStorage.setItem('authToken', data.token);
            const userData = await getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
            successToast(`Account created! Welcome, ${userData?.name || name || 'there'}.`);
            navigate('/');
        } catch (err) {
            let message = 'Registration failed.';
            if (err.message?.includes('already exists') || err.message?.includes('409')) {
                message = 'This email is already registered. Please log in.';
            } else if (err.message?.includes('name') || err.message?.includes('required')) {
                message = 'Please enter your full name.';
            }
            setAuthError(message);
            errorToast(message);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        sessionStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setUser(null);
        setAuthError(null);
        successToast('You have been logged out.');
        navigate('/login');
    };

    // Validate token on initial mount to restore user object
    useEffect(() => {
        validateAndSetUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                loading,
                error: authError,
                login,
                signup,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);