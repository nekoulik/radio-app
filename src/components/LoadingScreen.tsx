import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
    isLoading: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
    const [visible, setVisible] = useState(isLoading);

    useEffect(() => {
        if (!isLoading) {
            // Плавное исчезновение через 500ms
            const timer = setTimeout(() => setVisible(false), 500);
            return () => clearTimeout(timer);
        } else {
            setVisible(true);
        }
    }, [isLoading]);

    if (!visible) return null;

    // Создаём 15 лепестков сакуры со случайными параметрами
    const petals = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
        duration: `${4 + Math.random() * 4}s`,
    }));

    return (
        <div className={`loading-screen ${!isLoading ? 'loading-screen--hidden' : ''}`}>
            {petals.map((petal) => (
                <div
                    key={petal.id}
                    className="sakura-petal"
                    style={{
                        left: petal.left,
                        animationDelay: petal.delay,
                        animationDuration: petal.duration,
                    }}
                />
            ))}

            <div className="loading-content">
                <div className="loading-logo">🌸</div>
                <h1 className="loading-title">AniWave Radio</h1>
                <p className="loading-subtitle">Anime • J-Pop • Lo-Fi • OST</p>
                <div className="loading-spinner" />
            </div>

            <style>{`
                .loading-screen {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    overflow: hidden;
                    transition: opacity 0.6s ease-out;
                }
                .loading-screen--hidden {
                    opacity: 0;
                    pointer-events: none;
                }
                .loading-content {
                    text-align: center;
                    z-index: 1;
                    animation: fadeIn 0.8s ease-out;
                }
                .loading-logo {
                    font-size: 80px;
                    margin-bottom: 16px;
                    animation: pulse 2s ease-in-out infinite;
                    filter: drop-shadow(0 0 20px rgba(255, 102, 179, 0.6));
                }
                .loading-title {
                    font-size: 28px;
                    font-weight: bold;
                    color: #ffffff;
                    margin: 0 0 8px 0;
                    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
                    letter-spacing: 1px;
                }
                .loading-subtitle {
                    font-size: 15px;
                    color: rgba(255, 255, 255, 0.8);
                    margin: 0 0 32px 0;
                }
                .loading-spinner {
                    width: 36px;
                    height: 36px;
                    border: 3px solid rgba(255, 255, 255, 0.2);
                    border-top: 3px solid #ff66b3;
                    border-radius: 50%;
                    margin: 0 auto;
                    animation: spin 1s linear infinite;
                }
                .sakura-petal {
                    position: absolute;
                    width: 12px;
                    height: 12px;
                    background: linear-gradient(135deg, #ffb7c5 0%, #ff69b4 100%);
                    border-radius: 10px 15px 10px 15px;
                    top: -20px;
                    opacity: 0.7;
                    animation: fall linear infinite;
                    box-shadow: 0 0 8px rgba(255, 105, 180, 0.4);
                }
                @keyframes fall {
                    0% { transform: translateY(-20px) rotate(0deg) translateX(0px); }
                    25% { transform: translateY(25vh) rotate(90deg) translateX(20px); }
                    50% { transform: translateY(50vh) rotate(180deg) translateX(-20px); }
                    75% { transform: translateY(75vh) rotate(270deg) translateX(20px); }
                    100% { transform: translateY(110vh) rotate(360deg) translateX(0px); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};