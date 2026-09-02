import React, { useState } from 'react';
import { Cell, Search } from '@vkontakte/vkui';
import { RadioStation } from '../data/radioStations';

interface StationSearchProps {
    stations: RadioStation[];
    currentStationId: string | null;
    isPlaying: boolean;
    onStationSelect: (station: RadioStation) => void;
    isFavorite: (id: string) => boolean;
    toggleFavorite: (id: string) => void;
    stationRatings?: { [key: string]: number };
    onRating?: (stationId: string, rating: number) => void;
    hoveredRating?: { stationId: string; rating: number } | null;
    setHoveredRating?: (rating: { stationId: string; rating: number } | null) => void;
}

export const StationSearch: React.FC<StationSearchProps> = ({
    stations,
    currentStationId,
    isPlaying,
    onStationSelect,
    isFavorite,
    toggleFavorite,
    stationRatings,
    onRating,
    hoveredRating,
    setHoveredRating,
}) => {
    const [query, setQuery] = useState('');

    const filteredStations = stations.filter(station =>
        station.name.toLowerCase().includes(query.toLowerCase()) ||
        station.genre.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="station-list-container" style={{ margin: '0 16px 16px' }}>
            <Search
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Поиск станции..."
                style={{ marginBottom: '12px' }}
            />

            {filteredStations.map(station => {
                const rating = stationRatings?.[station.id] || 0;
                const hasVoted = !!stationRatings?.[station.id];
                const currentRating = hoveredRating?.stationId === station.id
                    ? hoveredRating.rating
                    : rating;

                return (
                    <Cell
                        key={station.id}
                        className={`station-cell ${currentStationId === station.id ? 'active' : ''}`}
                        onClick={() => onStationSelect(station)}
                        before={
                            <div
                                className={`station-icon ${currentStationId === station.id && isPlaying ? 'pulsing' : ''}`}
                                style={{ background: station.color }}
                            >
                                {currentStationId === station.id && isPlaying ? '🎵' : '📻'}
                            </div>
                        }
                        subtitle={
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span className="station-genre">{station.genre}</span>

                                {/* Блок рейтинга */}
                                {onRating && setHoveredRating && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Защита от повторного голосования
                                                    if (hasVoted) {
                                                        alert('Вы уже проголосовали за эту станцию!');
                                                        return;
                                                    }
                                                    onRating(station.id, star);
                                                }}
                                                onMouseEnter={() => {
                                                    if (!hasVoted) {
                                                        setHoveredRating({ stationId: station.id, rating: star });
                                                    }
                                                }}
                                                onMouseLeave={() => {
                                                    if (!hasVoted) {
                                                        setHoveredRating(null);
                                                    }
                                                }}
                                                style={{
                                                    cursor: hasVoted ? 'not-allowed' : 'pointer',
                                                    fontSize: '14px',
                                                    color: star <= currentRating ? '#FFD700' : 'rgba(255,255,255,0.3)',
                                                    transition: 'all 0.2s ease',
                                                    filter: star <= currentRating ? 'drop-shadow(0 0 4px rgba(255,215,0,0.8))' : 'none',
                                                    opacity: hasVoted ? 0.85 : 1,
                                                }}
                                                title={hasVoted ? 'Вы уже проголосовали' : 'Нажмите, чтобы оценить'}
                                            >
                                                ★
                                            </span>
                                        ))}
                                        {rating > 0 && (
                                            <span style={{
                                                fontSize: '11px',
                                                color: '#FFD700',
                                                fontWeight: 600,
                                                marginLeft: '4px',
                                                textShadow: '0 0 6px rgba(255,215,0,0.5)',
                                            }}>
                                                {rating}/5 {hasVoted ? '✓' : ''}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        }
                        after={
                            <div
                                className="favorite-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(station.id);
                                }}
                                title={isFavorite(station.id) ? 'Убрать из избранного' : 'Добавить в избранное'}
                            >
                                {isFavorite(station.id) ? '❤️' : '🤍'}
                            </div>
                        }
                    >
                        <div className={`station-title ${currentStationId === station.id ? 'active-title' : ''}`}>
                            {station.name}
                        </div>
                    </Cell>
                );
            })}

            {filteredStations.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '24px 16px',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '14px',
                }}>
                    😔 Станции не найдены
                </div>
            )}
        </div>
    );
};