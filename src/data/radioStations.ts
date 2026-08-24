export interface RadioStation {
    id: string;
    name: string;
    streamUrl: string;
    genre: string;
    description: string;
    color: string;
}

export const radioStations: RadioStation[] = [
    {
        id: 'hell',
        name: 'Hell',
        streamUrl: 'https://stream.laut.fm/hell',
        genre: 'Anime • J-Pop • OST',
        description: 'Лучшие треки из аниме и японской поп-музыки',
        color: 'linear-gradient(135deg, #ff66b3 0%, #66ccff 100%)',
    },
    {
        id: 'anime',
        name: 'Anime',
        streamUrl: 'https://stream.laut.fm/anime',
        genre: 'Lo-Fi • Chill • Study',
        description: 'Расслабляющие биты для учёбы и отдыха',
        color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    },
    {
        id: 'animeacademy',
        name: 'Anime Academy',
        streamUrl: 'https://stream.laut.fm/animeacademy',
        genre: 'J-Pop • Japanese',
        description: 'Свежие хиты японской поп-музыки',
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
        id: 'animefm',
        name: 'Anime FM',
        streamUrl: 'https://stream.laut.fm/animefm',
        genre: 'OST • Anime • Soundtrack',
        description: 'Саундтреки из любимых аниме',
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
        id: 'evil-animefm',
        name: 'Evil Anime FM',
        streamUrl: 'https://stream.laut.fm/evil-animefm',
        genre: 'Chill • Ambient • Electronic',
        description: 'Атмосферная электронная музыка',
        color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
    {
        id: 'animealive',
        name: 'Animealive',
        streamUrl: 'https://stream.laut.fm/animealive',
        genre: 'J-Pop • Japanese Pop',
        description: 'Только хиты японской поп-музыки',
        color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
    {
        id: 'anima',
        name: 'Anima Radio',
        streamUrl: 'https://stream.laut.fm/anima',
        genre: 'Lo-Fi • Anime • Chill',
        description: 'Lo-Fi ремиксы аниме саундтреков',
        color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    },
    {
        id: 'schlagerradiopretzsch',
        name: 'Schlagerradiopretzsch',
        streamUrl: 'https://stream.laut.fm/schlagerradiopretzsch',
        genre: 'Schlager • German',
        description: 'Немецкая шлягер-музыка',
        color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
    {
        id: 'anime-radio-switzerland',
        name: 'Anime Radio Switzerland',
        streamUrl: 'https://stream.laut.fm/anime-radio-switzerland',
        genre: 'City Pop • Japanese',
        description: 'Классический японский City Pop 80-х',
        color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    },
    {
        id: 'animklatu',
        name: 'Animklatu',
        streamUrl: 'https://stream.laut.fm/animklatu',
        genre: 'OST • Anime • Soundtrack',
        description: 'Эпические саундтреки из аниме',
        color: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
    },
    {
        id: 'radio-desiderium',
        name: 'Radio Desiderium',
        streamUrl: 'https://stream.laut.fm/radio-desiderium',
        genre: 'Lo-Fi • Hip Hop • Chill',
        description: 'Расслабляющий Lo-Fi хип-хоп',
        color: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    },
    {
        id: 'crewfirefm',
        name: 'Crewfire FM',
        streamUrl: 'https://stream.laut.fm/crewfirefm',
        genre: 'J-Pop • Idol',
        description: 'Идолы и J-Pop группы',
        color: 'linear-gradient(135deg, #ffd1ff 0%, #c1dfc8 100%)',
    },
    {
        id: 'anilibria',
        name: 'Anilibria',
        streamUrl: 'https://stream.laut.fm/anilibria',
        genre: 'Jazz • Anime • Lounge',
        description: 'Джазовые версии аниме тем',
        color: 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
    },
    {
        id: 'hip_pop',
        name: 'Hip Pop',
        streamUrl: 'https://stream.laut.fm/hip_pop',
        genre: 'Hip-Hop • Rap',
        description: 'Хип-хоп и рэп музыка',
        color: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
    },
    {
        id: 'mira-fm-pop',
        name: 'Mira.FM Pop',
        streamUrl: 'https://stream.laut.fm/mira-fm-pop',
        genre: 'Pop • Rock',
        description: 'Поп и рок музыка',
        color: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    },
];

export const DEFAULT_STATION_ID = 'hell';

export const getStationById = (id: string): RadioStation | undefined => {
    return radioStations.find(station => station.id === id);
};