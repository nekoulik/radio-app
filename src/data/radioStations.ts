// src/data/radioStations.ts

export interface RadioStation {
    id: string;
    name: string;
    streamUrl: string;
    genre: string;
    color: string;
    description?: string;
}

const COLORS = [
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Розовая сакура
    'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)', // Мятный лоу-фай
    'linear-gradient(to right, #fa709a 0%, #fee140 100%)', // Энергичный поп
    'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)', // Вечерний город
    'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)', // Теплый винтаж
    'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)', // Киберпанк небо
    'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)', // Серебряный дождь
    'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', // Глубокий океан
    'linear-gradient(to top, #30cfd0 0%, #330867 100%)', // Неоновый ночной клуб
    'linear-gradient(to right, #b8cbb8 0%, #b465da 33%, #ee609c 66%)', // Радужный единорог
    'linear-gradient(to right, #f83600 0%, #f9d423 100%)', // Огненный закат
    'linear-gradient(-20deg, #b721ff 0%, #21d4fd 100%)', // Электрический сон
    'linear-gradient(to top, #0ba360 0%, #3cba92 100%)', // Изумрудный лес
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Фиолетовый туман
    'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)', // Летний бриз
];

export const radioStations: RadioStation[] = [
    {
        id: '1',
        name: 'Anime Radio',
        streamUrl: 'https://stream.laut.fm/anime',
        genre: 'Anime • OST',
        color: COLORS[0],
        description: 'Лучшие опенинги и эндинги из аниме'
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
        name: 'Lo-Fi Beats',
        streamUrl: 'https://stream.laut.fm/lofi',
        genre: 'Lo-Fi • Chill',
        color: COLORS[2],
        description: 'Идеальный фон для учебы и релакса'
    },
    {
        id: '4',
        name: 'City Pop',
        streamUrl: 'https://stream.laut.fm/citypop',
        genre: 'City Pop • 80s',
        color: COLORS[3],
        description: 'Ностальгия по японским 80-м'
    },
    {
        id: '5',
        name: 'Nightcore',
        streamUrl: 'https://stream.laut.fm/nightcore',
        genre: 'Nightcore • Fast',
        color: COLORS[4],
        description: 'Ускоренные треки для энергии'
    },
    {
        id: '6',
        name: 'Vocaloid',
        streamUrl: 'https://stream.laut.fm/vocaloid',
        genre: 'Vocaloid • Miku',
        color: COLORS[5],
        description: 'Хатсуне Мику и виртуальные идолы'
    },
    {
        id: '7',
        name: 'K-Pop Global',
        streamUrl: 'https://stream.laut.fm/kpop',
        genre: 'K-Pop • Korean',
        color: COLORS[6],
        description: 'Корейские хиты и новинки'
    },
    {
        id: '8',
        name: 'Chillhop',
        streamUrl: 'https://stream.laut.fm/chillhop',
        genre: 'Hip-Hop • Beats',
        color: COLORS[7],
        description: 'Биты для хорошего настроения'
    },
    {
        id: '9',
        name: 'Retro Anime',
        streamUrl: 'https://stream.laut.fm/retroanime',
        genre: 'Retro • 90s',
        color: COLORS[8],
        description: 'Классика аниме музыки 90-х'
    },
    {
        id: '10',
        name: 'Piano & Strings',
        streamUrl: 'https://stream.laut.fm/piano',
        genre: 'Classical • OST',
        color: COLORS[9],
        description: 'Эмоциональные саундтреки'
    },
    {
        id: '11',
        name: 'Future Bass',
        streamUrl: 'https://stream.laut.fm/futurebass',
        genre: 'Electronic • Bass',
        color: COLORS[10],
        description: 'Мощные басы и синты'
    },
    {
        id: '12',
        name: 'Ambient Space',
        streamUrl: 'https://stream.laut.fm/ambient',
        genre: 'Ambient • Space',
        color: COLORS[11],
        description: 'Музыка для медитации и сна'
    },
    {
        id: '13',
        name: 'Gaming FM',
        streamUrl: 'https://stream.laut.fm/gaming',
        genre: 'Gaming • OST',
        color: COLORS[12],
        description: 'Саундтреки из видеоигр'
    },
    {
        id: '14',
        name: 'Synthwave',
        streamUrl: 'https://stream.laut.fm/synthwave',
        genre: 'Synth • Retro',
        color: COLORS[13],
        description: 'Неоновый ретровейв'
    },
    {
        id: '15',
        name: 'Drum & Bass',
        streamUrl: 'https://stream.laut.fm/dnb',
        genre: 'DnB • Breakbeat',
        color: COLORS[14],
        description: 'Быстрые ритмы и глубокий бас'
    }
];

export const DEFAULT_STATION_ID = '1';
export const getStationById = (id: string) => radioStations.find(s => s.id === id);

// Функция загрузки (теперь просто возвращает статический список)
export async function fetchRadioStations(): Promise<RadioStation[]> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(radioStations), 300);
    });
}