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

// Импортируем функцию загрузки и тип станции
import { fetchRadioStations, RadioStation } from '../data/radioStations';
import { StationSearch } from './StationSearch';
import { Visualizer } from './Visualizer';
import { useFavorites } from '../hooks/useFavorites';
import { NowPlayingScreen } from './NowPlayingScreen';
import { Equalizer } from './Equalizer';
import { useTheme } from '../hooks/useTheme';

interface RadioPlayerProps {
    id: string;
}

export const RadioPlayer: React.FC<RadioPlayerProps> = ({ id }) => {
    // Состояния для станций
    const [stations, setStations] = useState<RadioStation[]>([]);
    const [isLoadingStations, setIsLoadingStations] = useState(true);

    // Состояние плеера
    const [currentStationId, setCurrentStationId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [isLoading, setIsLoading] = useState(false);
    const [listeningHistory, setListeningHistory] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Состояния интерфейса
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

    // Находим текущую станцию в загруженном списке
    const currentStation = stations.find(s => s.id === currentStationId);

    const { toggleFavorite, isFavorite } = useFavorites();

    // Refs для Web Audio API (Эквалайзер)
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const bassFilterRef = useRef<BiquadFilterNode | null>(null);
    const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    const { isDarkTheme, toggleTheme } = useTheme();

    // 1. Загрузка станций и истории при монтировании
    useEffect(() => {
        const loadData = async () => {
            setIsLoadingStations(true);
            try {
                const loadedStations = await fetchRadioStations();
                setStations(loadedStations);

                // Проверяем, есть ли сохранённая станция
                const savedStationId = localStorage.getItem('lastStationId');
                if (savedStationId && loadedStations.find(s => s.id === savedStationId)) {
                    setCurrentStationId(savedStationId);
                } else if (loadedStations.length > 0) {
                    setCurrentStationId(loadedStations[0].id);
                }

                // ✅ Безопасно загружаем историю прослушивания
                const savedHistory = localStorage.getItem('listeningHistory');
                if (savedHistory) {
                    try {
                        setListeningHistory(JSON.parse(savedHistory));
                    } catch (e) {
                        console.error("Failed to parse listening history", e);
                        localStorage.removeItem('listeningHistory'); // Очищаем битые данные
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

    // 2. Инициализация Audio Context (теперь пересоздает цепочку полностью)
    const initAudioContext = (audioElement: HTMLAudioElement) => {
        try {
            // Если контекст уже есть, просто обновляем источник
            if (audioContextRef.current) {
                const ctx = audioContextRef.current;

                // Отключаем старые узлы (если они есть)
                if (sourceRef.current) {
                    try { sourceRef.current.disconnect(); } catch (e) { }
                }

                // Создаем НОВЫЙ источник для нового аудио-элемента
                const source = ctx.createMediaElementSource(audioElement);

                // Пересоздаем фильтры и анализатор
                const bass = ctx.createBiquadFilter();
                bass.type = 'lowshelf';
                bass.frequency.value = 200;
                // Применяем текущий пресет (если нужно сохранить настройки)
                // bass.gain.value = ... 

                const treble = ctx.createBiquadFilter();
                treble.type = 'highshelf';
                treble.frequency.value = 2000;

                const analyser = ctx.createAnalyser();
                analyser.fftSize = 64;

                // Соединяем заново
                source.connect(bass);
                bass.connect(treble);
                treble.connect(analyser);
                analyser.connect(ctx.destination);

                // Сохраняем новые ссылки
                sourceRef.current = source;
                bassFilterRef.current = bass;
                trebleFilterRef.current = treble;
                analyserRef.current = analyser;

                return; // Выходим, так как контекст уже был создан ранее
            }

            // Если контекста нет вообще — создаем с нуля (первый запуск)
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtx();

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

            audioContextRef.current = ctx;
            sourceRef.current = source;
            bassFilterRef.current = bass;
            trebleFilterRef.current = treble;
            analyserRef.current = analyser;

        } catch (err) {
            console.error("Ошибка инициализации AudioContext:", err);
        }
    };

    // 3. Управление аудио потоком
    useEffect(() => {
        if (!currentStation) return;

        let errorTimer: ReturnType<typeof setTimeout> | undefined;
        let retryCount = 0;
        const MAX_RETRIES = 2; // Максимум 2 попытки перед показом ошибки

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }

        const audio = new Audio(currentStation!.streamUrl);
        audio.crossOrigin = "anonymous";
        audio.preload = 'none';
        audio.volume = volume;

        // --- ЛОГИКА ТАЙМЕРА ОШИБКИ ---
        // Внутри startErrorTimer добавьте промежуточный чекпоинт:
        const startErrorTimer = () => {
            if (errorTimer) clearTimeout(errorTimer);

            // Промежуточное уведомление через 30 сек (опционально)
            const warningTimer = setTimeout(() => {
                if (isLoading && !isPlaying && !error) {
                    console.warn('Поток загружается дольше 30 секунд...');
                    // Можно показать мягкое уведомление, но не блокирующую ошибку
                }
            }, 30000);

            // Основная ошибка через 60 сек
            errorTimer = setTimeout(() => {
                clearTimeout(warningTimer); // Очищаем предупреждение
                if (isLoading && !isPlaying) {
                    setError(`Не удалось загрузить поток "${currentStation.name}" за 60 сек.`);
                    setIsLoading(false);
                }
            }, 60000);
        };

        const handleError = () => {
            // Если таймер ошибки уже сработал и показал сообщение — не пытаемся перезапускать
            if (error) return;

            if (errorTimer) clearTimeout(errorTimer);

            // Пробуем перезапустить поток автоматически (до 2 раз)
            if (retryCount < MAX_RETRIES) {
                retryCount++;
                console.log(`Попытка перезапуска потока #${retryCount}...`);

                // Небольшая задержка перед повторной попыткой
                setTimeout(() => {
                    // ВАЖНО: Проверяем, актуален ли ещё этот аудио-элемент
                    // Если пользователь переключил станцию, audioRef.current будет другим (или null)
                    if (audioRef.current && audioRef.current.src === audio.src) {
                        audioRef.current.load();
                        audioRef.current.play().catch(e => {
                            // Игнорируем AbortError, так как он возникает при переключении станции
                            if (e.name !== 'AbortError') {
                                console.error('Retry failed:', e);
                            }
                        });
                    }
                }, 2000);
            } else {
                // Все попытки исчерпаны — показываем ошибку
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

            // ✅ Всегда инициализируем/обновляем контекст для текущего аудио
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
        audio.addEventListener('stalled', handleError); // Добавляем обработку "зависания"

        // Запускаем таймер сразу
        startErrorTimer();

        audioRef.current = audio;

        return () => {
            audio.pause();
            if (errorTimer) clearTimeout(errorTimer);
        };
    }, [currentStationId]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Таймер сна
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

    // Функции управления
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
        let newIndex;

        if (direction === 'next') {
            newIndex = (currentIndex + 1) % stations.length;
        } else {
            newIndex = (currentIndex - 1 + stations.length) % stations.length;
        }

        const newStation = stations[newIndex];
        handleStationSelect(newStation);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    switchStation('next');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    switchStation('prev');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setVolume(prev => Math.min(prev + 0.1, 1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setVolume(prev => Math.max(prev - 0.1, 0));
                    break;
                case 'KeyM':
                    e.preventDefault();
                    setVolume(prev => prev === 0 ? 0.8 : 0);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [togglePlay, switchStation]);

    const playRandomStation = () => {
        if (stations.length === 0) return;
        const availableStations = stations.filter(s => s.id !== currentStationId);
        if (availableStations.length === 0) return;

        const randomIndex = Math.floor(Math.random() * availableStations.length);
        const randomStation = availableStations[randomIndex];
        handleStationSelect(randomStation);
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

            // 💾 Безопасно обновляем историю, используя предыдущее состояние
            setListeningHistory(prevHistory => {
                const newHistory = [station.id, ...prevHistory.filter(id => id !== station.id)].slice(0, 10);
                localStorage.setItem('listeningHistory', JSON.stringify(newHistory));
                return newHistory;
            });

            // 💾 Сохраняем последнюю станцию
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
        switch (preset) {
            case 'bass':
                bassFilterRef.current.gain.value = 15;
                trebleFilterRef.current.gain.value = -5;
                break;
            case 'vocal':
                bassFilterRef.current.gain.value = -5;
                trebleFilterRef.current.gain.value = 5;
                break;
            case 'flat':
            default:
                bassFilterRef.current.gain.value = 0;
                trebleFilterRef.current.gain.value = 0;
                break;
        }
    };

    const handleShare = async () => {
        try {
            await bridge.send('VKWebAppShare', { link: 'https://vk.com/app54729099' });
        } catch (err) {
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

    // Если станции еще грузятся, показываем спиннер
    if (isLoadingStations) {
        return (
            <Panel id={id}>
                <Div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <div style={{
                        width: '40px', height: '40px',
                        border: '4px solid rgba(255, 102, 179, 0.3)',
                        borderTop: '4px solid #ff66b3',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                </Div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </Panel>
        );
    }

    return (
        <Panel id={id}>
            {/* 1. Модальные окна */}
            <ModalRoot activeModal={isShareModalOpen ? 'share' : undefined}>
                <ModalPage id="share" header={<ModalPageHeader before={<Button mode="tertiary" onClick={() => setIsShareModalOpen(false)}><Icon24Dismiss /></Button>}>Поделиться</ModalPageHeader>} onClose={() => setIsShareModalOpen(false)}>
                    <Div style={{ padding: '16px' }}>
                        <Caption style={{ color: '#99A2AD', marginBottom: '12px', display: 'block' }}>Скопируйте текст:</Caption>
                        <Textarea value={shareText} onChange={(e) => setShareText(e.target.value)} rows={6} style={{ marginBottom: '16px' }} />
                        <Button
                            size="l"
                            mode={copySuccess ? 'primary' : 'primary'}
                            style={{ width: '100%', background: copySuccess ? '#4BB34B' : undefined }}
                            onClick={copyShareText}
                        >
                            {copySuccess ? '✅ Скопировано!' : '📋 Копировать текст'}
                        </Button>
                    </Div>
                </ModalPage>
            </ModalRoot>

            <ModalRoot activeModal={isChatModalOpen ? 'chat-invite' : undefined}>
                <ModalPage id="chat-invite" header={<ModalPageHeader before={<Button mode="tertiary" onClick={() => setIsChatModalOpen(false)}><Icon24Dismiss /></Button>}>💬 Общий чат</ModalPageHeader>} onClose={() => setIsChatModalOpen(false)}>
                    <Div style={{ padding: '16px' }}>
                        <Subhead style={{ marginBottom: '12px' }}>Добро пожаловать в чат AniWave Radio!</Subhead>
                        <Caption style={{ color: '#99A2AD', display: 'block', marginBottom: '20px' }}>Общайтесь, делитесь треками и предлагайте идеи!</Caption>
                        <Button size="l" mode="primary" style={{ width: '100%' }} Component="a" href="https://vk.me/join/FTopCT1MkUooAn7FGOJNXxV9O6bGBudBoak=" target="_blank">Присоединиться →</Button>
                    </Div>
                </ModalPage>
            </ModalRoot>

            {/* 🕐 Модальное окно полной истории прослушиваний */}
            <ModalRoot activeModal={isHistoryModalOpen ? 'history' : undefined}>
                <ModalPage
                    id="history"
                    header={
                        <ModalPageHeader
                            before={<Button mode="tertiary" onClick={() => setIsHistoryModalOpen(false)}><Icon24Dismiss /></Button>}
                        >
                            📜 История прослушиваний
                        </ModalPageHeader>
                    }
                    onClose={() => setIsHistoryModalOpen(false)}
                >
                    <Div style={{ padding: '16px' }}>
                        {listeningHistory.length === 0 ? (
                            <Div style={{ textAlign: 'center', padding: '32px 0' }}>
                                <Subhead style={{ color: '#99A2AD' }}>История пуста</Subhead>
                                <Caption style={{ color: '#99A2AD', display: 'block', marginTop: '8px' }}>
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
                                        before={<div style={{ fontSize: '24px' }}>{index + 1}</div>}
                                        onClick={() => {
                                            handleStationSelect(station);
                                            setIsHistoryModalOpen(false);
                                        }}
                                        subtitle={station.genre}
                                        after={
                                            <Button
                                                size="s"
                                                mode="primary"
                                                style={{ background: station.color, color: '#fff' }}
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
                                        {station.name}
                                    </Cell>
                                );
                            })
                        )}

                        {listeningHistory.length > 0 && (
                            <Div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                                <Button
                                    size="l"
                                    mode="secondary"
                                    style={{ width: '100%' }}
                                    onClick={() => {
                                        localStorage.removeItem('listeningHistory');
                                        setListeningHistory([]);
                                        setIsHistoryModalOpen(false);
                                    }}
                                >
                                    🗑️ Очистить историю
                                </Button>
                            </Div>
                        )}
                    </Div>
                </ModalPage>
            </ModalRoot>

            <ModalRoot activeModal={isEqOpen ? 'equalizer' : undefined}>
                <ModalPage id="equalizer" header={<ModalPageHeader before={<Button mode="tertiary" onClick={() => setIsEqOpen(false)}><Icon24Dismiss /></Button>}>Настройки звука</ModalPageHeader>} onClose={() => setIsEqOpen(false)}>
                    <Equalizer onPresetChange={applyEqPreset} analyserNode={analyserRef.current} />
                </ModalPage>
            </ModalRoot>

            {/* 2. Полноэкранный плеер */}
            <NowPlayingScreen isOpen={isNowPlayingOpen} onClose={() => setIsNowPlayingOpen(false)} station={currentStation} isPlaying={isPlaying} onTogglePlay={togglePlay} onSwitchStation={switchStation} onRandomStation={playRandomStation} />

            {/* 4. Баннер */}
            <div style={{ padding: '30px 16px', textAlign: 'center', background: 'linear-gradient(-45deg, #ff66b3, #66ccff, #a18cd1, #fbc2eb)', backgroundSize: '400% 400%', animation: 'gradientShift 8s ease infinite', color: '#fff' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}> AniWave Radio</div>
                <div style={{ fontSize: '15px', marginTop: '6px' }}>Anime • J-Pop • Lo-Fi • OST</div>
            </div>

            {/* 5. Основной контент */}
            <Group>
                {/* Плеер */}
                <Div style={{ textAlign: 'center', padding: '32px 16px', borderRadius: '12px', margin: '12px 0', background: 'url(/background.png) center/cover', filter: 'brightness(0.8)', position: 'relative', overflow: 'hidden', minHeight: '400px', cursor: 'pointer', color: 'var(--text-primary)' }} onClick={openNowPlaying}>
                    <div style={{ position: 'absolute', inset: 0, background: 'var(--player-overlay)', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <Div style={{ marginBottom: '24px' }}><Visualizer isPlaying={isPlaying} color={currentStation?.color} /></Div>
                        <Subhead style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}> {currentStation?.name || 'Выберите станцию'} </Subhead>
                        <Caption style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            {currentStation?.genre}
                            {isLoading && !isPlaying && (
                                <span style={{ marginLeft: '8px', opacity: 0.7 }}>• Загрузка...</span>
                            )}
                        </Caption>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                            <Button size="l" mode="primary" style={{ width: '80px', height: '80px', borderRadius: '50%', background: currentStation?.color, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }} onClick={(e) => { e.stopPropagation(); togglePlay(); }} disabled={isLoading}>
                                {isLoading ? <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : isPlaying ? <Icon28PauseOutline width={40} height={40} /> : <Icon28PlayOutline width={40} height={40} />}
                            </Button>
                        </div>

                        <Div style={{ maxWidth: '280px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <Slider value={volume * 100} onChange={handleVolumeChange} min={0} max={100} style={{ flex: 1 }} />
                                <span style={{ color: 'var(--text-primary)', fontSize: '12px', minWidth: '40px' }}> {Math.round(volume * 100)}% </span>
                            </div>
                        </Div>

                        <Div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                            <Caption style={{ color: 'var(--text-primary)', marginBottom: '12px', display: 'block' }}>
                                Таймер сна {timeLeftSeconds ? `• ${formatTime(timeLeftSeconds)}` : 'выкл'}
                            </Caption>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {[15, 30, 60].map(min => (
                                    <Button
                                        key={min}
                                        size="s"
                                        mode={sleepTimeMinutes === min ? 'primary' : 'outline'}
                                        style={{
                                            background: sleepTimeMinutes === min ? 'rgba(255,102,179,0.4)' : 'var(--player-overlay)',
                                            color: 'var(--text-primary)',
                                            border: '1px solid var(--border-color)'
                                        }}
                                        onClick={(e) => { e.stopPropagation(); handleSleepTimer(min); }}
                                    >
                                        {min} мин
                                    </Button>
                                ))}
                                <Button
                                    size="s"
                                    mode="outline"
                                    style={{
                                        background: !sleepTimeMinutes ? 'rgba(255,102,179,0.4)' : 'var(--player-overlay)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-color)'
                                    }}
                                    onClick={(e) => { e.stopPropagation(); handleSleepTimer(null); }}
                                >
                                    Выкл
                                </Button>
                            </div>
                        </Div>
                    </div>
                </Div>

                {/* Ячейки меню */}
                <Cell before={<Icon28CopyOutline />} onClick={handleShare} subtitle="Отправить приложение другу">Поделиться</Cell>
                <Cell before={<div style={{ fontSize: '24px' }}>💬</div>} onClick={() => setIsChatModalOpen(true)} subtitle="Общайтесь с другими слушателями">Общий чат</Cell>
                <Cell before={<div style={{ fontSize: '24px' }}>🎛️</div>} onClick={() => setIsEqOpen(true)} subtitle="Настройте басы и высокие частоты">Эквалайзер</Cell>

                {/* 🕐 Кнопка открытия полной истории */}
                <Cell
                    before={<div style={{ fontSize: '24px' }}>📜</div>}
                    onClick={() => setIsHistoryModalOpen(true)}
                    subtitle="Посмотреть историю прослушиваний"
                >
                    История прослушивания
                </Cell>

                {/* 🌓 Переключатель темы */}
                <Cell
                    before={<div style={{ fontSize: '24px' }}>{isDarkTheme ? '🌙' : '☀️'}</div>}
                    onClick={toggleTheme}
                    subtitle={isDarkTheme ? 'Тёмная тема активна' : 'Светлая тема активна'}
                >
                    Тема оформления
                </Cell>

                {/* Ошибка */}
                {error && (
                    <Group>
                        <Div style={{ padding: '16px', textAlign: 'center', background: 'rgba(244,67,54,0.1)', borderRadius: '8px' }}>
                            <Subhead weight="2" style={{ color: '#F44336' }}>Ошибка воспроизведения</Subhead>
                            <Caption style={{ color: '#F44336', display: 'block', margin: '8px 0' }}>{error}</Caption>
                            <Button
                                size="m"
                                mode="secondary"
                                onClick={() => {
                                    setError(null);
                                    setIsLoading(true);
                                    togglePlay();
                                }}
                            >
                                Попробовать снова
                            </Button>
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
                    />
                </Group>

                {/* Ссылки и поддержка */}
                <Separator />
                <Group header={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
                        <Subhead>Ссылки</Subhead>
                        <Button
                            size="s"
                            mode="tertiary"
                            Component="a"
                            href="https://vk.com/im?sel=-239834224"
                            target="_blank"
                            style={{ color: '#99A2AD' }}
                        >
                            🛠️ Поддержка
                        </Button>
                    </div>
                }>
                    <Cell
                        Component="a"
                        href="https://vk.ru/ani__wave"
                        target="_blank"
                        before={<div style={{ fontSize: '28px' }}>🌸</div>}
                        subtitle="Общайтесь, делитесь треками и предлагайте идеи!"
                        after={<div style={{ fontSize: '20px', color: '#99A2AD' }}>➜</div>}
                        style={{
                            background: 'linear-gradient(90deg, rgba(255, 102, 179, 0.1) 0%, rgba(102, 204, 255, 0.1) 100%)',
                            borderRadius: '8px',
                            margin: '8px 16px',
                            border: '1px solid rgba(255, 102, 179, 0.2)'
                        }}
                    >
                        <Subhead weight="2" style={{ color: '#ffffff' }}>Наше сообщество</Subhead>
                    </Cell>
                </Group>

                <Separator />
                <Group header={<Subhead style={{ padding: '12px 16px' }}>О радио</Subhead>}>
                    <Cell multiline>
                        <Text>
                            AniWave — это лучшее аниме радио! Слушайте J-Pop, Lo-Fi, OST из
                            любимых аниме 24/7.
                        </Text>
                    </Cell>
                    <Div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)' }}>
                        <Caption style={{ color: 'var(--text-secondary)', textAlign: 'center', display: 'block' }}>
                            💡 Горячие клавиши: Пробел (Play/Pause), ← → (станции), ↑ ↓ (громкость)
                        </Caption>
                    </Div>
                </Group>
            </Group>

            <style>{`
                :root {
                    --bg-primary: #19191a;
                    --text-primary: #ffffff;
                    --text-secondary: #939393;
                    --border-color: rgba(255, 255, 255, 0.1);
                    --player-overlay: rgba(0, 0, 0, 0.5);
                }
                [data-theme="light"] {
                    --bg-primary: #ffffff;
                    --text-primary: #000000;
                    --text-secondary: #818c99;
                    --border-color: rgba(0, 0, 0, 0.1);
                    --player-overlay: rgba(255, 255, 255, 0.4);
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
            `}</style>
        </Panel>
    );
};