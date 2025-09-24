import { insertDoc } from "../connectors/couchConnector.js";
const DB = "feedback";

export const saveIndividual = async ({ user, body }) => {
    const doc = {
        _id: `feedback:${body.sessionId || body.scenarioId}:${user.userId}:${Date.now()}`,
        type: "feedback",
        orgId: body.orgId || user.orgIds?.[0],
        sessionId: body.sessionId || null,
        scenarioId: body.scenarioId,
        mode: "individual",
        answers: body.answers || [],
        ts: new Date().toISOString()
    };
    return await insertDoc(DB, doc);
};

export const saveGroup = async ({ user, sessionId, body }) => {
    const doc = {
        _id: `feedback:group:${sessionId}:${Date.now()}`,
        type: "feedback",
        orgId: body.orgId || user.orgIds?.[0],
        sessionId,
        scenarioId: body.scenarioId,
        mode: "group",
        answers: body.answers || [],
        ts: new Date().toISOString()
    };
    return await insertDoc(DB, doc);
};

export const summary = async (scenarioId) => {
    const res = await fetch(`${process.env.COUCHDB_URL}/${DB}/_find`, {
        method: "POST",
        headers: {
            Authorization: "Basic " + Buffer.from(`${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASS}`).toString("base64"),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            selector: { type: "feedback", scenarioId },
            fields: ["mode", "answers", "ts"], limit: 10000
        })
    });
    const { docs } = await res.json();
    return { scenarioId, count: docs.length, items: docs };
};
