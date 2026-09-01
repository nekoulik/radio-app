import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [isDarkTheme, setIsDarkTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : false; // По умолчанию СВЕТЛАЯ для VK
    });

    useEffect(() => {
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');

        // Применяем к body (работает в iframe VK)
        document.body.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');

        // Добавляем/удаляем класс для надёжности
        if (isDarkTheme) {
            document.body.classList.add('theme-dark');
            document.body.classList.remove('theme-light');
        } else {
            document.body.classList.add('theme-light');
            document.body.classList.remove('theme-dark');
        }

        console.log('Theme applied:', isDarkTheme ? 'dark' : 'light');
    }, [isDarkTheme]);

    const toggleTheme = () => setIsDarkTheme(prev => !prev);

    return { isDarkTheme, toggleTheme };
};