import React from 'react';
import { ModalRoot, ModalPage, ModalPageHeader, Button, Div, Subhead, Caption } from '@vkontakte/vkui';
import { Icon24Dismiss } from '@vkontakte/icons';
import { Visualizer } from './Visualizer';
import { RadioStation } from '../data/radioStations';

interface NowPlayingScreenProps {
    isOpen: boolean;
    onClose: () => void;
    station: RadioStation | undefined;
    isPlaying: boolean;
    onTogglePlay: () => void;
}

export const NowPlayingScreen: React.FC<NowPlayingScreenProps> = ({
    isOpen,
    onClose,
    station,
    isPlaying,
    onTogglePlay,
}) => {
    if (!station) return null;

    return (
        <ModalRoot activeModal={isOpen ? 'now-playing' : undefined}>
            <ModalPage
                id="now-playing"
                header={
                    <ModalPageHeader
                        before={
                            <Button mode="tertiary" onClick={onClose}>
                                <Icon24Dismiss />
                            </Button>
                        }
                    >
                        Сейчас играет
                    </ModalPageHeader>
                }
                onClose={onClose}
                style={{
                    background: '#0a0a1a', // Темный фон
                    color: '#ffffff' // Белый текст по умолчанию
                }}
            >
                <Div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    padding: '32px 16px',
                    textAlign: 'center',
                    color: '#ffffff' // Явно задаем белый цвет для всего контента
                }}>
                    {/* Большая визуализация */}
                    <div style={{
                        width: '280px',
                        height: '280px',
                        marginBottom: '40px',
                        borderRadius: '24px',
                        background: station.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 20px 60px rgba(255, 102, 179, 0.4)',
                        animation: isPlaying ? 'pulse-large 3s ease-in-out infinite' : 'none'
                    }}>
                        <Visualizer
                            isPlaying={isPlaying}
                            color="rgba(255,255,255,0.9)"
                        />
                    </div>

                    {/* Информация о станции */}
                    <Subhead style={{
                        color: '#ffffff',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginBottom: '8px'
                    }}>
                        {station.name}
                    </Subhead>
                    <Caption style={{
                        color: '#99A2AD',
                        fontSize: '16px',
                        marginBottom: '40px'
                    }}>
                        {station.genre}
                    </Caption>

                    {/* Крупные кнопки управления */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        {/* Кнопка "Предыдущий" - декоративная */}
                        <Button
                            size="l"
                            mode="tertiary"
                            style={{
                                color: '#ffffff', // <-- Явный белый цвет
                                fontSize: '32px',
                                minWidth: '60px'
                            }}
                        >

                        </Button>

                        {/* Кнопка Play/Pause */}
                        <Button
                            size="l"
                            mode="primary"
                            onClick={onTogglePlay}
                            style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: station.color,
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {isPlaying ? (
                                <span style={{ fontSize: '40px', color: '#ffffff' }}>⏸</span>
                            ) : (
                                <span style={{ fontSize: '40px', color: '#ffffff', marginLeft: '4px' }}>▶</span>
                            )}
                        </Button>

                        {/* Кнопка "Следующий" - декоративная */}
                        <Button
                            size="l"
                            mode="tertiary"
                            style={{
                                color: '#ffffff', // <-- Явный белый цвет
                                fontSize: '32px',
                                minWidth: '60px'
                            }}
                        >
                            ⏭
                        </Button>
                    </div>
                </Div>
            </ModalPage>
        </ModalRoot>
    );
};