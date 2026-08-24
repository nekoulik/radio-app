import React from 'react';
import { Cell, List, Avatar, Caption, Subhead } from '@vkontakte/vkui';
import { RadioStation } from '../data/radioStations';

interface StationListProps {
    stations: RadioStation[];
    currentStationId: string;
    isPlaying: boolean;
    onStationSelect: (station: RadioStation) => void;
}

export const StationList: React.FC<StationListProps> = ({
    stations,
    currentStationId,
    isPlaying,
    onStationSelect,
}) => {
    return (
        <List>
            {stations.map((station) => {
                const isActive = station.id === currentStationId;
                return (
                    <Cell
                        key={station.id}
                        onClick={() => onStationSelect(station)}
                        before={
                            <Avatar
                                size={48}
                                style={{
                                    background: station.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                }}
                            >
                                🎵
                            </Avatar>
                        }
                        subtitle={station.genre}
                        after={
                            isActive ? (
                                <span
                                    style={{
                                        fontSize: '14px',
                                        color: isPlaying ? '#ff66b3' : '#99A2AD',
                                        fontWeight: '600',
                                    }}
                                >
                                    {isPlaying ? '▶' : '⏸'}
                                </span>
                            ) : null
                        }
                        style={{
                            background: isActive
                                ? 'rgba(255, 102, 179, 0.1)'
                                : 'transparent',
                            borderLeft: isActive
                                ? '3px solid #ff66b3'
                                : '3px solid transparent',
                        }}
                    >
                        <Subhead weight={isActive ? '2' : '1'}>
                            {station.name}
                        </Subhead>
                        <Caption style={{ color: '#99A2AD', marginTop: '4px' }}>
                            {station.description}
                        </Caption>
                    </Cell>
                );
            })}
        </List>
    );
};