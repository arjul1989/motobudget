'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export const ThemeToggle = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-current border border-white/5"
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? (
                <span className="material-symbols-outlined text-[20px]">light_mode</span>
            ) : (
                <span className="material-symbols-outlined text-[20px]">dark_mode</span>
            )}
        </button>
    );
};
