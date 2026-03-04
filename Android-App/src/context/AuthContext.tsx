import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/AuthService';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (name: string, email: string, password: string, phone: string, age: number, gender: string) => Promise<{ success: boolean; error?: string; otp_sent?: boolean; message?: string }>;
    logout: () => Promise<void>;
    verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
    resendOTP: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // ── Seed user instantly from localStorage (zero loading lag) ──────────
    const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
    const isLoading = false; // UI shows instantly — session verified in background

    useEffect(() => {
        // Verify session with the backend silently in the background.
        // If the token is invalid/expired: quietly log out.
        const verifyInBackground = async () => {
            const verified = await authService.verifySession();
            if (!verified && authService.getCurrentUser() !== null) {
                // Session expired — clear it silently
                setUser(null);
                localStorage.removeItem('session_token');
                localStorage.removeItem('user');
            } else if (verified) {
                // Refresh user data from backend
                setUser(verified);
            }
        };
        verifyInBackground();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authService.login(email, password);
        if (response.success && response.user) {
            setUser(response.user);
            return { success: true };
        }
        return { success: false, error: response.error };
    };

    const signup = async (name: string, email: string, password: string, phone: string, age: number, gender: string) => {
        const response = await authService.signup(name, email, password, phone, age, gender);
        // Signup returns {success, otp_sent, email} not a user object
        // User is only set after OTP verification
        return response;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: user !== null,
            login,
            signup,
            logout,
            verifyOTP: authService.verifyOTP.bind(authService),
            resendOTP: authService.resendOTP.bind(authService)
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
