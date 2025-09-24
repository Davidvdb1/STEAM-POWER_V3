// dependencies/sessions.service.js
import { insertDoc, getSpecificDoc } from "../connectors/couchConnector.js";

const SDB = "sessions";
const EDB = "events";

// Simple join code
const code = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export const createSession = async ({ scenarioId, orgId, moderatorId }) => {
    const doc = {
        _id: `session:${code()}`,
        type: "session",
        orgId, scenarioId, moderatorId,
        joinCode: code(),
        status: "waiting",
        currentNodeId: 1,
        createdAt: new Date().toISOString(),
        players: []
    };
    const r = await insertDoc(SDB, doc);
    return { id: doc._id, joinCode: doc.joinCode, ok: true, rev: r.rev || r._rev };
};

export const listJoinable = async (orgIds) => {
    const res = await fetch(`${process.env.COUCHDB_URL}/${SDB}/_find`, {
        method: "POST",
        headers: {
            Authorization: "Basic " + Buffer.from(`${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASS}`).toString("base64"),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            selector: { type: "session", orgId: { "$in": orgIds }, status: "waiting" },
            fields: ["_id", "orgId", "scenarioId", "joinCode", "createdAt"]
        })
    });
    const { docs } = await res.json();
    return docs;
};

export const setStatus = async (sessionId, status) => {
    // keep minimal; socket engine will keep live state
    return { id: sessionId, status, ok: true };
};

export const advanceManual = async (sessionId) => {
    return { id: sessionId, advanced: true };
};

export const getEvents = async (sessionId) => {
    const res = await fetch(`${process.env.COUCHDB_URL}/${EDB}/_find`, {
        method: "POST",
        headers: {
            Authorization: "Basic " + Buffer.from(`${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASS}`).toString("base64"),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            selector: { type: "event", sessionId },
            sort: [{ ts: "asc" }],
            limit: 10000
        })
    });
    const { docs } = await res.json();
    return docs;
};

export const getSummary = async (sessionId) => {
    const events = await getEvents(sessionId);
    const perNode = {};
    for (const e of events.filter(e => e.action === "answer")) {
        const key = String(e.nodeId);
        perNode[key] = perNode[key] || {};
        const ch = String(e.payload.choice);
        perNode[key][ch] = perNode[key][ch] || { count: 0, timeSum: 0 };
        perNode[key][ch].count += 1;
        perNode[key][ch].timeSum += e.payload.reactionMs || 0;
    }
    return { sessionId, nodes: perNode };
};
