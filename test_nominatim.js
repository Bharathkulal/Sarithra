const https = require('https');

const options = {
  hostname: 'nominatim.openstreetmap.org',
  path: '/search?q=Bengaluru&format=json&limit=1',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
};

https.get(options, (res) => {
  let data = '';
  console.log('Status code:', res.statusCode);
  
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response body:', data);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
