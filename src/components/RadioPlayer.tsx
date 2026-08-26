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

import {
    radioStations,
    DEFAULT_STATION_ID,
    getStationById,
    RadioStation,
} from '../data/radioStations';
import { StationSearch } from './StationSearch';
import { Visualizer } from './Visualizer';
import { useFavorites } from '../hooks/useFavorites';
import { NowPlayingScreen } from './NowPlayingScreen';
import { Equalizer } from './Equalizer'; // <-- Импорт эквалайзера

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
    const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);

    // Состояния для эквалайзера
    const [isEqOpen, setIsEqOpen] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentStation = getStationById(currentStationId);
    const { toggleFavorite, isFavorite } = useFavorites();
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);

    // Refs для Web Audio API
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const bassFilterRef = useRef<BiquadFilterNode | null>(null);
    const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const isAudioInitialized = useRef<boolean>(false);

    // Инициализация Audio Context (выполняется один раз)
    const initAudioContext = (audioElement: HTMLAudioElement) => {
        if (isAudioInitialized.current) return;

        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtx();

            // Создаем источник из элемента audio
            // ВАЖНО: createMediaElementSource может требовать CORS заголовков от потока
            const source = ctx.createMediaElementSource(audioElement);

            // Создаем фильтры
            const bass = ctx.createBiquadFilter();
            bass.type = 'lowshelf';
            bass.frequency.value = 200;

            const treble = ctx.createBiquadFilter();
            treble.type = 'highshelf';
            treble.frequency.value = 2000;

            // Анализатор для визуализации
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;

            // Цепочка: Источник -> Бас -> Высокие -> Анализатор -> Выход
            source.connect(bass);
            bass.connect(treble);
            treble.connect(analyser);
            analyser.connect(ctx.destination);

            // Сохраняем ссылки
            audioContextRef.current = ctx;
            sourceRef.current = source;
            bassFilterRef.current = bass;
            trebleFilterRef.current = treble;
            analyserRef.current = analyser;

            isAudioInitialized.current = true;
        } catch (err) {
            console.error("Ошибка инициализации AudioContext (возможна проблема CORS):", err);
        }
    };

    // Функция применения пресетов
    const applyEqPreset = (preset: string) => {
        if (!bassFilterRef.current || !trebleFilterRef.current) return;

        switch (preset) {
            case 'bass':
                bassFilterRef.current.gain.value = 15; // Усиливаем басы
                trebleFilterRef.current.gain.value = -5; // Чуть глушим высокие
                break;
            case 'vocal':
                bassFilterRef.current.gain.value = -5; // Глушим басы
                trebleFilterRef.current.gain.value = 5; // Усиливаем высокие
                break;
            case 'flat':
            default:
                bassFilterRef.current.gain.value = 0; // Сброс
                trebleFilterRef.current.gain.value = 0; // Сброс
                break;
        }
    };

    useEffect(() => {
        if (!currentStation) return;

        // Очищаем предыдущий аудио элемент
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            // Не удаляем полностью, чтобы не ломать связь с AudioContext, 
            // но меняем src. Если createMediaElementSource был вызван для этого элемента, он останется привязанным.
        }

        const audio = new Audio(currentStation.streamUrl);
        audio.crossOrigin = "anonymous"; // Важно для CORS
        audio.preload = 'none';
        audio.volume = volume;

        // Инициализируем контекст при первом воспроизведении или загрузке
        if (!isAudioInitialized.current) {
            // Откладываем инициализацию до первого play(), так как браузеры блокируют автоплей аудио контекста
            // Но мы можем подготовить элементы.
            // Для простоты в этом коде: инициализируем сразу, но активируем контекст при клике play.
        }

        audio.addEventListener('playing', () => {
            setIsPlaying(true);
            setIsLoading(false);
            setError(null);

            // Активируем AudioContext при первом воспроизведении (требование браузеров)
            if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }

            // Если контекст еще не создан (первый запуск), создаем его сейчас
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

        // При размонтировании или смене станции не удаляем audio полностью, 
        // чтобы не разрывать связь с Web Audio API узлами, если они уже созданы.
        // Просто ставим на паузу.
        return () => {
            audio.pause();
            // audio.src = ''; // Не очищаем src, чтобы сохранить привязку к source node
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

                // Если контекст существует и приостановлен, возобновляем его
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
        const currentIndex = radioStations.findIndex(s => s.id === currentStationId);
        let newIndex;

        if (direction === 'next') {
            newIndex = (currentIndex + 1) % radioStations.length;
        } else {
            newIndex = (currentIndex - 1 + radioStations.length) % radioStations.length;
        }

        const newStation = radioStations[newIndex];
        handleStationSelect(newStation);
    };

    const playRandomStation = () => {
        const availableStations = radioStations.filter(s => s.id !== currentStationId);
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

    const openNowPlaying = () => setIsNowPlayingOpen(true);

    return (
        <Panel id={id}>
            {/* Модальное окно "Поделиться" */}
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

            {/* Модальное окно с приглашением в чат */}
            <ModalRoot activeModal={isChatModalOpen ? 'chat-invite' : undefined}>
                <ModalPage
                    id="chat-invite"
                    header={
                        <ModalPageHeader
                            before={
                                <Button mode="tertiary" onClick={() => setIsChatModalOpen(false)}>
                                    <Icon24Dismiss />
                                </Button>
                            }
                        >
                            💬 Общий чат
                        </ModalPageHeader>
                    }
                    onClose={() => setIsChatModalOpen(false)}
                >
                    <Div style={{ padding: '16px' }}>
                        <Subhead style={{ marginBottom: '12px', display: 'block' }}>
                            Добро пожаловать в чат AniWave Radio!
                        </Subhead>
                        <Caption style={{ color: '#99A2AD', display: 'block', marginBottom: '20px' }}>
                            Здесь вы можете:
                            <br />• Делиться любимыми треками
                            <br />• Обсуждать аниме и музыку
                            <br />• Предлагать новые радиостанции
                            <br />• Знакомиться с другими слушателями
                        </Caption>
                        <Button
                            size="l"
                            mode="primary"
                            style={{ width: '100%', marginBottom: '12px' }}
                            Component="a"
                            href="https://vk.me/join/FTopCT1MkUooAn7FGOJNXxV9O6bGBudBoak="
                            target="_blank"
                            onClick={() => setIsChatModalOpen(false)}
                        >
                            Присоединиться к чату →
                        </Button>
                        <Caption style={{ color: '#99A2AD', textAlign: 'center', display: 'block' }}>
                            Нажмите, чтобы открыть чат в новом окне
                        </Caption>
                    </Div>
                </ModalPage>
            </ModalRoot>

            {/* Модальное окно Эквалайзера */}
            <ModalRoot activeModal={isEqOpen ? 'equalizer' : undefined}>
                <ModalPage
                    id="equalizer"
                    header={
                        <ModalPageHeader
                            before={
                                <Button mode="tertiary" onClick={() => setIsEqOpen(false)}>
                                    <Icon24Dismiss />
                                </Button>
                            }
                        >
                            Настройки звука
                        </ModalPageHeader>
                    }
                    onClose={() => setIsEqOpen(false)}
                >
                    <Equalizer
                        onPresetChange={applyEqPreset}
                        analyserNode={analyserRef.current}
                    />
                </ModalPage>
            </ModalRoot>

            {/* Полноэкранный режим "Сейчас играет" */}
            <NowPlayingScreen
                isOpen={isNowPlayingOpen}
                onClose={() => setIsNowPlayingOpen(false)}
                station={currentStation}
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                onSwitchStation={switchStation}
                onRandomStation={playRandomStation}
            />

            {/* Анимированный градиентный баннер */}
            <div style={{
                padding: '30px 16px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(-45deg, #ff66b3, #66ccff, #a18cd1, #fbc2eb)',
                backgroundSize: '400% 400%',
                animation: 'gradientShift 8s ease infinite',
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-30px',
                    left: '-30px',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.15)',
                    animation: 'float 6s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-40px',
                    right: '-40px',
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    animation: 'float 8s ease-in-out infinite reverse',
                }} />
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '10%',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    animation: 'float 5s ease-in-out infinite',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        fontSize: '36px',
                        fontWeight: 'bold',
                        color: '#ffffff',
                        textShadow: '0 2px 12px rgba(0,0,0,0.3)',
                        marginBottom: '6px',
                        letterSpacing: '1px',
                    }}>
                        AniWave Radio
                    </div>
                    <div style={{
                        fontSize: '15px',
                        color: 'rgba(255, 255, 255, 0.95)',
                        textShadow: '0 1px 6px rgba(0,0,0,0.3)',
                        fontWeight: '500',
                    }}>
                        Anime • J-Pop • Lo-Fi • OST
                    </div>
                </div>
            </div>

            <Group>
                {/* Основной блок плеера */}
                <Div
                    style={{
                        textAlign: 'center',
                        padding: '32px 16px',
                        borderRadius: '12px',
                        margin: '12px 0',
                        position: 'relative',
                        overflow: 'hidden',
                        minHeight: '450px',
                        cursor: 'pointer',
                    }}
                    onClick={openNowPlaying}
                >
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'url(/background.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        filter: 'brightness(0.35)',
                        zIndex: 0,
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <Div style={{ marginBottom: '24px' }}>
                            <Visualizer
                                isPlaying={isPlaying}
                                color={currentStation?.color || 'linear-gradient(180deg, #ff66b3 0%, #66ccff 100%)'}
                            />
                        </Div>

                        <Subhead style={{
                            color: '#ffffff',
                            marginBottom: '8px',
                            fontSize: '18px',
                            fontWeight: '600',
                            textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                        }}>
                            {currentStation?.name || 'AniWave Radio'}
                        </Subhead>

                        <Caption style={{
                            color: '#ffffff',
                            marginBottom: '24px',
                            textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                        }}>
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
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePlay();
                                }}
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
                                    onChange={(value) => handleVolumeChange(value)}
                                    min={0}
                                    max={100}
                                    style={{ flex: 1 }}
                                />
                                <span style={{
                                    color: '#ffffff',
                                    fontSize: '12px',
                                    minWidth: '40px',
                                    textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                                }}>
                                    {Math.round(volume * 100)}%
                                </span>
                            </div>
                        </Div>

                        <Div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '16px' }}>
                            <Caption style={{
                                color: '#ffffff',
                                marginBottom: '12px',
                                display: 'block',
                                textAlign: 'center',
                                textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                            }}>
                                Таймер сна {timeLeftSeconds !== null && timeLeftSeconds > 0 ? `• Осталось: ${formatTime(timeLeftSeconds)}` : 'выключен'}
                            </Caption>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {[15, 30, 60].map((min) => (
                                    <Button
                                        key={min}
                                        size="s"
                                        mode={sleepTimeMinutes === min ? 'primary' : 'outline'}
                                        style={{
                                            background: sleepTimeMinutes === min ? 'rgba(255, 102, 179, 0.4)' : 'rgba(0,0,0,0.4)',
                                            color: '#ffffff',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            minWidth: '60px',
                                            backdropFilter: 'blur(10px)',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSleepTimer(min);
                                        }}
                                    >
                                        {min} мин
                                    </Button>
                                ))}
                                <Button
                                    size="s"
                                    mode="outline"
                                    style={{
                                        background: sleepTimeMinutes === null ? 'rgba(255, 102, 179, 0.4)' : 'rgba(0,0,0,0.4)',
                                        color: '#ffffff',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        minWidth: '60px',
                                        backdropFilter: 'blur(10px)',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSleepTimer(null);
                                    }}
                                >
                                    Выкл
                                </Button>
                            </div>
                        </Div>
                    </div>
                </Div>

                <Cell
                    before={<Icon28CopyOutline />}
                    onClick={handleShare}
                    subtitle="Отправить приложение другу в сообщении"
                >
                    Поделиться
                </Cell>

                <Cell
                    before={<div style={{ fontSize: '24px' }}>💬</div>}
                    onClick={() => setIsChatModalOpen(true)}
                    subtitle="Общайтесь с другими слушателями и делитесь треками"
                    style={{ borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}
                >
                    Общий чат слушателей
                </Cell>

                {/* НОВАЯ КНОПКА ЭКВАЛАЙЗЕРА */}
                <Cell
                    before={<div style={{ fontSize: '24px' }}>🎛️</div>}
                    onClick={() => setIsEqOpen(true)}
                    subtitle="Настройте басы и высокие частоты"
                    style={{ borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}
                >
                    Эквалайзер
                </Cell>

                {error && (
                    <Group>
                        <Div style={{
                            padding: '16px',
                            textAlign: 'center',
                            background: 'rgba(244, 67, 54, 0.1)',
                            borderRadius: '8px'
                        }}>
                            <Subhead weight="2" style={{ color: '#F44336', marginBottom: '8px' }}>
                                Ошибка воспроизведения
                            </Subhead>
                            <Caption style={{ color: '#F44336', display: 'block', marginBottom: '12px' }}>
                                {error}
                            </Caption>
                            <Button size="m" mode="secondary" onClick={togglePlay}>
                                Попробовать снова
                            </Button>
                        </Div>
                    </Group>
                )}


                {/* Компактный список станций с поиском */}
                <Group header={<Subhead style={{ padding: '12px 16px' }}>📻 Радиостанции</Subhead>}>
                    <StationSearch
                        stations={radioStations}
                        currentStationId={currentStationId}
                        isPlaying={isPlaying}
                        onStationSelect={handleStationSelect}
                        isFavorite={isFavorite}
                        toggleFavorite={toggleFavorite}
                    />
                </Group>

                {/* Блок ссылок и поддержки */}
                <Separator />
                <Group header={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
                        <Subhead>🔗 Ссылки</Subhead>
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
                </Group>
            </Group>

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(255, 102, 179, 0.5); }
                    50% { transform: scale(1.05); box-shadow: 0 0 60px rgba(255, 102, 179, 0.7); }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
            `}</style>
        </Panel>
    );
};