// libs/socket.js
import { insertDoc } from "../connectors/couchConnector.js";

const EDB = "events";

const sessions = new Map(); // in-memory live state (authoritative for live play)

function now() { return new Date().toISOString(); }

function publish(io, sessionId) {
    const s = sessions.get(sessionId);
    if (!s) return;
    const payload = {
        status: s.status,
        nodeId: s.nodeId,
        needed: s.players.size,
        ready: s.readAcks.size,
        answered: s.answers.size,
        players: Array.from(s.players.values()).map(p => ({ userId: p.userId, name: p.name }))
    };
    io.to(sessionId).emit("session:state", payload);
}

async function logEvent(e) {
    const doc = {
        _id: `event:${e.sessionId}:${Date.now()}:${e.actor.userId || "system"}`,
        type: "event",
        orgId: e.orgId, sessionId: e.sessionId, scenarioId: e.scenarioId,
        actor: { userId: e.actor.userId, role: e.actor.role }, action: e.action,
        nodeId: e.nodeId, payload: e.payload || {}, ts: now(), meta: e.meta || {}
    };
    await insertDoc(EDB, doc);
}

export function initSocket(io) {
    io.on("connection", (socket) => {
        let ctx = { userId: socket.handshake.auth?.userId, name: socket.handshake.auth?.name, role: socket.handshake.auth?.role, orgId: socket.handshake.auth?.orgId };

        socket.on("session:join", ({ sessionId, scenarioId }) => {
            socket.join(sessionId);
            // init session state if missing
            if (!sessions.has(sessionId)) {
                sessions.set(sessionId, {
                    orgId: ctx.orgId,
                    scenarioId,
                    status: "waiting",
                    nodeId: 1,
                    players: new Map(),
                    readAcks: new Set(),
                    answers: new Map() // userId -> { choice, reactionMs }
                });
            }
            const s = sessions.get(sessionId);
            s.players.set(socket.id, { socketId: socket.id, userId: ctx.userId, name: ctx.name, role: ctx.role });
            publish(io, sessionId);
            logEvent({ orgId: s.orgId, scenarioId: s.scenarioId, sessionId, actor: { userId: ctx.userId, role: ctx.role }, action: "join", nodeId: s.nodeId });
        });

        socket.on("session:start", ({ sessionId }) => {
            const s = sessions.get(sessionId); if (!s) return;
            s.status = "running";
            s.nodeId = 1;
            s.readAcks.clear();
            s.answers.clear();
            publish(io, sessionId);
            logEvent({ orgId: s.orgId, scenarioId: s.scenarioId, sessionId, actor: { userId: ctx.userId, role: ctx.role }, action: "start", nodeId: 1 });
        });

        socket.on("session:ready", ({ sessionId, nodeId }) => {
            const s = sessions.get(sessionId); if (!s || s.nodeId !== nodeId) return;
            s.readAcks.add(ctx.userId);
            publish(io, sessionId);
            logEvent({ orgId: s.orgId, scenarioId: s.scenarioId, sessionId, actor: { userId: ctx.userId, role: "player" }, action: "ready", nodeId });
        });

        socket.on("session:answer", ({ sessionId, nodeId, choice, reactionMs }) => {
            const s = sessions.get(sessionId); if (!s || s.nodeId !== nodeId) return;
            s.answers.set(ctx.userId, { choice, reactionMs: Number(reactionMs) || 0 });
            publish(io, sessionId);
            logEvent({ orgId: s.orgId, scenarioId: s.scenarioId, sessionId, actor: { userId: ctx.userId, role: "player" }, action: "answer", nodeId, payload: { choice, reactionMs } });
        });

        socket.on("session:next", ({ sessionId }) => {
            const s = sessions.get(sessionId); if (!s) return;

            // Majority voting + tie-break
            const voteMap = new Map(); // choice -> { count, timeSum }
            for (const v of s.answers.values()) {
                const entry = voteMap.get(v.choice) || { count: 0, timeSum: 0 };
                entry.count += 1;
                entry.timeSum += v.reactionMs || 0;
                voteMap.set(v.choice, entry);
            }
            let selected = null;
            if (voteMap.size > 0) {
                selected = Array.from(voteMap.entries()).sort((a, b) => {
                    const A = a[1], B = b[1];
                    if (B.count !== A.count) return B.count - A.count;
                    return A.timeSum - B.timeSum;
                })[0][0];
            }

            io.to(sessionId).emit("session:results", Object.fromEntries(voteMap));
            // frontend will compute the NextChoiceNodeId by mapping the selected choice to the path
            s.nodeId = s.nodeId + 1; // naive advance; UI can request a specific node if needed
            s.readAcks.clear();
            s.answers.clear();
            publish(io, sessionId);
            logEvent({ orgId: s.orgId, scenarioId: s.scenarioId, sessionId, actor: { userId: ctx.userId, role: ctx.role }, action: "next", nodeId: s.nodeId, payload: { selected } });
        });

        socket.on("disconnect", () => {
            for (const [sessionId, s] of sessions.entries()) {
                if (s.players.has(socket.id)) {
                    const u = s.players.get(socket.id);
                    s.players.delete(socket.id);
                    publish(io, sessionId);
                    logEvent({ orgId: s.orgId, scenarioId: s.scenarioId, sessionId, actor: { userId: u.userId, role: u.role }, action: "leave", nodeId: s.nodeId });
                }
            }
        });
    });
}
