import {
    getDocById, getSpecificDoc, insertDoc, updateDoc,
    uploadAttachment, getAttachmentAsBase64
} from "../connectors/couchConnector.js";

const DB = "scenarios";

const ensureAccess = (doc, orgIds) => {
    if (!doc || doc.type !== "scenario") throw new Error("Not a scenario");
    if (!Array.isArray(doc.orgIds)) throw new Error("Scenario misconfigured (orgIds)");
    if (!orgIds.some(id => doc.orgIds.includes(id))) {
        const err = new Error("Forbidden");
        err.status = 403;
        throw err;
    }
};

export const listByOrgs = async (orgIds) => {
    // Minimal Mango query (requires an index on orgIds)

    return await getSpecificDoc(DB, "orgIds", { "$elemMatch": { "$in": orgIds } }, 200)
};

export const getScenarioForUser = async (id, orgIds) => {
    const doc = await getDocById(DB, id);
    ensureAccess(doc, orgIds);
    return doc;
};

export const getRawPayloadForUser = async (id, orgIds) => {
    const doc = await getDocById(DB, id);
    ensureAccess(doc, orgIds);
    if (!doc.scenario) throw new Error("Scenario payload missing");
    return doc.scenario; // unchanged JSON for the player
};

export const createScenario = async (scenarioJson, { orgIds, version = 1 }) => {
    if (!scenarioJson || typeof scenarioJson !== "object" || !Array.isArray(scenarioJson.ChoiceNodes)) {
        const err = new Error("Invalid scenario JSON (must include ChoiceNodes)");
        err.status = 400;
        throw err;
    }

    const name = scenarioJson.Name || "Scenario";
    const _id = `scenario:${name.toLowerCase().replace(/\s+/g, "-")}-v${version}`;

    const doc = {
        _id, type: "scenario", name, version,
        orgIds: Array.isArray(orgIds) ? orgIds : [],
        scenario: scenarioJson,
        assetManifest: {}
    };

    return await insertDoc(DB, doc);
};

export const addAttachmentAndMap = async (scenarioId, filePath, contentType, buffer) => {
    const doc = await getDocById(DB, scenarioId);
    const attachmentName = `file-${Date.now()}`;
    const res = await uploadAttachment(DB, scenarioId, doc._rev, attachmentName, contentType, buffer);
    const updated = await getDocById(DB, scenarioId);

    updated.assetManifest = updated.assetManifest || {};
    updated.assetManifest[filePath] = { source: "attachment", attachmentName: res.id ? undefined : res.rev, contentType };
    // Better: store the returned attachment name; our connector returns { ok, id, rev }, so keep attachment key we used:
    updated.assetManifest[filePath] = { source: "attachment", attachmentName: attachmentName, contentType };

    const put = await updateDoc(DB, scenarioId, updated);
    return put;
};

export const resolveAsset = async (scenarioId, orgIds, filePath) => {
    const doc = await getDocById(DB, scenarioId);
    ensureAccess(doc, orgIds);

    const mapping = doc.assetManifest?.[filePath];
    if (mapping?.source === "attachment") {
        const base64 = await getAttachmentAsBase64(DB, scenarioId, mapping.attachmentName);
        return { buffer: Buffer.from(base64, "base64"), contentType: mapping.contentType };
    }

    if (mapping?.source === "library") {
        // Fetch from assets DB
        const url = `${process.env.COUCHDB_URL}/assets/${encodeURIComponent(mapping.assetId)}/file`;
        const resp = await fetch(url, {
            headers: {
                Authorization: "Basic " + Buffer.from(`${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASS}`).toString("base64")
            }
        });
        if (!resp.ok) throw new Error(`Asset fetch failed ${resp.status}`);
        const arr = await resp.arrayBuffer();
        const ct = resp.headers.get("content-type") || "application/octet-stream";
        return { buffer: Buffer.from(arr), contentType: ct };
    }

    // Fallback: try direct attachment with encoded path (only if you saved using the same path)
    try {
        const base64 = await getAttachmentAsBase64(DB, scenarioId, encodeURIComponent(filePath));
        return { buffer: Buffer.from(base64, "base64"), contentType: "application/octet-stream" };
    } catch {
        const err = new Error(`Asset not found for path: ${filePath}`);
        err.status = 404;
        throw err;
    }
};
