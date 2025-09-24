// import session from "express-session";
// import Keycloak from "keycloak-connect";
// import {readFileSync, readFile} from "fs";
// import {join, resolve} from "path";
// import __dirname from "../utils/__dirname.js";
// import fs from "fs/promises";

// const memoryStore = new session.MemoryStore();

// export const sessionMiddleware = session({
//     secret: process.env.SESSION_SECRET || "dev-secret",
//     resave: false,
//     saveUninitialized: false,
//     store: memoryStore,
// });

// const keycloakJsonPath = resolve(join(__dirname, "config", "keycloak.json"));
// // Load the downloaded JSON
// const fileConfig = JSON.parse(readFileSync(keycloakJsonPath, 'utf8'));

// const kcConfig = {
//     ...fileConfig
// };

// // TEMP: prove what the adapter actually uses
// console.log('[KC] Loading Keycloak with:');
// console.log('[KC] realm=%s client=%s url=%s',
//     kcConfig.realm, kcConfig.resource, kcConfig['auth-server-url']);
// console.log("-----------------------------------------------------------------------------------------\n");


// export const keycloak = new Keycloak({ store: memoryStore }, kcConfig);
