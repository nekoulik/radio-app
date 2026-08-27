import React, { useEffect, useRef, useState } from 'react';
import { Div, Button, Caption } from '@vkontakte/vkui';

interface EqualizerProps {
    onPresetChange: (preset: string) => void;
    analyserNode: AnalyserNode | null;
}

export const Equalizer: React.FC<EqualizerProps> = ({ onPresetChange, analyserNode }) => {
    const [activePreset, setActivePreset] = useState('flat'); // <-- Добавили состояние
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        if (!analyserNode || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);

            analyserNode.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;

                const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
                gradient.addColorStop(0, '#ff66b3');
                gradient.addColorStop(1, '#66ccff');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [analyserNode]);

    // Функция обработки клика по пресету
    const handlePresetClick = (preset: string) => {
        setActivePreset(preset); // <-- Обновляем состояние кнопки
        onPresetChange(preset);  // <-- Вызываем функцию родителя
    };

    return (
        <Div style={{ padding: '16px' }}>
            {/* Кнопки пресетов с динамическим mode */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'center' }}>
                <Button
                    size="m"
                    mode={activePreset === 'flat' ? 'primary' : 'secondary'}
                    onClick={() => handlePresetClick('flat')}
                >
                    Плоский
                </Button>
                <Button
                    size="m"
                    mode={activePreset === 'bass' ? 'primary' : 'secondary'}
                    onClick={() => handlePresetClick('bass')}
                >
                    Басы
                </Button>
                <Button
                    size="m"
                    mode={activePreset === 'vocal' ? 'primary' : 'secondary'}
                    onClick={() => handlePresetClick('vocal')}
                >
                    Вокал
                </Button>
            </div>

            {/* Канвас для визуализации */}
            <canvas
                ref={canvasRef}
                width={300}
                height={100}
                style={{
                    width: '100%',
                    height: '100px',
                    background: 'rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    display: 'block'
                }}
            />

            <Caption style={{ color: '#99A2AD', display: 'block', textAlign: 'center', marginTop: '8px' }}>
                Визуализация частот (Real-time)
            </Caption>
        </Div>
    );
};