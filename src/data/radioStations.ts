// src/data/radioStations.ts

export interface RadioStation {
    id: string;
    name: string;
    streamUrl: string;
    genre: string;
    color: string;
    description?: string;
}

// Базовые цвета для станций
const COLORS = [
    'linear-gradient(135deg, #ff66b3 0%, #a18cd1 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
];

// Функция для получения станций из Radio Browser API
export async function fetchRadioStations(): Promise<RadioStation[]> {
    const tags = ['anime', 'jpop', 'lofi', 'ost', 'chill'];
    const stations: RadioStation[] = [];

    try {
        for (const tag of tags) {
            const response = await fetch(
                `https://de1.api.radio-browser.info/json/stations/search?limit=10&hidebroken=true&order=clickcount&reverse=true&tag=${tag}`
            );

            if (!response.ok) continue;

            const data = await response.json();

            data.forEach((station: any, _index: number) => {
                // Фильтруем только рабочие потоки
                if (station.codec && ['MP3', 'AAC', 'AAC+', 'OGG'].includes(station.codec.toUpperCase())) {
                    stations.push({
                        id: station.stationuuid,
                        name: station.name,
                        streamUrl: station.url_resolved || station.url,
                        genre: station.tags ? station.tags.split(',')[0] : tag,
                        color: COLORS[stations.length % COLORS.length],
                        description: `${station.name} • ${station.tags || tag}`, // <-- Описание добавлено ЗДЕСЬ, внутри цикла
                    });
                }
            });
        }

        // Удаляем дубликаты по URL
        const uniqueStations = Array.from(
            new Map(stations.map(s => [s.streamUrl, s])).values()
        );

        return uniqueStations.length > 0 ? uniqueStations : getFallbackStations();

    } catch (error) {
        console.error('Ошибка загрузки станций из API:', error);
        return getFallbackStations();
    }
}

// Резервные станции
function getFallbackStations(): RadioStation[] {
    return [
        {
            id: 'fallback-1',
            name: 'Anime Radio (Backup)',
            streamUrl: 'https://stream.laut.fm/anime',
            genre: 'Anime • J-Pop',
            color: COLORS[0],
            description: 'Лучшие аниме треки 24/7'
        },
        {
            id: 'fallback-2',
            name: 'Lo-Fi Beats (Backup)',
            streamUrl: 'https://stream.laut.fm/lofi',
            genre: 'Lo-Fi • Chill',
            color: COLORS[1],
            description: 'Расслабляющая музыка для учебы и работы'
        }
    ];
}

// Экспорты для совместимости
export const DEFAULT_STATION_ID = 'loading...';
export const radioStations: RadioStation[] = [];
export const getStationById = (id: string) => radioStations.find(s => s.id === id);