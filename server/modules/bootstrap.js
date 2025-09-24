// modules/bootstrap.js
import { ensureDatabase } from "../connectors/couchConnector.js";

// const DBS = ["scenarios", "assets", "sessions", "events", "feedback", "consents"];

async function createIndex(db, body) {
    const res = await fetch(`${process.env.COUCHDB_URL}/${db}/_index`, {
        method: "POST",
        headers: {
            Authorization: "Basic " + Buffer.from(`${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASS}`).toString("base64"),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const t = await res.text();
        console.warn(`Index create failed for ${db}: ${res.status} ${t}`);
    }
}

export async function bootstrap() {
    for (const db of DBS) await ensureDatabase(db);

    // await createIndex("scenarios", { index: { fields: ["type", "orgIds"] }, name: "idx_type_orgs" });
    // await createIndex("sessions",  { index: { fields: ["type", "orgId", "status"] }, name: "idx_session_org_status" });
    // await createIndex("events",    { index: { fields: ["type", "sessionId", "ts"] }, name: "idx_events_session_ts" });
    // await createIndex("feedback",  { index: { fields: ["type", "scenarioId"] }, name: "idx_fb_scenario" });
}
