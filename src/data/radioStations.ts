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
        id: 'megacity',
        name: 'Azuria Raido',
        streamUrl: 'https://stream.laut.fm/hell',
        genre: 'Anime • J-Pop • OST',
        description: 'Лучшие треки из аниме и японской поп-музыки',
        color: 'linear-gradient(135deg, #ff66b3 0%, #66ccff 100%)',
    },
    {
        id: 'anime',
        name: 'Radio für Animé-Fans',
        streamUrl: 'https://stream.laut.fm/anime',
        genre: 'Lo-Fi • Chill • Study',
        description: 'Расслабляющие биты для учёбы и отдыха',
        color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    },
    {
        id: 'crewfirefm',
        name: 'Crewfire FM',
        streamUrl: 'https://stream.laut.fm/crewfirefm',
        genre: 'J-Pop • Japanese',
        description: 'Свежие хиты японской поп-музыки',
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
        id: 'erdbeereis--radio',
        name: 'Erdbeereis Radio',
        streamUrl: 'https://stream.laut.fm/erdbeereis--radio',
        genre: 'OST • Anime • Soundtrack',
        description: 'Саундтреки из любимых аниме',
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
        id: 'radiodreamtiger',
        name: 'Radiodreamtiger',
        streamUrl: 'https://stream.laut.fm/radiodreamtiger',
        genre: 'Chill • Ambient • Electronic',
        description: 'Атмосферная электронная музыка',
        color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
    {
        id: 'jpop',
        name: 'J-Pop Hits Radio',
        streamUrl: 'https://stream.laut.fm/jpop',
        genre: 'J-Pop • Japanese Pop',
        description: 'Только хиты японской поп-музыки',
        color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
    {
        id: 'animelofi',
        name: 'Anime Lo-Fi',
        streamUrl: 'https://stream.laut.fm/animelofi',
        genre: 'Lo-Fi • Anime • Chill',
        description: 'Lo-Fi ремиксы аниме саундтреков',
        color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    },
    {
        id: 'kpop',
        name: 'K-Pop Radio',
        streamUrl: 'https://stream.laut.fm/kpop',
        genre: 'K-Pop • Korean',
        description: 'Лучшие хиты корейской поп-музыки',
        color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
    {
        id: 'citypop',
        name: 'City Pop FM',
        streamUrl: 'https://stream.laut.fm/citypop',
        genre: 'City Pop • Japanese',
        description: 'Классический японский City Pop 80-х',
        color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    },
    {
        id: 'animeost',
        name: 'Anime OST Radio',
        streamUrl: 'https://stream.laut.fm/animeost',
        genre: 'OST • Anime • Soundtrack',
        description: 'Эпические саундтреки из аниме',
        color: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
    },
    {
        id: 'lofihiphop',
        name: 'Lo-Fi Hip Hop',
        streamUrl: 'https://stream.laut.fm/lofihiphop',
        genre: 'Lo-Fi • Hip Hop • Chill',
        description: 'Расслабляющий Lo-Fi хип-хоп',
        color: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    },
    {
        id: 'jpopidol',
        name: 'J-Pop Idol',
        streamUrl: 'https://stream.laut.fm/jpopidol',
        genre: 'J-Pop • Idol',
        description: 'Идолы и J-Pop группы',
        color: 'linear-gradient(135deg, #ffd1ff 0%, #c1dfc8 100%)',
    },
    {
        id: 'animejazz',
        name: 'Anime Jazz',
        streamUrl: 'https://stream.laut.fm/animejazz',
        genre: 'Jazz • Anime • Lounge',
        description: 'Джазовые версии аниме тем',
        color: 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
    },
    {
        id: 'vocaloid',
        name: 'Vocaloid Radio',
        streamUrl: 'https://stream.laut.fm/vocaloid',
        genre: 'Vocaloid • J-Pop',
        description: 'Хатсуне Мику и другие вокалоиды',
        color: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
    },
    {
        id: 'animemetal',
        name: 'Anime Metal',
        streamUrl: 'https://stream.laut.fm/animemetal',
        genre: 'Metal • Rock • Anime',
        description: 'Рок и метал из аниме',
        color: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    },
];

export const DEFAULT_STATION_ID = 'megacity';

export const getStationById = (id: string): RadioStation | undefined => {
    return radioStations.find(station => station.id === id);
};