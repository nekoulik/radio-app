import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [isDarkTheme, setIsDarkTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : false; // По умолчанию СВЕТЛАЯ
    });

    useEffect(() => {
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');

        // Применяем к #root (работает в iframe VK)
        const root = document.getElementById('root');
        if (root) {
            root.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
            console.log('Theme applied to #root:', isDarkTheme ? 'dark' : 'light');
        }
    }, [isDarkTheme]);

    const toggleTheme = () => setIsDarkTheme(prev => !prev);

    return { isDarkTheme, toggleTheme };
};