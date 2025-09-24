import https from "https";

const AGENT = new https.Agent({
    keepAlive: true,
    maxSockets: 10, // optional: max concurrent sockets
    keepAliveMsecs: 30000,
});

const getAuthHeader = () => ({
    Authorization: "Basic " + Buffer.from(`${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASS}`).toString("base64"),
});

export const getAllDocs = async (dbName, options = { includeDocs: true }) => {
    const url = `${process.env.COUCHDB_URL}/${dbName}/_all_docs?include_docs=${options.includeDocs}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            agent: AGENT,
            headers: {
                ...getAuthHeader(),
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.rows.map((row) => row.doc);
    } catch (err) {
        console.error("Error querying CouchDB:", err);
        throw new Error(`CouchDB query failed for ${dbName}: ${err.message}`);
    }
};

export const getSpecificDoc = async (dbName, fieldName, fieldValue, limit = 1) => {
    const url = `${process.env.COUCHDB_URL}/${dbName}/_find`;

    const selector = {
        selector: {
            [fieldName]: fieldValue,
        },
        limit: limit, // You can remove or increase this if you want more than one result
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            agent: AGENT,
            headers: {
                Authorization: "Basic " + Buffer.from(`${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASS}`).toString("base64"),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(selector),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.docs && data.docs.length > 0) {
            return data.docs[0]; // or return data.docs if you want all matches
        } else {
            throw new Error(`No document found with ${fieldName} = "${fieldValue}"`);
        }
    } catch (err) {
        console.error(`Error querying ${dbName} for ${fieldName}=${fieldValue}:`, err);
        throw new Error(`Query failed: ${err.message}`);
    }
};

export const insertDoc = async (dbName, doc) => {
    const url = `${process.env.COUCHDB_URL}/${dbName}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            agent: AGENT,
            headers: {
                ...getAuthHeader(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(doc),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        return result; // { ok: true, id: '...', rev: '...' }
    } catch (err) {
        console.error(`Error inserting document into ${dbName}:`, err);
        throw new Error(`Insert failed: ${err.message}`);
    }
};

export const updateDoc = async (dbName, docId, doc) => {
    const url = `${process.env.COUCHDB_URL}/${dbName}/${docId}`;

    try {
        const response = await fetch(url, {
            method: "PUT",
            agent: AGENT,
            headers: {
                ...getAuthHeader(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(doc),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        return result; // { ok: true, id: '...', rev: '...' }
    } catch (err) {
        console.error(`Error updating document ${docId} in ${dbName}:`, err);
        throw new Error(`PUT failed: ${err.message}`);
    }
};

export const uploadAttachment = async (dbName, docId, rev, attachmentName, contentType, bufferData) => {
    const url = `${process.env.COUCHDB_URL}/${dbName}/${docId}/${attachmentName}?rev=${rev}`;

    try {
        const response = await fetch(url, {
            method: "PUT",
            agent: AGENT,
            headers: {
                ...getAuthHeader(),
                "Content-Type": contentType,
            },
            body: bufferData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }

        return await response.json(); // { ok: true, id: '...', rev: '...' }
    } catch (err) {
        console.error(`Error uploading attachment to ${docId}:`, err);
        throw new Error(`Attachment upload failed: ${err.message}`);
    }
};

export const getAttachmentAsBase64 = async (dbName, docId, attachmentName) => {
    const url = `${process.env.COUCHDB_URL}/${dbName}/${docId}/${attachmentName}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            agent: AGENT,
            headers: {
                ...getAuthHeader(),
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const buffer = await response.arrayBuffer();
        return Buffer.from(buffer).toString("base64");
    } catch (err) {
        console.error(`Error fetching attachment from ${dbName}/${docId}/${attachmentName}:`, err);
        throw new Error(`Attachment fetch failed: ${err.message}`);
    }
};

export const getView = async (dbName, designName, view, query = "") => {
    const url = `${process.env.COUCHDB_URL}/${dbName}/_design/${designName}/_view/${view}${query}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            agent: AGENT,
            headers: {
                ...getAuthHeader(),
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error querying CouchDB view:", err);
        throw new Error(`CouchDB query failed for DB: with ${dbName} err: ${err.message}`);
    }
};

export const getDocById = async (dbName, docId) => {
    const url = `${process.env.COUCHDB_URL}/${dbName}/${docId}`;
    const response = await fetch(url, {
        method: "GET",
        agent: AGENT,
        headers: {
            ...getAuthHeader(),
        },
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to fetch doc by ID: ${response.status} - ${errText}`);
    }

    return await response.json();
};

export const createDatabase = async (dbName, { n, q, partitioned } = {}) => {
    // CouchDB db names must be lowercase and URL-safe.
    const safeName = encodeURIComponent(dbName);

    const base = `${process.env.COUCHDB_URL}/${safeName}`;
    const params = new URLSearchParams();
    if (typeof n === "number") params.set("n", String(n)); // replicas
    if (typeof q === "number") params.set("q", String(q)); // shards
    if (typeof partitioned === "boolean") params.set("partitioned", partitioned ? "true" : "false");

    const url = params.toString() ? `${base}?${params.toString()}` : base;

    try {
        const res = await fetch(url, {
            method: "PUT",
            agent: AGENT,
            headers: {
                ...getAuthHeader(),
            },
        });

        if (res.status === 412) {
            // database already exists
            return { ok: true, exists: true, db: dbName };
        }

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${res.statusText} - ${text}`);
        }

        const json = await res.json(); // { ok: true }
        return { ...json, exists: false, db: dbName };
    } catch (err) {
        console.error(`Error creating database ${dbName}:`, err);
        throw new Error(`Create database failed: ${err.message}`);
    }
};

// Convenience: ensure a database exists (HEAD then create if 404)
export const ensureDatabase = async (dbName, options = {}) => {
    const safeName = encodeURIComponent(dbName);
    const url = `${process.env.COUCHDB_URL}/${safeName}`;

    try {
        const head = await fetch(url, {
            method: "HEAD",
            agent: AGENT,
            headers: { ...getAuthHeader() },
        });

        if (head.ok) {
            return { ok: true, exists: true, db: dbName };
        }

        if (head.status === 404) {
            return await createDatabase(dbName, options);
        }

        const text = await head.text();
        throw new Error(`HTTP ${head.status}: ${head.statusText} - ${text}`);
    } catch (err) {
        console.error(`Error ensuring database ${dbName}:`, err);
        throw new Error(`Ensure database failed: ${err.message}`);
    }
};
