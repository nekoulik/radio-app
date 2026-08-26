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
    const [error, setError] = useState<string | null>(null);

    // Состояния интерфейса
    const [sleepTimeMinutes, setSleepTimeMinutes] = useState<number | null>(null);
    const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareText, setShareText] = useState('');
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
    const isAudioInitialized = useRef<boolean>(false);

    // 1. Загрузка станций при монтировании
    useEffect(() => {
        const loadStations = async () => {
            setIsLoadingStations(true);
            try {
                const loadedStations = await fetchRadioStations();
                setStations(loadedStations);

                // Устанавливаем первую станцию по умолчанию
                if (loadedStations.length > 0 && !currentStationId) {
                    setCurrentStationId(loadedStations[0].id);
                }
            } catch (err) {
                console.error("Failed to load stations", err);
                setError("Не удалось загрузить список станций");
            } finally {
                setIsLoadingStations(false);
            }
        };
        loadStations();
    }, []);

    // 2. Инициализация Audio Context (для эквалайзера)
    const initAudioContext = (audioElement: HTMLAudioElement) => {
        if (isAudioInitialized.current) return;

        try {
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

            isAudioInitialized.current = true;
        } catch (err) {
            console.error("Ошибка инициализации AudioContext:", err);
        }
    };

    // 3. Управление аудио потоком
    useEffect(() => {
        if (!currentStation) return;

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }

        // Прямая ссылка (без прокси), так как Radio Browser поддерживает CORS
        const audio = new Audio(currentStation.streamUrl);
        audio.crossOrigin = "anonymous";
        audio.preload = 'none';
        audio.volume = volume;

        audio.addEventListener('playing', () => {
            setIsPlaying(true);
            setIsLoading(false);
            setError(null);

            if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }

            if (!isAudioInitialized.current) {
                initAudioContext(audio);
            }
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
        };
    }, [currentStationId]); // Пересоздаем аудио только при смене ID станции

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
            {/* Модальные окна (Share, Chat, Eq) */}
            <ModalRoot activeModal={isShareModalOpen ? 'share' : undefined}>
                <ModalPage id="share" header={<ModalPageHeader before={<Button mode="tertiary" onClick={() => setIsShareModalOpen(false)}><Icon24Dismiss /></Button>}>Поделиться</ModalPageHeader>} onClose={() => setIsShareModalOpen(false)}>
                    <Div style={{ padding: '16px' }}>
                        <Caption style={{ color: '#99A2AD', marginBottom: '12px', display: 'block' }}>Скопируйте текст:</Caption>
                        <Textarea value={shareText} onChange={(e) => setShareText(e.target.value)} rows={6} style={{ marginBottom: '16px' }} />
                        <Button
                            size="l"
                            mode={copySuccess ? 'primary' : 'primary'} // Используем 'primary' для обоих состояний
                            style={{ width: '100%', background: copySuccess ? '#4BB34B' : undefined }} // Зеленый фон при успехе
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

            <ModalRoot activeModal={isEqOpen ? 'equalizer' : undefined}>
                <ModalPage id="equalizer" header={<ModalPageHeader before={<Button mode="tertiary" onClick={() => setIsEqOpen(false)}><Icon24Dismiss /></Button>}>Настройки звука</ModalPageHeader>} onClose={() => setIsEqOpen(false)}>
                    <Equalizer onPresetChange={applyEqPreset} analyserNode={analyserRef.current} />
                </ModalPage>
            </ModalRoot>

            <NowPlayingScreen isOpen={isNowPlayingOpen} onClose={() => setIsNowPlayingOpen(false)} station={currentStation} isPlaying={isPlaying} onTogglePlay={togglePlay} onSwitchStation={switchStation} onRandomStation={playRandomStation} />

            {/* Баннер */}
            <div style={{ padding: '30px 16px', textAlign: 'center', background: 'linear-gradient(-45deg, #ff66b3, #66ccff, #a18cd1, #fbc2eb)', backgroundSize: '400% 400%', animation: 'gradientShift 8s ease infinite', color: '#fff' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}> AniWave Radio</div>
                <div style={{ fontSize: '15px', marginTop: '6px' }}>Anime • J-Pop • Lo-Fi • OST</div>
            </div>

            <Group>
                {/* Плеер */}
                <Div style={{ textAlign: 'center', padding: '32px 16px', borderRadius: '12px', margin: '12px 0', background: 'url(/background.png) center/cover', filter: 'brightness(0.8)', position: 'relative', overflow: 'hidden', minHeight: '400px', cursor: 'pointer' }} onClick={openNowPlaying}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <Div style={{ marginBottom: '24px' }}><Visualizer isPlaying={isPlaying} color={currentStation?.color} /></Div>
                        <Subhead style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{currentStation?.name || 'Выберите станцию'}</Subhead>
                        <Caption style={{ color: '#eee', marginBottom: '24px' }}>{currentStation?.genre}</Caption>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                            <Button size="l" mode="primary" style={{ width: '80px', height: '80px', borderRadius: '50%', background: currentStation?.color, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }} onClick={(e) => { e.stopPropagation(); togglePlay(); }} disabled={isLoading}>
                                {isLoading ? <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : isPlaying ? <Icon28PauseOutline width={40} height={40} /> : <Icon28PlayOutline width={40} height={40} />}
                            </Button>
                        </div>

                        <Div style={{ maxWidth: '280px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <Slider value={volume * 100} onChange={handleVolumeChange} min={0} max={100} style={{ flex: 1 }} />
                                <span style={{ color: '#fff', fontSize: '12px', minWidth: '40px' }}>{Math.round(volume * 100)}%</span>
                            </div>
                        </Div>

                        <Div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '16px' }}>
                            <Caption style={{ color: '#fff', marginBottom: '12px', display: 'block' }}>Таймер сна {timeLeftSeconds ? `• ${formatTime(timeLeftSeconds)}` : 'выкл'}</Caption>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {[15, 30, 60].map(min => <Button key={min} size="s" mode={sleepTimeMinutes === min ? 'primary' : 'outline'} style={{ background: sleepTimeMinutes === min ? 'rgba(255,102,179,0.4)' : 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} onClick={(e) => { e.stopPropagation(); handleSleepTimer(min); }}>{min} мин</Button>)}
                                <Button size="s" mode="outline" style={{ background: !sleepTimeMinutes ? 'rgba(255,102,179,0.4)' : 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} onClick={(e) => { e.stopPropagation(); handleSleepTimer(null); }}>Выкл</Button>
                            </div>
                        </Div>
                    </div>
                </Div>

                <Cell before={<Icon28CopyOutline />} onClick={handleShare} subtitle="Отправить приложение другу">Поделиться</Cell>
                <Cell before={<div style={{ fontSize: '24px' }}>💬</div>} onClick={() => setIsChatModalOpen(true)} subtitle="Общайтесь с другими слушателями">Общий чат</Cell>
                <Cell before={<div style={{ fontSize: '24px' }}>🎛️</div>} onClick={() => setIsEqOpen(true)} subtitle="Настройте басы и высокие частоты">Эквалайзер</Cell>

                {error && <Group><Div style={{ padding: '16px', textAlign: 'center', background: 'rgba(244,67,54,0.1)', borderRadius: '8px' }}><Subhead weight="2" style={{ color: '#F44336' }}>Ошибка</Subhead><Caption style={{ color: '#F44336', display: 'block', margin: '8px 0' }}>{error}</Caption><Button size="m" mode="secondary" onClick={togglePlay}>Попробовать снова</Button></Div></Group>}

                <Group header={<Subhead style={{ padding: '12px 16px' }}> Радиостанции</Subhead>}>
                    <StationSearch
                        stations={stations}
                        currentStationId={currentStationId || ''} // Передаем пустую строку, если null
                        isPlaying={isPlaying}
                        onStationSelect={handleStationSelect}
                        isFavorite={isFavorite}
                        toggleFavorite={toggleFavorite}
                    />
                </Group>

                <Separator />
                <Group header={<Subhead style={{ padding: '12px 16px' }}>О радио</Subhead>}>
                    <Cell multiline><Text>AniWave — лучшее аниме радио! Слушайте J-Pop, Lo-Fi, OST 24/7.</Text></Cell>
                </Group>
            </Group>

            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
            `}</style>
        </Panel>
    );
};