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
    Icon28CopyOutline,
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

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentStation = stations.find(s => s.id === currentStationId);
    const { toggleFavorite, isFavorite } = useFavorites();

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const bassFilterRef = useRef<BiquadFilterNode | null>(null);
    const boundAudioElementRef = useRef<HTMLAudioElement | null>(null);
    const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoadingStations(true);
            try {
                const loadedStations = await fetchRadioStations();
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

    const copyShareText = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            setCopySuccess(true);
        } catch (err) {
            const textarea = document.createElement('textarea');
            textarea.value = shareText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopySuccess(true);
        }
    };

    const openNowPlaying = () => setIsNowPlayingOpen(true);

    if (isLoadingStations) {
        return (
            <Panel id={id}>
                <Div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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
                    style={{ background: 'transparent' }}
                    header={
                        <ModalPageHeader
                            before={<Button mode="tertiary" onClick={() => { setIsShareModalOpen(false); setCopySuccess(false); }}><Icon24Dismiss /></Button>}
                        >
                            <span style={{ color: '#000000', fontWeight: 600 }}>Поделиться</span>
                        </ModalPageHeader>
                    }
                    onClose={() => { setIsShareModalOpen(false); setCopySuccess(false); }}
                >
                    <Div style={{ padding: '20px' }}>
                        {/* Заголовок — тёмный, видимый */}
                        <Subhead weight="2" style={{ color: '#000000', marginBottom: '12px', display: 'block' }}>
                            📋 Скопируйте текст и отправьте другу:
                        </Subhead>

                        {/* Поле с текстом */}
                        <Textarea
                            value={shareText}
                            onChange={(e) => setShareText(e.target.value)}
                            rows={5}
                            readOnly
                            style={{
                                marginBottom: '16px',
                                background: '#f5f5f5',
                                color: '#000000',
                                border: '1px solid rgba(0, 0, 0, 0.15)',
                                borderRadius: '12px',
                                padding: '12px',
                                fontSize: '14px',
                                lineHeight: '1.5'
                            }}
                        />

                        {/* Большая красивая кнопка */}
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
                                fontWeight: 600,
                                transition: 'all 0.3s ease'
                            }}
                            onClick={copyShareText}
                        >
                            {copySuccess ? '✅ Скопировано! Можете вставлять' : '📋 Скопировать текст'}
                        </Button>

                        {/* Подсказка */}
                        <Caption style={{
                            color: '#99A2AD',
                            display: 'block',
                            textAlign: 'center',
                            marginTop: '12px',
                            fontSize: '12px'
                        }}>
                            Текст автоматически скопируется в буфер обмена
                        </Caption>
                    </Div>
                </ModalPage>
            </ModalRoot>

            {/* 2. Модальное окно: Общий чат */}
            <ModalRoot activeModal={isChatModalOpen ? 'chat-invite' : undefined}>
                <ModalPage
                    id="chat-invite"
                    style={{ background: 'transparent' }}
                    header={
                        <ModalPageHeader
                            before={<Button mode="tertiary" onClick={() => setIsChatModalOpen(false)}><Icon24Dismiss /></Button>}
                        >
                            <span style={{ color: '#000000', fontWeight: 600 }}>💬 Общий чат</span>
                        </ModalPageHeader>
                    }
                    onClose={() => setIsChatModalOpen(false)}
                >
                    <Div style={{ padding: '20px' }}>
                        {/* Приветствие */}
                        <Subhead weight="2" style={{
                            color: '#000000',
                            marginBottom: '12px',
                            display: 'block',
                            fontSize: '18px'
                        }}>
                            Добро пожаловать в чат AniWave Radio!
                        </Subhead>

                        {/* Описание */}
                        <Caption style={{
                            color: '#555555',
                            display: 'block',
                            marginBottom: '24px',
                            fontSize: '14px',
                            lineHeight: '1.5'
                        }}>
                            Общайтесь с другими слушателями, делитесь любимыми треками и предлагайте идеи для развития радио!
                        </Caption>

                        {/* Большая кнопка присоединиться */}
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

                        {/* Подсказка */}
                        <Caption style={{
                            color: '#99A2AD',
                            display: 'block',
                            textAlign: 'center',
                            marginTop: '12px',
                            fontSize: '12px'
                        }}>
                            Чат откроется в новом окне VK Мессенджера
                        </Caption>
                    </Div>
                </ModalPage>
            </ModalRoot>

            {/* 3. Модальное окно: История */}
            <ModalRoot activeModal={isHistoryModalOpen ? 'history' : undefined}>
                <ModalPage
                    id="history"
                    style={{ background: 'transparent' }}
                    header={
                        <ModalPageHeader
                            before={<Button mode="tertiary" onClick={() => setIsHistoryModalOpen(false)}><Icon24Dismiss /></Button>}
                        >
                            <span style={{ color: '#000000', fontWeight: 600 }}>📜 История прослушиваний</span>
                        </ModalPageHeader>
                    }
                    onClose={() => setIsHistoryModalOpen(false)}
                >
                    <Div style={{ padding: '20px' }}>
                        {listeningHistory.length === 0 ? (
                            <Div style={{ textAlign: 'center', padding: '32px 0' }}>
                                <Subhead weight="2" style={{ color: '#000000', fontSize: '16px' }}>История пуста</Subhead>
                                <Caption style={{ color: '#99A2AD', display: 'block', marginTop: '8px', fontSize: '14px' }}>
                                    Начните слушать радио, чтобы увидеть историю
                                </Caption>
                            </Div>
                        ) : (
                            listeningHistory.map((stationId, index) => {
                                const station = stations.find(s => s.id === stationId);
                                if (!station) return null;
                                return (
                                    <Cell
                                        key={station.id}
                                        before={
                                            <div style={{
                                                fontSize: '20px',
                                                color: '#99A2AD',
                                                fontWeight: 600,
                                                minWidth: '24px'
                                            }}>
                                                {index + 1}
                                            </div>
                                        }
                                        onClick={() => {
                                            handleStationSelect(station);
                                            setIsHistoryModalOpen(false);
                                        }}
                                        subtitle={
                                            <span style={{ color: '#99A2AD', fontSize: '13px' }}>
                                                {station.genre}
                                            </span>
                                        }
                                        style={{
                                            background: '#f5f5f5',
                                            borderRadius: '12px',
                                            margin: '6px 0',
                                            border: '1px solid rgba(0,0,0,0.05)'
                                        }}
                                        after={
                                            <Button
                                                size="s"
                                                mode="primary"
                                                style={{
                                                    background: '#2D81E0',
                                                    color: '#fff',
                                                    borderRadius: '8px',
                                                    minWidth: '40px'
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStationSelect(station);
                                                    setIsHistoryModalOpen(false);
                                                }}
                                            >
                                                ▶
                                            </Button>
                                        }
                                    >
                                        <div style={{ color: '#000000', fontWeight: 600, fontSize: '15px' }}>
                                            {station.name}
                                        </div>
                                    </Cell>
                                );
                            })
                        )}
                        {listeningHistory.length > 0 && (
                            <Div style={{ marginTop: '16px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '16px' }}>
                                <Button
                                    size="l"
                                    mode="secondary"
                                    style={{
                                        width: '100%',
                                        background: '#f5f5f5',
                                        color: '#F44336',
                                        border: '1px solid rgba(244,67,54,0.3)',
                                        borderRadius: '12px',
                                        padding: '12px',
                                        fontWeight: 600
                                    }}
                                    onClick={() => {
                                        localStorage.removeItem('listeningHistory');
                                        setListeningHistory([]);
                                        setIsHistoryModalOpen(false);
                                    }}
                                >
                                    ️ Очистить историю
                                </Button>
                            </Div>
                        )}
                    </Div>
                </ModalPage>
            </ModalRoot>

            {/* 4. Модальное окно: Эквалайзер */}
            <ModalRoot activeModal={isEqOpen ? 'equalizer' : undefined}>
                <ModalPage
                    id="equalizer"
                    style={{ background: 'transparent' }}
                    header={
                        <ModalPageHeader
                            before={<Button mode="tertiary" onClick={() => setIsEqOpen(false)}><Icon24Dismiss /></Button>}
                        >
                            <span style={{ color: '#000000', fontWeight: 600 }}>🎛️ Настройки звука</span>
                        </ModalPageHeader>
                    }
                    onClose={() => setIsEqOpen(false)}
                >
                    <Equalizer onPresetChange={applyEqPreset} analyserNode={analyserRef.current} />
                </ModalPage>
            </ModalRoot>

            {/* Полноэкранный плеер */}
            <NowPlayingScreen isOpen={isNowPlayingOpen} onClose={() => setIsNowPlayingOpen(false)} station={currentStation} isPlaying={isPlaying} onTogglePlay={togglePlay} onSwitchStation={switchStation} onRandomStation={playRandomStation} />

            {/* Баннер */}
            <div className="gradient-banner" style={{ padding: '30px 16px', textAlign: 'center', color: '#fff' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}> AniWave Radio</div>
                <div style={{ fontSize: '15px', marginTop: '6px' }}>Anime • J-Pop • Lo-Fi • OST</div>
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

                {/* Ячейки меню */}
                <Cell before={<Icon28CopyOutline />} onClick={handleShare} subtitle="Отправить приложение другу">Поделиться</Cell>
                <Cell before={<div style={{ fontSize: '24px' }}>💬</div>} onClick={() => setIsChatModalOpen(true)} subtitle="Общайтесь с другими слушателями">Общий чат</Cell>
                <Cell before={<div style={{ fontSize: '24px' }}>🎛️</div>} onClick={() => setIsEqOpen(true)} subtitle="Настройте басы и высокие частоты">Эквалайзер</Cell>
                <Cell before={<div style={{ fontSize: '24px' }}>📜</div>} onClick={() => setIsHistoryModalOpen(true)} subtitle="Посмотреть историю прослушиваний">История прослушивания</Cell>

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
                    <StationSearch stations={stations} currentStationId={currentStationId} isPlaying={isPlaying} onStationSelect={handleStationSelect} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
                </Group>

                {/* Ссылки и поддержка */}
                <Separator />
                <Group header={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}><Subhead>Ссылки</Subhead><Button size="s" mode="tertiary" Component="a" href="https://vk.com/im?sel=-239834224" target="_blank" style={{ color: '#99A2AD' }}>🛠️ Поддержка</Button></div>}>
                    <Cell Component="a" href="https://vk.ru/ani__wave" target="_blank" before={<div style={{ fontSize: '28px' }}>🌸</div>} subtitle="Общайтесь, делитесь треками и предлагайте идеи!" after={<div style={{ fontSize: '20px', color: '#99A2AD' }}>➜</div>} style={{ background: 'linear-gradient(90deg, rgba(255, 102, 179, 0.1) 0%, rgba(102, 204, 255, 0.1) 100%)', borderRadius: '8px', margin: '8px 16px', border: '1px solid rgba(255, 102, 179, 0.2)' }}>
                        <Subhead weight="2" style={{ color: '#ffffff' }}>Наше сообщество</Subhead>
                    </Cell>
                </Group>

                <Separator />
                <Group header={<Subhead style={{ padding: '12px 16px' }}>О радио</Subhead>}>
                    <Cell multiline><Text>AniWave — это лучшее аниме радио! Слушайте J-Pop, Lo-Fi, OST из любимых аниме 24/7.</Text></Cell>
                    <Div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)' }}>
                        <Caption style={{ color: 'var(--text-secondary)', textAlign: 'center', display: 'block' }}>💡 Горячие клавиши: Пробел (Play/Pause), ← → (станции), ↑ ↓ (громкость)</Caption>
                    </Div>
                </Group>
            </Group>

            <style>{`
                :root {
                    --bg-primary: #f5f5f5;
                    --text-primary: #000000;
                    --text-secondary: #555555;
                    --border-color: rgba(0, 0, 0, 0.1);
                    --player-overlay: rgba(0, 0, 0, 0.25);
                }
                #root[data-theme="dark"], #root.theme-dark {
                    --bg-primary: #0a0a1a;
                    --text-primary: #ffffff;
                    --text-secondary: #b0b0b0;
                    --border-color: rgba(255, 255, 255, 0.1);
                    --player-overlay: rgba(0, 0, 0, 0.35);
                    background: #0a0a1a !important;
                }
                #root[data-theme="dark"] .Panel, #root.theme-dark .Panel, #root[data-theme="dark"] .Group, #root.theme-dark .Group { background: transparent !important; }
                #root[data-theme="dark"] .Cell, #root.theme-dark .Cell { background: #1a1a2e !important; }
                
                .now-playing-modal .ModalPage__in { background: #0a0a1a !important; min-height: 100vh; }
                .now-playing-modal .ModalPage__header { background: transparent !important; border-bottom: none !important; }
                .now-playing-modal .ModalPage__header-in { color: #ffffff !important; }
                .now-playing-modal::-webkit-scrollbar { display: none; }

                .gradient-banner {
                    background: linear-gradient(-45deg, #ff66b3, #66ccff, #a18cd1, #fbc2eb) !important;
                    background-size: 400% 400% !important;
                    animation: gradientShift 8s ease infinite;
                }
                .player-card {
                    background: url(/background.png) center/cover !important;
                }

                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                @keyframes modalGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
            `}</style>
        </Panel>
    );
};