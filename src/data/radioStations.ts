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
    {
        id: '1',
        name: 'Nightride FM',
        streamUrl: 'https://stream.nightride.fm/nightride.m4a',
        genre: 'Synthwave • Cyberpunk',
        color: COLORS[0],
        description: 'Ретровейв и киберпанк 24/7'
    },
    {
        id: '2',
        name: 'SomaFM Groove Salad',
        streamUrl: 'https://somafm.com/groovesalad256.pls',
        // Альтернативная прямая ссылка если pls не сработает:
        // streamUrl: 'https://ice1.somafm.com/groovesalad-256-mp3',
        genre: 'Ambient • Chill',
        color: COLORS[1],
        description: 'Спокойный эмбиент для релакса'
    },
    {
        id: '3',
        name: 'Radio Paradise',
        streamUrl: 'https://stream.radioparadise.com/aac-320',
        genre: 'Eclectic • Rock',
        color: COLORS[2],
        description: 'Лучшая эклектичная музыка без рекламы'
    },
    {
        id: '4',
        name: 'SomaFM Drone Zone',
        streamUrl: 'https://ice1.somafm.com/dronezone-256-mp3',
        genre: 'Drone • Atmospheric',
        color: COLORS[3],
        description: 'Глубокие атмосферные текстуры'
    },
    {
        id: '5',
        name: 'NTS Radio 1',
        streamUrl: 'https://stream-relay-geo.ntslive.net/stream',
        genre: 'Underground • Electronic',
        color: COLORS[4],
        description: 'Андеграундная электроника из Лондона'
    },
    {
        id: '6',
        name: 'SomaFM Lush',
        streamUrl: 'https://ice1.somafm.com/lush-256-mp3',
        genre: 'Electronic • Sensual',
        color: COLORS[5],
        description: 'Чувственная электроника'
    },
    {
        id: '7',
        name: 'SomaFM Space Station',
        streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3',
        genre: 'Space • Ambient',
        color: COLORS[6],
        description: 'Космический эмбиент'
    },
    {
        id: '8',
        name: 'SomaFM Secret Agent',
        streamUrl: 'https://ice1.somafm.com/secretagent-256-mp3',
        genre: 'Lounge • Spy',
        color: COLORS[7],
        description: 'Музыка для шпионов и детективов'
    },
    {
        id: '9',
        name: 'SomaFM Indie Pop',
        streamUrl: 'https://ice1.somafm.com/indiepop-128-mp3',
        genre: 'Indie • Pop',
        color: COLORS[8],
        description: 'Независимая поп-музыка'
    },
    {
        id: '10',
        name: 'SomaFM Boot Liquor',
        streamUrl: 'https://ice1.somafm.com/bootliquor-128-mp3',
        genre: 'Americana • Country',
        color: COLORS[9],
        description: 'Американская кантри-музыка'
    },
    {
        id: '11',
        name: 'SomaFM Fluid',
        streamUrl: 'https://ice1.somafm.com/fluid-128-mp3',
        genre: 'Instrumental • Hip Hop',
        color: COLORS[10],
        description: 'Инструментальный хип-хоп'
    },
    {
        id: '12',
        name: 'SomaFM Beat Blender',
        streamUrl: 'https://ice1.somafm.com/beatblender-128-mp3',
        genre: 'Dance • Electronica',
        color: COLORS[11],
        description: 'Танцевальная электроника'
    },
    {
        id: '13',
        name: 'SomaFM Seven Inch Soul',
        streamUrl: 'https://ice1.somafm.com/7soul-128-mp3',
        genre: 'Soul • R&B',
        color: COLORS[12],
        description: 'Классический соул и R&B'
    },
    {
        id: '14',
        name: 'SomaFM Metal Detector',
        streamUrl: 'https://ice1.somafm.com/metal-128-mp3',
        genre: 'Metal • Heavy',
        color: COLORS[13],
        description: 'Тяжелый метал и хард-рок'
    },
    {
        id: '15',
        name: 'SomaFM Folk Forward',
        streamUrl: 'https://ice1.somafm.com/folkfwd-128-mp3',
        genre: 'Folk • Acoustic',
        color: COLORS[14],
        description: 'Современный фолк и акустика'
    }
];

export const DEFAULT_STATION_ID = '1';
export const getStationById = (id: string) => radioStations.find(s => s.id === id);

export async function fetchRadioStations(): Promise<RadioStation[]> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(radioStations), 300);
    });
}