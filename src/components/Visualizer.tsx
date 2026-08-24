import React from 'react';

interface VisualizerProps {
    isPlaying: boolean;
    color?: string; // градиент для полосок
}

export const Visualizer: React.FC<VisualizerProps> = ({
    isPlaying,
    color = 'linear-gradient(180deg, #ff66b3 0%, #66ccff 100%)'
}) => {
    // Количество полосок эквалайзера
    const barCount = 7;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '4px',
            height: '80px',
            padding: '0 20px',
        }}>
            {Array.from({ length: barCount }).map((_, index) => {
                // Разная высота для каждой полоски (от 20% до 100%)
                const maxHeight = 30 + (index % 3) * 25;
                // Разная задержка анимации для эффекта волны
                const animationDelay = `${index * 0.1}s`;

                return (
                    <div
                        key={index}
                        style={{
                            width: '8px',
                            height: isPlaying ? `${maxHeight}%` : '20%',
                            background: color,
                            borderRadius: '4px',
                            transition: 'height 0.3s ease',
                            animation: isPlaying
                                ? `equalizer 1s ease-in-out ${animationDelay} infinite`
                                : 'none',
                            opacity: isPlaying ? 1 : 0.3,
                        }}
                    />
                );
            })}
        </div>
    );
};