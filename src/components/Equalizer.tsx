import React, { useEffect, useRef } from 'react';
import { Button, Div, Subhead, Caption } from '@vkontakte/vkui';

type Preset = 'flat' | 'bass' | 'vocal';

interface EqualizerProps {
    onPresetChange: (preset: Preset) => void;
    analyserNode: AnalyserNode | null; // <-- Теперь используем этот пропс
}

export const Equalizer: React.FC<EqualizerProps> = ({ onPresetChange, analyserNode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [activePreset, setActivePreset] = React.useState<Preset>('flat');

    // Функция отрисовки визуализации
    useEffect(() => {
        if (!analyserNode || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let animationId: number;

        const draw = () => {
            animationId = requestAnimationFrame(draw);
            analyserNode.getByteFrequencyData(dataArray);

            // Очистка холста
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            // Рисуем полоски
            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2; // Масштабируем высоту

                // Градиент для полосок (розовый -> фиолетовый)
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                gradient.addColorStop(0, '#ff66b3');
                gradient.addColorStop(1, '#a18cd1');

                ctx.fillStyle = gradient;

                // Скругленные верхушки (рисуем как прямоугольники пока что для производительности)
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [analyserNode]);

    const handleSelect = (preset: Preset) => {
        setActivePreset(preset);
        onPresetChange(preset);
    };

    return (
        <Div style={{ padding: '16px', textAlign: 'center' }}>
            <Subhead weight="2" style={{ marginBottom: '16px', color: '#ffffff' }}>
                Настройка звука 🎛️
            </Subhead>

            {/* Кнопки пресетов */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                <Button
                    size="s"
                    mode={activePreset === 'flat' ? 'primary' : 'secondary'}
                    onClick={() => handleSelect('flat')}
                    style={{ flex: 1 }}
                >
                    Плоский
                </Button>
                <Button
                    size="s"
                    mode={activePreset === 'bass' ? 'primary' : 'secondary'}
                    onClick={() => handleSelect('bass')}
                    style={{ flex: 1 }}
                >
                    Басы
                </Button>
                <Button
                    size="s"
                    mode={activePreset === 'vocal' ? 'primary' : 'secondary'}
                    onClick={() => handleSelect('vocal')}
                    style={{ flex: 1 }}
                >
                    Вокал
                </Button>
            </div>

            {/* Canvas для реальной визуализации */}
            <div style={{
                height: '80px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <canvas
                    ref={canvasRef}
                    width={300}
                    height={80}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                />
            </div>

            <Caption style={{ color: '#99A2AD', marginTop: '12px', display: 'block' }}>
                Визуализация частот (Real-time)
            </Caption>
        </Div>
    );
};