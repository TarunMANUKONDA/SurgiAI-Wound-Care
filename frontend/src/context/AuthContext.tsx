import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/AuthService';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (name: string, email: string, password: string, phone: string, age: number, gender: string) => Promise<{ success: boolean; error?: string; otp_sent?: boolean; message?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Verify session on mount
        const checkSession = async () => {
            const currentUser = await authService.verifySession();
            setUser(currentUser);
            setIsLoading(false);
        };
        checkSession();
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
            logout
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
