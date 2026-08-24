import React, { useState, useMemo } from 'react';
import { List, Cell, Subhead, Caption, Search } from '@vkontakte/vkui';
import { RadioStation } from '../data/radioStations';

interface StationSearchProps {
    stations: RadioStation[];
    currentStationId: string;
    isPlaying: boolean;
    onStationSelect: (station: RadioStation) => void;
}

export const StationSearch: React.FC<StationSearchProps> = ({
    stations,
    currentStationId,
    isPlaying,
    onStationSelect,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStations = useMemo(() => {
        if (!searchQuery.trim()) return stations;

        const query = searchQuery.toLowerCase().trim();
        return stations.filter(station =>
            station.name.toLowerCase().includes(query) ||
            station.genre.toLowerCase().includes(query) ||
            station.description.toLowerCase().includes(query)
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

            <div style={{
                maxHeight: '320px',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255, 102, 179, 0.5) rgba(0,0,0,0.1)',
            }}>
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
                            return (
                                <Cell
                                    key={station.id}
                                    onClick={() => onStationSelect(station)}
                                    before={
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: station.color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '20px',
                                            boxShadow: isActive ? '0 0 12px rgba(255, 102, 179, 0.6)' : 'none',
                                            transition: 'box-shadow 0.3s ease',
                                            flexShrink: 0, // ← Добавлено: иконка не сжимается
                                        }}>
                                            🎵
                                        </div>
                                    }
                                    after={
                                        isActive ? (
                                            <span style={{
                                                fontSize: '12px',
                                                color: isPlaying ? '#ff66b3' : '#99A2AD',
                                                fontWeight: '600',
                                                flexShrink: 0, // ← Добавлено: иконка play не сжимается
                                            }}>
                                                {isPlaying ? '▶' : '⏸'}
                                            </span>
                                        ) : null
                                    }
                                    multiline // ← Добавлено: разрешаем многострочный текст
                                    style={{
                                        background: isActive
                                            ? 'rgba(255, 102, 179, 0.15)'
                                            : 'transparent',
                                        borderLeft: isActive
                                            ? '3px solid #ff66b3'
                                            : '3px solid transparent',
                                        padding: '8px 16px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    {/* Название станции - всегда видимо */}
                                    <Subhead
                                        weight={isActive ? '2' : '1'}
                                        style={{
                                            color: isActive ? '#ff66b3' : '#ffffff',
                                            lineHeight: '1.3',
                                            wordBreak: 'break-word', // ← Добавлено: перенос длинных слов
                                            overflowWrap: 'break-word',
                                        }}
                                    >
                                        {station.name}
                                    </Subhead>

                                    {/* Жанр и описание на одной строке */}
                                    <div style={{ marginTop: '2px' }}>
                                        <Caption style={{
                                            color: '#99A2AD',
                                            fontSize: '11px',
                                            lineHeight: '1.3',
                                        }}>
                                            {station.genre}
                                        </Caption>
                                        {station.description && (
                                            <Caption style={{
                                                color: '#99A2AD',
                                                fontSize: '11px',
                                                lineHeight: '1.3',
                                                display: 'block',
                                                marginTop: '1px',
                                            }}>
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