import React, { useState, useRef, useEffect } from 'react';
import {
    Panel,
    PanelHeader,
    Button,
    Group,
    Cell,
    Slider,
    Placeholder,
    Div,
    Text,
    Subhead,
    Caption,
    Separator,
} from '@vkontakte/vkui';
import {
    Icon28PlayOutline,
    Icon28PauseOutline,
    Icon28ShareOutline,
} from '@vkontakte/icons';
import bridge from '@vkontakte/vk-bridge';

import {
    radioStations,
    DEFAULT_STATION_ID,
    getStationById,
    RadioStation,
} from '../data/radioStations';
import { StationList } from './StationList';

interface RadioPlayerProps {
    id: string;
}

export const RadioPlayer: React.FC<RadioPlayerProps> = ({ id }) => {
    const [currentStationId, setCurrentStationId] = useState(DEFAULT_STATION_ID);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Состояния для таймера сна
    const [sleepTimeMinutes, setSleepTimeMinutes] = useState<number | null>(null);
    const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentStation = getStationById(currentStationId);

    // Инициализация аудио при смене станции
    useEffect(() => {
        if (!currentStation) return;

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        const audio = new Audio(currentStation.streamUrl);
        audio.preload = 'none';
        audio.volume = volume;

        audio.addEventListener('playing', () => {
            setIsPlaying(true);
            setIsLoading(false);
            setError(null);
        });

        audio.addEventListener('pause', () => {
            setIsPlaying(false);
        });

        audio.addEventListener('waiting', () => {
            setIsLoading(true);
        });

        audio.addEventListener('error', () => {
            setError('Ошибка воспроизведения потока');
            setIsLoading(false);
            setIsPlaying(false);
        });

        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, [currentStationId]);

    // Обновление громкости
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Логика таймера сна
    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | undefined;

        if (sleepTimeMinutes !== null && timeLeftSeconds !== null && timeLeftSeconds > 0) {
            timer = setInterval(() => {
                setTimeLeftSeconds((prev) => {
                    if (prev !== null && prev <= 1) {
                        // Время вышло: останавливаем музыку
                        if (audioRef.current) {
                            audioRef.current.pause();
                        }
                        setIsPlaying(false);
                        setSleepTimeMinutes(null);
                        return 0;
                    }
                    return prev !== null ? prev - 1 : null;
                });
            }, 1000); // Обновляем каждую секунду
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [sleepTimeMinutes, timeLeftSeconds]);

    const togglePlay = async () => {
        if (!audioRef.current) return;

        try {
            if (isPlaying) {
                await audioRef.current.pause();
            } else {
                setIsLoading(true);
                await audioRef.current.play();
            }
        } catch (err) {
            console.error('Ошибка воспроизведения:', err);
            setError('Не удалось воспроизвести поток');
            setIsLoading(false);
        }
    };

    const handleVolumeChange = (value: number) => {
        setVolume(value / 100);
    };

    const handleSleepTimer = (minutes: number | null) => {
        setSleepTimeMinutes(minutes);
        setTimeLeftSeconds(minutes ? minutes * 60 : null);
    };

    const formatTime = (totalSeconds: number | null) => {
        if (totalSeconds === null) return '';
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleStationSelect = (station: RadioStation) => {
        if (station.id === currentStationId) {
            togglePlay();
        } else {
            setCurrentStationId(station.id);
            setIsPlaying(false);
            setIsLoading(false);
            setError(null);
            // Сбрасываем таймер при смене станции (опционально)
            setSleepTimeMinutes(null);
            setTimeLeftSeconds(null);

            setTimeout(() => {
                if (audioRef.current) {
                    setIsLoading(true);
                    audioRef.current.play().catch((e) => {
                        console.error('Autoplay error:', e);
                        setIsLoading(false);
                    });
                }
            }, 300);
        }
    };

    const handleShare = async () => {
        try {
            // @ts-ignore - VK Bridge метод может принимать разные параметры
            await bridge.send('VKWebAppShowShareBox', {
                link: 'https://vk.com/app54729099',
                title: 'AniWave - Anime Radio',
                comment: `Слушаю ${currentStation?.name} на AniWave! 🎵`,
            });
        } catch (err) {
            console.error('Ошибка при попытке поделиться:', err);
        }
    };

    return (
        <Panel id={id}>
            <PanelHeader>AniWave Radio</PanelHeader>

            <Group>
                {/* Основной блок плеера */}
                <Div
                    style={{
                        textAlign: 'center',
                        padding: '32px 16px',
                        background: 'linear-gradient(135deg, #1a0a2e 0%, #0a0a1a 100%)',
                        borderRadius: '12px',
                        margin: '12px 0',
                    }}
                >
                    {/* Логотип */}
                    <Div style={{ marginBottom: '24px' }}>
                        <div
                            style={{
                                width: '120px',
                                height: '120px',
                                margin: '0 auto',
                                borderRadius: '50%',
                                background: currentStation?.color || 'linear-gradient(135deg, #ff66b3 0%, #66ccff 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 40px rgba(255, 102, 179, 0.5)',
                                animation: isPlaying ? 'pulse 2s ease-in-out infinite' : 'none',
                            }}
                        >
                            <span style={{ fontSize: '64px' }}>🎵</span>
                        </div>
                    </Div>

                    {/* Название станции */}
                    <Subhead
                        style={{
                            color: '#ffffff',
                            marginBottom: '8px',
                            fontSize: '18px',
                            fontWeight: '600',
                        }}
                    >
                        {currentStation?.name || 'AniWave Radio'}
                    </Subhead>

                    <Caption style={{ color: '#99A2AD', marginBottom: '24px' }}>
                        {currentStation?.genre || 'Anime Radio • J-Pop • Lo-Fi • OST'}
                    </Caption>

                    {/* Кнопка Play/Pause */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                        <Button
                            size="l"
                            mode="primary"
                            style={{
                                background: currentStation?.color || 'linear-gradient(135deg, #ff66b3 0%, #66ccff 100%)',
                                border: 'none',
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                boxShadow: '0 8px 24px rgba(255, 102, 179, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onClick={togglePlay}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        border: '3px solid rgba(255, 255, 255, 0.3)',
                                        borderTop: '3px solid #ffffff',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite',
                                    }}
                                />
                            ) : isPlaying ? (
                                <Icon28PauseOutline width={40} height={40} />
                            ) : (
                                <Icon28PlayOutline width={40} height={40} style={{ marginLeft: '4px' }} />
                            )}
                        </Button>
                    </div>

                    {/* Громкость */}
                    <Div style={{ maxWidth: '280px', margin: '0 auto' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '8px',
                            }}
                        >
                            <Slider
                                value={volume * 100}
                                onChange={handleVolumeChange}
                                min={0}
                                max={100}
                                style={{ flex: 1 }}
                            />
                            <span
                                style={{
                                    color: '#99A2AD',
                                    fontSize: '12px',
                                    minWidth: '40px',
                                }}
                            >
                                {Math.round(volume * 100)}%
                            </span>
                        </div>
                    </Div>

                    {/* Таймер сна */}
                    <Div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                        <Caption style={{ color: '#99A2AD', marginBottom: '12px', display: 'block', textAlign: 'center' }}>
                            Таймер сна {timeLeftSeconds !== null && timeLeftSeconds > 0 ? `• Осталось: ${formatTime(timeLeftSeconds)}` : 'выключен'}
                        </Caption>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {[15, 30, 60].map((min) => (
                                <Button
                                    key={min}
                                    size="s"
                                    mode={sleepTimeMinutes === min ? 'primary' : 'outline'}
                                    style={{
                                        background: sleepTimeMinutes === min ? 'rgba(255, 102, 179, 0.2)' : 'transparent',
                                        color: sleepTimeMinutes === min ? '#ff66b3' : '#99A2AD',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        minWidth: '60px'
                                    }}
                                    onClick={() => handleSleepTimer(min)}
                                >
                                    {min} мин
                                </Button>
                            ))}
                            <Button
                                size="s"
                                mode="outline"
                                style={{
                                    background: sleepTimeMinutes === null ? 'rgba(255, 102, 179, 0.2)' : 'transparent',
                                    color: sleepTimeMinutes === null ? '#ff66b3' : '#99A2AD',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    minWidth: '60px'
                                }}
                                onClick={() => handleSleepTimer(null)}
                            >
                                Выкл
                            </Button>
                        </div>
                    </Div>
                </Div>

                {/* Кнопка Поделиться */}
                <Cell
                    before={<Icon28ShareOutline />}
                    onClick={handleShare}
                    subtitle="Пригласите друзей слушать вместе"
                >
                    Поделиться
                </Cell>

                {/* Ошибка */}
                {error && (
                    <Placeholder
                        stretched
                        header="Ошибка воспроизведения"
                        description={error}
                    >
                        <Button size="m" mode="secondary" onClick={togglePlay}>
                            Попробовать снова
                        </Button>
                    </Placeholder>
                )}

                {/* Список станций */}
                <Group
                    header={
                        <Subhead style={{ padding: '12px 16px' }}>
                            📻 Радиостанции
                        </Subhead>
                    }
                >
                    <StationList
                        stations={radioStations}
                        currentStationId={currentStationId}
                        isPlaying={isPlaying}
                        onStationSelect={handleStationSelect}
                    />
                </Group>

                {/* О радио */}
                <Separator />
                <Group
                    header={
                        <Subhead style={{ padding: '12px 16px' }}>
                            О радио
                        </Subhead>
                    }
                >
                    <Cell multiline>
                        <Text>
                            AniWave — это лучшее аниме радио! Слушайте J-Pop, Lo-Fi, OST из
                            любимых аниме 24/7.
                        </Text>
                    </Cell>
                </Group>
            </Group>

            {/* CSS анимации */}
            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 0 40px rgba(255, 102, 179, 0.5);
                    }
                    50% {
                        transform: scale(1.05);
                        box-shadow: 0 0 60px rgba(255, 102, 179, 0.7);
                    }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </Panel>
    );
};