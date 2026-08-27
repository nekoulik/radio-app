// src/data/radioStations.ts

export interface RadioStation {
    id: string;
    name: string;
    streamUrl: string;
    genre: string;
    color: string;
    description?: string;
    useProxy: boolean;
}

const COLORS = [
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Сакура
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
    // === ANIME & J-POP (Тематические) ===
    {
        id: '1',
        name: 'AniSon FM', // Или 'Wave Anime Radio', как вам больше нравится
        streamUrl: 'https://pool.anison.fm/AniSonFM(320)',
        genre: 'Anime • OST • High Quality',
        color: COLORS[0],
        description: 'Легендарное аниме радио в 320kbps',
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
        name: 'IA Music & News',
        streamUrl: 'https://ianewsja.ice.infomaniak.ch/ianewsja-128.mp3',
        genre: 'J-Pop • News',
        color: COLORS[2],
        description: 'Японская музыка и новости',
        useProxy: false
    },
    {
        id: '4',
        name: 'SomaFM Indie Pop Rocks',
        streamUrl: 'https://ice1.somafm.com/indiepop-128-mp3',
        genre: 'Indie • J-Pop',
        color: COLORS[3],
        description: 'Независимая поп-музыка со всего мира',
        useProxy: false
    },
    {
        id: '5',
        name: 'Radio Planeta',
        streamUrl: 'https://radioplaneta.emitironline.com/radio',
        genre: 'Pop • Dance',
        color: COLORS[4],
        description: 'Популярные хиты со всего мира',
        useProxy: false
    },

    // === SYNTHWAVE & RETRO (Атмосфера аниме 80-90х) ===
    {
        id: '6',
        name: 'Nightride FM',
        streamUrl: 'https://stream.nightride.fm/nightride.mp3',
        genre: 'Synthwave • Cyberpunk',
        color: COLORS[5],
        description: 'Ретровейв и киберпанк',
        useProxy: false
    },
    {
        id: '7',
        name: 'SomaFM Groove Salad',
        streamUrl: 'https://ice1.somafm.com/groovesalad-256-mp3',
        genre: 'Ambient • Chill',
        color: COLORS[6],
        description: 'Спокойный эмбиент для фона',
        useProxy: false
    },
    {
        id: '8',
        name: 'SomaFM Fluid',
        streamUrl: 'https://ice1.somafm.com/fluid-128-mp3',
        genre: 'Instrumental • Hip Hop',
        color: COLORS[7],
        description: 'Инструментальный хип-хоп и лоу-фай биты без слов', // <-- Исправлено описание
        useProxy: false
    },
    {
        id: '9',
        name: 'SomaFM Space Station',
        streamUrl: 'https://ice1.somafm.com/spacestation-128-mp3',
        genre: 'Space • Ambient',
        color: COLORS[8],
        description: 'Космический эмбиент',
        useProxy: false
    },

    // === GAMING & ENERGY (Для драйва) ===
    {
        id: '10',
        name: 'SomaFM Metal Detector',
        streamUrl: 'https://ice1.somafm.com/metal-128-mp3',
        genre: 'Metal • Heavy',
        color: COLORS[9],
        description: 'Тяжелый метал и хард-рок для драйва',
        useProxy: false
    },
    {
        id: '11',
        name: 'Happy Rave Radio',
        streamUrl: 'https://happyrave-rex.radioca.st/stream',
        genre: 'Rave • Happy Hardcore',
        color: COLORS[10],
        description: 'Энергичная рейв-музыка',
        useProxy: false
    },
    {
        id: '12',
        name: 'SomaFM Beat Blender',
        streamUrl: 'https://ice1.somafm.com/beatblender-128-mp3',
        genre: 'Dance • Electronica',
        color: COLORS[11],
        description: 'Танцевальная электроника',
        useProxy: false
    },

    // === RELAX & MOOD (Для спокойствия) ===
    {
        id: '13',
        name: 'SomaFM Drone Zone',
        streamUrl: 'https://ice1.somafm.com/dronezone-256-mp3',
        genre: 'Drone • Atmospheric',
        color: COLORS[12],
        description: 'Глубокие атмосферные текстуры',
        useProxy: false
    },
    {
        id: '14',
        name: 'NPO Radio 2',
        streamUrl: 'https://icecast.omroep.nl/radio2-bb-mp3',
        genre: 'City Pop • Retro', // <-- Уточнен жанр для лучшей читаемости
        color: COLORS[13],
        description: 'Саундтрек вашей жизни в стиле аниме 90-х',
        useProxy: false
    },
    {
        id: '15',
        name: 'Radio Paradise Main Mix',
        streamUrl: 'https://stream.radioparadise.com/mp3-320',
        genre: 'Eclectic • Rock',
        color: COLORS[14],
        description: 'Лучшая музыка без рекламы',
        useProxy: false
    }
];

export const DEFAULT_STATION_ID = '1';
export const getStationById = (id: string) => radioStations.find(s => s.id === id);

export async function fetchRadioStations(): Promise<RadioStation[]> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(radioStations), 300);
    });
}