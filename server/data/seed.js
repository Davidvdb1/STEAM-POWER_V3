// seed.js
// Run: node seed.js
// ENV: DB_SCENARIOS (default "scenarios")
import "dotenv/config";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

// Use your existing connector (path at project root)
import {
    ensureDatabase,
    insertDoc,
    getDocById,
    updateDoc,
    uploadAttachment,
} from "../connectors/couchConnector.js";

// ──────────────────────────────────────────────────────────────
// Paths & constants
// ──────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_ROOT = path.resolve(path.join(__dirname, "seed"));
// Folder name inside ./seed that contains the scenario & assets
const SCENARIO_DIR = "Een groepswerk in het onderwijs";
// Prefer this file name; will fall back to first *.json if not found
const SCENARIO_FILE = "scenario_een_groepswerk.json";

const DB_SCENARIOS = process.env.DB_SCENARIOS || "scenarios";
const SCENARIO_ID = "scenario:groupwork-v1";

const IMAGE_EXTS = ["png", "jpg", "jpeg", "gif", "webp"];
const AUDIO_EXTS = ["mp3", "wav", "ogg", "m4a"];
const CONTENT_TYPES = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    m4a: "audio/mp4",
};

// ──────────────────────────────────────────────────────────────
// Utility
// ──────────────────────────────────────────────────────────────
const slug = (s) =>
    s
        .toString()
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase();

const sha1Hex = (buf) => crypto.createHash("sha1").update(buf).digest("hex");

function collectScenarioMediaKeys(scn) {
    // Collect all FilePath references and force "Scenarios/<dir>/" prefix so it
    // matches your original JSON lookups on the frontend
    const keys = new Set();

    const withPrefix = (fp) => {
        if (!fp || typeof fp !== "string") return null;
        if (fp.startsWith("Scenarios/")) return fp;
        return `Scenarios/${SCENARIO_DIR}/${fp}`;
    };

    const maybeAdd = (fp) => {
        const k = withPrefix(fp);
        if (k) keys.add(k);
    };

    const walk = (node) => {
        if (!node || typeof node !== "object") return;

        if (node.ImageReference?.FilePath) maybeAdd(node.ImageReference.FilePath);
        if (node.AudioReference?.FilePath) maybeAdd(node.AudioReference.FilePath);
        if (node.AmbientAudioReference?.FilePath)
            maybeAdd(node.AmbientAudioReference.FilePath);
        if (node.BackgroundImageReference?.FilePath)
            maybeAdd(node.BackgroundImageReference.FilePath);

        for (const v of Object.values(node)) {
            if (Array.isArray(v)) v.forEach(walk);
            else if (v && typeof v === "object") walk(v);
        }
    };

    walk(scn);
    return Array.from(keys.values());
}

function resolveFileForKey(key) {
    // Example key:
    // "Scenarios/Een groepswerk in het onderwijs/Sounds/Intro spel"
    const baseDir = path.join(SEED_ROOT, SCENARIO_DIR);

    const last = key.split("/").pop(); // "Intro spel", "Lesvoorbereiding", ...
    let subFolder = "";
    if (/Background_Images/i.test(key)) subFolder = "Background_Images";
    else if (/Images/i.test(key)) subFolder = "Images";
    else if (/Sounds/i.test(key)) subFolder = "Sounds";

    const searchDir = subFolder ? path.join(baseDir, subFolder) : baseDir;
    if (!fs.existsSync(searchDir)) {
        return { key, error: `Missing folder: ${searchDir}` };
    }

    const files = fs.readdirSync(searchDir);
    // Match by base name (case-insensitive), regardless of extension
    const match = files.find(
        (f) => path.parse(f).name.toLowerCase() === last.toLowerCase()
    );

    if (!match) {
        return { key, error: `No file named "${last}" (any extension) in ${searchDir}` };
    }

    const abs = path.join(searchDir, match);
    const ext = path.parse(abs).ext.slice(1).toLowerCase();
    const contentType = CONTENT_TYPES[ext];
    if (!contentType) {
        return { key, error: `Unsupported extension ".${ext}" for ${abs}` };
    }

    const buffer = fs.readFileSync(abs);
    const size = buffer.length;
    const sha1 = sha1Hex(buffer);
    const isImage = IMAGE_EXTS.includes(ext);
    const isAudio = AUDIO_EXTS.includes(ext);
    const kind = isImage ? "image" : isAudio ? "audio" : "other";

    // Attachment name format (no "asset:" prefix):
    // "<kind>:<slug(name)>-<sha8>"
    const simpleName = last; // keep original base name for display
    const id = `${kind}:${slug(simpleName)}-${sha1.slice(0, 8)}`;

    return { key, id, kind, name: simpleName, sha1, size, contentType, buffer, abs };
}

