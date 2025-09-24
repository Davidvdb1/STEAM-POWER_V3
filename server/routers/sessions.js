import express from "express";
import { requireRole, getUserFromReq } from "../utils/auth.js";
import * as svc from "../services/sessions.js";

const router = express.Router();

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     tags: [Sessions]
 *     summary: Create a new session (moderator)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [scenarioId, orgId]
 *             properties:
 *               scenarioId: { type: string }
 *               orgId: { type: string, description: "Must match moderator's org." }
 *     responses:
 *       201:
 *         description: Session created
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
// Create a new MP session
router.post("/", requireRole("moderator"), async (req, res, next) => {
    try {
        const user = getUserFromReq(req);
        const { scenarioId, orgId } = req.body; // orgId should match moderator org
        const out = await svc.createSession({ scenarioId, orgId, moderatorId: user.userId });
        res.status(201).json(out);
    } catch (e) {
        next(e);
    }
});

/**
 * @swagger
 * /api/sessions/joinable:
 *   get:
 *     tags: [Sessions]
 *     summary: List sessions joinable by current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Joinable sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 additionalProperties: true
 */
router.get("/joinable", async (req, res, next) => {
    try {
        const user = getUserFromReq(req);
        const r = await svc.listJoinable(user);
        res.json(r);
    } catch (e) {
        next(e);
    }
});

/**
 * @swagger
 * /api/sessions/{id}/start:
 *   post:
 *     tags: [Sessions]
 *     summary: Set session status to "running" (moderator)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 */
router.post("/:id/start", requireRole("moderator"), async (req, res, next) => {
    try {
        const out = await svc.start(req.params.id);
        res.json(out);
    } catch (e) {
        next(e);
    }
});

/**
 * @swagger
 * /api/sessions/{id}/next:
 *   post:
 *     tags: [Sessions]
 *     summary: Manually advance session to the next step (moderator)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated session or advancement result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 */
router.post("/:id/next", requireRole("moderator"), async (req, res, next) => {
    try {
        const out = await svc.next(req.params.id);
        res.json(out);
    } catch (e) {
        next(e);
    }
});

/**
 * @swagger
 * /api/sessions/{id}/summary:
 *   get:
 *     tags: [Sessions]
 *     summary: Get a session summary
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Summary for the session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 */
router.get("/:id/summary", async (req, res, next) => {
    try {
        res.json(await svc.getSummary(req.params.id));
    } catch (e) {
        next(e);
    }
});

/**
 * @swagger
 * /api/sessions/{id}/events:
 *   get:
 *     tags: [Sessions]
 *     summary: Get session events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Events emitted by the session
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 additionalProperties: true
 */
router.get("/:id/events", async (req, res, next) => {
    try {
        res.json(await svc.getEvents(req.params.id));
    } catch (e) {
        next(e);
    }
});

export default router;