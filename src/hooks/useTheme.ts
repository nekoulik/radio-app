import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [isDarkTheme, setIsDarkTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : false; // По умолчанию светлая
    });

    useEffect(() => {
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');

        const root = document.getElementById('root');
        if (root) {
            // Устанавливаем и атрибут, и класс для 100% совместимости с CSS
            if (isDarkTheme) {
                root.setAttribute('data-theme', 'dark');
                root.classList.add('theme-dark');
                root.classList.remove('theme-light');
            } else {
                root.setAttribute('data-theme', 'light');
                root.classList.add('theme-light');
                root.classList.remove('theme-dark');
            }
        }
    }, [isDarkTheme]);

    const toggleTheme = () => setIsDarkTheme(prev => !prev);

    return { isDarkTheme, toggleTheme };
};