function buildManifests(resolved) {
    // Unique attachments by id (same file can be referenced by multiple keys)
    const byId = new Map();
    for (const a of resolved) {
        if (a.error) continue;
        if (!byId.has(a.id)) byId.set(a.id, a);
    }

    // assetManifest per key (exact "Scenarios/…" key), and
    // the shape you asked for: source, attachmentName, kind, name
    const assetManifest = {};
    for (const a of resolved) {
        if (a.error) continue;
        assetManifest[a.key] = {
            source: "attachment",
            attachmentName: a.id,
            kind: a.kind,
            name: a.name,
        };
    }

    // // attachmentsManifest minimal: id, kind, name, sha1
    // const attachmentsManifest = Array.from(byId.values()).map((a) => ({
    //     id: a.id,
    //     kind: a.kind,
    //     name: a.name,
    //     sha1: a.sha1,
    // }));

    return {
        assetManifest,
        // attachmentsManifest,
        uniqueAttachments: Array.from(byId.values()),
    };
}

async function upsertScenarioDoc({ scenarioPayload, assetManifest, attachmentsManifest }) {
    const baseDoc = {
        _id: SCENARIO_ID,
        type: "scenario",
        name: scenarioPayload.Name || "Een groepswerk in het onderwijs",
        version: 1,
        orgIds: ["org:schoolA", "org:schoolB"],
        visibility: "private",
        assetManifest,
        attachmentsManifest,
        scenario: scenarioPayload, // 1:1 unchanged payload under "scenario"
    };

    let current;
    try {
        current = await getDocById(DB_SCENARIOS, SCENARIO_ID);
    } catch (_) {}

    if (!current) {
        const created = await insertDoc(DB_SCENARIOS, baseDoc);
        return { rev: created.rev };
    } else {
        const updated = await updateDoc(DB_SCENARIOS, SCENARIO_ID, {
            ...baseDoc,
            _rev: current._rev,
        });
        return { rev: updated.rev };
    }
}

function loadScenarioJSON() {
    const preferred = path.join(SEED_ROOT, SCENARIO_DIR, SCENARIO_FILE);
    if (fs.existsSync(preferred)) {
        return JSON.parse(fs.readFileSync(preferred, "utf8"));
    }
    // Fallback: pick first *.json in the scenario folder
    const dir = path.join(SEED_ROOT, SCENARIO_DIR);
    const any = fs
        .readdirSync(dir)
        .filter((f) => f.toLowerCase().endsWith(".json"))
        .map((f) => path.join(dir, f));
    if (!any.length) {
        throw new Error(`No scenario JSON found in ${dir}`);
    }
    return JSON.parse(fs.readFileSync(any[0], "utf8"));
}

// ──────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────
(async () => {
    try {
        console.log(`→ Ensuring DB: ${DB_SCENARIOS}`);
        await ensureDatabase(DB_SCENARIOS);

        const scenarioPayload = loadScenarioJSON();

        // Collect "Scenarios/…" media keys from your payload
        const keys = collectScenarioMediaKeys(scenarioPayload);
        console.log(`→ Found ${keys.length} media reference(s)`);

        // Resolve each key to a file under ./seed/<SCENARIO_DIR>/...
        const resolved = keys.map(resolveFileForKey);

        const problems = resolved.filter((r) => r.error);
        if (problems.length) {
            console.warn("⚠ Unable to resolve some media:");
            problems.forEach((p) => console.warn(`   - ${p.key}: ${p.error}`));
        }

        const { assetManifest, uniqueAttachments } =
            buildManifests(resolved);

        console.log("→ Upserting scenario doc:", SCENARIO_ID);
        let { rev } = await upsertScenarioDoc({
            scenarioPayload,
            assetManifest,
            // attachmentsManifest,
        });

        console.log(`→ Uploading ${uniqueAttachments.length} attachment(s)`);
        for (const a of uniqueAttachments) {
            const out = await uploadAttachment(
                DB_SCENARIOS,
                SCENARIO_ID,
                rev,
                a.id,            // attachment name in _attachments
                a.contentType,   // content_type lives in _attachments (not in assetManifest)
                a.buffer
            );
            rev = out.rev;
            console.log(`   ✓ ${a.id} (${a.contentType}, ${a.size} bytes)`);
        }

        const finalDoc = await getDocById(DB_SCENARIOS, SCENARIO_ID);
        const attCount = finalDoc?._attachments
            ? Object.keys(finalDoc._attachments).length
            : 0;

        console.log("────────────────────────────────────────");
        console.log(`✅ Seed complete for ${SCENARIO_ID}`);
        console.log(`   assetManifest entries: ${Object.keys(finalDoc.assetManifest || {}).length}`);
        console.log(`   attachments uploaded:  ${attCount}`);
        if (problems.length) {
            console.log("   ⚠ Unresolved media keys:");
            problems.forEach((p) => console.log(`     - ${p.key}: ${p.error}`));
        }
        console.log("────────────────────────────────────────");
    } catch (err) {
        console.error("❌ Seeding failed:", err?.response?.data || err.message || err);
        process.exit(1);
    }
})();