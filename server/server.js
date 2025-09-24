import http from "http";
import express from "express";
import { Server as SocketIOServer } from "socket.io";
import { keycloak, sessionMiddleware } from "./connectors/keycloak.js";

import * as hpm from 'http-proxy-middleware';
import path, { join } from 'path';

import __dirname from './utils/__dirname.js';
import scenariosRouter from "./routers/scenarios.js";
import sessionsRouter from "./routers/sessions.js";
import feedbackRouter from "./routers/feedback.js";
import assetsRouter from "./routers/assets.js";
import devRouter from "./routers/dev.js";
import { initSocket } from "./libs/socket.js";
import { bootstrap } from "./modules/bootstrap.js";

// Load dotenv only if not in production
if (!process.env.ENVIRONMENT) {
    console.warn('NO environment found!');
    console.warn("-----------------------------------------------------------------------------------------\n");
    console.warn("Assuming dev:")
    console.warn("Run `npm run dev` or `node -r dotenv/config server.js` to preload a dev environment");
    console.warn("-----------------------------------------------------------------------------------------\n");
    console.warn("Assuming prod:");
    console.warn("Fill in the environment variables, e.g. via a .env file and mount to docker container\n\n");
}


const PORT = process.env.PORT || 2025;
const APP = express();
const server = http.createServer(APP);
const io = new SocketIOServer(server, { cors: { origin: "*" } });
initSocket(io); // multiplayer engine

// Enable live reload only if ENVIRONMENT is dev
if (process.env.ENVIRONMENT === 'dev') {
    const livereload = await import('livereload');
    const connectLiveReload = (await import('connect-livereload')).default;
    const livereloadServer = livereload.createServer({
        exts: ['html', 'css', 'js', 'png', 'gif', 'jpg', 'svg']
    });

    // const livereloadServer = livereload.createServer();
    livereloadServer.watch(join(__dirname, '..', 'client'));
    livereloadServer.server.once('connection', () => {
        setTimeout(() => {
            livereloadServer.refresh("/");
        }, 100);
    });

    APP.use(connectLiveReload()); // Must be before static
    const { default: swaggerUi } = await import('swagger-ui-express');
    const { swaggerSpec } = await import('./swagger.js');

    // Provide Swagger UI with OAuth config
    const swaggerUiOptions = {
        swaggerOptions: {
            oauth: {
                clientId: process.env.KEYCLOAK_SWAGGER_CLIENT_ID, // 👈 This pre-fills the client_id
                usePkceWithAuthorizationCodeGrant: true, // Only if using PKCE (recommended)
            }
        },
        customCss: `
            #swagger-ui > section > div.swagger-ui > div:nth-child(2) > div.scheme-container > section > div > div > div.modal-ux > div > div > div.modal-ux-content > div:nth-child(1) > div > div:nth-child(2) > div > div:nth-child(5),
            #swagger-ui > section > div.swagger-ui > div:nth-child(2) > div.scheme-container > section > div > div > div.modal-ux > div > div > div.modal-ux-content > div:nth-child(1) > div > div:nth-child(2) > div > div:nth-child(6)
            {
                display: none !important;
              }
            `
    };

    APP.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
}
APP.use(sessionMiddleware)
APP.use(keycloak.middleware()); // /logout, etc.

APP.use(express.json({ limit: '10mb' })); // to support JSON-encoded bodies

// Routers
APP.use("/api/scenarios", scenariosRouter);
APP.use("/api/sessions", sessionsRouter);
APP.use("/api/feedback", feedbackRouter);
APP.use("/api/assets", assetsRouter);

if (process.env.ENVIRONMENT === 'dev') {
    APP.use("/api/dev", devRouter);
}


APP.get("/api/healthz", (_, res) => res.status(200).json({ ok: true }));


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


bootstrap()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`App running @ http://localhost:${PORT}`);
            console.log(`📖 Swagger UI at http://localhost:${PORT}/docs`);
        });
    })
    .catch((err) => {
        console.error("Bootstrap failed:", err);
        process.exit(1);
    });
