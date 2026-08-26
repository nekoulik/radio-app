import React from 'react';
import { Cell } from '@vkontakte/vkui';
import { Icon28Message } from '@vkontakte/icons';
import bridge from '@vkontakte/vk-bridge';

interface CommunityChatProps {
    communityId: string;
}

export const CommunityChat: React.FC<CommunityChatProps> = ({ communityId }) => {
    const openChat = async () => {
        try {
            // Открываем диалог с сообществом
            // @ts-ignore - VK Bridge имеет специфичную типизацию
            await bridge.send('VKWebAppOpenCommunityAppMessage' as any, {
                community_id: parseInt(communityId),
            });
        } catch (error) {
            console.error('Ошибка открытия чата:', error);
            // Fallback - открываем в браузере
            window.open(`https://vk.com/im?sel=${communityId}`, '_blank');
        }
    };

    return (
        <Cell
            before={<Icon28Message />}
            onClick={openChat}
            subtitle="Общайтесь с другими слушателями"
            style={{ borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}
        >
            💬 Чат с сообществом
        </Cell>
    );
};