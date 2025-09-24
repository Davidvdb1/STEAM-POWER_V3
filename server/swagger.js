// swagger.js
import swaggerJSDoc from 'swagger-jsdoc';
import {join, resolve} from "path";
import __dirname from "./utils/__dirname.js";
import {readFileSync} from "fs";

const keycloakJsonPath = resolve(join(__dirname, "config", "keycloak.json"));
// Load the downloaded JSON
const fileConfig = JSON.parse(readFileSync(keycloakJsonPath, 'utf8'));

const kcConfig = {
    ...fileConfig
};

const issuer = kcConfig["auth-server-url"] + '/realms/' + kcConfig.realm
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: process.env.SWAGGER_TITLE || "FILL IN SWAGGER_TITLE IN ENV",
            version: process.env.SWAGGER_VERSION || "FILL IN SWAGGER_VERSION IN ENV",
            description: process.env.SWAGGER_DESCRIPTION || "FILL IN SWAGGER_DESCRIPTION IN ENV",
        },
        components: {
            securitySchemes: {
                keycloakOAuth: {
                    type: 'oauth2',
                    flows: {
                        authorizationCode: {
                            authorizationUrl: `${issuer}/protocol/openid-connect/auth`,
                            tokenUrl: `${issuer}/protocol/openid-connect/token`,
                        },
                    },
                }
            },
        }
    },
    // JSDoc comments will live in routers/**/*.js
    apis: ['./routers/**/*.js'],
};


export const swaggerSpec = swaggerJSDoc(options);

swaggerSpec.security = [{ keycloakOAuth: [] }];