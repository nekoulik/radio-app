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
            {/* Добавляем класс dark-theme для принудительного темного фона */}
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
                        // Делаем заголовок прозрачным или темным
                        style={{ background: 'transparent', color: '#fff' }}
                    >
                        <span style={{ color: '#ffffff' }}>Сейчас играет</span>
                    </ModalPageHeader>
                }
                onClose={onClose}
            >
                {/* Контейнер с темным фоном на всю высоту */}
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

                        {/* Информация о станции - ЯВНЫЙ БЕЛЫЙ ЦВЕТ */}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginTop: '20px' }}>
                            {/* Кнопка "Предыдущий" */}
                            <Button
                                size="l"
                                mode="tertiary"
                                style={{
                                    color: '#000000', // Черный цвет для видимости
                                    minWidth: '60px',
                                    height: '60px',
                                    fontSize: '32px', // Размер эмодзи
                                    padding: 0
                                }}
                                onClick={() => {
                                    // Здесь можно добавить логику переключения назад
                                    console.log('Prev station');
                                }}
                            >
                                ⏮
                            </Button>

                            {/* Кнопка Play/Pause (Центральная) */}
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
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                    padding: 0
                                }}
                            >
                                {isPlaying ? (
                                    <span style={{ fontSize: '36px', lineHeight: 1, color: '#fff' }}></span>
                                ) : (
                                    <span style={{ fontSize: '36px', lineHeight: 1, marginLeft: '6px', color: '#fff' }}>▶</span>
                                )}
                            </Button>

                            {/* Кнопка "Следующий" */}
                            <Button
                                size="l"
                                mode="tertiary"
                                style={{
                                    color: '#000000', // Черный цвет для видимости
                                    minWidth: '60px',
                                    height: '60px',
                                    fontSize: '32px', // Размер эмодзи
                                    padding: 0
                                }}
                                onClick={() => {
                                    // Здесь можно добавить логику переключения вперед
                                    console.log('Next station');
                                }}
                            >
                                ⏭
                            </Button>
                        </div>
                    </Div>
                </div>
            </ModalPage>
        </ModalRoot>
    );
};