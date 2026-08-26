import React, { useState } from 'react';
import { ModalRoot, ModalPage, ModalPageHeader, Button, Div, Subhead, Caption, Cell } from '@vkontakte/vkui';
import { Icon24Dismiss } from '@vkontakte/icons';
import bridge from '@vkontakte/vk-bridge';

interface StatusPickerProps {
    isOpen: boolean;
    onClose: () => void;
    currentStationName?: string;
}

// Готовые шаблоны статусов
const STATUS_TEMPLATES = [
    { id: 1, emoji: '🎧', text: 'Слушаю AniWave Radio', color: '#ff66b3' },
    { id: 2, emoji: '🌸', text: 'Погружаюсь в мир аниме-музыки', color: '#ff99cc' },
    { id: 3, emoji: '🎵', text: 'Мой вайб — Lo-Fi & Chill', color: '#66ccff' },
    { id: 4, emoji: '❤️', text: 'AniWave Radio — моё любимое радио', color: '#ff3366' },
    { id: 5, emoji: '🎶', text: 'J-Pop, Lo-Fi, OST 24/7', color: '#a18cd1' },
    { id: 6, emoji: '🌙', text: 'Засыпаю под AniWave Radio', color: '#6699ff' },
    { id: 7, emoji: '🔥', text: 'Топовые аниме треки здесь', color: '#ff6633' },
    { id: 8, emoji: '✨', text: 'Открываю новую музыку с AniWave', color: '#ffcc66' },
];

export const StatusPicker: React.FC<StatusPickerProps> = ({
    isOpen,
    onClose,
    currentStationName,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Динамический статус с названием текущей станции
    const dynamicStatus = currentStationName
        ? `🎧 Слушаю ${currentStationName} на AniWave Radio`
        : '🎧 Слушаю AniWave Radio';

    const setStatus = async (statusText: string) => {
        setIsLoading(true);
        setSuccessMessage('');

        try {
            // Запрашиваем право на установку статуса
            await bridge.send('VKWebAppGetAuthToken', {
                app_id: 54729099,
                scope: 'status'
            });

            // Устанавливаем статус через VK API
            // Используем as any для обхода строгой типизации VK Bridge
            await bridge.send('VKWebAppCallAPIMethod' as any, {
                method: 'status.set',
                params: {
                    text: statusText
                }
            } as any);

            setSuccessMessage('✅ Статус установлен!');
            setTimeout(() => {
                setSuccessMessage('');
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Ошибка установки статуса:', error);
            setSuccessMessage('❌ Не удалось установить статус. Проверьте разрешения.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ModalRoot activeModal={isOpen ? 'status-picker' : undefined}>
            <ModalPage
                id="status-picker"
                header={
                    <ModalPageHeader
                        before={
                            <Button mode="tertiary" onClick={onClose}>
                                <Icon24Dismiss />
                            </Button>
                        }
                    >
                        Установить статус
                    </ModalPageHeader>
                }
                onClose={onClose}
            >
                <Div style={{ padding: '16px' }}>
                    <Caption style={{ color: '#99A2AD', marginBottom: '16px', display: 'block' }}>
                        Выберите статус или используйте текущую станцию:
                    </Caption>

                    {/* Динамический статус с текущей станцией */}
                    <Cell
                        onClick={() => setStatus(dynamicStatus)}
                        before={<div style={{ fontSize: '24px' }}>🎧</div>}
                        subtitle={dynamicStatus}
                        style={{
                            background: 'linear-gradient(90deg, rgba(255, 102, 179, 0.1) 0%, rgba(102, 204, 255, 0.1) 100%)',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            border: '2px solid #ff66b3'
                        }}
                        disabled={isLoading}
                    >
                        <Subhead weight="2" style={{ color: '#ff66b3' }}>
                            Текущая станция
                        </Subhead>
                    </Cell>

                    {/* Список готовых статусов */}
                    {STATUS_TEMPLATES.map((status) => (
                        <Cell
                            key={status.id}
                            onClick={() => setStatus(status.text)}
                            before={<div style={{ fontSize: '24px' }}>{status.emoji}</div>}
                            subtitle={status.text}
                            style={{
                                borderRadius: '8px',
                                marginBottom: '8px',
                                background: 'transparent'
                            }}
                            disabled={isLoading}
                        >
                            <Subhead style={{ color: '#ffffff' }}>
                                {status.text}
                            </Subhead>
                        </Cell>
                    ))}

                    {/* Сообщение об успехе/ошибке */}
                    {successMessage && (
                        <Div style={{
                            textAlign: 'center',
                            marginTop: '16px',
                            padding: '12px',
                            background: successMessage.includes('✅') ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                            borderRadius: '8px'
                        }}>
                            <Caption style={{
                                color: successMessage.includes('✅') ? '#4CAF50' : '#F44336',
                                fontSize: '14px'
                            }}>
                                {successMessage}
                            </Caption>
                        </Div>
                    )}

                    {/* Индикатор загрузки */}
                    {isLoading && (
                        <Div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <Caption style={{ color: '#99A2AD' }}>
                                Устанавливаем статус...
                            </Caption>
                        </Div>
                    )}
                </Div>
            </ModalPage>
        </ModalRoot>
    );
};