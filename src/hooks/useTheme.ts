import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [isDarkTheme, setIsDarkTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : false;
    });

    useEffect(() => {
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');

        const root = document.getElementById('root');
        if (root) {
            if (isDarkTheme) {
                root.classList.remove('theme-light');
                root.classList.add('theme-dark');
            } else {
                root.classList.remove('theme-dark');
                root.classList.add('theme-light');
            }
            console.log('Theme:', isDarkTheme ? 'dark' : 'light');
        }
    }, [isDarkTheme]);

    const toggleTheme = () => setIsDarkTheme(prev => !prev);

    return { isDarkTheme, toggleTheme };
};