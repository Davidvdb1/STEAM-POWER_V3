import { insertDoc, uploadAttachment, getDocById, getAttachmentAsBase64 } from "../connectors/couchConnector.js";

const DB = "assets";

export const createAsset = async ({ assetId, kind, contentType, buffer, aliases = [] }) => {
    const _id = assetId || `asset:${Date.now()}`;
    const doc = { _id, type: "asset", kind, aliases };
    const inserted = await insertDoc(DB, doc);
    await uploadAttachment(DB, _id, inserted.rev || inserted._rev, "file", contentType, buffer);
    return { id: _id, ok: true };
};

export const getAssetFile = async (id) => {
    const doc = await getDocById(DB, id);
    const base64 = await getAttachmentAsBase64(DB, id, "file");
    return { buffer: Buffer.from(base64, "base64"), contentType: "application/octet-stream" };
};
