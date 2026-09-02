import React from 'react';

interface StationRatingProps {
    stationId: string;
    rating: number;
    onRating: (stationId: string, rating: number) => void;
    hoveredRating: { stationId: string, rating: number } | null;
    setHoveredRating: (rating: { stationId: string, rating: number } | null) => void;
}

export const StationRating: React.FC<StationRatingProps> = ({
    stationId,
    rating,
    onRating,
    hoveredRating,
    setHoveredRating,
}) => {
    const currentRating = hoveredRating?.stationId === stationId
        ? hoveredRating.rating
        : rating;

    return (
        <div style={{
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
            padding: '4px 0',
        }}>
            <span style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.7)',
                marginRight: '4px'
            }}>
                Оценка:
            </span>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRating(stationId, star);
                    }}
                    onMouseEnter={() => setHoveredRating({ stationId, rating: star })}
                    onMouseLeave={() => setHoveredRating(null)}
                    style={{
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: star <= currentRating ? '#FFD700' : 'rgba(255,255,255,0.25)',
                        transition: 'all 0.2s ease',
                        filter: star <= currentRating ? 'drop-shadow(0 0 6px rgba(255,215,0,0.8))' : 'none',
                    }}
                >
                    ★
                </span>
            ))}
            {rating > 0 && (
                <span style={{
                    fontSize: '11px',
                    color: '#FFD700',
                    marginLeft: '4px',
                    fontWeight: 600,
                }}>
                    {rating}/5
                </span>
            )}
        </div>
    );
};