import { config } from "../appSettings.js";

/**
 * @module httpClient
 */

/**
 * @typedef {Object} HttpResponse
 * @property {any} data - The parsed response data (JSON or text).
 * @property {string|null} error - Error message, or null if successful.
 * @property {Response|null} response - The Fetch API Response object, or null if network failure.
 */

/**
 * Internal utility to make HTTP requests, supporting JSON and binary streams.
 *
 * @async
 * @param {"GET"|"POST"|"PUT"|"DELETE"|"PATCH"} method - HTTP method.
 * @param {string} urlPath - Path to append to base_url (must start with '/').
 * @param {Object|Blob|ArrayBuffer|FormData|undefined} [body] - Optional body to send.
 * @param {string|undefined} [token] - Optional Bearer token for Authorization header.
 * @param {string|undefined} [contentType] - Content-Type header (e.g. 'application/json', 'application/octet-stream', 'image/png'). If sending FormData, leave undefined.
 * @returns {Promise<HttpResponse>} Result object with data, error, and response.
 */
async function _request(method, urlPath, body, token, contentType) {
    let url = config.server.httpSecure ? "https" : "http";
    url += "://" + config.server.baseURL + urlPath;

    /** @type {Record<string, string>} */
    let headers = {
        "accept": "*/*" // Accept anything; let caller handle it
    };

    // Set Content-Type header unless it's FormData (browser auto-sets boundary)
    if (contentType) headers["Content-Type"] = contentType;

    if (token && token.trim().length !== 0) {
        headers["Authorization"] = "Bearer " + token;
    }

    /** @type {RequestInit} */
    let request = {
        method,
        headers,
    };

    if (body !== undefined && body !== null) {
        // If sending JSON, serialize. If binary/FormData, send as-is.
        if (!contentType || contentType === "application/json") {
            request.body = JSON.stringify(body);
        } else {
            request.body = body;
        }
    }

    let data = null;
    let error = null;
    let response = null;
    try {
        response = await fetch(url, request);
        const ct = response.headers.get("content-type") || "";

        if (response.ok) {
            if (ct.includes("application/json")) {
                data = await response.json();
            } else if (ct.startsWith("text/")) {
                data = await response.text();
            } else {
                // Don't consume the body—let the caller do response.blob() or .arrayBuffer()
                data = null;
            }
        } else {
            // Error: Try to get text if possible
            try {
                error = await response.text();
            } catch (e) {
                error = response.statusText || "Request failed";
            }
        }
    } catch (e) {
        error = e instanceof Error ? e.message : String(e);
    }

    return { data, error, response };
}

export async function simpleGetRequest(urlPath) {
    let url = config.server.httpSecure ? "https" : "http";
    url += "://" + config.server.baseURL + urlPath;

    return await fetch(url);
}

/**
 * Sends a GET request.
 * @async
 * @param {string} urlPath
 * @param {string|undefined} [token]
 * @returns {Promise<HttpResponse>}
 */
export async function getRequest(urlPath, token) {
    return await _request("GET", urlPath, undefined, token);
}

/**
 * Sends a POST request. Supports JSON and binary data.
 *
 * @async
 * @param {string} urlPath - Path to append to the base URL.
 * @param {Object|Blob|ArrayBuffer|FormData} body - Data to send.
 * @param {string|undefined} [token] - Optional Bearer token.
 * @param {string|undefined} [contentType] - Optional content type (e.g., "application/json", "application/octet-stream", "image/png").
 * @returns {Promise<HttpResponse>}
 * @example
 *   // Send JSON:
 *   await postRequest('/api/thing', {x: 1}, undefined, 'application/json');
 *   // Send binary:
 *   await postRequest('/api/upload', imageBlob, undefined, 'image/png');
 *   // Send raw binary:
 *   await postRequest('/api/raw', buffer, undefined, 'application/octet-stream');
 *   // Send FormData (contentType omitted!):
 *   const fd = new FormData();
 *   fd.append('file', fileInput.files[0]);
 *   await postRequest('/api/upload', fd);
 */
export async function postRequest(urlPath, body, token, contentType) {
    return await _request("POST", urlPath, body, token, contentType);
}

/**
 * Sends a PUT request. Supports JSON and binary data.
 * @async
 * @param {string} urlPath
 * @param {Object|Blob|ArrayBuffer|FormData} body
 * @param {string|undefined} [token]
 * @param {string|undefined} [contentType]
 * @returns {Promise<HttpResponse>}
 */
export async function putRequest(urlPath, body, token, contentType) {
    return await _request("PUT", urlPath, body, token, contentType);
}



export async function patchRequest(urlPath, body, token, contentType) {
    return await _request("PATCH", urlPath, body, token, contentType);
}

/**
 * Sends a DELETE request. Supports optional body.
 * @async
 * @param {string} urlPath
 * @param {Object|Blob|ArrayBuffer|FormData|undefined} [body]
 * @param {string|undefined} [token]
 * @param {string|undefined} [contentType]
 * @returns {Promise<HttpResponse>}
 */
export async function deleteRequest(urlPath, body, token, contentType) {
    return await _request("DELETE", urlPath, body, token, contentType);
}


export async function readableStreamToBlob(stream, mimeType = "image/png") {
    // Collect all chunks into an array
    const reader = stream.getReader();
    const chunks = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }

    // Concatenate into one Blob
    return new Blob(chunks, { type: mimeType });
}