import { NextResponse } from 'next/server';
import { differenceInHours, differenceInDays } from 'date-fns';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const clientApiKey = searchParams.get('apiKey');
    const days = parseInt(searchParams.get('publishedAfter') || '15', 10);
    const order = searchParams.get('order') || 'viewCount';
    const videoDuration = searchParams.get('videoDuration') || 'any';
    const minSpeed = parseInt(searchParams.get('minSpeed') || '0', 10);

    // 优先使用服务器环境变量中的 Key，其次使用前端传入的 Key
    const apiKey = process.env.YOUTUBE_API_KEY || clientApiKey;

    if (!apiKey || !keyword) {
        return NextResponse.json({ error: '需要配置 API Key 和搜索关键词' }, { status: 400 });
    }

    const trimmedKeyword = keyword.trim().replace(/\s+/g, ' ');

    try {
        console.log(`[YouTube API] Starting search using fetch for: "${trimmedKeyword}" (days: ${days}, minSpeed: ${minSpeed})`);

        // 1. Search for videos based on user filters
        const publishedAfterDate = new Date();
        publishedAfterDate.setDate(publishedAfterDate.getDate() - days);

        const searchUrl = new URL(`${YOUTUBE_API_URL}/search`);
        searchUrl.searchParams.append('part', 'snippet');
        searchUrl.searchParams.append('q', trimmedKeyword);
        searchUrl.searchParams.append('type', 'video');
        searchUrl.searchParams.append('order', order);
        searchUrl.searchParams.append('publishedAfter', publishedAfterDate.toISOString());
        searchUrl.searchParams.append('maxResults', '50');
        searchUrl.searchParams.append('key', apiKey);

        if (videoDuration !== 'any') {
            searchUrl.searchParams.append('videoDuration', videoDuration);
        }

        const searchRes = await fetch(searchUrl.toString(), {
            signal: AbortSignal.timeout(15000), // 15s timeout
            headers: { 'User-Agent': 'YouTube Viral Finder/1.0' }
        });

        if (!searchRes.ok) {
            const error = await searchRes.json();
            throw { response: { data: error, status: searchRes.status } };
        }

        const searchData = await searchRes.json();
        const items = searchData.items || [];
        console.log(`[YouTube API] Search complete. Found ${items.length} items.`);

        if (items.length === 0) {
            return NextResponse.json({ videos: [] });
        }

        const videoIds = items.map((item: any) => item.id.videoId).join(',');

        // 2. Fetch statistics for these videos
        console.log(`[YouTube API] Fetching stats for ${items.length} videos...`);
        const statsUrl = new URL(`${YOUTUBE_API_URL}/videos`);
        statsUrl.searchParams.append('part', 'statistics,snippet');
        statsUrl.searchParams.append('id', videoIds);
        statsUrl.searchParams.append('key', apiKey);

        const statsRes = await fetch(statsUrl.toString(), {
            signal: AbortSignal.timeout(15000),
            headers: { 'User-Agent': 'YouTube Viral Finder/1.0' }
        });

        if (!statsRes.ok) {
            const error = await statsRes.json();
            throw { response: { data: error, status: statsRes.status } };
        }

        const statsData = await statsRes.json();
        const videos = statsData.items
            .map((video: any) => {
                const publishedAt = new Date(video.snippet.publishedAt);
                const now = new Date();

                const hoursSincePublished = Math.max(1, differenceInHours(now, publishedAt));
                const daysSincePublished = differenceInDays(now, publishedAt);

                const views = parseInt(video.statistics.viewCount || '0', 10);
                const likes = parseInt(video.statistics.likeCount || '0', 10);

                // Calculate growth speed (views per hour)
                const speedRaw = views / hoursSincePublished;

                let speedStr = "";
                if (speedRaw > 10000) {
                    speedStr = (speedRaw / 10000).toFixed(1) + "万播放/小时";
                } else if (speedRaw > 1000) {
                    speedStr = (speedRaw / 1000).toFixed(1) + "k 播放/小时";
                } else {
                    speedStr = Math.round(speedRaw) + " 播放/小时";
                }

                // Formatting numbers (Chinese style: 万, 亿)
                const formatNumber = (num: number) => {
                    if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
                    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
                    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
                    return num.toString();
                };

                // Define "Hot" (Surging) logic
                const isHot = speedRaw > 5000 || (views > 100000 && daysSincePublished <= 15);

                return {
                    id: video.id,
                    title: video.snippet.title,
                    channel: video.snippet.channelTitle,
                    publishedAt: daysSincePublished === 0
                        ? `${hoursSincePublished} 小时前`
                        : `${daysSincePublished} 天前`,
                    views: formatNumber(views),
                    likes: formatNumber(likes),
                    speed: speedStr,
                    speedRaw, // for sorting
                    viewsRaw: views, // for sorting
                    engagementRaw: likes / (views || 1), // for sorting
                    thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
                    isHot
                };
            })
            .filter((v: any) => v.speedRaw >= minSpeed);

        return NextResponse.json({ videos });

    } catch (error: any) {
        console.error('YouTube API Error Captured:', error);
        if (error.stack) console.error('Stack Trace:', error.stack);

        const errorData = error.response?.data?.error || { message: error.message };
        let errorMessage = '获取 YouTube 数据失败';

        if (errorData?.reason === 'API_KEY_SERVICE_BLOCKED' || errorData?.message?.includes('blocked')) {
            errorMessage = '该 API Key 尚未在 Google Cloud 控制台中启用 YouTube Data API v3 服务，请启用后重试。';
        } else if (errorData?.message) {
            errorMessage = errorData.message;
        }

        if (error.name === 'TimeoutError') {
            errorMessage = '网络连接超时，请检查您的网络环境或代理设置。';
        } else if (error.message === 'fetch failed') {
            errorMessage = '网络连接失败 (fetch failed)。请检查您的本地代理或网络环境。';
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: error.response?.status || 500 }
        );
    }
}

