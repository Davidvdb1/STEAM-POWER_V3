// dependencies/scenariosService.js
import { functionalBase, define } from "../abstracts/functionalBase.js";
import { getRequest, simpleGetRequest, readableStreamToBlob } from "../libs/apiUtils.js";
import {keycloak} from "../libs/auth.js";

/**
 * @typedef {'attachment'|'library'} AssetSource
 */

/**
 * @typedef {Object} AssetManifestEntry
 * @property {AssetSource} source                - Where to fetch the asset: "attachment" or "library".
 * @property {string} attachmentName             - Identifier/filename inside the doc or library (e.g. "image:lesvoorbereiding-c7bf8a23").
 * @property {'image'|'audio'|'video'|'other'} [kind] - Optional hint about the asset kind.
 * @property {string} [name]                     - Optional human-friendly name.
 */

/**
 * @typedef {Object.<string, AssetManifestEntry>} AssetManifest
 * A mapping from logical asset path to its source/attachment reference.
 */

/**
 * ================================
 * Scenario JSON
 * ================================
 * The scenario JSON structure is kept 1:1 as-is from the authoring tool.
 * It is stored in the scenario doc as the `scenario` property.
 * The scenario JSON references assets by FilePath, which are mapped
 * to actual attachments or library assets using the `assetManifest`.
 *
 * See the typedefs below for details.
 */

/**
 * Pointer to an asset used by the scenario (image, audio, background).
 * FilePath follows: "Scenarios/<ScenarioName>/<Category>/<AssetName>".
 * @typedef {Object} MediaRef
 * @property {string} FilePath
 */

/**
 * Speaker identity for a dialog line.
 * @typedef {Object} Character
 * @property {string} FirstName
 * @property {string} LastName
 */

/**
 * A single line within a dialog sequence.
 * @typedef {Object} DialogLine
 * @property {number} Sequence                 - 1-based order within the dialog.
 * @property {Character} Character             - Who is speaking.
 * @property {MediaRef|null} ImageReference    - Optional image shown with the line.
 * @property {MediaRef|null} AudioReference    - Optional audio played with the line.
 * @property {string} Text                     - Raw line content.
 * @property {boolean} IsKeyDialogLine         - Marks lines used for summaries/highlights.
 * @property {string} Summary                  - Shortened version for logs/recaps.
 */

/**
 * A dialog “block” (cutscene/beat) shown at a node or before transitioning.
 * @typedef {Object} Dialog
 * @property {number} Sequence
 * @property {string} Title
 * @property {DialogLine[]} DialogLines
 * @property {MediaRef|null} AmbientAudioReference
 * @property {MediaRef|null} BackgroundImageReference
 */

/**
 * A possible choice (edge) leaving the current node.
 * @typedef {Object} ChoiceOutcome
 * @property {number} NextChoiceNodeId         - Target node Id to continue the story.
 * @property {Dialog} Dialog                   - Optional dialog shown on choosing this outcome.
 * @property {string} Description              - Human text describing the choice/outcome.
 */

/**
 * A node in the branching scenario graph.
 * @typedef {Object} ChoiceNode
 * @property {number} Id                       - Unique node identifier.
 * @property {string} Title
 * @property {string} Description
 * @property {Dialog[]} Dialogs                - Dialogs to present when entering this node.
 * @property {ChoiceOutcome[]} PossibleOutcomes
 */

/**
 * Root structure of a scenario timeline.
 * @typedef {Object} ScenarioJSON
 * @property {string} Name
 * @property {ChoiceNode[]} ChoiceNodes        - Directed graph of nodes.
 *                                              The “start” is typically Id === 1 (or the first item).
 */

/**
 * @typedef {Object} ScenarioDoc
 * @property {string} _id                         - e.g. "scenario:groupwork-v1"
 * @property {'scenario'} type
 * @property {string} name                        - Human title
 * @property {number} version
 * @property {string[]} orgIds                    - Organizations allowed to access
 * @property {'private'|'public'} visibility
 * @property {AssetManifest} assetManifest        - Lookup table for assets used in the scenario
 * @property {ScenarioJSON} scenario              - The scenario JSON payload (kept 1:1, unchanged)
 * @property {Object<string, any>} [_attachments] - Optional CouchDB-style attachments if stored inline
 */

/**
 * @typedef {ScenarioDoc[]} ScenarioListResponse
 */

/**
 * @typedef {Object} ResolvedAsset
 * @property {string} manifestKey                - The key matched in the assetManifest.
 * @property {AssetManifestEntry} entry          - The manifest entry itself.
 * @property {'image'|'audio'|'video'|'other'} [kind]
 * @property {string} [name]
 */

