const Koa = require('koa');
const Router = require('@koa/router');
const fetch = require('node-fetch');
const { HttpsProxyAgent } = require('https-proxy-agent');
const cors = require('@koa/cors'); // Add this line

const app = new Koa();
const router = new Router();

const WALLHAVEN_API_URL = 'https://wallhaven.cc/api/v1/search';
const PROXY_URL = 'http://127.0.0.1:7897'; // Clash proxy URL

const agent = new HttpsProxyAgent(PROXY_URL);

// Declare a route
router.get('/', (ctx) => {
  ctx.body = { hello: 'world' };
});

router.get('/wallhaven/search', async (ctx) => {
  const { query } = ctx.request;
  const searchParams = new URLSearchParams(query);
  const apiUrl = `${WALLHAVEN_API_URL}?${searchParams.toString()}`;

  try {
    const response = await fetch(apiUrl, { agent });
    const data = await response.json();
    ctx.body = data;
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch data from Wallhaven API' };
  }
});

app
  .use(cors()) // Add this line
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});