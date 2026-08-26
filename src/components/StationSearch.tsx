import React, { useState, useMemo } from 'react';
import { List, Cell, Subhead, Caption, Search } from '@vkontakte/vkui';
import { RadioStation } from '../data/radioStations';

interface StationSearchProps {
    stations: RadioStation[];
    currentStationId: string | null;
    isPlaying: boolean;
    onStationSelect: (station: RadioStation) => void;
    isFavorite: (id: string) => boolean;
    toggleFavorite: (id: string) => void;
}

export const StationSearch: React.FC<StationSearchProps> = ({
    stations,
    currentStationId,
    isPlaying,
    onStationSelect,
    isFavorite,
    toggleFavorite,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStations = useMemo(() => {
        if (!searchQuery.trim()) return stations;

        const query = searchQuery.toLowerCase().trim();
        return stations.filter(station =>
            station.name.toLowerCase().includes(query) ||
            station.genre.toLowerCase().includes(query) ||
            (station.description && station.description.toLowerCase().includes(query)) // <-- Добавлена проверка
        );
    }, [stations, searchQuery]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <>
            <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)' }}>
                <Search
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Поиск станций..."
                    style={{ margin: 0 }}
                />
            </div>

            <div className="station-list-container">
                <List>
                    {filteredStations.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <Caption style={{ color: '#99A2AD' }}>
                                Станции не найдены
                            </Caption>
                        </div>
                    ) : (
                        filteredStations.map((station) => {
                            const isActive = station.id === currentStationId;
                            const fav = isFavorite(station.id);

                            return (
                                <Cell
                                    key={station.id}
                                    onClick={() => onStationSelect(station)}
                                    className={`station-cell ${isActive ? 'active' : ''}`}
                                    before={
                                        <div
                                            className={`station-icon ${isActive ? 'pulsing' : ''}`}
                                            style={{ background: station.color }} // <-- Вернули цвет!
                                        >
                                            🎵
                                        </div>
                                    }
                                    after={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {isActive && (
                                                <span className="play-indicator">
                                                    {isPlaying ? '▶' : ''}
                                                </span>
                                            )}

                                            <div
                                                className="favorite-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(station.id);
                                                }}
                                            >
                                                {fav ? '❤️' : '🤍'}
                                            </div>
                                        </div>
                                    }
                                    multiline
                                >
                                    <Subhead
                                        weight={isActive ? '2' : '1'}
                                        className={isActive ? 'active-title' : 'station-title'}
                                    >
                                        {station.name}
                                    </Subhead>

                                    <div style={{ marginTop: '2px' }}>
                                        <Caption className="station-genre">
                                            {station.genre}
                                        </Caption>
                                        {station.description && (
                                            <Caption className="station-desc">
                                                {station.description}
                                            </Caption>
                                        )}
                                    </div>
                                </Cell>
                            );
                        })
                    )}
                </List>
            </div>

            <div style={{
                padding: '8px 16px',
                textAlign: 'center',
                borderTop: '1px solid rgba(255,255,255,0.1)',
            }}>
                <Caption style={{ color: '#99A2AD' }}>
                    {filteredStations.length} из {stations.length} станций
                    {searchQuery && ` (поиск: "${searchQuery}")`}
                </Caption>
            </div>
        </>
    );
};