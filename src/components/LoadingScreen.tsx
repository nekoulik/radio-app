import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
    isLoading: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
    const [visible, setVisible] = useState(isLoading);

    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => setVisible(false), 500);
            return () => clearTimeout(timer);
        } else {
            setVisible(true);
        }
    }, [isLoading]);

    if (!visible) return null;

    const petals = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${6 + Math.random() * 6}s`,
        size: 8 + Math.random() * 8,
    }));

    return (
        <div className={`loading-screen ${!isLoading ? 'loading-screen--hidden' : ''}`}>
            {/* Фоновое изображение */}
            <div className="loading-background" />

            {/* Затемнение фона */}
            <div className="loading-overlay" />

            {/* Падающие лепестки */}
            {petals.map((petal) => (
                <div
                    key={petal.id}
                    className="sakura-petal"
                    style={{
                        left: petal.left,
                        animationDelay: petal.delay,
                        animationDuration: petal.duration,
                        width: `${petal.size}px`,
                        height: `${petal.size}px`,
                    }}
                />
            ))}

            {/* Контент */}
            <div className="loading-content">
                <div className="loading-logo"></div>
                <h1 className="loading-title">AniWave Radio</h1>
                <p className="loading-subtitle">Anime • J-Pop • Lo-Fi • OST</p>
                <div className="loading-spinner" />
            </div>

            <style>{`
                .loading-screen {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
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
                .loading-background {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-image: url('/background.png');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    z-index: 0;
                }
                .loading-overlay {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 1;
                }
                .loading-content {
                    text-align: center;
                    z-index: 2;
                    animation: fadeIn 0.8s ease-out;
                    position: relative;
                }
                .loading-logo {
                    font-size: 100px;
                    margin-bottom: 20px;
                    animation: pulse 2s ease-in-out infinite;
                    filter: drop-shadow(0 0 30px rgba(255, 102, 179, 0.8));
                    display: inline-block;
                }
                .loading-title {
                    font-size: 36px;
                    font-weight: bold;
                    color: #ffffff;
                    margin: 0 0 10px 0;
                    text-shadow: 0 3px 15px rgba(0, 0, 0, 0.8);
                    letter-spacing: 1.5px;
                }
                .loading-subtitle {
                    font-size: 16px;
                    color: rgba(255, 255, 255, 0.95);
                    margin: 0 0  40px 0;
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-top: 3px solid #ff66b3;
                    border-radius: 50%;
                    margin: 0 auto;
                    animation: spin 1s linear infinite;
                }
                .sakura-petal {
                    position: absolute;
                    background: linear-gradient(135deg, #ffb7c5 0%, #ff69b4 100%);
                    border-radius: 10px 15px 10px 15px;
                    top: -20px;
                    opacity: 0.8;
                    animation: fall linear infinite;
                    box-shadow: 0 0 12px rgba(255, 105, 180, 0.6);
                    z-index: 1;
                }
                @keyframes fall {
                    0% { 
                        transform: translateY(-20px) rotate(0deg) translateX(0px); 
                    }
                    25% { 
                        transform: translateY(25vh) rotate(90deg) translateX(30px); 
                    }
                    50% { 
                        transform: translateY(50vh) rotate(180deg) translateX(-30px); 
                    }
                    75% { 
                        transform: translateY(75vh) rotate(270deg) translateX(30px); 
                    }
                    100% { 
                        transform: translateY(110vh) rotate(360deg) translateX(0px); 
                    }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};