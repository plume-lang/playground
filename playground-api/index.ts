import { serve } from "bun";
import { LogLevel, log } from "#library/logger";
import chalk from "chalk";
import { routes } from "./routes";
import { CORS_HEADERS } from "#library/route";

// Build the API
const server = serve({
  port: process.env.SERVER_PORT || 3001,
  hostname: process.env.SERVER_HOST || 'localhost',
  async fetch(req) {
    const { method } = req;
    const { pathname } = new URL(req.url);

    const route = routes.find((route) => {
      if (typeof route.route === 'string') {
        return route.route === pathname && route.method === method;
      }
      return route.route.test(pathname) && route.method === method;
    });
    
    if (route) {
      log(LogLevel.INFO, `Requested route at ${pathname}`);
      const res = await route.handler(req);
      log(LogLevel.INFO, `${res.status} response at ${pathname}`);
      return res;
    }

    log(LogLevel.ERROR, `Route not found at ${pathname}`);
    return new Response('Not found', { status: 404, ...CORS_HEADERS });
  }
});

console.log(`${chalk.green('START')}: Running at http://${server.hostname}:${server.port}`);
