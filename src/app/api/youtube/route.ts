import { NextResponse } from 'next/server';
import axios from 'axios';
import { differenceInHours, differenceInDays } from 'date-fns';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const clientApiKey = searchParams.get('apiKey');
    const publishedAfterDays = parseInt(searchParams.get('publishedAfter') || '15', 10);
    const order = searchParams.get('order') || 'viewCount';
    const videoDuration = searchParams.get('videoDuration') || 'any';

    // 优先使用服务器环境变量中的 Key，其次使用前端传入的 Key
    const apiKey = process.env.YOUTUBE_API_KEY || clientApiKey;

    if (!apiKey || !keyword) {
        return NextResponse.json({ error: '需要配置 API Key 和搜索关键词' }, { status: 400 });
    }

    try {
        // 1. Search for videos based on user criteria
        const publishedAfter = new Date();
        publishedAfter.setDate(publishedAfter.getDate() - publishedAfterDays);

        // We get top 50 results to have a good sample size for filtering
        const searchRes = await axios.get(`${YOUTUBE_API_URL}/search`, {
            params: {
                part: 'snippet',
                q: keyword,
                type: 'video',
                order: order,
                videoDuration: videoDuration !== 'any' ? videoDuration : undefined,
                publishedAfter: publishedAfter.toISOString(),
                maxResults: 50,
                key: apiKey,
            },
        });

        const items = searchRes.data.items || [];
        if (items.length === 0) {
            return NextResponse.json({ videos: [] });
        }

        const videoIds = items.map((item: any) => item.id.videoId).join(',');

        // 2. Fetch statistics for these videos
        const statsRes = await axios.get(`${YOUTUBE_API_URL}/videos`, {
            params: {
                part: 'statistics,snippet',
                id: videoIds,
                key: apiKey,
            },
        });

        const videos = statsRes.data.items.map((video: any) => {
            const publishedAt = new Date(video.snippet.publishedAt);
            const now = new Date();

            const hoursSincePublished = Math.max(1, differenceInHours(now, publishedAt));
            const daysSincePublished = differenceInDays(now, publishedAt);

            const views = parseInt(video.statistics.viewCount || '0', 10);
            const likes = parseInt(video.statistics.likeCount || '0', 10);

            // Calculate growth speed (views per hour)
            const speedRaw = views / hoursSincePublished;

            let speedStr = "";
            if (speedRaw > 1000) {
                speedStr = (speedRaw / 1000).toFixed(1) + "万播放/小时";
            } else {
                speedStr = Math.round(speedRaw) + " 播放/小时";
            }

            // Formatting numbers
            const formatNumber = (num: number) => {
                if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
                if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
                return num.toString();
            };

            // Define "Hot" (Surging) logic
            // e.g. > 5000 views per hour OR total views > 100k in less than 15 days
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
        });

        return NextResponse.json({ videos });

    } catch (error: any) {
        const errorData = error.response?.data?.error;
        console.error('YouTube API Error:', errorData || error.message);

        let errorMessage = 'Failed to fetch YouTube data';
        if (errorData?.reason === 'API_KEY_SERVICE_BLOCKED' || errorData?.message?.includes('blocked')) {
            errorMessage = 'YouTube Data API v3 has not been enabled for this API Key in Google Cloud Console. Please enable it to proceed.';
        } else if (errorData?.message) {
            errorMessage = errorData.message;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: error.response?.status || 500 }
        );
    }
}
