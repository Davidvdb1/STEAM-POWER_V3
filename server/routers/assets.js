import express from "express";
import { requireRole } from "../utils/auth.js";
import * as svc from "../services/assets.js";

const router = express.Router();

/**
 * @swagger
 * /api/assets:
 *   post:
 *     tags: [Assets]
 *     summary: Upload shared asset (moderator)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assetId, kind, contentType, dataBase64]
 *             properties:
 *               assetId: { type: string }
 *               kind: { type: string }
 *               contentType: { type: string }
 *               dataBase64: { type: string, format: byte }
 *               aliases:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       201:
 *         description: Asset created
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
// Upload shared asset (base64 to keep example short)
router.post("/", requireRole("moderator"), async (req, res, next) => {
    try {
        const { assetId, kind, contentType, dataBase64, aliases = [] } = req.body;
        const r = await svc.createAsset({ assetId, kind, contentType, buffer: Buffer.from(dataBase64, "base64"), aliases });
        res.status(201).json(r);
    } catch (e) {
        next(e);
    }
});

/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     tags: [Assets]
 *     summary: Stream shared asset by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Binary asset stream; Content-Type reflects stored asset
 *         content:
*             schema:
*               type: string
*               format: binary
*       404:
*         description: Not Found
*/
// Stream shared asset file
router.get("/:id", async (req, res, next) => {
    try {
        const out = await svc.getAssetFile(req.params.id);
        res.setHeader("Content-Type", out.contentType);
        res.end(out.buffer);
    } catch (e) {
        next(e);
    }
});

export default router;