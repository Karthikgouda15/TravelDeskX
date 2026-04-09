const https = require('https');

const cities = ["Gateway of India", "Victoria Memorial", "Kapaleeshwarar Temple", "Charminar", "Vidhana Soudha"];

function getImageUrl(query) {
    return new Promise((resolve) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=thumbnail&pithumbsize=300&titles=${encodeURIComponent(query)}`;
        const req = https.get(url, { headers: { 'User-Agent': 'TravelDeskBot/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const parsed = JSON.parse(data);
                const pages = parsed.query.pages;
                const pageId = Object.keys(pages)[0];
                resolve({ city: query, url: pages[pageId]?.thumbnail?.source || null });
            });
        });
    });
}

Promise.all(cities.map(getImageUrl)).then(res => console.log(JSON.stringify(res, null, 2)));
