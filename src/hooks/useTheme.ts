import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [isDarkTheme, setIsDarkTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : true;
    });

    useEffect(() => {
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    }, [isDarkTheme]);

    const toggleTheme = () => setIsDarkTheme(prev => !prev);

    return { isDarkTheme, toggleTheme };
};