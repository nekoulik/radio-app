import React from 'react';
import { Cell } from '@vkontakte/vkui';
import { Icon28Message } from '@vkontakte/icons';
import bridge from '@vkontakte/vk-bridge';

export const InAppChat: React.FC = () => {
    const openChat = async () => {
        try {
            // Открываем диалог с сообществом через VK Bridge
            // @ts-ignore - VK Bridge имеет специфичную типизацию
            await bridge.send('VKWebAppOpenCommunityAppMessage' as any, {
                community_id: -239834224,
            });
        } catch (error) {
            console.error('Ошибка открытия чата:', error);
            // Fallback - открываем в новом окне
            window.open('https://vk.com/im?sel=-239834224', '_blank');
        }
    };

    return (
        <Cell
            before={<Icon28Message />}
            onClick={openChat}
            subtitle="Общайтесь с другими слушателями"
            style={{ borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}
        >
            💬 Чат приложения
        </Cell>
    );
};