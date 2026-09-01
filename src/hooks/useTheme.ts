import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [isDarkTheme, setIsDarkTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : false;
    });

    useEffect(() => {
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');

        // Добавляем класс на body И на documentElement для надёжности
        if (isDarkTheme) {
            document.body.classList.add('theme-dark');
            document.body.classList.remove('theme-light');
            document.documentElement.classList.add('theme-dark');
            document.documentElement.classList.remove('theme-light');
        } else {
            document.body.classList.add('theme-light');
            document.body.classList.remove('theme-dark');
            document.documentElement.classList.add('theme-light');
            document.documentElement.classList.remove('theme-dark');
        }

        console.log('Theme applied:', isDarkTheme ? 'dark' : 'light');
        console.log('Body classes:', document.body.classList.toString());
    }, [isDarkTheme]);

    const toggleTheme = () => setIsDarkTheme(prev => !prev);

    return { isDarkTheme, toggleTheme };
};