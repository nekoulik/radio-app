import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [isDarkTheme, setIsDarkTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : false;
    });

    useEffect(() => {
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');

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

        console.log('Theme:', isDarkTheme ? 'dark' : 'light');

        // === JAVASCRIPT СТИЛИ ДЛЯ МОДАЛОК ===
        const styleId = 'modal-gradient-styles';
        let styleElement = document.getElementById(styleId);

        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }

        styleElement.textContent = `
            .ModalPage__in, .ModalPage, .ModalRoot,
            [class*="ModalPage__in"], [class*="ModalPage"], [class*="ModalRoot"],
            div[class*="Modal"] {
                background: linear-gradient(-45deg, #667eea, #764ba2, #6B73FF, #9B59B6) !important;
                background-size: 400% 400% !important;
                animation: modalGradient 12s ease infinite !important;
            }
            
            .ModalPage__header, [class*="ModalPage__header"] {
                background: rgba(255, 255, 255, 0.1) !important;
                backdrop-filter: blur(10px) !important;
            }
            
            .ModalPage__header-in, [class*="ModalPage__header-in"] {
                color: #ffffff !important;
            }
            
            .Cell, .Group, .Div,
            [class*="Cell"], [class*="Group"], [class*="Div"] {
                background: rgba(255, 255, 255, 0.08) !important;
                color: #ffffff !important;
            }
        `;
    }, [isDarkTheme]);

    const toggleTheme = () => setIsDarkTheme(prev => !prev);

    return { isDarkTheme, toggleTheme };
};