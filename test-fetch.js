async function test() {
    const apiKey = 'AIzaSyBB1NCzWsq4_QqxHGfwfqBSf99o-eUg4qI';
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&key=${apiKey}&maxResults=1`;

    console.log('Testing native fetch to Google APIs...');
    try {
        const res = await fetch(url, {
            signal: AbortSignal.timeout(10000)
        });
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Success! Items found:', data.items?.length);
    } catch (e) {
        console.error('Fetch Error:', e.name, e.message);
        if (e.cause) console.error('Cause:', e.cause.message || e.cause);
    }
}

test();
