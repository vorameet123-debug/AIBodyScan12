/**
 * Theme Context
 * Manages dark/light mode across the app.
 * Persists preference via AsyncStorage.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
    mode: ThemeMode;
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'dark',
    isDark: true,
    toggleTheme: () => { },
    setTheme: () => { },
});

const STORAGE_KEY = '@aibodyscan_theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>('dark');

    // Load saved preference
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then((saved: string | null) => {
            if (saved === 'light' || saved === 'dark') {
                setMode(saved);
            }
        });
    }, []);

    const toggleTheme = () => {
        const next = mode === 'dark' ? 'light' : 'dark';
        setMode(next);
        AsyncStorage.setItem(STORAGE_KEY, next);
    };

    const setTheme = (newMode: ThemeMode) => {
        setMode(newMode);
        AsyncStorage.setItem(STORAGE_KEY, newMode);
    };

    return (
        <ThemeContext.Provider value={{ mode, isDark: mode === 'dark', toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
