const http = require('http');
const config = require('./src/config/app');

const options = {
  hostname: 'localhost',
  port: config.port,
  path: '/api/health',
  method: 'GET',
  timeout: 2000
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', () => {
  process.exit(1);
});

request.on('timeout', () => {
  request.destroy();
  process.exit(1);
});

request.end(); 