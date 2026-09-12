import React, { useState, useRef, useEffect } from 'react';
import {
    Panel,
    Button,
    Group,
    Cell,
    Slider,
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
    Icon24Dismiss,
} from '@vkontakte/icons';
import bridge from '@vkontakte/vk-bridge';

import { fetchRadioStations, RadioStation } from '../data/radioStations';
import { StationSearch } from './StationSearch';
import { Visualizer } from './Visualizer';
import { useFavorites } from '../hooks/useFavorites';
import { NowPlayingScreen } from './NowPlayingScreen';
import { Equalizer } from './Equalizer';

interface RadioPlayerProps {
    id: string;
}

export const RadioPlayer: React.FC<RadioPlayerProps> = ({ id }) => {
    const [stations, setStations] = useState<RadioStation[]>([]);
    const [isLoadingStations, setIsLoadingStations] = useState(true);
    const [currentStationId, setCurrentStationId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [isLoading, setIsLoading] = useState(false);
    const [listeningHistory, setListeningHistory] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [sleepTimeMinutes, setSleepTimeMinutes] = useState<number | null>(null);
    const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareText, setShareText] = useState('');
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
    const [isEqOpen, setIsEqOpen] = useState(false);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [userName, setUserName] = useState<string>('');

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentStation = stations.find(s => s.id === currentStationId);
    const { toggleFavorite, isFavorite } = useFavorites();

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const bassFilterRef = useRef<BiquadFilterNode | null>(null);
    const boundAudioElementRef = useRef<HTMLAudioElement | null>(null);
    const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    const [stationRatings, setStationRatings] = useState<{ [key: string]: number }>({});
    const [hoveredRating, setHoveredRating] = useState<{ stationId: string, rating: number } | null>(null);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

    // === ФУНКЦИЯ ДЛЯ ТАКТИЛЬНОЙ ОТДАЧИ ===
    const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
        bridge.send('VKWebAppTapticImpactOccurred', { style }).catch(() => { });
    };

    // Дополнительная функция для событий (успех/ошибка)
    const triggerHapticNotification = (type: 'error' | 'success' | 'warning' = 'success') => {
        bridge.send('VKWebAppTapticNotificationOccurred', { type }).catch(() => { });
    };

    // === ПОЛУЧЕНИЕ ИМЕНИ ПОЛЬЗОВАТЕЛЯ ===
    const fetchUserInfo = async () => {
        try {
            const result = await bridge.send('VKWebAppGetUserInfo');
            if (result.first_name) {
                setUserName(result.first_name);
            }
        } catch (err) {
            console.error('Не удалось получить информацию о пользователе:', err);
            setUserName(''); // Если не получилось, оставляем пустым
        }
    };

    // Вызываем сразу после инициализации
    useEffect(() => {
        fetchUserInfo();
    }, []);

    // === КРИТИЧЕСКИ ВАЖНО: Инициализация VK Bridge СРАЗУ ===
    useEffect(() => {
        bridge.send('VKWebAppInit').catch(console.error);
    }, []);

    // Загрузка данных (после инициализации)
    useEffect(() => {
        const loadData = async () => {
            setIsLoadingStations(true);
            try {
                // Добавляем таймаут для защиты от долгой загрузки
                const timeoutPromise = new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 10000)
                );

                const loadedStations = await Promise.race([
                    fetchRadioStations(),
                    timeoutPromise
                ]);

                setStations(loadedStations);
                const savedStationId = localStorage.getItem('lastStationId');
                if (savedStationId && loadedStations.find(s => s.id === savedStationId)) {
                    setCurrentStationId(savedStationId);
                } else if (loadedStations.length > 0) {
                    setCurrentStationId(loadedStations[0].id);
                }
                const savedHistory = localStorage.getItem('listeningHistory');
                if (savedHistory) {
                    try {
                        setListeningHistory(JSON.parse(savedHistory));
                    } catch (e) {
                        console.error("Failed to parse listening history", e);
                        localStorage.removeItem('listeningHistory');
                    }
                }

                const savedRatings = localStorage.getItem('stationRatings');
                if (savedRatings) {
                    try {
                        setStationRatings(JSON.parse(savedRatings));
                    } catch (e) {
                        console.error("Failed to parse station ratings", e);
                    }
                }

            } catch (err) {
                console.error("Failed to load stations", err);
                setError("Не удалось загрузить список станций");
            } finally {
                setIsLoadingStations(false);
            }
        };
        loadData();
    }, []);

    const initAudioContext = (audioElement: HTMLAudioElement) => {
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioCtx();
            }
            const ctx = audioContextRef.current;
            if (boundAudioElementRef.current === audioElement && sourceRef.current) {
                if (ctx.state === 'suspended') ctx.resume();
                return;
            }
            if (sourceRef.current) {
                try { sourceRef.current.disconnect(); } catch (e) { }
            }
            const source = ctx.createMediaElementSource(audioElement);
            const bass = ctx.createBiquadFilter();
            bass.type = 'lowshelf';
            bass.frequency.value = 200;
            const treble = ctx.createBiquadFilter();
            treble.type = 'highshelf';
            treble.frequency.value = 2000;
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(bass);
            bass.connect(treble);
            treble.connect(analyser);
            analyser.connect(ctx.destination);
            boundAudioElementRef.current = audioElement;
            sourceRef.current = source;
            bassFilterRef.current = bass;
            trebleFilterRef.current = treble;
            analyserRef.current = analyser;
            if (ctx.state === 'suspended') ctx.resume();
        } catch (err) {
            console.error("Ошибка инициализации AudioContext:", err);
        }
    };

    useEffect(() => {
        if (!currentStation) return;
        let errorTimer: ReturnType<typeof setTimeout> | undefined;
        let retryCount = 0;
        const MAX_RETRIES = 2;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
        const audio = new Audio(currentStation!.streamUrl);
        audio.crossOrigin = "anonymous";
        audio.preload = 'none';
        audio.volume = volume;

        const startErrorTimer = () => {
            if (errorTimer) clearTimeout(errorTimer);
            const warningTimer = setTimeout(() => {
                if (isLoading && !isPlaying && !error) {
                    console.warn('Поток загружается дольше 30 секунд...');
                }
            }, 30000);
            errorTimer = setTimeout(() => {
                clearTimeout(warningTimer);
                if (isLoading && !isPlaying) {
                    setError(`Не удалось загрузить поток "${currentStation.name}" за 60 сек.`);
                    setIsLoading(false);
                }
            }, 60000);
        };

        const handleError = () => {
            if (error) return;
            if (errorTimer) clearTimeout(errorTimer);
            if (retryCount < MAX_RETRIES) {
                retryCount++;
                setTimeout(() => {
                    if (audioRef.current && audioRef.current.src === audio.src) {
                        audioRef.current.load();
                        audioRef.current.play().catch(e => {
                            if (e.name !== 'AbortError') console.error('Retry failed:', e);
                        });
                    }
                }, 2000);
            } else {
                setError(`Ошибка воспроизведения "${currentStation.name}". Попробуйте другую станцию.`);
                setIsLoading(false);
                setIsPlaying(false);
            }
        };

        audio.addEventListener('playing', () => {
            if (errorTimer) clearTimeout(errorTimer);
            retryCount = 0;
            setIsPlaying(true);
            setIsLoading(false);
            setError(null);
            if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
            initAudioContext(audio);
        });
        audio.addEventListener('pause', () => {
            if (errorTimer) clearTimeout(errorTimer);
            setIsPlaying(false);
        });
        audio.addEventListener('waiting', () => {
            setIsLoading(true);
            startErrorTimer();
        });
        audio.addEventListener('error', handleError);
        audio.addEventListener('stalled', handleError);
        startErrorTimer();
        audioRef.current = audio;

        return () => {
            audio.pause();
            if (errorTimer) clearTimeout(errorTimer);
        };
    }, [currentStationId]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
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
        triggerHaptic('medium');
        if (!audioRef.current) return;
        try {
            if (isPlaying) {
                await audioRef.current.pause();
            } else {
                setIsLoading(true);
                if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                    await audioContextRef.current.resume();
                }
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

    const switchStation = (direction: 'next' | 'prev') => {
        triggerHaptic('light');
        if (stations.length === 0) return;
        const currentIndex = stations.findIndex(s => s.id === currentStationId);
        const newIndex = direction === 'next'
            ? (currentIndex + 1) % stations.length
            : (currentIndex - 1 + stations.length) % stations.length;
        handleStationSelect(stations[newIndex]);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            switch (e.code) {
                case 'Space': e.preventDefault(); togglePlay(); break;
                case 'ArrowRight': e.preventDefault(); switchStation('next'); break;
                case 'ArrowLeft': e.preventDefault(); switchStation('prev'); break;
                case 'ArrowUp': e.preventDefault(); setVolume(prev => Math.min(prev + 0.1, 1)); break;
                case 'ArrowDown': e.preventDefault(); setVolume(prev => Math.max(prev - 0.1, 0)); break;
                case 'KeyM': e.preventDefault(); setVolume(prev => prev === 0 ? 0.8 : 0); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, switchStation]);

    const playRandomStation = () => {
        if (stations.length === 0) return;
        const available = stations.filter(s => s.id !== currentStationId);
        if (available.length === 0) return;
        handleStationSelect(available[Math.floor(Math.random() * available.length)]);
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
            setListeningHistory(prevHistory => {
                const newHistory = [station.id, ...prevHistory.filter(id => id !== station.id)].slice(0, 10);
                localStorage.setItem('listeningHistory', JSON.stringify(newHistory));
                return newHistory;
            });
            localStorage.setItem('lastStationId', station.id);
            setTimeout(() => {
                if (audioRef.current) {
                    setIsLoading(true);
                    audioRef.current.play().catch(() => setIsLoading(false));
                }
            }, 300);
        }
    };

    const handleRating = (stationId: string, rating: number) => {
        if (stationRatings[stationId]) {
            triggerHapticNotification('error'); // Вибрация ошибки
            alert('Вы уже проголосовали за эту станцию!');
            return;
        }

        triggerHapticNotification('success'); // ← ДОБАВИТЬ ЭТУ СТРОКУ (приятный отклик при успехе)

        setStationRatings(prev => {
            const newRatings = { ...prev, [stationId]: rating };
            localStorage.setItem('stationRatings', JSON.stringify(newRatings));
            return newRatings;
        });
    };

    const getStationsByRating = () => {
        return stations
            .map(station => ({
                ...station,
                rating: stationRatings[station.id] || 0,
                votes: stationRatings[station.id] ? 1 : 0
            }))
            .filter(station => station.rating > 0)
            .sort((a, b) => b.rating - a.rating);
    };

    const applyEqPreset = (preset: string) => {
        if (!bassFilterRef.current || !trebleFilterRef.current) return;
        if (preset === 'bass') { bassFilterRef.current.gain.value = 15; trebleFilterRef.current.gain.value = -5; }
        else if (preset === 'vocal') { bassFilterRef.current.gain.value = -5; trebleFilterRef.current.gain.value = 5; }
        else { bassFilterRef.current.gain.value = 0; trebleFilterRef.current.gain.value = 0; }
    };

    const handleShare = async () => {
        try {
            await bridge.send('VKWebAppShare', { link: 'https://vk.com/app54729099' });
        } catch (err) {
            setShareText(`🎵 Слушаю ${currentStation?.name} на AniWave Radio!\n\nAnime Radio • J-Pop • Lo-Fi • OST\nhttps://vk.com/app54729099`);
            setCopySuccess(false);
            setIsShareModalOpen(true);
        }
    };

    // === КОПИРОВАТЬ ТЕКСТ ===
    const copyShareText = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            setCopySuccess(true);
            triggerHapticNotification('success');
        } catch (err) {
            const textarea = document.createElement('textarea');
            textarea.value = shareText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopySuccess(true);
            triggerHapticNotification('success');
        }
    };

    // === ПОДЕЛИТЬСЯ В ИСТОРИИ VK (с готовой картинкой) ===
    const shareToStory = async () => {
        try {
            // Абсолютный URL картинки (замените на ваш реальный домен)
            const imageUrl = 'https://vk.com/app54729099/story-bg.png';

            await bridge.send('VKWebAppShowStoryBox', {
                background_type: 'image',
                background: {
                    url: imageUrl,  // ← именно url, а не image
                },
            } as any);

            triggerHapticNotification('success');
        } catch (err) {
            console.error('Ошибка при публикации в историю:', err);
            triggerHapticNotification('error');
        }
    };

    const openNowPlaying = () => setIsNowPlayingOpen(true);

    if (isLoadingStations) {
        return (
            <Panel id={id}>
                <Div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                    <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255, 102, 179, 0.3)', borderTop: '4px solid #ff66b3', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </Div>
            </Panel>
        );
    }

    return (
        <Panel id={id}>
            {/* 1. Модальное окно: Поделиться */}
            <ModalRoot activeModal={isShareModalOpen ? 'share' : undefined}>
                <ModalPage
                    id="share"
                    hideCloseButton={true}
                    header={
                        <ModalPageHeader
                            style={{ background: '#2D81E0' }}
                            before={<Button mode="tertiary" onClick={() => { setIsShareModalOpen(false); setCopySuccess(false); }}><Icon24Dismiss style={{ color: '#ffffff' }} /></Button>}
                        >
                            <span style={{ color: '#ffffff' }}>Поделиться</span>
                        </ModalPageHeader>
                    }
                    onClose={() => { setIsShareModalOpen(false); setCopySuccess(false); }}
                >
                    <Div style={{ padding: '20px' }}>
                        <Subhead weight="2" style={{ marginBottom: '12px', display: 'block' }}>
                            📋 Скопируйте текст и отправьте другу:
                        </Subhead>
                        <Textarea
                            value={shareText}
                            onChange={(e) => setShareText(e.target.value)}
                            rows={5}
                            readOnly
                            style={{
                                marginBottom: '16px',
                                borderRadius: '12px',
                                padding: '12px',
                                fontSize: '14px',
                                lineHeight: '1.5'
                            }}
                        />

                        {/* Кнопка 1: Копировать текст */}
                        <Button
                            size="l"
                            mode={copySuccess ? 'primary' : 'secondary'}
                            style={{
                                width: '100%',
                                background: copySuccess ? '#4BB34B' : '#2D81E0',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '14px',
                                fontSize: '16px',
                                fontWeight: 600
                            }}
                            onClick={copyShareText}
                        >
                            {copySuccess ? '✅ Скопировано!' : '📋 Скопировать текст'}
                        </Button>

                        {/* Кнопка 2: Поделиться в Истории (НОВАЯ) */}
                        <Button
                            size="l"
                            mode="secondary"
                            style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '14px',
                                fontSize: '16px',
                                fontWeight: 600,
                                marginTop: '12px',
                                boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)'
                            }}
                            onClick={shareToStory}
                        >
                            📖 Поделиться в Истории VK
                        </Button>

                        <Caption style={{ display: 'block', textAlign: 'center', marginTop: '12px', fontSize: '12px' }}>
                            Текст автоматически скопируется в буфер обмена
                        </Caption>
                    </Div>
                </ModalPage>
            </ModalRoot>

            {/* 2. Модальное окно: Общий чат */}
            <ModalRoot activeModal={isChatModalOpen ? 'chat-invite' : undefined}>
                <ModalPage
                    id="chat-invite"
                    hideCloseButton={true}
                    header={
                        <ModalPageHeader
                            style={{ background: '#2D81E0' }}
                            before={<Button mode="tertiary" onClick={() => setIsChatModalOpen(false)}><Icon24Dismiss style={{ color: '#ffffff' }} /></Button>}
                        >
                            <span style={{ color: '#ffffff' }}>💬 Общий чат</span>
                        </ModalPageHeader>
                    }
                    onClose={() => setIsChatModalOpen(false)}
                >
                    <Div style={{ padding: '20px' }}>
                        <Subhead weight="2" style={{ marginBottom: '12px', display: 'block', fontSize: '18px' }}>
                            Добро пожаловать в чат AniWave Radio!
                        </Subhead>
                        <Caption style={{ display: 'block', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5' }}>
                            Общайтесь с другими слушателями, делитесь любимыми треками и предлагайте идеи!
                        </Caption>
                        <Button
                            size="l"
                            mode="primary"
                            style={{
                                width: '100%',
                                background: '#2D81E0',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '14px',
                                fontSize: '16px',
                                fontWeight: 600
                            }}
                            Component="a"
                            href="https://vk.me/join/FTopCT1MkUooAn7FGOJNXxV9O6bGBudBoak="
                            target="_blank"
                        >
                            Присоединиться к чату →
                        </Button>
                        <Caption style={{ display: 'block', textAlign: 'center', marginTop: '12px', fontSize: '12px' }}>
                            Чат откроется в новом окне VK Мессенджера
                        </Caption>
                    </Div>
                </ModalPage>
            </ModalRoot>

            {/* 3. Модальное окно: История */}
            <ModalRoot activeModal={isHistoryModalOpen ? 'history' : undefined}>
                <ModalPage
                    id="history"
                    hideCloseButton={true}
                    header={
                        <ModalPageHeader
                            style={{ background: '#2D81E0' }}
                            before={<Button mode="tertiary" onClick={() => setIsHistoryModalOpen(false)}><Icon24Dismiss style={{ color: '#ffffff' }} /></Button>}
                        >
                            <span style={{ color: '#ffffff' }}>📜 История</span>
                        </ModalPageHeader>
                    }
                    onClose={() => setIsHistoryModalOpen(false)}
                >
                    <Div style={{ padding: '20px' }}>
                        {listeningHistory.length === 0 ? (
                            <Div style={{ textAlign: 'center', padding: '32px 0' }}>
                                <Subhead weight="2" style={{ fontSize: '16px' }}>История пуста</Subhead>
                                <Caption style={{ display: 'block', marginTop: '8px', fontSize: '14px' }}>
                                    Начните слушать радио
                                </Caption>
                            </Div>
                        ) : (
                            <>
                                {listeningHistory.map((stationId) => {
                                    const station = stations.find(s => s.id === stationId);
                                    if (!station) return null;
                                    return (
                                        <Cell
                                            key={station.id}
                                            onClick={() => { handleStationSelect(station); setIsHistoryModalOpen(false); }}
                                            subtitle={<span>{station.genre}</span>}
                                            style={{ borderRadius: '12px', margin: '6px 0' }}
                                            after={
                                                <Button size="s" mode="primary" style={{ background: '#2D81E0', borderRadius: '8px' }}>▶</Button>
                                            }
                                        >
                                            <div style={{ fontWeight: 600 }}>{station.name}</div>
                                        </Cell>
                                    );
                                })}

                                {/* Кнопка очистки истории */}
                                <Div style={{
                                    marginTop: '16px',
                                    borderTop: '1px solid var(--modal-border)',
                                    paddingTop: '16px'
                                }}>
                                    <Button
                                        size="l"
                                        mode="secondary"
                                        style={{
                                            width: '100%',
                                            background: 'var(--modal-cell-bg)',
                                            color: '#F44336',
                                            border: '1px solid rgba(244,67,54,0.3)',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            fontWeight: 600
                                        }}
                                        onClick={() => {
                                            triggerHaptic('heavy');
                                            localStorage.removeItem('listeningHistory');
                                            setListeningHistory([]);
                                            setIsHistoryModalOpen(false);
                                        }}
                                    >
                                        🗑️ Очистить историю
                                    </Button>
                                </Div>
                            </>
                        )}
                    </Div>
                </ModalPage>
            </ModalRoot>

            {/* 4. Модальное окно: Эквалайзер */}
            <ModalRoot activeModal={isEqOpen ? 'equalizer' : undefined}>
                <ModalPage
                    id="equalizer"
                    hideCloseButton={true}
                    header={
                        <ModalPageHeader
                            style={{ background: '#2D81E0' }}
                            before={<Button mode="tertiary" onClick={() => setIsEqOpen(false)}><Icon24Dismiss style={{ color: '#ffffff' }} /></Button>}
                        >
                            <span style={{ color: '#ffffff' }}>️🎛️ Настройки звука</span>
                        </ModalPageHeader>
                    }
                    onClose={() => setIsEqOpen(false)}
                >
                    <Equalizer onPresetChange={applyEqPreset} analyserNode={analyserRef.current} />
                </ModalPage>
            </ModalRoot>

            {/* 5. Модальное окно: Рейтинг станций */}
            <ModalRoot activeModal={isRatingModalOpen ? 'rating' : undefined}>
                <ModalPage
                    id="rating"
                    hideCloseButton={true}
                    header={
                        <ModalPageHeader
                            style={{ background: '#2D81E0' }}
                            before={<Button mode="tertiary" onClick={() => setIsRatingModalOpen(false)}><Icon24Dismiss style={{ color: '#ffffff' }} /></Button>}
                        >
                            <span style={{ color: '#ffffff' }}>🏆 Рейтинг</span>
                        </ModalPageHeader>
                    }
                    onClose={() => setIsRatingModalOpen(false)}
                >
                    <Div style={{ padding: '20px' }}>
                        {getStationsByRating().length === 0 ? (
                            <Div style={{ textAlign: 'center', padding: '32px 0' }}>
                                <Subhead weight="2" style={{ fontSize: '16px' }}>Пока нет оценок</Subhead>
                                <Caption style={{ display: 'block', marginTop: '8px', fontSize: '14px' }}>
                                    Будьте первым!
                                </Caption>
                            </Div>
                        ) : (
                            getStationsByRating().map((station, index) => (
                                <Cell
                                    key={station.id}
                                    before={
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', minWidth: '32px', textAlign: 'center' }}>
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </div>
                                    }
                                    subtitle={<div style={{ fontSize: '12px' }}>{station.genre}</div>}
                                    style={{ borderRadius: '12px', margin: '6px 0' }}
                                    onClick={() => { handleStationSelect(station); setIsRatingModalOpen(false); }}
                                >
                                    <div style={{ fontWeight: 600 }}>{station.name}</div>
                                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span key={star} style={{ fontSize: '14px', color: star <= station.rating ? '#FFD700' : '#999' }}>★</span>
                                        ))}
                                    </div>
                                </Cell>
                            ))
                        )}
                    </Div>
                </ModalPage>
            </ModalRoot>

            {/* Полноэкранный плеер */}
            <NowPlayingScreen isOpen={isNowPlayingOpen} onClose={() => setIsNowPlayingOpen(false)} station={currentStation} isPlaying={isPlaying} onTogglePlay={togglePlay} onSwitchStation={switchStation} onRandomStation={playRandomStation} />

            {/* Баннер */}
            <div className="gradient-banner" style={{ padding: '30px 16px', textAlign: 'center', color: '#fff' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}> AniWave Radio</div>
                <div style={{ fontSize: '15px', marginTop: '6px' }}>Anime • J-Pop • Lo-Fi • OST</div>
                {userName && (
                    <div style={{
                        fontSize: '14px',
                        marginTop: '12px',
                        opacity: 0.9,
                        fontWeight: 500,
                        textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                        padding: '6px 16px',
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: '20px',
                        display: 'inline-block',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        👋 Привет, {userName}!
                    </div>
                )}
            </div>

            {/* Основной контент */}
            <Group>
                {/* Плеер */}
                <Div className="player-card" style={{ textAlign: 'center', padding: '32px 16px', borderRadius: '12px', margin: '12px 0', position: 'relative', overflow: 'hidden', minHeight: '400px', cursor: 'pointer', color: 'var(--text-primary)' }} onClick={openNowPlaying}>
                    <div style={{ position: 'absolute', inset: 0, background: 'var(--player-overlay)', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <Div style={{ marginBottom: '24px' }}><Visualizer isPlaying={isPlaying} color={currentStation?.color} /></Div>
                        <Subhead style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}> {currentStation?.name || 'Выберите станцию'} </Subhead>
                        <Caption style={{ color: '#ffffff', marginBottom: '24px', textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}> {currentStation?.genre} {isLoading && !isPlaying && (<span style={{ marginLeft: '8px', opacity: 0.7 }}>• Загрузка...</span>)} </Caption>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                            <Button size="l" mode="primary" style={{ width: '80px', height: '80px', borderRadius: '50%', background: currentStation?.color, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }} onClick={(e) => { e.stopPropagation(); togglePlay(); }} disabled={isLoading}>
                                {isLoading ? <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : isPlaying ? <Icon28PauseOutline width={40} height={40} /> : <Icon28PlayOutline width={40} height={40} />}
                            </Button>
                        </div>

                        <Div style={{ maxWidth: '280px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <Slider value={volume * 100} onChange={handleVolumeChange} min={0} max={100} style={{ flex: 1 }} />
                                <span style={{ color: '#ffffff', fontSize: '12px', minWidth: '40px', textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}> {Math.round(volume * 100)}% </span>
                            </div>
                        </Div>

                        <Div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                            <Caption style={{ color: '#ffffff', marginBottom: '12px', display: 'block', textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}> Таймер сна {timeLeftSeconds ? `• ${formatTime(timeLeftSeconds)}` : 'выкл'} </Caption>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {[15, 30, 60].map(min => (
                                    <Button key={min} size="s" mode={sleepTimeMinutes === min ? 'primary' : 'outline'} style={{ background: sleepTimeMinutes === min ? 'rgba(255,102,179,0.8)' : 'rgba(255,255,255,0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }} onClick={(e) => { e.stopPropagation(); handleSleepTimer(min); }} > {min} мин </Button>
                                ))}
                                <Button size="s" mode="outline" style={{ background: !sleepTimeMinutes ? 'rgba(255,102,179,0.8)' : 'rgba(255,255,255,0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }} onClick={(e) => { e.stopPropagation(); handleSleepTimer(null); }} > Выкл </Button>
                            </div>
                        </Div>
                    </div>
                </Div>

                {/* Красивые цветные кнопки меню */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '12px 16px' }}>
                    {/* Поделиться */}
                    <div
                        onClick={handleShare}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '16px',
                            padding: '20px 16px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)';
                        }}
                    >
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📤</div>
                        <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Поделиться</div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Отправить другу</div>
                    </div>

                    {/* Общий чат */}
                    <div
                        onClick={() => setIsChatModalOpen(true)}
                        style={{
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            borderRadius: '16px',
                            padding: '20px 16px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 16px rgba(245, 87, 108, 0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 87, 108, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(245, 87, 108, 0.3)';
                        }}
                    >
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                        <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Общий чат</div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Общайтесь</div>
                    </div>

                    {/* Эквалайзер */}
                    <div
                        onClick={() => setIsEqOpen(true)}
                        style={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            borderRadius: '16px',
                            padding: '20px 16px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 16px rgba(79, 172, 254, 0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(79, 172, 254, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(79, 172, 254, 0.3)';
                        }}
                    >
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎛️</div>
                        <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Эквалайзер</div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Настройка звука</div>
                    </div>

                    {/* История */}
                    <div
                        onClick={() => setIsHistoryModalOpen(true)}
                        style={{
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            borderRadius: '16px',
                            padding: '20px 16px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 16px rgba(250, 112, 154, 0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(250, 112, 154, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(250, 112, 154, 0.3)';
                        }}
                    >
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📜</div>
                        <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>История</div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Прослушиваний</div>
                    </div>

                    {/*  Рейтинг станций (НОВАЯ КНОПКА) */}
                    <div
                        onClick={() => setIsRatingModalOpen(true)}
                        style={{
                            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                            borderRadius: '16px',
                            padding: '20px 16px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 16px rgba(255, 215, 0, 0.4)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gridColumn: 'span 2',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 215, 0, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 215, 0, 0.4)';
                        }}
                    >
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏆</div>
                        <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Рейтинг станций</div>
                        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '11px' }}>Топ популярных</div>
                    </div>
                </div>

                {/* Ошибка */}
                {error && (
                    <Group>
                        <Div style={{ padding: '16px', textAlign: 'center', background: 'rgba(244,67,54,0.1)', borderRadius: '8px' }}>
                            <Subhead weight="2" style={{ color: '#F44336' }}>Ошибка воспроизведения</Subhead>
                            <Caption style={{ color: '#F44336', display: 'block', margin: '8px 0' }}>{error}</Caption>
                            <Button size="m" mode="secondary" onClick={() => { setError(null); setIsLoading(true); togglePlay(); }}>Попробовать снова</Button>
                        </Div>
                    </Group>
                )}

                {/* Список станций */}
                <Group header={<Subhead style={{ padding: '12px 16px' }}>📻 Радиостанции</Subhead>}>
                    <StationSearch
                        stations={stations}
                        currentStationId={currentStationId}
                        isPlaying={isPlaying}
                        onStationSelect={handleStationSelect}
                        isFavorite={isFavorite}
                        toggleFavorite={toggleFavorite}
                        stationRatings={stationRatings}
                        onRating={handleRating}
                        hoveredRating={hoveredRating}
                        setHoveredRating={setHoveredRating}
                    />
                </Group>

                {/* Ссылки и поддержка */}
                <Separator />
                <Group header={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
                    <Subhead weight="2" style={{ fontWeight: 600 }}>Ссылки</Subhead>
                    <Button
                        size="s"
                        mode="primary"
                        Component="a"
                        href="https://vk.com/im?sel=-239834224"
                        target="_blank"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }}
                    >
                        🛠️ Поддержка
                    </Button>
                </div>}>
                    <Cell
                        Component="a"
                        href="https://vk.ru/ani__wave"
                        target="_blank"
                        before={<div style={{ fontSize: '28px' }}>🌸</div>}
                        subtitle="Общайтесь, делитесь треками и предлагайте идеи!"
                        after={<div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.8)' }}></div>}
                        style={{
                            background: 'linear-gradient(135deg, rgba(255, 102, 179, 0.2), rgba(102, 204, 255, 0.2))',
                            borderRadius: '12px',
                            margin: '8px 16px',
                            border: '1px solid rgba(255, 102, 179, 0.3)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 102, 179, 0.3), rgba(102, 204, 255, 0.3))';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 102, 179, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 102, 179, 0.2), rgba(102, 204, 255, 0.2))';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <Subhead weight="2" style={{ fontWeight: 600 }}>Наше сообщество</Subhead>
                    </Cell>
                </Group>

                <Separator />
                <Group header={<Subhead style={{ padding: '12px 16px' }}>О радио</Subhead>}>
                    <Cell multiline><Text>AniWave — это лучшее аниме радио! Слушайте J-Pop, Lo-Fi, OST из любимых аниме 24/7.</Text></Cell>
                    <Div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)' }}>
                        <Caption style={{ textAlign: 'center', display: 'block' }}>💡 Горячие клавиши: Пробел (Play/Pause), ← → (станции), ↑ ↓ (громкость)</Caption>
                    </Div>
                </Group>
            </Group>

            <style>{`
                /* === ЦВЕТОВЫЕ ПЕРЕМЕННЫЕ === */
                :root {
                    --bg-primary: #f5f5f5;
                    --text-primary: #000000;
                    --text-secondary: #555555;
                    --border-color: rgba(0, 0, 0, 0.1);
                    --player-overlay: rgba(0, 0, 0, 0.25);
                    --modal-bg: #ffffff;
                    --modal-text: #000000;
                    --modal-secondary: #555555;
                    --modal-cell-bg: #f5f5f5;
                    --modal-border: rgba(0, 0, 0, 0.1);
                    --modal-inactive-star: #cccccc;
                    --modal-header-bg: #2D81E0;
                    --modal-header-text: #ffffff;
                }

                #root[data-theme="dark"], #root.theme-dark {
                    --bg-primary: #0a0a1a;
                    --text-primary: #ffffff;
                    --text-secondary: #b0b0b0;
                    --border-color: rgba(255, 255, 255, 0.1);
                    --player-overlay: rgba(0, 0, 0, 0.35);
                    --modal-bg: #232324;
                    --modal-text: #ffffff;
                    --modal-secondary: #939393;
                    --modal-cell-bg: #2a2a2b;
                    --modal-border: rgba(255, 255, 255, 0.1);
                    --modal-inactive-star: #555555;
                    background: #0a0a1a !important;
                }

                @media (prefers-color-scheme: dark) {
                    :root {
                        --modal-bg: #232324;
                        --modal-text: #ffffff;
                        --modal-secondary: #939393;
                        --modal-cell-bg: #2a2a2b;
                        --modal-border: rgba(255, 255, 255, 0.1);
                        --modal-inactive-star: #555555;
                    }
                }

                /* === МОДАЛЬНЫЕ ОКНА === */
                .ModalPage__in {
                    background: var(--modal-bg) !important;
                    border-radius: 16px !important;
                }

                .ModalPage__header {
                    background: var(--modal-header-bg) !important;
                    border-bottom: none !important;
                }

                .ModalPage__header *,
                .ModalPage__header .Subhead {
                    color: var(--modal-header-text) !important;
                    font-weight: 600;
                }

                .ModalPage .Div,
                .ModalPage .Group,
                .ModalPage .Cell {
                    background: var(--modal-bg) !important;
                    color: var(--modal-text) !important;
                }

                .ModalPage .Subhead,
                .ModalPage .Text {
                    color: var(--modal-text) !important;
                }

                .ModalPage .Caption {
                    color: var(--modal-secondary) !important;
                }

                .ModalPage .Cell:hover {
                    background: var(--modal-cell-bg) !important;
                }

                /* === ЗАГОЛОВКИ ГРУПП === */
                .Group__header {
                    color: var(--text-primary) !important;
                }

                /* === ИСПРАВЛЕНИЕ ЗАГОЛОВКОВ В ТЁМНОЙ ТЕМЕ === */
                #root[data-theme="dark"] .Group__header,
                #root.theme-dark .Group__header,
                #root[data-theme="dark"] .Group__header *,
                #root.theme-dark .Group__header *,
                #root[data-theme="dark"] .Group__header .Subhead,
                #root.theme-dark .Group__header .Subhead,
                #root[data-theme="dark"] .Group__header .Text,
                #root.theme-dark .Group__header .Text {
                    color: #ffffff !important;
                }

                #root[data-theme="dark"] .Group .Text,
                #root.theme-dark .Group .Text,
                #root[data-theme="dark"] .Group .Caption,
                #root.theme-dark .Group .Caption {
                    color: #b0b0b0 !important;
                }

                #root[data-theme="dark"] .Cell__main,
                #root.theme-dark .Cell__main,
                #root[data-theme="dark"] .Cell__children,
                #root.theme-dark .Cell__children {
                    color: #ffffff !important;
                }

                #root[data-theme="dark"] .Cell__subtitle,
                #root.theme-dark .Cell__subtitle {
                    color: #939393 !important;
                }

                /* === ОСТАЛЬНЫЕ СТИЛИ === */
                @supports (height: 100dvh) {
                    .loading-screen { height: 100dvh !important; }
                }

                #root[data-theme="dark"] .Panel, #root.theme-dark .Panel,
                #root[data-theme="dark"] .Group, #root.theme-dark .Group { 
                    background: transparent !important; 
                }

                #root[data-theme="dark"] .Cell, #root.theme-dark .Cell { 
                    background: #1a1a2e !important; 
                }

                .player-card { 
                    background: url(/background.png) center/cover !important; 
                }

                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes modalGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
            `}</style>
        </Panel>
    );
};