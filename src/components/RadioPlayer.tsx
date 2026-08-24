import React, { useState, useRef, useEffect } from 'react';
import {
    Panel,
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
    ModalRoot,
    ModalPage,
    ModalPageHeader,
    Textarea,
} from '@vkontakte/vkui';
import {
    Icon28PlayOutline,
    Icon28PauseOutline,
    Icon28CopyOutline,
    Icon24Dismiss,
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
    const [sleepTimeMinutes, setSleepTimeMinutes] = useState<number | null>(null);
    const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareText, setShareText] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentStation = getStationById(currentStationId);

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
        audio.addEventListener('pause', () => setIsPlaying(false));
        audio.addEventListener('waiting', () => setIsLoading(true));
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

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | undefined;
        if (sleepTimeMinutes !== null && timeLeftSeconds !== null && timeLeftSeconds > 0) {
            timer = setInterval(() => {
                setTimeLeftSeconds((prev) => {
                    if (prev !== null && prev <= 1) {
                        if (audioRef.current) audioRef.current.pause();
                        setIsPlaying(false);
                        setSleepTimeMinutes(null);
                        return 0;
                    }
                    return prev !== null ? prev - 1 : null;
                });
            }, 1000);
        }
        return () => { if (timer) clearInterval(timer); };
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

    const handleVolumeChange = (value: number) => setVolume(value / 100);

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
            setSleepTimeMinutes(null);
            setTimeLeftSeconds(null);
            setTimeout(() => {
                if (audioRef.current) {
                    setIsLoading(true);
                    audioRef.current.play().catch(() => setIsLoading(false));
                }
            }, 300);
        }
    };

    // Нативное окно отправки приложения ВК
    const handleShare = async () => {
        try {
            // @ts-ignore - VK Bridge метод
            await bridge.send('VKWebAppShare', {
                link: 'https://vk.com/app54729099',
            });
        } catch (err) {
            console.log('VKWebAppShare не сработал, открываем fallback');
            const text = `🎵 Слушаю ${currentStation?.name} на AniWave Radio!\n\nAnime Radio • J-Pop • Lo-Fi • OST\nhttps://vk.com/app54729099`;
            setShareText(text);
            setCopySuccess(false);
            setIsShareModalOpen(true);
        }
    };

    const copyShareText = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            setCopySuccess(true);
            return;
        } catch (err) {
            console.log('Clipboard API не сработал');
        }

        try {
            const textarea = document.createElement('textarea');
            textarea.value = shareText;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopySuccess(true);
        } catch (err) {
            console.error('Ошибка копирования:', err);
        }
    };

    return (
        <Panel id={id}>
            {/* Fallback модальное окно копирования */}
            <ModalRoot activeModal={isShareModalOpen ? 'share' : undefined}>
                <ModalPage
                    id="share"
                    header={
                        <ModalPageHeader
                            before={
                                <Button
                                    mode="tertiary"
                                    onClick={() => setIsShareModalOpen(false)}
                                >
                                    <Icon24Dismiss />
                                </Button>
                            }
                        >
                            Поделиться
                        </ModalPageHeader>
                    }
                    onClose={() => setIsShareModalOpen(false)}
                >
                    <Div style={{ padding: '16px' }}>
                        <Caption style={{ color: '#99A2AD', marginBottom: '12px', display: 'block' }}>
                            Скопируйте текст и отправьте друзьям:
                        </Caption>
                        <Textarea
                            value={shareText}
                            onChange={(e) => setShareText(e.target.value)}
                            rows={6}
                            style={{ marginBottom: '16px', fontFamily: 'monospace' }}
                        />
                        <Button
                            size="l"
                            mode={(copySuccess ? 'positive' : 'primary') as any}
                            style={{ width: '100%' }}
                            onClick={copyShareText}
                        >
                            {copySuccess ? '✅ Скопировано!' : '📋 Копировать текст'}
                        </Button>
                        <Caption style={{ color: '#99A2AD', marginTop: '12px', display: 'block', textAlign: 'center' }}>
                            Теперь вставьте текст в сообщение другу
                        </Caption>
                    </Div>
                </ModalPage>
            </ModalRoot>

            {/* Баннер */}
            <div style={{
                background: 'linear-gradient(135deg, #ff66b3 0%, #66ccff 100%)',
                padding: '20px 16px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-20px',
                    left: '-20px',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    right: '-30px',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#ffffff',
                        textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        marginBottom: '4px',
                    }}>
                        🌸 AniWave Radio
                    </div>
                    <div style={{
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        textShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    }}>
                        Anime • J-Pop • Lo-Fi • OST
                    </div>
                </div>
            </div>

            <Group>
                <Div style={{
                    textAlign: 'center',
                    padding: '32px 16px',
                    background: 'linear-gradient(135deg, #1a0a2e 0%, #0a0a1a 100%)',
                    borderRadius: '12px',
                    margin: '12px 0',
                }}>
                    <Div style={{ marginBottom: '24px' }}>
                        <div style={{
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
                        }}>
                            <span style={{ fontSize: '64px' }}>🎵</span>
                        </div>
                    </Div>

                    <Subhead style={{
                        color: '#ffffff',
                        marginBottom: '8px',
                        fontSize: '18px',
                        fontWeight: '600',
                    }}>
                        {currentStation?.name || 'AniWave Radio'}
                    </Subhead>

                    <Caption style={{ color: '#99A2AD', marginBottom: '24px' }}>
                        {currentStation?.genre || 'Anime Radio • J-Pop • Lo-Fi • OST'}
                    </Caption>

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
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    border: '3px solid rgba(255, 255, 255, 0.3)',
                                    borderTop: '3px solid #ffffff',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                }} />
                            ) : isPlaying ? (
                                <Icon28PauseOutline width={40} height={40} />
                            ) : (
                                <Icon28PlayOutline width={40} height={40} style={{ marginLeft: '4px' }} />
                            )}
                        </Button>
                    </div>

                    <Div style={{ maxWidth: '280px', margin: '0 auto' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '8px',
                        }}>
                            <Slider
                                value={volume * 100}
                                onChange={handleVolumeChange}
                                min={0}
                                max={100}
                                style={{ flex: 1 }}
                            />
                            <span style={{
                                color: '#99A2AD',
                                fontSize: '12px',
                                minWidth: '40px',
                            }}>
                                {Math.round(volume * 100)}%
                            </span>
                        </div>
                    </Div>

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

                <Cell
                    before={<Icon28CopyOutline />}
                    onClick={handleShare}
                    subtitle="Отправить приложение другу в сообщении"
                >
                    Поделиться
                </Cell>

                {error && (
                    // @ts-ignore - Placeholder принимает description как строку
                    <Placeholder stretched description={error}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Ошибка воспроизведения</div>
                        <Button size="m" mode="secondary" onClick={togglePlay}>
                            Попробовать снова
                        </Button>
                    </Placeholder>
                )}

                <Group header={<Subhead style={{ padding: '12px 16px' }}>📻 Радиостанции</Subhead>}>
                    <StationList
                        stations={radioStations}
                        currentStationId={currentStationId}
                        isPlaying={isPlaying}
                        onStationSelect={handleStationSelect}
                    />
                </Group>

                <Separator />
                <Group header={<Subhead style={{ padding: '12px 16px' }}>О радио</Subhead>}>
                    <Cell multiline>
                        <Text>
                            AniWave — это лучшее аниме радио! Слушайте J-Pop, Lo-Fi, OST из
                            любимых аниме 24/7.
                        </Text>
                    </Cell>
                </Group>
            </Group>

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