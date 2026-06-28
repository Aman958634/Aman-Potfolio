const https = require('https');
const url = new URL('https://aman-potfolio-production.up.railway.app/api/auth/login');
const data = JSON.stringify({ email: 'admin@prestige.com', password: 'Admin@123' });
const opts = {
  method: 'POST',
  hostname: url.hostname,
  path: url.pathname,
  headers: {
    Origin: 'https://aman-potfolio-amber.vercel.app',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};
const req = https.request(opts, res => {
  console.log('status', res.statusCode);
  console.log('headers', JSON.stringify(res.headers, null, 2));
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('body', body);
    process.exit(0);
  });
});
req.on('error', err => {
  console.error('error', err.message);
  process.exit(1);
});
req.write(data);
req.end();
