// src/data/radioStations.ts

export interface RadioStation {
    id: string;
    name: string;
    streamUrl: string;
    genre: string;
    color: string;
    description?: string;
}

// Палитра градиентов для станций
const COLORS = [
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', // Розовый закат
    'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)', // Мятный бриз
    'linear-gradient(to right, #fa709a 0%, #fee140 100%)', // Персиковый сорбет
    'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)', // Лавандовый туман
    'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)', // Теплый песок
    'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)', // Небесный свод
    'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)', // Серебряный иней
    'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', // Глубокий океан
    'linear-gradient(to top, #30cfd0 0%, #330867 100%)', // Неоновый ночной клуб
    'linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)', // Радужный единорог
    'linear-gradient(to right, #f83600 0%, #f9d423 100%)', // Огненный закат
    'linear-gradient(-20deg, #b721ff 0%, #21d4fd 100%)', // Киберпанк
    'linear-gradient(to top, #0ba360 0%, #3cba92 100%)', // Изумрудный лес
];

export const radioStations: RadioStation[] = [
    {
        id: '1',
        name: 'Anime Radio',
        streamUrl: 'https://stream.laut.fm/anime',
        genre: 'Anime • J-Pop',
        color: COLORS[0],
        description: 'Лучшие опенинги и эндинги 24/7'
    },
    {
        id: '2',
        name: 'J-Pop Power',
        streamUrl: 'https://stream.laut.fm/jpop',
        genre: 'J-Pop • Idol',
        color: COLORS[1],
        description: 'Свежие хиты японской поп-музыки'
    },
    {
        id: '3',
        name: 'Lo-Fi Girl',
        streamUrl: 'https://stream.laut.fm/lofi',
        genre: 'Lo-Fi • Chill',
        color: COLORS[2],
        description: 'Идеально для учебы и релакса'
    },
    {
        id: '4',
        name: 'Gaming FM',
        streamUrl: 'https://stream.laut.fm/gaming',
        genre: 'Gaming • OST',
        color: COLORS[3],
        description: 'Саундтреки из любимых игр'
    },
    {
        id: '5',
        name: 'City Pop',
        streamUrl: 'https://stream.laut.fm/citypop',
        genre: 'City Pop • Retro',
        color: COLORS[4],
        description: 'Вайб японских 80-х'
    },
    {
        id: '6',
        name: 'Nightcore',
        streamUrl: 'https://stream.laut.fm/nightcore',
        genre: 'Nightcore • Fast',
        color: COLORS[5],
        description: 'Ускоренные треки для энергии'
    },
    {
        id: '7',
        name: 'Vocaloid',
        streamUrl: 'https://stream.laut.fm/vocaloid',
        genre: 'Vocaloid • Miku',
        color: COLORS[6],
        description: 'Хатсуне Мику и друзья'
    },
    {
        id: '8',
        name: 'K-Pop Global',
        streamUrl: 'https://stream.laut.fm/kpop',
        genre: 'K-Pop • Korean',
        color: COLORS[7],
        description: 'Корейские хиты и новинки'
    },
    {
        id: '9',
        name: 'Chillhop',
        streamUrl: 'https://stream.laut.fm/chillhop',
        genre: 'Hip-Hop • Beats',
        color: COLORS[8],
        description: 'Биты для хорошего настроения'
    },
    {
        id: '10',
        name: 'Retro Anime',
        streamUrl: 'https://stream.laut.fm/retroanime',
        genre: 'Retro • 90s',
        color: COLORS[9],
        description: 'Классика аниме музыки'
    },
    {
        id: '11',
        name: 'Piano & Strings',
        streamUrl: 'https://stream.laut.fm/piano',
        genre: 'Classical • OST',
        color: COLORS[10],
        description: 'Эмоциональные саундтреки'
    },
    {
        id: '12',
        name: 'Future Bass',
        streamUrl: 'https://stream.laut.fm/futurebass',
        genre: 'Electronic • Bass',
        color: COLORS[11],
        description: 'Мощные басы и синты'
    },
    {
        id: '13',
        name: 'Ambient Space',
        streamUrl: 'https://stream.laut.fm/ambient',
        genre: 'Ambient • Space',
        color: COLORS[12],
        description: 'Музыка для медитации и сна'
    }
];

// Вспомогательные функции
export const DEFAULT_STATION_ID = '1';
export const getStationById = (id: string) => radioStations.find(s => s.id === id);

// Функция fetchRadioStations теперь просто возвращает наш статический список
// Это сохраняет совместимость с кодом в RadioPlayer.tsx
export async function fetchRadioStations(): Promise<RadioStation[]> {
    // Имитация задержки сети для плавности (опционально)
    return new Promise((resolve) => {
        setTimeout(() => resolve(radioStations), 500);
    });
}