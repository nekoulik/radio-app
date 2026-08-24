export interface RadioStation {
    id: string;
    name: string;
    streamUrl: string;
    genre: string;
    description: string;
    color: string; // градиент для карточки
}

export const radioStations: RadioStation[] = [
    {
        id: 'megacity',
        name: 'Azuria Raido',
        streamUrl: 'https://stream.laut.fm/hell',
        genre: 'Anime • J-Pop • OST',
        description: 'Лучшие треки из аниме и японской поп-музыки',
        color: 'linear-gradient(135deg, #ff66b3 0%, #66ccff 100%)',
    },
    {
        id: 'lofi',
        name: 'Radio für Animé-Fans',
        streamUrl: 'https://stream.laut.fm/anime',
        genre: 'Lo-Fi • Chill • Study',
        description: 'Расслабляющие биты для учёбы и отдыха',
        color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    },
    {
        id: 'jpop',
        name: 'Crewfire FM',
        streamUrl: 'https://stream.laut.fm/crewfirefm',
        genre: 'J-Pop • Japanese',
        description: 'Свежие хиты японской поп-музыки',
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
        id: 'anime-ost',
        name: 'Erdbeereis Radio',
        streamUrl: 'https://stream.laut.fm/erdbeereis--radio',
        genre: 'OST • Anime • Soundtrack',
        description: 'Саундтреки из любимых аниме',
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
        id: 'chill',
        name: 'Top Radio',
        streamUrl: 'https://stream.laut.fm/topradio',
        genre: 'Chill • Ambient • Electronic',
        description: 'Атмосферная электронная музыка',
        color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
];

// Станция по умолчанию
export const DEFAULT_STATION_ID = 'megacity';

export const getStationById = (id: string): RadioStation | undefined => {
    return radioStations.find(station => station.id === id);
};