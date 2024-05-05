import { LogLevel, customLog, log } from "#library/logger";
import { serve } from "bun";
import chalk from "chalk";
import path from "path";

const server = serve({
  port: process.env.SERVER_PORT || 3000,
  hostname: process.env.SERVER_HOST || 'localhost',
  async fetch(request) {
    const { method } = request;
    const { pathname } = new URL(request.url);

    if (method !== 'GET') {
      log(LogLevel.ERROR, `Method ${method} not allowed at ${pathname}`);
      return new Response('Method not allowed', { status: 405 });
    }

    const distPath = path.resolve(path.dirname(Bun.main), "dist");

    if (pathname === '/') {
      log(LogLevel.INFO, `Requested route at ${pathname}`);
      const index = await Bun.file(path.resolve(distPath, 'index.html'));
      const indexStr = await index.text();
      customLog('ROOT', `Served index.html at ${pathname}`);

      return new Response(indexStr, { headers: { 'Content-Type': 'text/html' } });
    } else if (pathname.startsWith('/assets/')) {
      log(LogLevel.INFO, `Requested route at ${pathname}`);
      const assetName = pathname.match(/\/assets\/(.+)/)?.[1];
      if (!assetName) return new Response('Not found', { status: 404 });

      const asset = await Bun.file(path.resolve(distPath, 'assets', assetName));
      const assetStr = await asset.text();

      const ext = assetName.split('.').pop();
      if (ext === 'js') {
        customLog('ASSET', `Served Javascript asset at ${pathname}`);
        return new Response(assetStr, { headers: { 'Content-Type': 'application/javascript' } });
      }
      if (ext === 'css') {
        customLog('ASSET', `Served CSS asset at ${pathname}`);
        return new Response(assetStr, { headers: { 'Content-Type': 'text/css' } });
      }
      
      log(LogLevel.ERROR, `Asset type not supported at ${pathname}`);
      return new Response('Not found', { status: 404 });
    } else if (pathname === '/logo-bg.svg') {
      const logo = await Bun.file(path.resolve(distPath, 'logo-bg.svg'));
      const logoStr = await logo.text();

      customLog('ASSET', `Served SVG asset ${pathname}`);
      return new Response(logoStr, { headers: { 'Content-Type': 'image/svg+xml' } });
    } else if (pathname === '/logo.svg') {
      const logo = await Bun.file(path.resolve(distPath, 'logo.svg'));
      const logoStr = await logo.text();

      customLog('ASSET', `Served SVG asset ${pathname}`);
      return new Response(logoStr, { headers: { 'Content-Type': 'image/svg+xml' } });
    }

    log(LogLevel.ERROR, `Route not found at ${pathname}`);
    return new Response('Not found', { status: 404 });
  },
});

console.log(`${chalk.green('START')}: Running at http://${server.hostname}:${server.port}`);