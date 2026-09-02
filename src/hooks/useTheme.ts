import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [isDarkTheme, setIsDarkTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : false;
    });

    useEffect(() => {
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');

        // Переключаем классы на body и html для применения стилей из index.css
        if (isDarkTheme) {
            document.body.classList.remove('theme-light');
            document.body.classList.add('theme-dark');
            document.documentElement.classList.remove('theme-light');
            document.documentElement.classList.add('theme-dark');
        } else {
            document.body.classList.remove('theme-dark');
            document.body.classList.add('theme-light');
            document.documentElement.classList.remove('theme-dark');
            document.documentElement.classList.add('theme-light');
        }

        console.log('Theme applied:', isDarkTheme ? 'dark' : 'light');

        // ❌ УДАЛЕНО: Блок с document.createElement('style'). 
        // Все стили модалок теперь корректно и безопасно управляются через index.css!
    }, [isDarkTheme]);

    const toggleTheme = () => setIsDarkTheme(prev => !prev);

    return { isDarkTheme, toggleTheme };
};