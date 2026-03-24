'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => {},
    isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        // Read from localStorage on mount
        const saved = localStorage.getItem('career-ai-theme') as Theme | null;
        if (saved === 'dark' || saved === 'light') {
            setTheme(saved);
            document.documentElement.setAttribute('data-theme', saved);
        } else {
            // Default to dark if no saved preference
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

    const toggleTheme = () => {
        const next: Theme = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        localStorage.setItem('career-ai-theme', next);
        document.documentElement.setAttribute('data-theme', next);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
