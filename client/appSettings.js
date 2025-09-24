/**
 * @typedef {Object} ServerConfig
 * @property {boolean} httpSecure - Whether to use HTTPS for API calls.
 * @property {string} baseURL - The API base URL (format: host:port/path).
 */


/**
 * @typedef {Object} AppConfig
 * @property {string} logMode - Application logging level (e.g., "trace", "info", "warn", "error").
 */

/**
 * @typedef {Object} Config
 * @property {ServerConfig} server - Server connection configuration.
 * @property {AppConfig} app - Application-level configuration.
 */

/**
 * Global application configuration object.
 *
 * @type {Config}
 */
export let config = {
    server: {
        httpSecure: false,
        baseURL: "localhost:2025/api",
        socketIo: "localhost:3000"
    },
    boothCamera: {
        restartTimout: 7
    },
    app: {
        logMode: "trace"
    }
};

/**
 * Loads the configuration from `/config.json` and replaces the global {@link config} object.
 * If loading fails, the default configuration remains in effect.
 *
 * @async
 * @function loadConfig
 * @returns {Promise<void>}
 *
 * @example
 * await loadConfig();
 * console.log(config.server.baseURL);
 */
export async function loadConfig() {
    // const hostname = window.location.hostname;
    // const port = window.location.port;
    // config.server.baseURL = hostname + ":" + port + "/api";
    // const response = await fetch('/config.json');
    // if (!response.ok) return;
    // config = await response.json();
    //TODO implemanet save first and fix load
}

// TODO: ADD BOOTH ID TO CONFIG.JS