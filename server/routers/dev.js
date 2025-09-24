import express from "express";
import { keycloak } from "../connectors/keycloak.js";
const router = express.Router();

/**
 * @swagger
 * /api/dev/me:
 *   get:
 *     summary: Get information about the authenticated user
 *     description: >
 *       Returns the current access token and decoded claims from Keycloak.
 *       Requires a valid Bearer token.
 *     tags:
 *       - [Development]
 *     security:
 *       - keycloakOAuth: []
 *     responses:
 *       200:
 *         description: Successful response with token information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The raw access token (JWT)
 *                 claims:
 *                   type: object
 *                   description: Decoded claims (username, email, roles, expiry, etc.)
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (invalid or expired token)
 */
router.get("/me", keycloak.protect(), (req, res) => {
    res.json({
        token: req.kauth.grant.access_token.token || null,
        claims: req.kauth.grant.access_token.content || null,
    });
});

export default router;