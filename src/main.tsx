import { createRoot } from 'react-dom/client';
import vkBridge from '@vkontakte/vk-bridge';
import { AppConfig } from './AppConfig.tsx';
import './index.css'; // ✅ Отлично, что добавили!
import React from 'react';

// Инициализируем VK Bridge
vkBridge.send('VKWebAppInit');

// Рендерим приложение
createRoot(document.getElementById('root')!).render(<AppConfig />);

// Подключаем отладчик Eruda только в режиме разработки
if (import.meta.env.MODE === 'development') {
  import('./eruda.ts');
}