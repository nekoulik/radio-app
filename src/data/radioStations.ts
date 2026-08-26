// src/data/radioStations.ts

export interface RadioStation {
    id: string;
    name: string;
    streamUrl: string;
    genre: string;
    color: string;
    description?: string;
    useProxy: boolean; // <-- Новый флаг
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
    // === ПРЯМЫЕ ПОТОКИ (Работают без прокси) ===
    {
        id: '1',
        name: 'Wave Anime Radio',
        streamUrl: 'https://channel_3.waveani.fun/stream',
        genre: 'Anime • OST',
        color: COLORS[0],
        description: 'Лучшие аниме треки 24/7',
        useProxy: false
    },
    {
        id: '2',
        name: 'Hunter.fm Lo-Fi',
        streamUrl: 'https://live.hunter.fm/lofi_high',
        genre: 'Lo-Fi • Chill',
        color: COLORS[1],
        description: 'Идеально для учебы и релакса',
        useProxy: false
    },
    {
        id: '3',
        name: 'Radio Planeta',
        streamUrl: 'https://radioplaneta.emitironline.com/radio',
        genre: 'Pop • Dance',
        color: COLORS[2],
        description: 'Популярные хиты со всего мира',
        useProxy: false
    },
    {
        id: '4',
        name: 'Full Spectrum DnB',
        streamUrl: 'https://fullspectrumradio.com/listen',
        genre: 'DnB • Dubstep',
        color: COLORS[3],
        description: 'Тяжелые басы и быстрые ритмы',
        useProxy: false
    },
    {
        id: '5',
        name: 'Happy Rave Radio',
        streamUrl: 'https://happyrave-rex.radioca.st/stream',
        genre: 'Rave • Happy Hardcore',
        color: COLORS[4],
        description: 'Энергичная рейв-музыка',
        useProxy: false
    },
    {
        id: '6',
        name: 'IA Music & News',
        streamUrl: 'https://ianewsja.ice.infomaniak.ch/ianewsja-128.mp3',
        genre: 'J-Pop • News',
        color: COLORS[5],
        description: 'Японская музыка и новости',
        useProxy: false
    },
    {
        id: '7',
        name: 'OnlyHits Japan',
        streamUrl: 'https://j.onlyhit.us/play',
        genre: 'J-Pop • Hits',
        color: COLORS[6],
        description: 'Только хиты японской сцены',
        useProxy: false
    },
    {
        id: '8',
        name: 'Happy Hardcore FM',
        streamUrl: 'https://happyhardcore-high.rautemusik.fm/?ref=radiobrowser',
        genre: 'Hardcore • Gabber',
        color: COLORS[7],
        description: 'Самый быстрый хардкор',
        useProxy: false
    },
    {
        id: '9',
        name: 'Anime FM (Laut)',
        streamUrl: 'https://animefm.stream.laut.fm/animefm',
        genre: 'Anime • J-Pop',
        color: COLORS[8],
        description: 'Классическое аниме радио',
        useProxy: false // Пробуем напрямую, этот поддомен иногда работает
    },

    // === ТРЕБУЮТ ПРОКСИ (Zeno, Laut.fm, HTTP) ===
    {
        id: '10',
        name: 'Аниме Para Ti',
        streamUrl: 'https://stream.zeno.fm/qpn8mkt8c4duv',
        genre: 'Anime • Latin',
        color: COLORS[9],
        description: 'Аниме музыка для души',
        useProxy: true
    },
    {
        id: '11',
        name: 'Animecol Radio',
        streamUrl: 'https://stream.zeno.fm/6bfysacxc6quv',
        genre: 'Anime • Colombia',
        color: COLORS[10],
        description: 'Латиноамериканское аниме радио',
        useProxy: true
    },
    {
        id: '12',
        name: 'Animealive',
        streamUrl: 'https://stream.laut.fm/animealive',
        genre: 'Anime • Live',
        color: COLORS[11],
        description: 'Живое аниме радио',
        useProxy: true
    },
    {
        id: '13',
        name: 'Otaku World',
        streamUrl: 'https://otaku-world.stream.laut.fm/otaku-world',
        genre: 'Otaku • Culture',
        color: COLORS[12],
        description: 'Мир отаку и аниме культуры',
        useProxy: true
    },
    {
        id: '14',
        name: 'Anime Radio (HTTP)',
        streamUrl: 'https://stream.laut.fm/animefm', // Исправлено на HTTPS
        genre: 'Anime • Classic',
        color: COLORS[13],
        description: 'Классические аниме хиты',
        useProxy: true
    },
    {
        id: '15',
        name: 'J-Rock Powerplay',
        streamUrl: 'https://kathy.torontocast.com:3340/;?shoutcast',
        genre: 'J-Rock • Power',
        color: COLORS[14],
        description: 'Мощный японский рок',
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