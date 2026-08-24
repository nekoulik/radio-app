import React from 'react';
import { List, Cell, Subhead, Caption, Spinner, Div } from '@vkontakte/vkui';
import { Icon24MusicOutline } from '@vkontakte/icons';

interface TrackHistoryProps {
    tracks: string[];
    isLoading: boolean;
}

export const TrackHistory: React.FC<TrackHistoryProps> = ({ tracks, isLoading }) => {
    if (isLoading) {
        return (
            <Div style={{ textAlign: 'center', padding: '20px' }}>
                {/* @ts-ignore - Spinner size */}
                <Spinner size="medium" />
                <Caption style={{ marginTop: '8px', display: 'block', color: '#99A2AD' }}>
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
                            background: 'rgba(255, 102, 179, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Icon24MusicOutline style={{ color: '#ff66b3' }} />
                        </div>
                    }
                    subtitle={index === 0 ? 'Сейчас играет' : `Играл ${index} трек(ов) назад`}
                    style={{
                        background: index === 0 ? 'rgba(255, 102, 179, 0.05)' : 'transparent',
                    }}
                >
                    <Subhead weight={index === 0 ? '2' : '1'} style={{ color: index === 0 ? '#ff66b3' : '#ffffff' }}>
                        {track}
                    </Subhead>
                </Cell>
            ))}
        </List>
    );
};