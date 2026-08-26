// proxy-worker.js - Cloudflare Worker для проксирования аудио-потоков

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const url = new URL(request.url)
    const streamUrl = url.searchParams.get('url')

    // Проверка CORS заголовков
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            }
        })
    }

    if (!streamUrl) {
        return new Response('URL parameter required', {
            status: 400,
            headers: { 'Access-Control-Allow-Origin': '*' }
        })
    }

    try {
        // Запрашиваем аудиопоток
        const response = await fetch(streamUrl, {
            headers: {
                'User-Agent': 'AniWave Radio Bot/1.0',
                'Accept': 'audio/*'
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        // Создаем новые заголовки с CORS
        const newHeaders = new Headers(response.headers)
        newHeaders.set('Access-Control-Allow-Origin', '*')
        newHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
        newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate')
        newHeaders.set('Content-Type', response.headers.get('content-type') || 'audio/mpeg')

        return new Response(response.body, {
            status: response.status,
            headers: newHeaders
        })

    } catch (error) {
        console.error('Proxy error:', error)
        return new Response(JSON.stringify({ error: 'Failed to fetch stream' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        })
    }
}