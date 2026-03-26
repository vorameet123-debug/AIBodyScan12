import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '../services/auth';

interface User {
    id: number;
    email: string;
    name?: string;
}

interface AuthContextType {
    userId: number;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch current user from API
    const fetchCurrentUser = async () => {
        if (!AuthService.isAuthenticated()) {
            setIsLoading(false);
            return;
        }

        try {
            const userData = await AuthService.getCurrentUser();
            setUser({
                id: userData.id,
                email: userData.email,
                name: userData.full_name,
            });
            setIsAuthenticated(true);
            // Also store in localStorage for quick access
            localStorage.setItem('user', JSON.stringify({
                id: userData.id,
                email: userData.email,
                name: userData.full_name,
            }));
        } catch (error) {
            console.error('Failed to fetch current user:', error);
            // Token might be invalid, clear it
            AuthService.logout();
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Check for stored auth on mount
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Ensure id is a number
                if (parsedUser && typeof parsedUser.id === 'number') {
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } else {
                    // Invalid user data, fetch fresh from API
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('user');
            }
        }

        // Always fetch fresh user data if token exists
        fetchCurrentUser();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        AuthService.logout();
    };

    const refreshUser = async () => {
        await fetchCurrentUser();
    };

    // Default to userId 1 for development if not authenticated
    // Ensure userId is ALWAYS a number
    const userId = typeof user?.id === 'number' ? user.id : 1;

    return (
        <AuthContext.Provider
            value={{
                userId,
                user,
                isAuthenticated,
                isLoading,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
