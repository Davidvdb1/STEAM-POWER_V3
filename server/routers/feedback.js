import express from "express";
import { getUserFromReq, requireRole } from "../utils/auth.js";
import * as svc from "../services/feedback.js";

const router = express.Router();

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     tags: [Feedback]
 *     summary: Submit individual feedback
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       201:
 *         description: Individual feedback saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 */
router.post("/", async (req, res, next) => {
    try {
        const user = getUserFromReq(req);
        const r = await svc.saveIndividual({ user, body: req.body });
        res.status(201).json(r);
    } catch (e) {
        next(e);
    }
});

/**
 * @swagger
 * /api/feedback/group/{sessionId}:
 *   post:
 *     tags: [Feedback]
 *     summary: Submit group feedback for a session (moderator)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       201:
 *         description: Group feedback saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 */
router.post("/group/:sessionId", requireRole("moderator"), async (req, res, next) => {
    try {
        const user = getUserFromReq(req);
        const r = await svc.saveGroup({ user, sessionId: req.params.sessionId, body: req.body });
        res.status(201).json(r);
    } catch (e) {
        next(e);
    }
});

/**
 * @swagger
 * /api/feedback/{scenarioId}/summary:
 *   get:
 *     tags: [Feedback]
 *     summary: Get feedback summary for a scenario (moderator)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scenarioId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Aggregated feedback summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 */
router.get("/:scenarioId/summary", requireRole("moderator"), async (req, res, next) => {
    try {
        res.json(await svc.summary(req.params.scenarioId));
    } catch (e) {
        next(e);
    }
});

export default router;