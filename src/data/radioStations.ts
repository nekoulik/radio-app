// src/data/radioStations.ts

export interface RadioStation {
    id: string;
    name: string;
    streamUrl: string;
    genre: string;
    color: string;
    description?: string;
    useProxy?: boolean; // <-- Новый флаг: true = через прокси, false = напрямую
}

const COLORS = [
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(to right, #fa709a 0%, #fee140 100%)',
    'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)',
    'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(to top, #30cfd0 0%, #330867 100%)',
    'linear-gradient(to right, #b8cbb8 0%, #b465da 33%, #ee609c 66%)',
    'linear-gradient(to right, #f83600 0%, #f9d423 100%)',
    'linear-gradient(-20deg, #b721ff 0%, #21d4fd 100%)',
    'linear-gradient(to top, #0ba360 0%, #3cba92 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
];

export const radioStations: RadioStation[] = [
    // === НАДЕЖНЫЕ СТАНЦИИ (работают напрямую, без прокси) ===
    {
        id: '1',
        name: 'Nightride FM',
        streamUrl: 'https://stream.nightride.fm/nightride.m4a',
        genre: 'Synthwave • Cyberpunk',
        color: COLORS[0],
        description: 'Ретровейв и киберпанк 24/7',
        useProxy: false
    },
    {
        id: '2',
        name: 'Radio Paradise',
        streamUrl: 'https://stream.radioparadise.com/aac-320',
        genre: 'Eclectic • Rock',
        color: COLORS[1],
        description: 'Лучшая музыка без рекламы',
        useProxy: false
    },
    {
        id: '3',
        name: 'SomaFM Groove Salad',
        streamUrl: 'https://ice1.somafm.com/groovesalad-256-mp3',
        genre: 'Ambient • Chill',
        color: COLORS[2],
        description: 'Спокойный эмбиент для релакса',
        useProxy: false
    },
    {
        id: '4',
        name: 'SomaFM Drone Zone',
        streamUrl: 'https://ice1.somafm.com/dronezone-256-mp3',
        genre: 'Drone • Atmospheric',
        color: COLORS[3],
        description: 'Глубокие атмосферные текстуры',
        useProxy: false
    },
    {
        id: '5',
        name: 'SomaFM Lush',
        streamUrl: 'https://ice1.somafm.com/lush-256-mp3',
        genre: 'Electronic • Sensual',
        color: COLORS[4],
        description: 'Чувственная электроника',
        useProxy: false
    },
    {
        id: '6',
        name: 'SomaFM Space Station',
        streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3',
        genre: 'Space • Ambient',
        color: COLORS[5],
        description: 'Космический эмбиент',
        useProxy: false
    },
    {
        id: '7',
        name: 'SomaFM Secret Agent',
        streamUrl: 'https://ice1.somafm.com/secretagent-256-mp3',
        genre: 'Lounge • Spy',
        color: COLORS[6],
        description: 'Музыка для шпионов',
        useProxy: false
    },
    {
        id: '8',
        name: 'SomaFM Indie Pop',
        streamUrl: 'https://ice1.somafm.com/indiepop-128-mp3',
        genre: 'Indie • Pop',
        color: COLORS[7],
        description: 'Независимая поп-музыка',
        useProxy: false
    },

    // === LAUT.FM СТАНЦИИ (требуют прокси) ===
    {
        id: '9',
        name: 'Anime Radio',
        streamUrl: 'https://stream.laut.fm/anime',
        genre: 'Anime • OST',
        color: COLORS[8],
        description: 'Лучшие опенинги и эндинги',
        useProxy: true
    },
    {
        id: '10',
        name: 'J-Pop Power',
        streamUrl: 'https://stream.laut.fm/jpop',
        genre: 'J-Pop • Idol',
        color: COLORS[9],
        description: 'Свежие хиты японского попа',
        useProxy: true
    },
    {
        id: '11',
        name: 'Lo-Fi Beats',
        streamUrl: 'https://stream.laut.fm/lofi',
        genre: 'Lo-Fi • Chill',
        color: COLORS[10],
        description: 'Идеально для учебы',
        useProxy: true
    },
    {
        id: '12',
        name: 'City Pop',
        streamUrl: 'https://stream.laut.fm/citypop',
        genre: 'City Pop • 80s',
        color: COLORS[11],
        description: 'Ностальгия по 80-м',
        useProxy: true
    },
    {
        id: '13',
        name: 'Nightcore',
        streamUrl: 'https://stream.laut.fm/nightcore',
        genre: 'Nightcore • Fast',
        color: COLORS[12],
        description: 'Ускоренные треки',
        useProxy: true
    },
    {
        id: '14',
        name: 'Vocaloid',
        streamUrl: 'https://stream.laut.fm/vocaloid',
        genre: 'Vocaloid • Miku',
        color: COLORS[13],
        description: 'Хатсуне Мику и друзья',
        useProxy: true
    },
    {
        id: '15',
        name: 'K-Pop Global',
        streamUrl: 'https://stream.laut.fm/kpop',
        genre: 'K-Pop • Korean',
        color: COLORS[14],
        description: 'Корейские хиты',
        useProxy: true
    }
];

export const DEFAULT_STATION_ID = '1';
export const getStationById = (id: string) => radioStations.find(s => s.id === id);

export async function fetchRadioStations(): Promise<RadioStation[]> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(radioStations), 300);
    });
}