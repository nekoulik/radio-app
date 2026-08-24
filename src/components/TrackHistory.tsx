import React from 'react';
import { List, Cell, Subhead, Caption, Div } from '@vkontakte/vkui';

interface TrackHistoryProps {
    tracks: string[];
    isLoading: boolean;
}

export const TrackHistory: React.FC<TrackHistoryProps> = ({ tracks, isLoading }) => {
    if (isLoading) {
        return (
            <Div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{
                    width: '24px',
                    height: '24px',
                    border: '3px solid rgba(255, 102, 179, 0.3)',
                    borderTop: '3px solid #ff66b3',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 8px'
                }} />
                <Caption style={{ color: '#99A2AD' }}>
                    Загрузка истории...
                </Caption>
            </Div>
        );
    }

    if (tracks.length === 0) {
        return (
            <Div style={{ textAlign: 'center', padding: '20px' }}>
                <Caption style={{ color: '#99A2AD' }}>
                    История треков пока недоступна
                </Caption>
            </Div>
        );
    }

    return (
        <List>
            {tracks.map((track, index) => (
                <Cell
                    key={index}
                    before={
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: index === 0 ? 'rgba(255, 102, 179, 0.2)' : 'rgba(153, 162, 173, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px'
                        }}>
                            {index === 0 ? '🎵' : '🎶'}
                        </div>
                    }
                    subtitle={index === 0 ? 'Сейчас играет' : undefined}
                    style={{
                        background: index === 0 ? 'rgba(255, 102, 179, 0.05)' : 'transparent',
                    }}
                >
                    <Subhead weight={index === 0 ? '2' : '1'} style={{ color: index === 0 ? '#ff66b3' : '#99A2AD' }}>
                        {track}
                    </Subhead>
                </Cell>
            ))}
        </List>
    );
};