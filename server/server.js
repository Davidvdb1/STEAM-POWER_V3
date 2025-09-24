import express from 'express';

import * as hpm from 'http-proxy-middleware';
import path, { join } from 'path';
import __dirname from './utils/__dirname.js';
import http from 'http';

// import { exampleRouter } from './routers/exampleRouter.js';

// Load dotenv only if not in production
if (!process.env.ENVIRONMENT) {
    console.warn('NO environment found, trying to load dotenv file...')
    const dotenv = await import('dotenv');
    dotenv.config();
}

const PORT = process.env.PORT || 2025;
const APP = express();
const server = http.createServer(APP);

// Enable live reload only if ENVIRONMENT is dev
if (process.env.ENVIRONMENT === 'dev') {
    const livereload = await import('livereload');
    const connectLiveReload = (await import('connect-livereload')).default;

    const livereloadServer = livereload.createServer();
    livereloadServer.watch(join(__dirname, '..', 'client'));
    livereloadServer.server.once('connection', () => {
        setTimeout(() => {
            livereloadServer.refresh("/");
        }, 100);
    });

    APP.use(connectLiveReload()); // Must be before static
    const { default: swaggerUi } = await import('swagger-ui-express');
    const { swaggerSpec } = await import('./swagger.js');
    APP.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// APP.use('/api/example', exampleRouter);

// Serve static files from the current directory
APP.use(express.static(join(__dirname, '..', 'client'), {
    setHeaders: (res) => {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
    }
}));

// Proxy middleware for all unknown routes
APP.use("/", hpm.createProxyMiddleware({
    target: `http://localhost:${PORT}?`,
    changeOrigin: true,
    ws: true
}));

server.listen(PORT, () => {
    console.log(`App running @ http://localhost:${PORT}`);
    console.log(`📖 Swagger UI at http://localhost:${PORT}/docs`);
});