/**
 * Scenarios service: client-side helper for listing scenarios the current user can see,
 * resolving assets referenced by the scenario JSON, and (optionally) fetching attachments.
 *
 * NOTE on routes:
 *  - This service calls GET /api/scenarios for listing.
 *  - For attachments, it expects (and will call) GET /api/scenarios/:id/attachments/:attachmentName
 *    if you use getAttachment(). Expose this route on the server to return the raw file.
 */
define("scenario-service-χ", class extends functionalBase {
    /**
     * List scenarios visible to the current user.
     * Server route: GET /api/scenarios
     * @returns {Promise<ScenarioDoc[]|null>}
     * @example
     *   const scenarios = await µScenariosService.listScenarios();
     *   if (scenarios) console.log("First scenario:", scenarios[0].name);
     */
    async listScenarios() {
        const res = await getRequest("/scenarios", keycloak.token);
        if (res.error) return null;
        // The endpoint returns an array of scenario docs (res.json(items))
        /** @type {ScenarioListResponse} */
        const items = res.data;
        console.log(items);
        return items;
    }

    async getScenario(id) {
        const res = await getRequest(`/scenarios/${id}`, keycloak.token);
        if (res.error) return null;
        // The endpoint returns an array of scenario docs (res.json(items))
        /** @type {ScenarioDoc} */
        const item = res.data;
        console.log(item);
        return item;
    }

//     /**
//      * Resolve an asset in a scenario document using a Scenario JSON FilePath.
//      *
//      * Scenario JSON commonly references assets with a "FilePath" like:
//      *   "Scenarios/Een groepswerk in het onderwijs/Images/Lesvoorbereiding"
//      * while the assetManifest uses keys like:
//      *   "Een groepswerk in het onderwijs/Images/Lesvoorbereiding"
//      *
//      * This helper normalizes the prefix and looks up the entry.
//      *
//      * @param {ScenarioDoc} doc
//      * @param {string} filePathFromScenario - e.g. "Scenarios/Een groepswerk in het onderwijs/Images/Lesvoorbereiding"
//      * @returns {ResolvedAsset|null}
//      * @example
//      *   const asset = µScenariosService.resolveAsset(doc, "Scenarios/Een groepswerk in het onderwijs/Images/Lesvoorbereiding");
//      *   if (asset?.entry.source === "attachment") {
//      *     const blob = await µScenariosService.getAttachment(doc._id, asset.entry.attachmentName);
//      *   }
//      */
//     resolveAsset(doc, filePathFromScenario) {
//         if (!doc?.assetManifest || !filePathFromScenario) return null;
//
//         // Strip an optional "Scenarios/" prefix used inside scenario JSON references
//         const normalized = filePathFromScenario.startsWith("Scenarios/")
//             ? filePathFromScenario.slice("Scenarios/".length)
//             : filePathFromScenario;
//
//         // Direct hit
//         if (doc.assetManifest[normalized]) {
//             const entry = doc.assetManifest[normalized];
//             return { manifestKey: normalized, entry, kind: entry.kind, name: entry.name };
//         }
//
//         // Fallback: try a looser match (e.g., handle accidental leading/trailing slashes)
//         const trimmed = normalized.replace(/^\/+|\/+$/g, "");
//         const maybe = doc.assetManifest[trimmed] || doc.assetManifest[trimmed.replace(/\s+/g, " ")];
//         if (maybe) {
//             return { manifestKey: trimmed, entry: maybe, kind: maybe.kind, name: maybe.name };
//         }
//
//         return null;
//     }
//
//     /**
//      * Fetch an attachment blob for a given scenario document.
//      * Requires a server route that returns the raw attachment for the scenario, e.g.:
//      *   GET /api/scenarios/:id/attachments/:attachmentName  -> returns file stream/body
//      *
//      * The content type is preserved when converting to a Blob.
//      *
//      * @param {string} scenarioId        - The doc _id (e.g. "scenario:groupwork-v1")
//      * @param {string} attachmentName    - e.g. "image:lesvoorbereiding-c7bf8a23"
//      * @returns {Promise<Blob|null>}
//      * @example
//      *   const blob = await µScenariosService.getAttachment("scenario:groupwork-v1", "image:lesvoorbereiding-c7bf8a23");
//      *   if (blob) {
//      *     const url = URL.createObjectURL(blob);
//      *     // display <img src={url}> or <audio src={url}>
//      *   }
//      */
//     async getAttachment(scenarioId, attachmentName) {
//         if (!scenarioId || !attachmentName) return null;
//         const url =
//             `/api/scenarios/${encodeURIComponent(scenarioId)}` +
//             `/attachments/${encodeURIComponent(attachmentName)}`;
//
//         const res = await simpleGetRequest(url);
//         if (!res.ok) return null;
//
//         const contentType = res.headers.get("Content-Type") || "application/octet-stream";
//         return await readableStreamToBlob(res.body, contentType);
//     }
}, undefined);