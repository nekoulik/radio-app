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
    onSwitchStation: (direction: 'next' | 'prev') => void;
    onRandomStation?: () => void; // <-- Новый пропс
}

export const NowPlayingScreen: React.FC<NowPlayingScreenProps> = ({
    isOpen,
    onClose,
    station,
    isPlaying,
    onTogglePlay,
    onSwitchStation,
    onRandomStation,
}) => {
    if (!station) return null;

    return (
        <ModalRoot activeModal={isOpen ? 'now-playing' : undefined}>
            <ModalPage
                id="now-playing"
                className="now-playing-modal"
                header={
                    <ModalPageHeader
                        before={
                            <Button mode="tertiary" onClick={onClose}>
                                <Icon24Dismiss style={{ color: '#fff' }} />
                            </Button>
                        }
                        style={{ background: 'transparent', color: '#fff' }}
                    >
                        <span style={{ color: '#ffffff' }}>Сейчас играет</span>
                    </ModalPageHeader>
                }
                onClose={onClose}
            >
                <div className="now-playing-content">
                    <Div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        padding: '32px 16px',
                        textAlign: 'center'
                    }}>
                        {/* Большая визуализация */}
                        <div style={{
                            width: '260px',
                            height: '260px',
                            marginBottom: '32px',
                            borderRadius: '24px',
                            background: station.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        }}>
                            <Visualizer
                                isPlaying={isPlaying}
                                color="rgba(255,255,255,0.9)"
                            />
                        </div>

                        {/* Информация о станции */}
                        <Subhead style={{
                            color: '#ffffff !important',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            marginBottom: '8px'
                        }}>
                            {station.name}
                        </Subhead>
                        <Caption style={{
                            color: '#99A2AD !important',
                            fontSize: '16px',
                            marginBottom: '40px'
                        }}>
                            {station.genre}
                        </Caption>

                        {/* Крупные кнопки управления */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '20px' }}>
                            {/* Кнопка "Предыдущий" */}
                            <Button
                                size="l"
                                mode="tertiary"
                                style={{
                                    color: '#ffffff',
                                    minWidth: '56px',
                                    height: '56px',
                                    fontSize: '28px',
                                    padding: 0,
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '50%',
                                    backdropFilter: 'blur(10px)',
                                }}
                                onClick={() => onSwitchStation('prev')}
                            >
                                ⏮
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
                                    justifyContent: 'center',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                    padding: 0
                                }}
                            >
                                {isPlaying ? (
                                    <span style={{ fontSize: '36px', lineHeight: 1, color: '#fff' }}>⏸</span>
                                ) : (
                                    <span style={{ fontSize: '36px', lineHeight: 1, marginLeft: '6px', color: '#fff' }}>▶</span>
                                )}
                            </Button>

                            {/* Кнопка "Следующий" */}
                            <Button
                                size="l"
                                mode="tertiary"
                                style={{
                                    color: '#ffffff',
                                    minWidth: '56px',
                                    height: '56px',
                                    fontSize: '28px',
                                    padding: 0,
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '50%',
                                    backdropFilter: 'blur(10px)',
                                }}
                                onClick={() => onSwitchStation('next')}
                            >
                                ⏭
                            </Button>

                            {/* 🎲 Кнопка "Случайная станция" */}
                            {onRandomStation && (
                                <Button
                                    size="l"
                                    mode="tertiary"
                                    onClick={onRandomStation}
                                    style={{
                                        minWidth: '56px',
                                        height: '56px',
                                        fontSize: '28px',
                                        padding: 0,
                                        background: 'linear-gradient(135deg, #ff66b3 0%, #a18cd1 100%)',
                                        borderRadius: '50%',
                                        boxShadow: '0 4px 16px rgba(255, 102, 179, 0.4)',
                                        border: 'none',
                                    }}
                                >
                                    🎲
                                </Button>
                            )}
                        </div>
                    </Div>
                </div>
            </ModalPage>
        </ModalRoot>
    );
};