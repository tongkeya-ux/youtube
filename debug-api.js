const axios = require('axios');
const { differenceInHours, differenceInDays } = require('date-fns');

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
const apiKey = 'AIzaSyBB1NCzWsq4_QqxHGfwfqBSf99o-eUg4qI'; // From user logs
const keyword = 'cat';

async function test() {
    const publishedAfter = new Date();
    publishedAfter.setDate(publishedAfter.getDate() - 15);

    try {
        console.log('Testing YouTube Search API...');
        const searchRes = await axios.get(`${YOUTUBE_API_URL}/search`, {
            params: {
                part: 'snippet',
                q: keyword,
                type: 'video',
                order: 'viewCount',
                publishedAfter: publishedAfter.toISOString(),
                maxResults: 5, // small batch for test
                key: apiKey,
            },
            timeout: 10000
        });
        console.log('Search Success! Found', searchRes.data.items.length, 'items');
    } catch (error) {
        console.error('API Error:', error.code, error.message);
        if (error.response) {
            console.error('Response Data:', JSON.stringify(error.response.data));
        }
    }
}

test();
