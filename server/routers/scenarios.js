// routers/scenarios.router.js
import express from "express";
import { requireRole, getUserFromReq } from "../utils/auth.js";
import * as svc from "../services/scenarios.js";
import {keycloak} from "../connectors/keycloak.js";
import {createScenario, getScenarioForUser} from "../services/scenarios.js";

const router = express.Router();

/**
 * @swagger
 * /api/scenarios:
 *   get:
 *     tags: [Scenarios]
 *     summary: List scenarios visible to the current user
 *     security:
 *       - keycloakOAuth: []
 *     responses:
 *       200:
 *         description: Array of scenarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 additionalProperties: true
 */
// List scenarios visible to user
router.get("/",keycloak.protect() , async (req, res, next) => {
    try {
        const { orgIds } = getUserFromReq(req);
        const items = await svc.listByOrgs(orgIds);
        res.json(items);
    } catch (e) {
        next(e);
    }
});

/**
 * @swagger
 * /api/scenarios:
 *   post:
 *     tags: [Scenarios]
 *     summary: Create a new scenario (moderator)
 *     security:
 *       - keycloakOAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orgIds, scenario]
 *             properties:
 *               orgIds:
 *                 type: array
 *                 items: { type: string }
 *               version:
 *                 type: integer
 *                 default: 1
 *               scenario:
 *                 type: object
 *                 additionalProperties: true
 *     responses:
 *       201:
 *         description: Scenario created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/", requireRole("moderator"), async (req, res, next) => {
    try {
        const out = await svc.createScenario(req.body);
        res.status(201).json(out);
    } catch (e) {
        next(e);
    }
});

/**
 * @swagger
 * /api/scenarios/{id}:
 *   get:
 *     tags: [Scenarios]
 *     summary: Get scenario (metadata + payload)
 *     security:
 *       - keycloakOAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Scenario with payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       404:
 *         description: Not Found
 */
router.get("/:id", keycloak.protect(), async (req, res, next) => {
    try {
        const { orgIds } = getUserFromReq(req);
        const item = await svc.getScenarioForUser(req.params.id, orgIds);
        res.json(item);
    } catch (e) {
        next(e);
    }
});

/**
 * @swagger
 * /api/scenarios/{id}/raw:
 *   get:
 *     tags: [Scenarios]
 *     summary: Get raw scenario payload only
 *     security:
 *       - keycloakOAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Raw payload JSON
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       404:
 *         description: Not Found
 */
router.get("/:id/raw", async (req, res, next) => {
    try {
        const { orgIds } = getUserFromReq(req);
        const item = await svc.getRaw(req.params.id, orgIds);
        res.json(item);
    } catch (e) {
        next(e);
    }
});

/**
 * @swagger
 * /api/scenarios/{id}/attachments:
 *   post:
 *     tags: [Scenarios]
 *     summary: Upload per-scenario attachment (moderator)
 *     security:
 *       - keycloakOAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [path, contentType, dataBase64]
 *             properties:
 *               path: { type: string }
 *               contentType: { type: string }
 *               dataBase64: { type: string, format: byte }
 *     responses:
 *       201:
 *         description: Attachment uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/:id/attachments", requireRole("moderator"), async (req, res, next) => {
    try {
        const user = getUserFromReq(req);
        const out = await svc.addAttachment({ id: req.params.id, user, body: req.body });
        res.status(201).json(out);
    } catch (e) {
        next(e);
    }
});

/**
 * @swagger
 * /api/scenarios/{id}/assets:
 *   get:
 *     tags: [Scenarios]
 *     summary: Resolve and stream a per-scenario asset by path
 *     security:
 *       - keycloakOAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: path
 *         required: true
 *         schema: { type: string }
 *         description: Asset path from the scenario manifest
 *     responses:
 *       200:
 *         description: Binary asset stream; Content-Type reflects the stored asset
 *         content:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Not Found
 */
// Resolve and stream asset by FilePath (image/audio)
router.get("/:id/assets", async (req, res, next) => {
    try {
        const { orgIds } = getUserFromReq(req);
        const { path } = req.query;
        const streamInfo = await svc.resolveAsset(req.params.id, orgIds, String(path));
        res.setHeader("Content-Type", streamInfo.contentType || "application/octet-stream");
        res.end(streamInfo.buffer);
    } catch (e) {
        next(e);
    }
});

export default router;