import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'aniwave_favorites';

export const useFavorites = () => {
    // Загружаем избранное из localStorage при старте
    const [favorites, setFavorites] = useState<string[]>(() => {
        try {
            const stored = localStorage.getItem(FAVORITES_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Сохраняем в localStorage при каждом изменении
    useEffect(() => {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (stationId: string) => {
        setFavorites(prev =>
            prev.includes(stationId)
                ? prev.filter(id => id !== stationId)
                : [...prev, stationId]
        );
    };

    const isFavorite = (stationId: string) => favorites.includes(stationId);

    return { favorites, toggleFavorite, isFavorite };
};